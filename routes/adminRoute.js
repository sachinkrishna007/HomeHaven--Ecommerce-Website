const express=require('express')
const adminRoute = express()
const auth = require('../middlewares/adminAuth')

//session
const session=require('express-session')
const config=require("../config/config");
adminRoute.use(session({
    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:false,
}))

//express layout
const expressEjsLayout = require('express-ejs-layouts')

//body parser
const bodyParser = require('body-parser');
adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({ extended: true }))

//set
adminRoute.set('layout','layout')
adminRoute.set('view engine', 'ejs');
adminRoute.set('views', './views/admin')


//require
const adminController = require("../controllers/admincontroller")
const productContoller=require('../controllers/productcontroller')
const catagoryController=require('../controllers/catagorycontroller')
adminRoute.use(express.static('views/admin'));
adminRoute.use(express.static('public'))
adminRoute.use(expressEjsLayout)

//login route
adminRoute.get('/',auth.islogout,adminController.loadLogin)
adminRoute.post('/',adminController.verifyLogin)
adminRoute.get('/dashboard',auth.islogin,adminController.loadDashboard)

//logout
adminRoute.get('/logout',auth.islogin,adminController.logout)

//users options
adminRoute.get('/users',auth.islogin,adminController.userList)
adminRoute.get('/userview',auth.islogin,adminController.userView)
adminRoute.get('/block',auth.islogin,adminController.blockUser)
adminRoute.get('/unblock',adminController.unblockUser) 


//product routes
adminRoute.post('/product',productContoller.addProduct)
adminRoute.get('/loadProduct',auth.islogin,productContoller.loadProduct)
adminRoute.get('/showProduct',auth.islogin,productContoller.loadProductPage)
adminRoute.get('/productView',auth.islogin,productContoller.productView)
adminRoute.get('/delete',productContoller.deleteProduct)
adminRoute.get('/edit-product/:id',auth.islogin,productContoller.editProduct)
adminRoute.post('/edit-product/:id',productContoller.updateEditProduct)
adminRoute.get('/list',auth.islogin,productContoller.listProduct)
adminRoute.get('/unlist',auth.islogin,productContoller.unlistProduct)


//catagory routes
adminRoute.post('/category', catagoryController.createCategory);
adminRoute.get('/loadCategory',auth.islogin,auth.islogin,catagoryController.loadCategory)
adminRoute.get('/search',auth.islogin,productContoller.ProductSearch)
adminRoute.get('/editCategory',catagoryController.editCategory)
adminRoute.get('/editCategory/:id',catagoryController.editCategory)
adminRoute.post('/editCategory/:id',catagoryController.updateCategory)
adminRoute.post('/deleteCategory/:id',catagoryController.deleteCategory)


//orders route
adminRoute.get('/orders',productContoller.orderStatus)
adminRoute.post('/updateStatus/:orderId',productContoller.updateStatus)
adminRoute.get('/adminOrderDetails/:orderId',productContoller.adminViewOrders)


module.exports=adminRoute
