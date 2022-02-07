import pkg from "mongoose";

const {Types} = pkg;
import Care from "../models/care.model.js";
import log from "../logger.js";

export function createCare(req, res, next) {
    if (!req.body) {
        return res.status(400).send("Request body is missing");
    }
    const care = new Care({
        _id: new Types.ObjectId(),
        date: req.body.date ? req.body.date : undefined,
        patient: req.body.patient._id,
        type: req.body.type,
        toPay: req.body.toPay,
        paid: req.body.paid,
        paymentMethods: req.body.paymentMethods,
        note: req.body.note
    });
    care
        .save()
        .then((result) => {
            res.status(201).json({
                message: "Handling POST requests to /cares",
                createdCare: care,
            });
        })
        .catch((err) => {
            log.debug(err);
            const error = new Error(err);
            next(error);
        });
}

export function getCares(req, res, next) {
    Care.find()
        .populate("patient", "lastName firstName")
        .populate("type", "title")
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

export function getCare(req, res, next) {
    Care.findById(req.params.id)
        .populate("patient", "lastName firstName")
        .populate("type", "title")
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

export function updateCare(req, res, next) {
    Care.findById(req.params.id).then((care) => {
        care.date = req.body.date;
        care.patient = req.body.patient._id;
        care.type = req.body.type._id;
        care.toPay = req.body.toPay;
        care.paid = req.body.paid;
        care.paymentMethods = req.body.paymentMethods;
        care.note = req.body.note;

        care
            .save()
            .then((result) => {
                res.status(200).json(result);
            })
            .catch((err) => {
                const error = new Error(err);
                next(error);
            });
    });
}

export function deleteCare(req, res, next) {
    Care.deleteOne({_id: req.params.id})
        .exec()
        .then((result) => {
            res.status(200).json(result);
        })
        .catch((err) => {
            const error = new Error(err);
            next(error);
        });
}

export function searchCares(beginDate, endDate) {
    return Care.find({date: {
            $gte: beginDate,
            $lt: endDate
        }})
        .populate("type", "title")
        .exec();
}
