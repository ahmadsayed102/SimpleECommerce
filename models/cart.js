const mongoose = require('mongoose')
const schema = mongoose.Schema

const cartSchema = new schema({
    user : {
        type : mongoose.Types.ObjectId,
        ref : 'User',
        required : true
    },
    product : {
        type : mongoose.Types.ObjectId,
        ref : 'Product',
        required : true
    },
    count : {
        type : Number,
        required : true
    }
},
{
    timestamps : true
})

module.exports = mongoose.model('Cart', cartSchema)