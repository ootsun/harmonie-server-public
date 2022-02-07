import pkg from "mongoose";

const {Types} = pkg;
import Course from "../models/course.model.js";
import log from "../logger.js";

export function createCourse(req, res, next) {
    if (!req.body) {
        return res.status(400).send("Request body is missing");
    }
    const course = new Course({
        _id: new Types.ObjectId(),
        date: req.body.date ? req.body.date : undefined,
        patient: req.body.patient._id,
        training: req.body.training,
        toPay: req.body.toPay,
        paid: req.body.paid,
        paymentMethods: req.body.paymentMethods,
    });
    course
        .save()
        .then((result) => {
            res.status(201).json({
                message: "Handling POST requests to /courses",
                createdCourse: course,
            });
        })
        .catch((err) => {
            log.debug(err);
            const error = new Error(err);
            next(error);
        });
}

export function getCourses(req, res, next) {
    Course.find()
        .populate("patient", "lastName firstName")
        .populate("training", "title")
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

export function getCourse(req, res, next) {
    Course.findById(req.params.id)
        .populate("patient", "lastName firstName")
        .populate("training", "title")
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

export function updateCourse(req, res, next) {
    Course.findById(req.params.id).then((course) => {
        course.date = req.body.date;
        course.patient = req.body.patient._id;
        course.training = req.body.training._id;
        course.toPay = req.body.toPay;
        course.paid = req.body.paid;
        course.paymentMethods = req.body.paymentMethods;

        course
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

export function deleteCourse(req, res, next) {
    Course.deleteOne({_id: req.params.id})
        .exec()
        .then((result) => {
            res.status(200).json(result);
        })
        .catch((err) => {
            const error = new Error(err);
            next(error);
        });
}

export function searchCourses(beginDate, endDate) {
    return Course.find({date: {
            $gte: beginDate,
            $lt: endDate
        }})
        .populate("training", "title")
        .exec();
}
