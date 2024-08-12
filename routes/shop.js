const express = require('express')

const router = express.Router();
const productsController = require('../controllers/products')
const errorController = require('../controllers/error')
const isAuth = require('../middleware/is-auth')

router.get('/cart', isAuth, productsController.getCart)
router.post('/cart-delete-item', isAuth, productsController.postDeleteCartProduct)
router.post('/addToCart', isAuth, productsController.postCart) 
router.get('/orders', isAuth, productsController.getOrders) 
router.post('/create-order', isAuth, productsController.postOrder) 

router.get('/orders/:orderId', isAuth, productsController.getInvoice) 

router.get('/', productsController.getProducts)
router.use(errorController.get404Page)

exports.routes = router;