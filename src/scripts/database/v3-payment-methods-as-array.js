export async function v3PaymentMethodsAsArray(cares, sales) {
    const allPromises = [];

    for(const care of cares) {
        care.paymentMethods = [care.paymentMethod];
        care.paymentMethod = undefined;
        allPromises.push(care.save());
    }

    for(const sale of sales) {
        sale.paymentMethods = [sale.paymentMethod];
        sale.paymentMethod = undefined;
        allPromises.push(sale.save());
    }

    await Promise.all(allPromises)
        .then(() => console.log("v3PaymentMethodsAsArray was successful"))
        .catch((err) => console.error(err));
}