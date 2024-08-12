const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')
const multer = require('multer')
const User = require('./models/user') 


const session = require('express-session')
const mongoDbStore = require('connect-mongodb-session')(session)
const MONGODBURI = 'mongodb+srv://ahmedsayed11724:y288VUXvj7P7ETGw@cluster0.uw7wrww.mongodb.net/try?w=majority&appName=Cluster0'
const mongoose = require('mongoose')
const csrf = require('csurf')
const flash = require('connect-flash')

const adminData = require('./routes/admin')
const shopRoutes = require('./routes/shop')
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/profile')

const fileStorage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'images')
    },
    filename:(req,file,cb)=>{
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname)
    }
})
const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' )
        cb(null,true)
    else
        cb(null,false)
}

const store = new mongoDbStore({
    uri : MONGODBURI,
    collection : 'sessions'
})
const csrfProtection = csrf()
const app = express(); 
app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(bodyParser.urlencoded({extended:false}));
app.use(multer({storage:fileStorage, fileFilter : fileFilter}).single('image'));

app.use(express.static(path.join(__dirname, 'public')))
app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(session({
    secret:'my sec', saveUninitialized : false, resave : false , store : store
}))
app.use(csrfProtection)
app.use(flash());
app.use((req, res, next)=>{
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})
app.use((req, res, next) => {
    if(!req.session.user) return next();
    User
        .findById(req.session.user._id)
        .then(user => {
            if(user) {
                req.user = user;
                next();
            } else {
                res.redirect('/login');
            }
        })
        .catch(err => {
            console.log(err);
        });
});
app.use(adminData.routes);
app.use(authRoutes.routes)
app.use(profileRoutes.routes);
app.use(shopRoutes.routes);



mongoose.connect(MONGODBURI)
.then(result => {
    app.listen(3000);
})
.catch(err=>{
    console.log(err);
})

