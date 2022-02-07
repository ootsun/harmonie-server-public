import pkg from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
const { Schema, model } = pkg;

const userSchema = Schema({
    _id: Schema.Types.ObjectId,
    email: {type: String, required: true, unique: true},
    password: {type : String, required: true},
    lastName: {type : String, required: true},
    firstName: {type : String, required: true},
    failedLoginAttempts: {type : Number, default: 0, required: true},
});

userSchema.plugin(uniqueValidator);

const User = model('User', userSchema);
export default User;
