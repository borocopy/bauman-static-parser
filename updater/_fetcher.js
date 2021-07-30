const cheerio = require('cheerio');
const fs = require('fs').promises;
const { join } = require('path');

async function downloadMeta() {
  const raw = await fs.readFile(join(__dirname, './_source.html'));

  const $ = cheerio.load(raw);

  const data = [];
  $('.ws-flex1.ovya.ng-star-inserted a.mat-list-item').each(function (i, elem) {
    const str = $(elem).text().replace('picture_as_pdf', '').trim();
    const id = str.match(/\d\d.\d\d.\d\d/)[0];
    data.push({
      id,
      title: str.replace(/(\d\d.\d\d.\d\d) - (\d\d.\d\d.\d\d)/, '').trim(),
    });
  });

  await fs.writeFile(
    join(__dirname, '../src/majors.json'),
    JSON.stringify(data)
  );
}

downloadMeta();
