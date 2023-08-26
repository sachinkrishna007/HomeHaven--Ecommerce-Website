
const User = require("../models/userModel")
const Admin = require("../models/adminModel")
const Product = require('../models/productModel')
const Category = require('../models/catagoryModel')
const Order = require('../models/orderModel')
const path = require('path')
const easyinvoice = require("easyinvoice");
const fs=require('fs')
const multer = require('multer')
const { Readable } = require('stream');
const { CANCELLED } = require("dns")
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
});
    
// const upload = require('./multerConfig');



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'views/admin/images'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        const ext = path.extname(file.originalname); 
        const filename = uniqueSuffix + ext; 
        cb(null, filename);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 5, 
    },
});

   
const addProduct = async (req, res) => {
    
    try {
        upload.array('images', 4)(req, res, async (err) => {
            if (err) {
                console.error(err); 
                return res.redirect('/admin'); 
            }

            // const { name, description, price, category } = req.body;
            const imageNames = req.files.map((file) => path.basename(file.path));
            const category = await Category.findOne({_id:req.body.category})
            console.log();

            const newProduct = new Product({
                name:req.body.name,
                description:req.body.description,
                price:req.body.price,
                category:category._id,
                stock:req.body.stock,
                offerprice:req.body.offerprice,

                images: imageNames,
            });

            const ProductResult = await newProduct.save();
            
        
            
           
            res.redirect('/admin/loadProduct'); 

        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};



const loadProduct = async(req,res)=>{
    try {
        const categories = await Category.find({}, '_id name');
        res.render('product-add',{categories})
    } catch (error) {
        console.log(error);
        
    }
}
const loadProductPage = async(req,res)=>{
    try{
        res.render('product-list')

    }catch(error){
        console.log(error);
    }
}

const productView = async(req,res)=>{
    try {
        let search = ''
      if(req.query.search){
        search = req.query.search
      } 
      const productData= await Product.find({
        $or: [

            {name:{$regex:'.*'+search+'.*',$options:'i'}},
        ]
    }).sort({_id:-1}).populate('category');

        // const productData= await Product.find({})
        res.render('product-list',{productData})

    } catch (error) {
        
    }
}

const deleteProduct = async(req,res)=>{
    try{
        const id=req.query.id;
        await Product.deleteOne({_id:id})
        res.redirect('/admin/productView')
    }catch(error){
        console.log(error);
    }
}
// add error image and render
const editProduct = async(req,res)=>{
    try{
        const productId = req.params.id;
        const product = await Product.findById(productId);
        const categories = await Category.find();
        // const images = req.files.map(file => file.filename);

        res.render('edit-product', { product, categories });
    }catch(error){
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}
// uncle bob cleancode structure
// const updateEditProduct = async (req, res) => {
//     try {
      
//         upload.array('images')(req, res, async (err) => {
//             if (err) {  
//                 console.error(err);
//                 return res.redirect('/admin');
//             }

//             const productId = req.params.id;
//             // const { name, description, price, category } = req.body;
//             const imageNames = req.files.map((file) => path.basename(file.path));
//             const category = await Category.findOne({_id:req.body.category})


//             const updatedProduct = await Product.findByIdAndUpdate(
//                 productId,
//                 {
//                     name:req.body.name,
//                     description:req.body.description,
//                     price:req.body.price,
//                     category:category.name,
//                     stock:req.body.stock,
//                     offerprice:req.body.offerprice,
//                     images: imageNames,

//                 },
//                 { new: true }
//             );

//             res.redirect('/admin/productView');
//         });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).send('Internal Server Error');
//     }
// };


const updateEditProduct = async (req, res) => {
  try {
      upload.array('images')(req, res, async (err) => {
          if (err) {  
              console.error(err);
              return res.redirect('/admin');
          }
          var existingImages = req.body.existingImages || []
          const removedImages = req.body.removedImages || [];
          var newImages  = []
          for(let i=0;i<req.files.length;i++){
            if(req.files[i]!==undefined){
              newImages.push(req.files[i].filename)
            }
          }
          const remainingImages = existingImages.filter(image => !removedImages.includes(image));
      

          const productId = req.params.id;
          const existingProduct = await Product.findById(productId);

          const category = await Category.findOne({ _id: req.body.category });

          // Check if new images are uploaded
          // let newImageNames = existingProduct.images;
          // if (req.files && req.files.length > 0) {
          //     newImageNames = req.files.map((file) => path.basename(file.path));
          // }

          const updatedProduct = await Product.findByIdAndUpdate(
              productId,
              {
                  name: req.body.name,
                  description: req.body.description,
                  price: req.body.price,
                  category: category._id,
                  stock: req.body.stock,
                  offerprice: req.body.offerprice,
                  images:remainingImages.concat(newImages),
              },
              { new: true }
          );

          res.redirect('/admin/productView');
      });
  } catch (error) {
      console.error(error.message);
      res.status(500).send('Internal Server Error');
  }
};


const ProductSearch = async(req,res)=>{
    try{
           const query=req.query.query
           const products=await Product.find({
            $or:[
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
            ]
           }) 
           res.render('product-list', { productData: products });
    }catch(error){
        console.log(message.error);
    }
}

const ITEMS_PER_PAGE = 15; 

const orderStatus = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; 
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

    const orders = await Order.find().sort({_id:-1})
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE)
      .populate('user');

    res.render('order-status', {
      order: orders,
      currentPage: page,
      totalPages: totalPages
    });
  } catch (error) {
    console.log(error.message);
    res.redirect('/admin'); 
  }
};
 
const adminViewOrders = async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const order = await Order.findById(orderId).populate('items.productId');
      if (!order) {
        return res.status(404).json({ error: 'Order not found.' });
      }
  
      const userId = req.session.user_id;
      const user = await User.findById(userId);
      const selectedAddressId = user.selectedAddress;
      let selectedAddress;
      if (selectedAddressId) {
        selectedAddress = user.address.find((address) => address._id.equals(selectedAddressId));
      }
   
      res.render('order-details-admin', { order: order, selectedAddress: selectedAddress });
    } catch (error) {
      console.log(error.message);
      res.redirect('/'); 
    }
  };

const updateStatus = async(req,res) => {
    try{
        const orderId = req.params.orderId;
        const {newStatus,currentPage} = req.body;

        await Order.findByIdAndUpdate(orderId,{status:newStatus})

        res.redirect(`/admin/orders?page=${currentPage}`)

    }catch(error){
        console.log(error.message);
    }
}

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId).populate('items.productId');
    for (const item of order.items) {
      const product = item.productId;
      const originalStock = product.stock;

      // Increase the stock quantity
      product.stock = originalStock + item.quantity;
      await product.save();
    }

    // Check if the payment type is online (razorpay)
    if (order.paymentMethod === 'razorpay' || order.paymentMethod==="wallet") {
      const totalAmountRefunded = order.total; // Refund the order's total amount
    

      // Fetch the user's wallet balance
      const userId = order.user;
      const user = await User.findById(userId);
      const currentWalletBalance = user.wallet || 0;
     

      // Update the user's wallet balance
      user.wallet = currentWalletBalance + totalAmountRefunded;
      user.walletTransaction.push({
        type: 'credit',
        amount:totalAmountRefunded,
        date: new Date()
    });
      
      await user.save();

      await Order.findByIdAndUpdate(orderId, { status: "CANCELLED" });

      res.json({ message: 'Order cancelled successfully. Wallet refunded.' });
    } else {
      await Order.findByIdAndUpdate(orderId, { status: "CANCELLED" });
      res.json({ message: 'Order cancelled successfully' });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: 'An error occurred while cancelling the order' });
  }
};


const returnOrder = async(req,res) =>{
  try {
    console.log('reached');
    const orderId = req.params.orderId;
    console.log(orderId);
    const order = await Order.findById(orderId).populate('items.productId');
      await Order.findByIdAndUpdate(orderId, { status: "Return-Req" });
      res.json({ message: 'Order retun requested' });
    
  } catch (error) {
    
  }
}

const acceptreturn = async (req,res) => {
  try {
    const orderId = req.params.orderId;
    const order = await Order.findById(orderId).populate('items.productId');
    for (const item of order.items) {
      const product = item.productId;
      const originalStock = product.stock;

      // Increase the stock quantity
      product.stock = originalStock + item.quantity;

      await product.save();

      if (order.paymentMethod === 'razorpay' || order.paymentMethod==="wallet") {
        const totalAmountRefunded = order.total; // Refund the order's total amount
      
  
        // Fetch the user's wallet balance
        const userId = order.user;
        const user = await User.findById(userId);
        const currentWalletBalance = user.wallet || 0;
       
  
        // Update the user's wallet balance
        user.wallet = currentWalletBalance + totalAmountRefunded;
        user.walletTransaction.push({
          type: 'credit',
          amount: totalAmountRefunded,
          date: new Date()
      });
      
        
        await user.save();
  


      await Order.findByIdAndUpdate(orderId, { status: "Return Accepted" });
      res.json({ message: 'Order retun requested' });
      }else{
        await Order.findByIdAndUpdate(orderId, { status: "Return Accepted" });
        res.json({ message: 'Order retun requested' });
      }

    }
  } catch (error) {
    
  }

}
  // list
 const listProduct = async(req,res)=>{
    try {
      const id = req.query.id
      console.log(id);
      await Product.findByIdAndUpdate({_id:id},{$set:{is_Listed:false}})
      res.redirect('/admin/productView')
    } catch (error) {
      console.log(error)
    }
  }
 
//unblock the user
  const unlistProduct = async(req,res)=>{
    try {
      const id = req.query.id
      await Product.findByIdAndUpdate({_id:id},{$set:{is_Listed:true}})
      res.redirect('/admin/productView')
    } catch (error) {
      console.log(error)
    }
  }

  const downloadInvoice = async (req, res) => {
    try {
      const id = req.query.id;
      const user = req.session.user_id;
  
     
      const customer = {
       
      };
  
     
      const order = await Order.findOne({ _id: id }).populate('items.productId');
      console.log('Order ID:', order._id.toString());
    console.log('Order Created At:', order.createdAt);
      const date = order.createdAt.toLocaleDateString();
  
      const products = order.items.map(async (item) => {
        
        const product = await Product.findOne({ _id: item.productId });
  
        return {
          quantity: item.quantity,
          description: product.name, 
          price: item.total,
          "tax-rate":0,
          total:order.subTotal
          
        };
      });
  
      const productsWithData = await Promise.all(products);
  
      const subTotal = productsWithData.reduce((total, product) => total + product.price, 0);
  
      const totalAmount = subTotal; 
      console.log('subTotal:', subTotal);
       console.log('totalAmount:', totalAmount);

  
      const data = {
        documentTitle: 'Invoice',
        currency: 'USD',
        marginTop: 25,
        marginRight: 25,
        marginLeft: 25,
        marginBottom: 25,
        logo: 'https://public.easyinvoice.cloud/img/watermark-draft.jpg',
        sender: {
          company: 'Home Haven',
          address: 'Brototype',
          zip: '686633',
          city: 'Maradu',
          country: 'India',
          taxNotation: 'vatnone'
        },
        client: {
         
         
        },
        invoiceNumber:order._id.toString(),
        invoiceDate: order.createdAt.toISOString(),
        information: {
          number: order._id.toString(), // Invoice number
          date: order.createdAt.toISOString(), // Invoice date
          'due-date': 'Nil', // Due date (customize as needed)
        },
        products: productsWithData,
        amount: {
          subtotal: subTotal.toFixed(2), // Display subtotal with two decimal places
          total: (subTotal + totalAmount).toFixed(2)
        },

        bottomNotice: 'Thank you, Keep shopping.',
      };
  
      const pdfResult = await easyinvoice.createInvoice(data);
      const pdfBuffer = Buffer.from(pdfResult.pdf, 'base64');
  
      res.setHeader('Content-Disposition', 'attachment; filename="invoice.pdf"');
      res.setHeader('Content-Type', 'application/pdf');
  
      const pdfStream = new Readable();
      pdfStream.push(pdfBuffer);
      pdfStream.push(null);
  
      pdfStream.pipe(res);
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).send('Error generating invoice.');
    }
  };
  
module.exports = {
    addProduct,
    loadProduct,
    loadProductPage,
    productView,
    deleteProduct,
    editProduct,
    updateEditProduct,
    ProductSearch,
    orderStatus,
    updateStatus,
    cancelOrder,
    listProduct,
    unlistProduct,
    adminViewOrders,
    returnOrder,
    acceptreturn,
    downloadInvoice
};


