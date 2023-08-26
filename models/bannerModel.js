const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
      },
      link: {
        type: String,
    },
      image: {
        type: Array,
        required: true,
      },
      
    
})

module.exports = mongoose.model('Banner',bannerSchema)