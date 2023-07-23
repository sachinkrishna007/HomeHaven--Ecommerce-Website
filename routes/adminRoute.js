const express=require('express')
const adminRoute = express()

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
adminRoute.get('/',adminController.loadLogin)
adminRoute.post('/',adminController.verifyLogin)
adminRoute.get('/dashboard',adminController.loadDashboard)

//logout
adminRoute.get('/logout',adminController.logout)

//users options
adminRoute.get('/users',adminController.userList)
adminRoute.get('/userview',adminController.userView)
adminRoute.get('/block',adminController.blockUser)
adminRoute.get('/unblock',adminController.unblockUser)


//product routes
adminRoute.post('/product',productContoller.addProduct)
adminRoute.get('/loadProduct',productContoller.loadProduct)
adminRoute.get('/showProduct',productContoller.loadProductPage)
adminRoute.get('/productView',productContoller.productView)
adminRoute.get('/delete',productContoller.deleteProduct)
adminRoute.get('/edit-product/:id',productContoller.editProduct)
adminRoute.post('/edit-product/:id',productContoller.updateEditProduct)

//catagory routes
adminRoute.post('/category', catagoryController.createCategory);
adminRoute.get('/loadCategory',catagoryController.loadCategory)
adminRoute.get('/search',productContoller.ProductSearch)




module.exports=adminRoute
