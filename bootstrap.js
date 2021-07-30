console.log(__dirname);
const updateData = require('./updater/updater');

async function main() {
  await updateData();
}

main();
