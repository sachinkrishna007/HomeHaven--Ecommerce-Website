const express = require('express')
const userRoute = express()
const isAuth=require('../middlewares/userAuth')

//mongodb session
const session=require('express-session')
const config=require("../config/config");
const mongoDBSession=require('connect-mongodb-session')(session)
const store=new mongoDBSession({
    uri:process.env.MONGODBURL,
    collection:'user_session'
})
userRoute.use(session({
    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:false,
    store:store
}))

//set
userRoute.set('view engine', 'ejs');
userRoute.set('views', './views/public')

userRoute.use(express.static('views/public'));

//parser
const bodyParser = require('body-parser');
userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({ extended: true }))

//reqire controllers
const userController = require("../controllers/usercontroller")
const userMiddleWare = require("../middlewares/auth")
userRoute.use(userMiddleWare.sessionCheck)


//user login
userRoute.get('/',userController.loadhome)
userRoute.get('/login',userController.loadlogin)
userRoute.post('/login',userController.verifyLogin)
//logout
userRoute.get('/logout',userController.logout)

//otp login
userRoute.post('/otplogin',userController.verifynumber)
userRoute.post('/loginotp',userController.verifyOtpLogin)


//register
userRoute.get('/register',userController.loadRegister)
userRoute.post('/register',userController.validation)
userRoute.post('/verifyOtp',userController.verifyOtp)



//products
userRoute.get('/product',userController.listProduct)








module.exports = userRoute