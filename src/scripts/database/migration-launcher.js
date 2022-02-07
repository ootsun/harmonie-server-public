import Patient from "../../models/patient.model.js";
import Product from "../../models/product.model.js";
import CareType from "../../models/care-type.model.js";
import Care from "../../models/care.model.js";
import Sale from "../../models/sale.model.js";
import User from "../../models/user.model.js";
import {v1VatAmountOnProduct} from "./v1-vat-amount-on-product.js";
import {v2ToPayAndPaidOnSaleLine} from "./v2-toPay-and-paid-on-saleLine.js";
import {v3PaymentMethodsAsArray} from "./v3-payment-methods-as-array.js";
import {v4SetArchivedToFalse} from './v4-set-archived-to-false.js';
import mongoose from 'mongoose';


const DB_PROTOCOL = 'mongodb';
const DB_USERNAME = '';
const DB_PASSWORD = '';
const DB_URL = "";
const DB_PORT = 27017;
const DB_NAME = "";
const DB_CONNECT_MAX_RETRIES = 5;
const DB_CONNECT_RETRY_DELAY_IN_MS = 10000;
let nbRetries = 0;

let patients;
let products;
let careTypes;
let cares;
let sales;
let users;

async function migrate() {
    // console.log("Begin v1VatAmountOnProduct")
    // await v1VatAmountOnProduct(products);
  //   console.log("Begin v2ToPayAndPaidOnSaleLine")
  // await v2ToPayAndPaidOnSaleLine(sales);
  //     console.log("Begin v3PaymentMethodsAsArray")
  //   await v3PaymentMethodsAsArray(cares, sales);
         console.log("Begin v4SetArchivedToFalse")
       await v4SetArchivedToFalse(patients, products, careTypes);
}

connectDB();

function connectDB() {
    let connectionString = DB_PROTOCOL + "://" + DB_USERNAME + ":" + DB_PASSWORD + "@" + DB_URL;
    if(DB_PORT > 0) {
        connectionString += ":" + DB_PORT;
    }
    connectionString += "/" + DB_NAME;
    mongoose.connect(connectionString,
      {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true,
          useFindAndModify: false
      },
        async function (err, db) {
            if (err) {
                console.log(
                    "Unable to connect to the database. nbRetries = " +
                    nbRetries +
                    ". Error: ",
                    err
                );
                if (nbRetries < DB_CONNECT_MAX_RETRIES) {
                    setTimeout(function () {
                        nbRetries++;
                        connectDB();
                    }, DB_CONNECT_RETRY_DELAY_IN_MS);
                }
            } else {
                console.log("Connected to database successfully!");

                await fetchData();
                await migrate();
                console.log("Migration finished")
                process.exit(1);
            }
        }
    );
}

async function fetchData() {
    try {
        console.log("fetchData...")
        patients = await Patient.find();
        products = await Product.find();
        careTypes = await CareType.find();
        cares = await Care.find()
            .populate("patient", "lastName firstName")
            .populate("type", "title");
        sales = await Sale.find()
            .populate("patient", "lastName firstName")
            .populate("saleLines.product", "_id brand title price");
        users = await User.find();
        console.log("all data is fetched")
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}
