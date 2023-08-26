const User=require("../models/userModel")
const Admin=require("../models/adminModel")
const bcrypt=require('bcrypt');
const Category=require('../models/catagoryModel')
const Order = require('../models/orderModel')
const Product = require('../models/productModel');
const couponModel = require("../models/couponModel");
const Contact = require('../models/contactModel')


// load the loginpage 
const loadLogin=async(req,res)=>{
    try{
        res.render('adminlogin',{layout:false})

    }
    catch(error){
        console.log(error.message);
    }
}

//load dashboard
const loadDashboard=async(req,res)=>{
    try{

        const orders = await Order.aggregate([
            {
                $match: {
                    "status": "Delivered" 
                }
              },
              {
                $group: {
                  _id: null,
                  totalPriceSum: { $sum: { $toInt: "$total" } },
                  count: { $sum: 1 }
                }
              }
        
            ])

            

            const salesCount = await Order.aggregate([
               
                {
                  $match: {
                    "status": "Delivered"  
                  }
                },
                {
                  $group: {
                    _id: {
                      $dateToString: {  // Group by the date part of createdAt field
                        format: "%Y-%m-%d",
                        date: "$createdAt"
                      }
                    },
                    orderCount: { $sum: 1 }  // Calculate the count of orders per date
                  }
                },
                {
                  $sort: {
                    _id: 1  // Sort the results by date in ascending order
                  }
                }
              ])
          


            const salesData = await Order.aggregate([
                {
                  $match: {
                    "status": "Delivered"  // Consider only completed orders
                  }
                },
                {
                  $group: {
                    _id: {
                      $dateToString: {  // Group by the date part of createdAt field
                        format: "%Y-%m-%d",
                        date: "$createdAt"
                      }
                    },
                    dailySales: { $sum: { $toInt: "$total" } }  // Calculate the daily sales
                  } 
                }, 
                {
                  $sort: {
                    _id: 1  // Sort the results by date in ascending order
                  }
                }
              ])
              const productsCount  = await Product.find({}).count()
              const categoryCount  = await Category.find({}).count()
              const onlinePay = await getOnlineCount()
              const walletPay = await getWalletCount()
              const codPay = await getCodCount()
              const Users = await getUsersCount()
    console.log(orders,productsCount,categoryCount,onlinePay,walletPay,codPay,salesData,salesCount,Users);
        res.render('dashboard',{orders,productsCount,categoryCount,onlinePay,walletPay,codPay,salesData,salesCount,Users})
    }catch(error){
        console.log(error.message);
    }
}

//verify admin login
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const adminData = await Admin.findOne({ email: email });
        if (adminData) {
            
            const passwordMatch = await bcrypt.compare(password, adminData.password);
                  
            if (passwordMatch) {
                req.session.admin_id = adminData._id;
                res.redirect('/admin/dashboard');
            } else {
                
                
                res.render("adminlogin",{layout:false,message:"error"});
            }
        } else {
           
            res.render("adminlogin",{layout:false,message:"error"});
        }
    } catch (error) {
        console.log(error.message);
    }
};

//logout
const logout=async(req,res)=>{
    try {
        req.session.admin_id=null
        res.redirect('/admin')
    } catch (error) {
        
    }
}

//lode userlist
 const userList=async(req,res)=>{
    try {
        res.render('user-list')
    } catch (error) {
        console.log(error.message);   
    }
 }

// get user and view in admin panel
 const userView=async(req,res)=>{
    try {
        
        const userData=await User.find({})
        
        
        res.render('user-list',{user:userData})
    } catch (error) {
        
    }
 }

// block the user
 const blockUser = async(req,res)=>{
    try {
      const id = req.query.id
      await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:true}})
      res.redirect('/admin/userView')
    } catch (error) {
      console.log(error)
    }
  }
 
//unblock the user
  const unblockUser = async(req,res)=>{
    try {
      const id = req.query.id
      await User.findByIdAndUpdate({_id:id},{$set:{is_blocked:false}})
      res.redirect('/admin/userView')
    } catch (error) {
      console.log(error)
    }
  }
  const getOnlineCount = async () => {
    try {
      const response = await Order.aggregate([
        {
          $match: {
            "paymentMethod": "razorpay",
            "status": "Delivered"
          },
        },
        {
          $group: {
            _id: null,
            totalPriceSum: { $sum: "$total" },
            count: { $sum: 1 },
          },
        },
      ]);
  
      return response;
    } catch (error) {
      throw error;
    }
  };
  
  const getWalletCount =  () => {
    return new Promise(async (resolve, reject) => {
      const response = await Order.aggregate([
      
        {
          $match: {
            "paymentMethod": "wallet",
            "status": "Delivered" 

          },
        },
        {
          $group:{
            _id: null,
          totalPriceSum: { $sum: { $toInt: "$total" } },
          count: { $sum: 1 }

          } 

        }

      ]);
      resolve(response);
    });
  }
  const getCodCount =  () => {
    return new Promise(async (resolve, reject) => {
      const response = await Order.aggregate([
       
        {
          $match: {
            "paymentMethod": "COD",
            "status": "Delivered" 

          },
        },
        {
          $group:{
            _id: null,
          totalPriceSum: { $sum: { $toInt: "$total" } },
          count: { $sum: 1 }

          }

        }

      ]);
      resolve(response);
    });
  }
  const getUsersCount = async () => {
    try {
      const response = await User.aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: 1 }
          }
        }
      ]);
  
      if (response && response.length > 0) {
        return response[0].count;
      } else {
        return 0; // No users found
      }
    } catch (error) {
      throw error;
    }
  };
  
  const SalesReport = async (req,res)=>{

    try{ 
        const report = await Order.aggregate([
        {
            $match:{
                'status':'Delivered'
            }
        }
    ])

    let details =[]

    const getDate = (date) => {
        const orderDate = new Date(date);
        const day = orderDate.getDate();
        const month = orderDate.getMonth() + 1;
        const year = orderDate.getFullYear();
        return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${
          isNaN(year) ? "0000" : year
        }`;
      };
      for (const order of report) {
        const product = await Product.findById(order.items[0].productId);
        const user = await User.findById(order.user)
        const userName = user?user.name:'unknown'
        const productName = product ? product.name : 'Unknown Product';
        const orderDate = getDate(order.createdAt);

     
        details.push({
            order,
            productName,
            orderDate,
            userName
          });
        }
    
      res.render('salesReport',{details,getDate})

    }catch(error){
        console.log()

    }
   
  }
  const postSalesReport = async (req, res) => {
    try {
      const details = [];
      const getDate = (date) => {
        const orderDate = new Date(date);
        const day = orderDate.getDate();
        const month = orderDate.getMonth() + 1;
        const year = orderDate.getFullYear();
        return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${
          isNaN(year) ? "0000" : year
        }`;
      };
  
      const orderData = await postReport(req.body); 
      console.log(orderData);
  
      orderData.forEach((order) => {
        const orderDetail = {
          order: order,
          orderDate: getDate(order.createdAt),
        
          productName: order.items[0].productName || 'Unknown Product'
        };
        details.push(orderDetail);
      });
  
      res.render("salesReport", { details, getDate });
    } catch (error) {
      console.log(error.message);
    }
  };
  
    const postReport = async (date) => {
        try {
          const start = new Date(date.startdate);
          const end = new Date(date.enddate);
      
          const response = await Order.aggregate([
            {
              $match: {
                $and: [
                  { "status": "Delivered" },
                  {
                    "createdAt": {
                      $gte: start,
                      $lte: new Date(end.getTime() + 86400000),
                    },
                  },
                ],
              },
            },
          ]).exec();
       
          // Fetch product details for each order item
          const orderData = await Promise.all(response.map(async (order) => {
            const user = await User.findById(order.user);
            console.log(user);

            const itemsWithProductDetails = await Promise.all(order.items.map(async (item) => {
              const product = await Product.findById(item.productId);
              const productName = product ? product.name : 'Unknown Product';
           
              return { ...item, productName };
            }));
      
            return { ...order, user: user ? user.name : 'Unknown User', items: itemsWithProductDetails };
          }));
      
          return orderData;
        } catch (error) {
          console.log(error.message);
        }
      };
      
const loadMessages= async(req,res)=>{
  try {
    const contacts = await Contact.find({})
    res.render('list-mesages',{contacts})
    
  } catch (error) {
    console.log(error.message);
    
  }
}
module.exports={
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    userList,
    userView,
    blockUser,
    unblockUser,
    SalesReport,
    postSalesReport,
    loadMessages
}