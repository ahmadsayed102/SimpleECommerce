const express = require('express')
const {body} = require('express-validator')

const router = express.Router();
const productsController = require('../controllers/products')
const isAuth = require('../middleware/is-auth')

router.get('/add-product', isAuth, productsController.getAddProduct)
router.post('/add-product', isAuth, body('price').isFloat()
    , body('title').isAlphanumeric().isLength({min:1}).trim(),
    body('discount').isNumeric().trim(),  
    productsController.postAddProduct )

exports.routes = router;
