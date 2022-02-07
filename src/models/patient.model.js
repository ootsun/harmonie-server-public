import pkg from 'mongoose';
const { Schema, model } = pkg;

const patientSchema = Schema({
    _id: Schema.Types.ObjectId,
    lastName: {type : String, required: true},
    firstName: {type : String, required: true},
    phone: String,
    mobile: String,
    email: String,
    subscriptionDate: {type : Date, default: Date.now},
    gender: {type : String, required: true},
    birthDate: Date,
    nbChildren: Number,
    job: String,
    address: {
        country: String,
        zipCode: Number,
        city: String,
        street: String,
        number: String
    },
    archived: { type: Boolean, default: false}
});

const Patient = model('Patient', patientSchema);
export default Patient;
