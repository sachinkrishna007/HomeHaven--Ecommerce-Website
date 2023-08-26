const mongoose = require('mongoose');

const ContactSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
   
    email:{
        type:String,
        Required:true
    },
    subject:{
        type:String,
        Required:true
    },
    message:{
        type:String,
        Required:true
    }
   

})

module.exports=mongoose.model('Contact',ContactSchema)