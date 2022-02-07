export async function v4SetArchivedToFalse(patients, products, careTypes) {
  const allPromises = [];
  const items = [...patients, ...products, ...careTypes];

  for(const item of items) {
    item.archived = false;
    allPromises.push(item.save());
  }

  await Promise.all(allPromises)
    .then(() => console.log("v4SetArchivedToFalse was successful"))
    .catch((err) => console.error(err));
}