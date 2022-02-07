import pkg from 'mongoose';
const { Schema, model } = pkg;

const productSchema = Schema({
    _id: Schema.Types.ObjectId,
    title: {type : String, required: true},
    brand: String,
    price: {type : Number, required: true},
    vatAmount: {type : Number, required: true},
    stock: {type : Number, required: true},
    losses: {
        type: [{
            date: { type: Date, default: Date.now, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true }
        }]
    },
    archived: { type: Boolean, default: false}
});

export default model('Product', productSchema);