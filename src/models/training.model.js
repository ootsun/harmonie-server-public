import pkg from 'mongoose';
const { Schema, model } = pkg;

const trainingSchema = Schema({
    _id: Schema.Types.ObjectId,
    title: {type : String, required: true},
    archived: { type: Boolean, default: false}
});

export default model('Training', trainingSchema);
