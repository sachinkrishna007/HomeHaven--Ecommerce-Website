const mongoose=require("mongoose")


const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
   
    email:{
        type:String,
        Required:true
    },
    mobile:{
        type:String,
        Required:true
    },
    password:{
        type:String,
        Required:true
    },
    is_blocked:{
        type:Number,
        requried:true,
        default:false
    }
    


})

module.exports=mongoose.model('User',userSchema)