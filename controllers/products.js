const fs = require('fs')
const path = require('path')
const PDFDocument = require('pdfkit')

const Product = require('../models/product');
const Order = require('../models/order');
const validRes = require('express-validator').validationResult

const ItemPerPage = 1

exports.getAddProduct = (req, res, next) => {
    res.render('add-product', {
        pagetitle : 'Add product',
        path: 'add-product',
        errorMessage : '',
        oldInput :  {title: '', price: '', discount: ''},
        errors : []
    })
} 
exports.postAddProduct =(req, res, next) => {
    const errors = validRes(req)
    const title = req.body.title
    const image = req.file
    const price = req.body.price
    const discount = req.body.discount
    if(!image){
        return res.status(422).render('add-product', {
            pagetitle : 'Add product',
            path: 'add-product',
            errorMessage: 'Attached file is not an image',
            errors : [],
            oldInput :  {title: title, price: price, discount: discount}
        })
    }
    if(!errors.isEmpty()){
        return res.render('add-product', {
            pagetitle : 'Add product',
            path: 'add-product',
            errorMessage: errors.array()[0].msg,
            errors : errors.array(),
            oldInput :  {title: title, price: price, discount: discount}
        })
    }
    const imgUrl = path.join(image.path)
    const product = new Product({title : title , price : price, imgUrl:imgUrl, discount:discount, user:req.session.user})
    product.save()
    .then(()=>{
        res.redirect('/')
    });
}

exports.getProducts = (req, res, next) => {
    const page = req.query.page || 1
    let totalNumber 
    Product.find().countDocuments().then(prodNum=>{
        totalNumber = prodNum
        return Product.find({user: {$ne : req.user}})
                .skip((page-1)*ItemPerPage).limit(ItemPerPage)
    })
    .then( (prods) =>{
    res.render('shop', {
        prods : prods,
        pagetitle : 'SHOP',
        path : '/',
        hasProducts : prods.length > 0,
        currentPage : page,
        nextPage : totalNumber > page*ItemPerPage,
        previousPage : page > 1,
        lastPage : Math.ceil(totalNumber/ItemPerPage)
    })})
}
module.exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    Product.findById(productId).
    then(product => {
            return req.user.addToCart(product)
    }).then(result => {
        res.redirect('/cart')
    })
}

module.exports.postDeleteCartProduct = (req, res, next) => {
    const productId = req.body.productId;
        return req.user.deleteItemFromCart(productId)
        .then(result => {
        res.redirect('/cart');
    })
    .catch(err => console.log(err))
}
module.exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            let products = user.cart.items.map(item => {
                return { ...item.productId._doc, quantity: item.quantity };
            });
            res.render('shop/cart', {
                pagetitle: 'Your Cart',
                path: '/cart',
                products: products
            });
        })
        .catch(err => {
            console.log(err);
            res.redirect('/');
        });
};
///////////////////////////////////////
module.exports.getOrders = (req, res, next) => {
    Order
        .find({
            'user._id': req.session.user._id
        })
        .then(orders => {
            res.render('shop/orders', {
                pagetitle: 'Orders',
                path: '/orders',
                orders: orders
            });
        })
        .catch(err => console.log(err));
};

module.exports.postOrder = (req, res, next) => {
        req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(item => {
                return {
                    _id: item.productId._id,
                    title: item.productId.title,
                    price: item.productId.price,
                    discount: item.productId.discount,
                    imgUrl: item.productId.imgUrl,
                    quantity: item.quantity
                };
            });
            const order = new Order({
                user: {
                    _id: user._id,
                    username: user.name
                },
                products: products
            });
            return order.save();
        })
        .then(result => {
                return req.user.clearCart()
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
};

module.exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId
    Order.findById(orderId).then(order=>{
        if(order){
            if(order.user._id.toString()=== req.session.user._id.toString()){
                const invoiceName = 'invoice-' + orderId + '.pdf'
                const invoicePath = path.join('data','invoices' , invoiceName)
                res.setHeader('Content-Type', 'application/pdf')
                res.setHeader('Content-Disposition', 'inline; filename="' +invoiceName +'"')
                const pdf = new PDFDocument()
                pdf.pipe(fs.createWriteStream(invoicePath))
                pdf.pipe(res)

                pdf.fontSize(26).text('Invoice')
                pdf.text('--------------------------------------')
                let totalPrice = 0
                order.products.forEach(prod => {
                    const discount = prod.discount
                    const price = prod.price
                    totalPrice += prod.quantity * (price-(discount/100)*price)
                    pdf.fontSize(16).text(prod.title + ' : ' + prod.quantity + ' x  $ ' + (price-(discount/100)*price))
                })
                pdf.fontSize(26).text('--------------------------------------')
                pdf.text('Total Price :  $ '+totalPrice )
                pdf.end()
                
            }else
                res.status(404).render('404', {
                    pagetitle: 'Notfound',
                    path: '/404'
                });
        }
    })
    
};