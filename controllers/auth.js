const User = require('../models/user')
const bcrypt = require('bcryptjs')
const validRes = require('express-validator').validationResult

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pagetitle: 'Login',
        path: '/login',
        errorMessage: '',
        oldInput :  {email: '', password: ''}
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    User.findOne({
        email: email
    }).then(user => {
        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    req.user = user
                    req.session.save(err => {
                        return res.redirect('/')
                    })
                } else {
                    return res.status(422).render('auth/login', {
                        pagetitle: 'Login',
                        path: '/login',
                        errorMessage: 'Invalid email or password',
                        oldInput :  {email: email, password: password}
                    })
                }
            })
        } else {
            return res.status(422).render('auth/login', {
                pagetitle: 'Login',
                path: '/login',
                errorMessage: 'Invalid email or password',
                oldInput :  {email: email, password: password}
            })
        }
    })

}

exports.getSignUp = (req, res, next) => {
    res.render('auth/signup', {
        pagetitle: 'SignUp',
        path: '/signup',
        errorMessage : '',
        oldInput :  {email: '', password: '', confirmPassword: '', name:''},
        errors : []
    }) 
}
exports.postSignUp = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    const name = req.body.name
    const errors = validRes(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            pagetitle: 'SignUp',
            path: '/signup',
            errorMessage: errors.array()[0].msg,
            errors : errors.array(),
            oldInput :  {email: email, password: password, confirmPassword: confirmPassword, name:name}
        })
    }
        bcrypt.hash(password, 12)
            .then(hashed => {
                const user = new User({
                    name: name,
                    email: email,
                    password: hashed
                })
                user.save()
                    .then(() => {
                        res.redirect('/login')
                    })
            })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        res.redirect('/')
    })
}