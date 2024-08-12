const mongoose = require('mongoose')
const schema = mongoose.Schema

const productSchema = new schema({
    title : {
        type : String ,
        required : true
    },
    price : {
        type : Number ,
        required : true
    },
    imgUrl : {
        type : String ,
        required : true
    },
    discount : {
        type : Number ,
        required : true,
        default:0
    },
    user : { 
        type: mongoose.Schema.Types.ObjectId,
        required : true,
        ref: 'User' 
    }
    },
    {
        timestamps : true
    }
)
// productSchema.statics.deleteProduct = function(productId) {
//     //const prodId = mongoose.Types.ObjectId(productId)
//     return this.deleteOne({_id : productId});
// }

module.exports = mongoose.model('Product', productSchema)
