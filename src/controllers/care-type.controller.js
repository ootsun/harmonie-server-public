import pkg from "mongoose";
const { Types } = pkg;
import CareType from "../models/care-type.model.js";
import log from "../logger.js";

export function createCareType(req, res, next) {
  if (!req.body) {
    return res.status(400).send("Request body is missing");
  }
  const careType = new CareType({
    _id: new Types.ObjectId(),
    title: req.body.title,
    price: req.body.price,
  });
  careType
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Handling POST requests to /care-types",
        createdCareType: careType,
      });
    })
    .catch((err) => {
      log.error(err);
      const error = new Error(err);
      next(error);
    });
}

export function getCareTypes(req, res, next) {
  CareType.find({archived: false})
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

export function getCareType(req, res, next) {
  CareType.findById(req.params.id)
    .exec()
    .then((doc) => {
      if (doc) {
        if(doc.archived) {
          res.status(404).message({message: "Care type is archived"});
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

export function updateCareType(req, res, next) {
  const id = req.params.id;
  CareType.update({ _id: id }, { $set: req.body })
    .exec()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
}

export function deleteCareType(req, res, next) {
  const id = req.params.id;
  req.body.archived = true;
  CareType.update({ _id: id }, { $set: req.body })
    .exec()
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      const error = new Error(err);
      next(error);
    });
}