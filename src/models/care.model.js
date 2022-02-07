import pkg from "mongoose";
const { Schema, model } = pkg;

const careSchema = Schema({
  _id: Schema.Types.ObjectId,
  date: { type: Date, default: Date.now, required: true },
  patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  type: { type: Schema.Types.ObjectId, ref: "CareType", required: true },
  toPay: { type: Number, required: true },
  paid: Number,
  paymentMethods: { type: [String] },
  note: String,
});

export default model("Care", careSchema);
