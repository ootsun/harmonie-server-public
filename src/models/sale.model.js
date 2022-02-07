import pkg from "mongoose";
const { Schema, model } = pkg;

const saleSchema = Schema({
  _id: Schema.Types.ObjectId,
  date: { type: Date, default: Date.now, required: true },
  saleLines: {
    type: [{
      product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
      toPay: { type: Number, required: true },
      paid: Number,
    }],
    required: true},
  patient: { type: Schema.Types.ObjectId, ref: "Patient" },
  paymentMethods: { type: [String] },
});

export default model("Sale", saleSchema);
