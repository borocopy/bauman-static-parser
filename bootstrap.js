console.log(__dirname);
const { generateHomePage, generateSubPages } = require('./generator/generator');
const updateData = require('./updater/updater');

async function main() {
  await updateData();
  await generateHomePage();
  console.log('Template "/" is successfully generated.');
  await generateSubPages();
}

main();
