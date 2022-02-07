export async function v1VatAmountOnProduct(products) {
    const allPromises = [];

    for(const product of products) {
        product.vatAmount = 21;
        allPromises.push(product.save());
    }

    await Promise.all(allPromises)
        .then(() => console.log("v1VatAmountOnProduct was successful"))
        .catch((err) => console.error(err));
}