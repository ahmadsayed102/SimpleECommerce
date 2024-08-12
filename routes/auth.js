const express = require('express')
const router = express.Router()
const User = require('../models/user')

const {body} = require('express-validator')
const isLogged = require('../middleware/is-logged')

const authController = require('../controllers/auth')


router.get('/signup' ,isLogged, authController.getSignUp)
router.post('/signup' , 
[   body('email','Enter a valid email').isEmail().normalizeEmail().
    custom((value, req)=>{
    return User.findOne({email: value}).then(user=>{
        if(user){
            return Promise.reject('Email already exist');
        }}
    )
}),
    body('password', 'Password must be minimum 5').trim().isLength({min:5}),
    body('confirmPassword').trim().custom((value, {req}) => {
        if(value!== req.body.password){
            throw new Error("Passwords dont match");
        }
        return true; 
    })
], authController.postSignUp)
router.get('/login' ,isLogged ,authController.getLogin)
router.post('/login' ,body('email').isEmail().normalizeEmail(),
body('password').trim() , authController.postLogin)
router.get('/logout' , authController.postLogout)

exports.routes = router
