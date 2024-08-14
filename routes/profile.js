const express = require('express')
const {body} = require('express-validator')

const router = express.Router();
const profileController = require('../controllers/profile')
const isAuth = require('../middleware/is-auth')

router.get('/profile', isAuth, profileController.getProfile)

router.get('/editProduct', isAuth, profileController.getEditProduct)
router.post('/editProduct', isAuth, body('price').isFloat()
    , body('title').isLength({min:1}).trim(),
    body('discount').isNumeric().trim(), profileController.postEditProduct)

router.delete('/profile/:productId', isAuth, profileController.deleteProduct)

exports.routes = router;