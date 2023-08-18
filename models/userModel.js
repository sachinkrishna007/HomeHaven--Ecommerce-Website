const mongoose=require("mongoose")
const addressSchema = new mongoose.Schema({
    name: { type:String, required : true},
    mobile: {type:String, required : true},
    landmark: { type: String, required: false },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    district: { type: String, required: true },
    address: { type: String, required:true},
  });

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
    },
    address:[addressSchema],

    selectedAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
      },
      coupons:{
        type:Array,
    },
    wallet:{
        type:Number,
        default:0
    }


})

module.exports=mongoose.model('User',userSchema)