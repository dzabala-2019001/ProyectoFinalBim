import {Schema, model} from 'mongoose'

const cartSchema= Schema({
    user:{
        type: Schema.Types.ObjectId,
        ref: 'user',
        require: [true, "User is require"]
    },
    products:[{
        product:{
            type: Schema.Types.ObjectId,
            ref: 'product',
            require: [true, "Product is require"]
        },
        quantity:{
            type: Number,
            default: 1,
            require: [true, "Quantity is require"]
        }
    }],
    total:{
        type: Number,
        require: true
    }
    
},{
    versionKey: false
})

export default model('cart', cartSchema)