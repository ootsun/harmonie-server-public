import pkg from "mongoose";
const { Schema, model } = pkg;

const courseSchema = Schema({
  _id: Schema.Types.ObjectId,
  date: { type: Date, default: Date.now, required: true },
  patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  training: { type: Schema.Types.ObjectId, ref: "Training", required: true },
  toPay: { type: Number, required: true },
  paid: Number,
  paymentMethods: { type: [String] },
});

export default model("Course", courseSchema);
