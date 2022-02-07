import pkg from "mongoose";
const { Types } = pkg;
import Patient from "../models/patient.model.js";
import log from "../logger.js";

export function createPatient(req, res, next) {
  if (!req.body) {
    return res.status(400).send("Request body is missing");
  }
  const patient = new Patient({
    _id: new Types.ObjectId(),
    lastName: req.body.lastName,
    firstName: req.body.firstName,
    phone: req.body.phone,
    mobile: req.body.mobile,
    email: req.body.email,
    subscriptionDate: req.body.subscriptionDate
      ? req.body.subscriptionDate
      : undefined,
    gender: req.body.gender,
    birthDate: req.body.birthDate,
    nbChildren: req.body.nbChildren,
    job: req.body.job,
    address: req.body.address
  });
  patient
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Handling POST requests to /patients",
        createdPatient: patient,
      });
    })
    .catch((err) => {
      log.debug(err);
      const error = new Error(err);
      next(error);
    });
}

export function getPatients(req, res, next) {
  Patient.find({archived: false})
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

export function getPatient(req, res, next) {
  Patient.findById(req.params.id)
    .exec()
    .then((doc) => {
      log.debug(doc);
      if (doc) {
        if(doc.archived) {
          res.status(404).message({message: "Patient is archived"});
        } else {
          res.status(200).json(doc);
        }
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch((err) => {
      log.debug(err);
      const error = new Error(err);
      next(error);
    });
}

export function updatePatient(req, res, next) {
  const id = req.params.id;
  Patient.update({ _id: id }, { $set: req.body })
    .exec()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
}

export function deletePatient(req, res, next) {
  const id = req.params.id;
  req.body.archived = true;
  Patient.update({ _id: id }, { $set: req.body })
      .exec()
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        const error = new Error(err);
        next(error);
      });
}
