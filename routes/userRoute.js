const express = require('express')
const userRoute = express()
// const isAuth=require('../middlewares/userAuth')
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
const cartController = require('../controllers/cartController')
const profileContoller = require('../controllers/profilecontoller')
const ProductController = require('../controllers/productcontroller')
const couponController = require('../controllers/couponController')

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
userRoute.get('/block',userController.blockpage)

//profileRoutes
userRoute.get('/profile',userMiddleWare.isloggedout,userMiddleWare.checkBlockedUser,userController.loadProfile)
userRoute.get('/loadAddress',userMiddleWare.isloggedout,userMiddleWare.checkBlockedUser,profileContoller.loadAddress)
userRoute.post('/addAddress',userMiddleWare.checkBlockedUser,profileContoller.addAddress)
userRoute.get('/orderHistory',userMiddleWare.isloggedout,userMiddleWare.checkBlockedUser,profileContoller.orderHistory)
userRoute.post('/selectAddress',userMiddleWare.checkBlockedUser,profileContoller.selectAddress)
userRoute.get('/orderDetails/:orderId',userMiddleWare.isloggedout,userMiddleWare.checkBlockedUser,profileContoller.orderDetails)
userRoute.get('/editAddress/:id',profileContoller.editAddress)
userRoute.post('/updateAddress/:id',profileContoller.updateAddress)
userRoute.get('/deleteAddress/:id',profileContoller.deleteAddress)

// userRoute.post('/editAddress/:userId/:addressIndex',profileContoller.updateAddress)



//error
userRoute.get('/errroMessage',userController.errormessage)
userRoute.get('/error',userController.errorpage)

//cartRoutes
userRoute.post('/add-to-cart/:id',userMiddleWare.checkBlockedUser,cartController.addToCart);
userRoute.get('/loadCart',userMiddleWare.checkBlockedUser,cartController.loadCart)
userRoute.put('/editQuantity',userMiddleWare.checkBlockedUser,cartController.editQuantity)
userRoute.delete('/deleteProduct',userMiddleWare.checkBlockedUser,cartController.deleteProduct)

//checkout
userRoute.get('/checkout',userMiddleWare.isloggedout,userMiddleWare.checkBlockedUser,userMiddleWare.checkoutMiddleware,userController.loadCheckout)
userRoute.post('/checkout',userMiddleWare.checkBlockedUser, userController.processCheckout)
userRoute.get('/confirmation',userMiddleWare.isloggedout,userMiddleWare.checkBlockedUser,userController.confirmation)
userRoute.post('/verifyPayment',userController.verifyPayment)

//forgotPassword
userRoute.get('/forgotPassword',userMiddleWare.isloggedIn,userController.forgotPassword)
userRoute.post('/forgotPassword',userController.forgotPasswordOtp)
userRoute.post('/verifyForgotPassword',userController.forgotpasswordVerify)
userRoute.post('/resetPassword',userController.resetPassword)
userRoute.get('/updatePassword',userMiddleWare.isloggedout,profileContoller.updatePasswordLoad)

userRoute.post('/updatePassword',profileContoller.updatePassword)
userRoute.post('/verify-oldPassword',profileContoller.verifyOldPassword)

//cancel order
userRoute.post('/cancel-order/:orderId',ProductController.cancelOrder)
//returrn order
userRoute.post('/return-order/:orderId',ProductController.returnOrder)

//coupons

userRoute.get('/applyCoupon/:id',couponController.applyCoupon)
userRoute.get('/couponVerify/:id',couponController.verifyCoupon)


//wallet
userRoute.get('/wallet',profileContoller.LoadWallet)

module.exports = userRoute