require('dotenv').config();
const nocache=require('nocache')
const mongoose=require('mongoose')
mongoose.connect(process.env.MONGODBURL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
})
.then((res)=>{
    console.log("mongodb connected");
})
.catch((error)=>{
    console.log(error.message);
})


 
const express=require("express")
const app=express()


app.use(nocache())

//user route
const userRoute=require('./routes/userRoute')
app.use('/',userRoute)



//admin route
const adminRoute=require('./routes/adminRoute');
app.use('/admin',adminRoute)


// app.use('*',(req,res)=>{
//     res.redirect('/error')
// })

//port
app.listen(3000,function(){
    console.log(" Server Started in http://localhost:3000");
})
