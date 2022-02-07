import pkg from "mongoose";

const {Types} = pkg;
import Sale from "../models/sale.model.js";
import log from "../logger.js";
import {updateProductStock} from "./product.controller.js";

export function createSale(req, res, next) {
    if (!req.body) {
        return res.status(400).send("Request body is missing");
    }
    log.debug(req.body);

    const sale = new Sale({
        _id: new Types.ObjectId(),
        date: req.body.date,
        saleLines: req.body.saleLines.map(sl => {
            return {
                product: sl.product._id,
                quantity: sl.quantity,
                toPay: sl.toPay,
                paid: sl.paid
            }
        }),
        patient: req.body.patient._id,
        paymentMethods: req.body.paymentMethods,
    });

    sale
        .save()
        .then((result) => {
            const promises = [];
            for (const saleLine of result.saleLines) {
                promises.push(updateProductStock(saleLine.product, 0, saleLine.quantity));
            }
            Promise.all(promises)
                .then(() => {
                    res.status(201).json({
                        message: "Handling POST requests to /sale",
                        createdSale: result,
                    });
                })
                .catch((err) => {
                    next(err);
                })
        })
        .catch((err) => {
            log.debug(err);
            const error = new Error(err);
            next(error);
        });
}

export function getSales(req, res, next) {
    Sale.find()
        .populate("patient", "lastName firstName")
        .populate("saleLines.product", "_id brand title price")
        .exec()
        .then((docs) => {
            res.status(200).json(docs);
        })
        .catch((err) => {
            log.debug(err);
            const error = new Error(err);
            next(error);
        });
}

export function getSale(req, res, next) {
    Sale.findById(req.params.id)
        .populate("patient", "lastName firstName")
        .populate("saleLines.product", "_id brand title price")
        .exec()
        .then((doc) => {
            if (doc) {
                res.status(200).json(doc);
            } else {
                res
                    .status(404)
                    .json({message: "No valid entry found for provided ID"});
            }
        })
        .catch((err) => {
            log.debug(err);
            const error = new Error(err);
            next(error);
        });
}

export function updateSale(req, res, next) {
    Sale.findById(req.params.id)
        .exec()
        .then((sale) => {
            const initialSaleLines = [...sale.saleLines];
            sale.date = req.body.date;
            sale.saleLines = req.body.saleLines.map(sl => {
                return {
                    product: sl.product._id,
                    quantity: sl.quantity,
                    toPay: sl.toPay,
                    paid: sl.paid
                }
            });
            sale.patient = req.body.patient._id;
            sale.paymentMethods = req.body.paymentMethods;
            sale
                .save()
                .then((result) => {
                    const promises = updateStockWhenUpdatingSale(result, initialSaleLines);
                    Promise.all(promises)
                        .then(() => {
                            res.status(200).json(result);
                        })
                        .catch(err => next(err));
                })
                .catch((err) => {
                    console.log(err)
                    const error = new Error(err);
                    next(error);
                });
        });
}

export function deleteSale(req, res, next) {
    Sale.findById(req.params.id).then((sale) => {
        Sale.deleteOne({_id: sale._id})
            .exec()
            .then((result) => {
                const promises = [];
                for (const saleLine of sale.saleLines) {
                    promises.push(updateProductStock(saleLine.product, saleLine.quantity, 0));
                }
                Promise.all(promises)
                    .then(() => {
                        res.status(200).json(result);
                    })
                    .catch(err => next(err));
            })
            .catch((err) => {
                const error = new Error(err);
                next(error);
            });
    });
}

function updateStockWhenUpdatingSale(result, initialSaleLines) {
    const promises = [];
    const updatedProducts = [];
    for (const saleLine of result.saleLines) {
        let initialNbItemSold = 0;
        const existingSaleLineIndex = initialSaleLines.findIndex((sl) => sl.product._id.equals(saleLine.product._id));
        if (existingSaleLineIndex >= 0) {
            initialNbItemSold = initialSaleLines[existingSaleLineIndex].quantity;
            updatedProducts.push(saleLine.product);
        }
        promises.push(updateProductStock(saleLine.product, initialNbItemSold, saleLine.quantity));
    }
    for (const saleLine of initialSaleLines) {
        if (updatedProducts.findIndex((p) => p._id.equals(saleLine.product._id)) < 0) {
            promises.push(updateProductStock(saleLine.product, saleLine.quantity, 0));
            updatedProducts.push(saleLine.product);
        }
    }
    return promises;
}

export function searchSales(beginDate, endDate) {
    return Sale.find({date: {
            $gte: beginDate,
            $lt: endDate
        }})
        .populate("saleLines.product", "brand title vatAmount")
        .exec();
}
