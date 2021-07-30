const { get } = require('https');
const { createWriteStream, promises: fs, readdir } = require('fs');
const { join } = require('path');

const parsePDF = require(join(__dirname, '../parser/parser.js'));

async function downloadPDF(id) {
  return new Promise(async (resolve, reject) => {
    const url = `https://priem.bmstu.ru/lists/upload/enrollees/first/moscow-1/${id}.pdf`;
    try {
      await fs.readdir(join(__dirname, `../src/${id}`));
    } catch (e) {
      await fs.mkdir(join(__dirname, `../src/${id}`));
    }
    const file = createWriteStream(join(__dirname, `../src/${id}/${id}.pdf`));
    const req = get(url, (res) => {
      // res.setEncoding('utf-8');
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        const fileName = join(__dirname, `../src/${id}/${id}.pdf`);
        console.log(`File ${fileName} is successfully downloaded.`);
        resolve();
      });
    }).on('error', (err) => reject(err));
  });
}

async function updateSources() {
  const majors = JSON.parse(
    await fs.readFile(join(__dirname, '../src/majors.json'))
  );
  return new Promise((resolve, reject) => {
    const filesPromises = [];

    majors.forEach(({ id }) => filesPromises.push(downloadPDF(id)));

    Promise.all(filesPromises)
      .then(() => resolve())
      .catch((e) => reject(e));
  });
}

async function updateContestState() {
  const majors = JSON.parse(
    await fs.readFile(join(__dirname, '../src/majors.json'))
  );
  return new Promise((resolve, reject) => {
    const filesPromises = [];

    majors.forEach(({ id }) => {
      filesPromises.push(
        new Promise(async (resolve, reject) => {
          try {
            const raw = await fs.readFile(
              join(__dirname, `../src/${id}/${id}.pdf`)
            );
            const data = JSON.stringify(await parsePDF(raw));
            await fs.writeFile(
              join(__dirname, `../src/${id}/${id}.json`),
              data
            );

            const fileName = join(__dirname, `../src/${id}/${id}.json`);
            console.log(`File ${fileName} is successfully parsed.`);
            resolve();
          } catch (e) {
            reject(e);
          }
        })
      );
    });

    Promise.all(filesPromises)
      .then(() => resolve())
      .catch((e) => reject(e));
  });
}

module.exports = async () => {
  try {
    await updateSources();
    await updateContestState();
    return { status: 'ok' };
  } catch (e) {
    throw e;
  }
};
