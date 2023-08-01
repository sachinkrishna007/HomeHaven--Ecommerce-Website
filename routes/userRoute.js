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
const cartController = require('../controllers/cartController')
const profileContoller = require('../controllers/profilecontoller')
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
userRoute.get('/loadAddress',profileContoller.loadAddress)
userRoute.post('/addAddress',profileContoller.addAddress)
userRoute.get('/orderHistory',profileContoller.orderHistory)
userRoute.post('/selectAddress',profileContoller.selectAddress)
userRoute.get('/orderDetails/:orderId',profileContoller.orderDetails)





//cartRoutes
userRoute.post('/add-to-cart/:id',cartController.addToCart);
userRoute.get('/loadCart',cartController.loadCart)
userRoute.put('/editQuantity',cartController.editQuantity)
userRoute.delete('/deleteProduct',cartController.deleteProduct)

//checkout
userRoute.get('/checkout',userController.loadCheckout)
userRoute.post('/checkout', userController.processCheckout)
userRoute.get('/confirmation',userController.confirmation)

module.exports = userRoute