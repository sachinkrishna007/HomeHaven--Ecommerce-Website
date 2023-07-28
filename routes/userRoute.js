const express = require('express')
const userRoute = express()
const isAuth=require('../middlewares/userAuth')
const blocked=require('../middlewares/auth')


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
const userController = require("../controllers/userController")
const userMiddleWare = require("../middlewares/auth")
const productController = require('../controllers/cartController')
userRoute.use(userMiddleWare.sessionCheck)


//user login
userRoute.get('/',userController.loadhome)
userRoute.get('/login',userMiddleWare.isloggedIn,userController.loadlogin)
userRoute.post('/login',userController.verifyLogin)
//logout
userRoute.get('/logout',userController.logout)

//otp login
userRoute.post('/otplogin',userController.verifynumber)
userRoute.post('/loginotp',userController.verifyOtpLogin)



//register
userRoute.get('/register',userMiddleWare.isloggedIn,userController.loadRegister)
userRoute.post('/register',userController.validation)
userRoute.post('/verifyOtp',userController.verifyOtp)



//products
userRoute.get('/product',userMiddleWare.checkBlockedUser,userController.listProduct)
userRoute.get('/productDetail/:id',userMiddleWare.checkBlockedUser,userController.productDetail)
userRoute.get('/error',userController.errorpage)
userRoute.get('/block',userController.blockpage)

//profileRoutes
userRoute.get('/profile',userController.loadProfile)



//cartRoutes




module.exports = userRoute