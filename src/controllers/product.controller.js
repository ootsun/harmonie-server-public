import pkg from 'mongoose';

const {Types} = pkg;
import Product from '../models/product.model.js';
import log from '../logger.js';
import {Workbook} from 'excel4node';
import fs from 'fs';
import * as os from 'os';
import path from 'path';

export function createProduct(req, res, next) {
    if (!req.body) {
        return res.status(400).send('Request body is missing');
    }
    const product = new Product({
        _id: new Types.ObjectId(),
        title: req.body.title,
        brand: req.body.brand,
        price: req.body.price,
        vatAmount: req.body.vatAmount,
        stock: req.body.stock,
        losses: req.body.losses,
    });
    product
        .save()
        .then((result) => {
            res.status(201).json({
                message: 'Handling POST requests to /products',
                createdProduct: product,
            });
        })
        .catch((err) => {
            log.debug(err);
            const error = new Error(err);
            next(error);
        });
}

export function getProducts(req, res, next) {
    Product.find({archived: false})
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

export function getProduct(req, res, next) {
    Product.findById(req.params.id)
        .exec()
        .then((doc) => {
            if (doc) {
                if(doc.archived) {
                    res.status(404).json({message: "Product is archived"});
                } else {
                    res.status(200).json(doc);
                }
            } else {
                res
                    .status(404)
                    .json({message: 'No valid entry found for provided ID'});
            }
        })
        .catch((err) => {
            log.debug(err);
            const error = new Error(err);
            next(error);
        });
}

export function updateProduct(req, res, next) {
    const id = req.params.id;
    Product.updateOne({_id: id}, {$set: req.body})
        .exec()
        .then((result) => {
            res.status(200).json(result);
        })
        .catch((err) => {
            const error = new Error(err);
            next(error);
        });
}

export function updateProductStock(id, initialNbItemSold, newNbItemSold) {
    return Product.findById(id)
        .exec()
        .then((doc) => {
            if (doc) {
                const difference = newNbItemSold - initialNbItemSold;
                let newStock = doc.stock - difference;
                if (newStock < 0) {
                    newStock = 0;
                }
                Product.updateOne({_id: id}, {$set: {stock: newStock}})
                    .exec()
                    .catch((err) => {
                        throw new Error(err);
                    });
            } else {
                throw new Error('No valid entry found for provided _id');
            }
        })
        .catch((err) => {
            log.debug(err);
            throw new Error(err);
        });
}

export function deleteProduct(req, res, next) {
    const id = req.params.id;
    req.body.archived = true;
    Product.update({ _id: id }, { $set: req.body })
      .exec()
      .then((result) => {
          res.status(200).json(result);
      })
      .catch((err) => {
          const error = new Error(err);
          next(error);
      });
}

export async function exportLosses(req, res, next) {
    const year = req.params.year;
    try {
        const result = await Product.find(
            {
                losses: {
                    $elemMatch: {
                        date: {
                            $gte: new Date(year * 1, 0),
                            $lt: new Date(year * 1 + 1, 0)
                        }
                    }
                }
            })
            .exec();

        const losses = result.flatMap(product => product.losses).sort(lossSortFn);
        const productByLossMap = new Map();
        for (const product of result) {
            for (const loss of product.losses) {
                productByLossMap.set(loss, product);
            }
        }

        const workBook = new Workbook({
            defaultFont: {
                size: 11,
                name: 'Calibri',
                color: 'black',
            },
            dateFormat: 'dd/mm/yyyy',
            author: 'Catherine Delhaye',
            numberFormat: '#,##0.00€; (#,##0.00€); -'
        });
        const workSheet = workBook.addWorksheet('Pertes ' + year);

        fillSheet(workBook, workSheet, losses, productByLossMap);

        fs.mkdtemp(path.join(os.tmpdir(), 'harmonie-'), (err, folder) => {
            if (err) {
                throw err;
            }
            const fileName = path.join(folder, 'Pertes - ' + year + '.xlsx');
            workBook.write(fileName, async (err) => {
                if (err) {
                    throw err;
                }
                log.debug('Excel export was written at ' + fileName);
                res.download(fileName);
            });
        });

    } catch (err) {
        log.debug(err);
        const error = new Error(err);
        next(error);
    }
}

const lossSortFn = (a, b) => {
    return a.date.getTime() - b.date.getTime();
}

function getNumberFormat(workBook) {
    return workBook.createStyle({
        numberFormat: '#,##0.00€; #,##.00€; -'
    });
}

function fillSheet(workBook, workSheet, losses, productByLossMap) {
    const numberStyle = getNumberFormat(workBook);

    let rowIndex = 2;
    let total = 0;

    for (const loss of losses) {
        const product = productByLossMap.get(loss);
        workSheet.cell(rowIndex, 1).date(dateWithoutTime(loss.date));
        workSheet.cell(rowIndex, 2).string(product.brand + ' - ' + product.title);
        workSheet.cell(rowIndex, 3).number(loss.price).style(numberStyle);
        workSheet.cell(rowIndex, 4).number(loss.quantity);
        workSheet.cell(rowIndex, 5).number(loss.price * loss.quantity).style(numberStyle);
        total += loss.price * loss.quantity;
        rowIndex++;
    }

    addHeader(workBook, workSheet);
    addFooter(workBook, workSheet, rowIndex, total);
}

function addHeader(workBook, workSheet) {
    const style = workBook.createStyle({
        font: {
            bold: true,
            color: 'white'
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: '#3F51B5',
            fgColor: '#3F51B5'
        },
    });

    workSheet.cell(1, 1).string('Date').style(style);
    workSheet.cell(1, 2).string('Intitulé').style(style);
    workSheet.cell(1, 3).string('Prix d\'achat').style(style);
    workSheet.cell(1, 4).string('Quantité').style(style);
    workSheet.cell(1, 5).string('Total').style(style);
    workSheet.row(1).freeze();
    workSheet.column(2).setWidth(60);
}

function addFooter(workBook, workSheet, rowIndex, total) {
    const styleString = workBook.createStyle({
        font: {
            bold: true,
            color: '#ff4081'
        }
    });
    const totalPriceStyle = workBook.createStyle({
        font: {
            bold: true,
        }
    });
    const numberStyle = getNumberFormat(workBook);
    workSheet.cell(rowIndex, 4).string('Total :').style(styleString);
    workSheet.cell(rowIndex, 5).number(total).style(totalPriceStyle).style(numberStyle);
}

function dateWithoutTime(date) {
    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    return date;
}
