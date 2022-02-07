import pkg from 'mongoose';
const { Schema, model } = pkg;

const careTypeSchema = Schema({
    _id: Schema.Types.ObjectId,
    title: {type : String, required: true},
    price: {type : Number, required: true},
    archived: { type: Boolean, default: false}
});

export default model('CareType', careTypeSchema);
