const express = require('express')
const {body} = require('express-validator')

const router = express.Router();
const profileController = require('../controllers/profile')
const isAuth = require('../middleware/is-auth')

router.get('/profile', isAuth, profileController.getProfile)

router.get('/editProduct', isAuth, profileController.getEditProduct)
router.post('/editProduct', isAuth, profileController.postEditProduct)

router.post('/deleteProduct', isAuth, profileController.postdeleteProduct)

exports.routes = router;