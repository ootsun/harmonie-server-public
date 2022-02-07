import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import log from "./logger.js";
import morgan from "morgan";

import patientRoute from "./routes/patient.js";
import productRoute from "./routes/product.js";
import careTypeRoute from "./routes/care-type.js";
import careRoute from "./routes/care.js";
import saleRoute from "./routes/sale.js";
import userRoute from "./routes/user.js";
import vatRoute from "./routes/vat.js";
import trainingRoute from "./routes/training.js";
import courseRoute from "./routes/course.js";

const app = express();
const PORT = process.env.PORT;
const DB_PROTOCOL = process.env.DB_PROTOCOL;
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_URL = process.env.DB_URL;
const DB_PORT = process.env.DB_PORT;
const DB_NAME = process.env.DB_NAME;
const DB_CONNECT_MAX_RETRIES = process.env.DB_CONNECT_MAX_RETRIES;
const DB_CONNECT_RETRY_DELAY_IN_MS = process.env.DB_CONNECT_RETRY_DELAY_IN_MS;

app.use(
    morgan(":method :url :status - :response-time ms", {
        stream: log.stream,
    })
);

connectDB();
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*, Authorization");
    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE");
        return res.status(200).json({});
    }
    next();
});

app.use("/products", productRoute);
app.use("/patients", patientRoute);
app.use("/care-types", careTypeRoute);
app.use("/cares", careRoute);
app.use("/sales", saleRoute);
app.use("/users", userRoute);
app.use("/vat", vatRoute);
app.use("/trainings", trainingRoute);
app.use("/courses", courseRoute);

app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message,
        },
    });
    log.error(err.stack);
});

app.listen(PORT, () => log.info(`Server has started on port ${PORT}`));

let nbRetries = 0;

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
        function (err, db) {
            if (err) {
                log.error("Unable to connect to the database. nbRetries = " + nbRetries);
                log.error(err);
                if (nbRetries < DB_CONNECT_MAX_RETRIES) {
                    setTimeout(function () {
                        nbRetries++;
                        connectDB();
                    }, DB_CONNECT_RETRY_DELAY_IN_MS);
                }
            } else {
                log.info("Connected to database successfully!");
            }
        }
    );
}
