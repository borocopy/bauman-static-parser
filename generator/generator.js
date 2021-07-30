const fs = require('fs').promises;
const { join } = require('path');

async function generateHomePage() {
  const template = await fs.readFile(join(__dirname, './template_home.html'), {
    encoding: 'utf-8',
  });
  const majors = JSON.parse(
    await fs.readFile(join(__dirname, '../src/majors.json'))
  );

  const data = majors.map(
    (x) => `
  <a href="/${x.id}.html" class="text-xl text-blue-500 hover:text-indigo-500 mb-4"
  >${x.id} ${x.title}</a>`
  );

  await fs.writeFile(
    join(__dirname, '../build/index.html'),
    template.replace('${items}', data.join('\n'))
  );
}

async function generateTablePage({ id, title }) {
  const template = await fs.readFile(join(__dirname, './template_page.html'), {
    encoding: 'utf-8',
  });
  const ranking = JSON.parse(
    await fs.readFile(join(__dirname, `../src/${id}/${id}.json`), {
      encoding: 'utf-8',
    })
  );

  const data = ranking
    .filter((x) => x.enrolling == true)
    .map(
      (x, idx) => `
      <tr class="text-xl text-gray-700">
        <td class="px-6 py-4 whitespace-nowrap">${idx + 1}</td>
        <td class="px-6 py-4 whitespace-nowrap">${x.uid
          .split('')
          .reduce((acc, iter) => acc.replace(/#/, iter), '###-###-### ##')}</td>
        <td class="px-6 py-4 whitespace-nowrap">${x.pointsTotal}</td>
      </tr> 
    `
    );

  await fs.writeFile(
    join(__dirname, `../build/${id}.html`),
    template
      .replace('${title}', `${id} ${title}`)
      .replace('${data}', data.join('\n'))
  );
}

async function generateSubPages() {
  const majors = JSON.parse(
    await fs.readFile(join(__dirname, '../src/majors.json'))
  );

  return new Promise((resolve, reject) => {
    const filesPromises = [];

    majors.forEach((x) => {
      filesPromises.push(
        new Promise(async (resolve, reject) => {
          try {
            await generateTablePage(x);
            console.log(`Page "/${x.id}.html is successfully generated.`);
            resolve();
          } catch (e) {
            reject(e);
          }
        })
      );
    });

    Promise.all(filesPromises)
      .then(() => resolve)
      .catch((e) => reject(e));
  });
}

module.exports = {
  generateHomePage,
  generateSubPages,
};
