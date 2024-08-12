const User = require('../models/user')
const Product = require('../models/product')
const user = require('../models/user')
const validRes = require('express-validator').validationResult

const fileHelper = require('../util/file')

exports.getProfile = (req, res, next) => {
    Product.find({user:req.user}).then( (prods) =>{
        res.render('profile/profile', {
            prods : prods,
            pagetitle : 'Profile',
            path : '/profile',
            hasProducts : prods.length > 0,
            errorMessage: '',
            userName : req.user.name
        })})
}

exports.postdeleteProduct = (req, res, next) => {
    Product.findById( req.body.productId).then(prod=>{
        if(!prod) return res.redirect('404')
        return Product.deleteOne({_id : prod._id, userId : user._id})
    })
    .then( (result) =>{
        return res.redirect('profile')
    })
}
module.exports.getEditProduct = (req, res, next) => {
    const productId = req.query.productId;
    Product
        .findById(productId)
        .then(product => {
            if(!product || product.user === req.user._id) {
                res.redirect('404');
            } else {
                res.render('editProduct', {
                    pagetitle: 'Edit '+product.title,
                    path: '/profile/editProduct',
                    oldInput: product,
                    errorMessage: '',
                    validationErrors: []
                });
            }
        })
};



/////
module.exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const productTitle = req.body.title;
    const productPrice = req.body.price;
    const productImage = req.file;
    const productDiscount = req.body.discount;
    const errors = validRes(req);
    if(!errors.isEmpty()) {
        return res
            .status(422)
            .render('editProduct', {
                pagetitle: 'Edit Product',
                path: '/editProduct',
                editing: true,
                errorMessage: errors.array().map(error => error.msg),
                product: {
                    _id: productId,
                    title: productTitle,
                    price: productPrice,
                    discount: productDiscount
                },
                validationErrors: errors.array()
            });
    }
    Product
        .findById(productId)
        .then(product => {
            if(!product) 
                return res.redirect('404')
            if(product.user.toString() === req.user._id.toString()) {
                product.title = productTitle;
                product.price = productPrice;
                if(productImage) {
                    fileHelper.deleteFile(product.imgUrl);
                    product.imgUrl = productImage.path;
                }
                product.discount = productDiscount;
                return product.save();
            } else {
                return res.redirect('404')
            }
        }).then(resu=>{
            res.redirect('profile')
        })
};