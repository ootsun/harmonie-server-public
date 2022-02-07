export async function v2ToPayAndPaidOnSaleLine(sales) {
    const allPromises = [];

    for(const sale of sales) {
        for(const sl of sale.saleLines) {
            sl.toPay = sl.product.price;
            if(sale.toPay === sale.paid) {
                sl.paid = sl.product.price;
            } else {
                sl.paid = 0;
            }
        }
        sale.toPay = undefined;
        sale.paid = undefined;
        allPromises.push(sale.save());
    }

    await Promise.all(allPromises)
        .then(() => console.log("v2ToPayAndPaidOnSaleLine was successful"))
        .catch((err) => console.error(err));
}