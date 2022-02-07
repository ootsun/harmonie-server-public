import Care from "../models/care.model.js";
import Sale from "../models/sale.model.js";
import Course from "../models/course.model.js";
import log from "../logger.js";
import {searchCares} from "./care.controller.js";
import {searchSales} from "./sale.controller.js";
import {searchCourses} from "./course.controller.js";
import {Workbook} from 'excel4node';
import fs from 'fs';
import * as os from "os";
import path from 'path';

export function getVats(req, res, next) {
    let cares = null;
    let sales = null;
    let courses = null;

    const promises = [];
    promises.push(Care.find()
        .populate("patient", "lastName firstName")
        .populate("type", "title")
        .exec()
        .then(docs => cares = docs));
    promises.push(Sale.find()
        .populate("patient", "lastName firstName")
        .populate("saleLines.product", "_id brand title")
        .exec()
        .then(docs => sales = docs));
    promises.push(Course.find()
      .populate("patient", "lastName firstName")
      .populate("training", "title")
      .exec()
      .then(docs => courses = docs));

    Promise.all(promises)
        .then(() => {
            res.status(200).json({
                cares: cares,
                sales: sales,
                courses: courses
            });
        })
        .catch(err => {
            log.debug(err);
            const error = new Error(err);
            next(error);
        });
}

export async function exportVat(req, res, next) {
    const quarter = {
        number: req.body.number,
        year: req.body.year
    };
    const beginDate = new Date(quarter.year, (quarter.number - 1) * 3);
    const endDate = new Date(quarter.year, (quarter.number) * 3);

    const monthsName = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    const promises = [];
    promises.push(searchCares(beginDate, endDate));
    promises.push(searchSales(beginDate, endDate));
    promises.push(searchCourses(beginDate, endDate));

    try {
        const result = await Promise.all(promises);
        const items = [...result[0], ...result[1], ...result[2]];
        log.debug('Number of items to export : ' + items.length);
        const itemsM1 = items.filter(item => item.date.getMonth() === beginDate.getMonth()).sort(vatSortFn);
        const itemsM2 = items.filter(item => item.date.getMonth() === beginDate.getMonth() + 1).sort(vatSortFn);
        const itemsM3 = items.filter(item => item.date.getMonth() === beginDate.getMonth() + 2).sort(vatSortFn);

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
        const workSheetM1 = workBook.addWorksheet(monthsName[beginDate.getMonth()]);
        beginDate.setMonth(beginDate.getMonth() + 1);
        const workSheetM2 = workBook.addWorksheet(monthsName[beginDate.getMonth()]);
        beginDate.setMonth(beginDate.getMonth() + 1);
        const workSheetM3 = workBook.addWorksheet(monthsName[beginDate.getMonth()]);

        fillSheet(workBook, workSheetM1, itemsM1);
        fillSheet(workBook, workSheetM2, itemsM2);
        fillSheet(workBook, workSheetM3, itemsM3);

        fs.mkdtemp(path.join(os.tmpdir(), 'harmonie-'), (err, folder) => {
            if (err) {
                throw err;
            }
            const fileName = path.join(folder, 'TVA - T' + quarter.number + ' ' + quarter.year + '.xlsx');
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

const vatSortFn = (a, b) => {
    return a.date.getTime() - b.date.getTime();
}

function getNumberFormat(workBook) {
    return workBook.createStyle({
        numberFormat: '#,##0.00€; #,##.00€; -'
    });
}

function fillSheet(workBook, workSheet, data) {
    const numberStyle = getNumberFormat(workBook);

    let rowIndex = 2;
    let toPayCare = 0;
    let toPaySale21 = 0;
    let toPaySale6 = 0;
    let toPayCourse = 0;

    for (const item of data) {
        if (item instanceof Care) {
            workSheet.cell(rowIndex, 1).date(dateWithoutTime(item.date));
            workSheet.cell(rowIndex, 2).string('Soin');
            workSheet.cell(rowIndex, 3).string(item.type.title);
            workSheet.cell(rowIndex, 4).number(item.toPay).style(numberStyle);
            toPayCare += item.toPay;
            rowIndex++;
        } else if (item instanceof Sale) {
            for(const sl of item.saleLines) {
                workSheet.cell(rowIndex, 1).date(dateWithoutTime(item.date));
                workSheet.cell(rowIndex, 2).string('Vente');
                workSheet.cell(rowIndex, 3).string(sl.product.brand + ' - ' + sl.product.title + ' [' + sl.quantity + ']');
                if(sl.product.vatAmount === 21) {
                    workSheet.cell(rowIndex, 4).number(sl.toPay).style(numberStyle);
                    toPaySale21 += sl.toPay;
                } else {
                    workSheet.cell(rowIndex, 5).number(sl.toPay).style(numberStyle);
                    toPaySale6 += sl.toPay;
                }
                rowIndex++;
            }
        } else if(item instanceof Course) {
            workSheet.cell(rowIndex, 1).date(dateWithoutTime(item.date));
            workSheet.cell(rowIndex, 2).string('Cours');
            workSheet.cell(rowIndex, 3).string(item.training.title);
            workSheet.cell(rowIndex, 4).number(item.toPay).style(numberStyle);
            toPayCourse += item.toPay;
            rowIndex++;
        }
    }

    addHeader(workBook, workSheet);
    addFooter(workBook, workSheet, rowIndex, toPayCare, toPaySale21, toPaySale6, toPayCourse);
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
    workSheet.cell(1, 2).string('Type').style(style);
    workSheet.cell(1, 3).string('Intitulé').style(style);
    workSheet.cell(1, 4).string('Prix (21%)').style(style);
    workSheet.cell(1, 5).string('Prix (6%)').style(style);
    workSheet.row(1).freeze();
    workSheet.column(1).setWidth(18);
    workSheet.column(3).setWidth(60);
}

function addFooter(workBook, workSheet, rowIndex, toPayCare, toPaySale21, toPaySale6, toPayCourse) {
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
    workSheet.cell(rowIndex + 2, 1).string('Total soins (21%) :').style(styleString);
    workSheet.cell(rowIndex + 2, 2).number(toPayCare).style(totalPriceStyle).style(numberStyle);
    workSheet.cell(rowIndex + 3, 1).string('Total ventes (21%) :').style(styleString);
    workSheet.cell(rowIndex + 3, 2).number(toPaySale21).style(totalPriceStyle).style(numberStyle);
    workSheet.cell(rowIndex + 4, 1).string('Total ventes (6%) :').style(styleString);
    workSheet.cell(rowIndex + 4, 2).number(toPaySale6).style(totalPriceStyle).style(numberStyle);
    workSheet.cell(rowIndex + 5, 1).string('Total cours (21%) :').style(styleString);
    workSheet.cell(rowIndex + 5, 2).number(toPayCourse).style(totalPriceStyle).style(numberStyle);
    workSheet.cell(rowIndex + 6, 1).string('Total :').style(styleString);
    workSheet.cell(rowIndex + 6, 2).number(toPayCare + toPaySale21 + toPaySale6 + toPayCourse).style(totalPriceStyle).style(numberStyle);
}

function dateWithoutTime(date) {
    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);
    return date;
}
