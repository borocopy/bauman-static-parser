const pdf = require('pdf-parse');

async function parsePDF(rawData) {
  const rawText = (await pdf(rawData)).text;
  const startIndex =
    rawText.split('\n').indexOf('приема и БВИ на момент публикации списка)') +
    1;
  const text = rawText
    .split('\n')
    .slice(startIndex)
    .join('\n')
    .replace(/\*/g, '');
  const data = text
    .match(/(\d*-\d\d\d-\d\d\d \d\d|\d*[А-Я]\d*)(Нет|Да)\d*(Нет|Да)(Нет|Да)/gi)
    .map((s) => {
      let c = s.toLowerCase().replace(/ /g, '');
      const d = {};
      let pointPos = 0;
      if (c.indexOf('-') != -1) {
        d.type = 'СНИЛС';
        d.pos = parseInt(
          c
            .match(/\d*\d\d\d-/)[0]
            .split('')
            .reverse()
            .slice(4)
            .reverse()
            .join('')
        );

        d.uid = c.match(/\d\d\d-\d\d\d-\d\d\d\d\d/)[0].replace(/-/g, '');
        c = c.replace(/-/g, '');
        pointPos = c.indexOf(d.uid) + d.uid.length;
      } else {
        d.type = 'ИД';
        d.pos = parseInt(
          c
            .match(/\d*[А-Я]/i)[0]
            .split('')
            .reverse()
            .slice(1)
            .reverse()
            .join('')
        );
        d.uid = c.match(/[А-Я]\d*/i)[0];
        pointPos = c.indexOf(d.uid) + d.uid.length;
      }

      if (c[pointPos] == 'д') pointPos += 2;
      else pointPos += 3;
      d.pointsTotal = parseInt(c.slice(pointPos, pointPos + 3));
      if (c.split('').reverse()[0] == 'а') {
        d.enrolling = true;
      } else {
        d.enrolling = false;
      }

      return d;
    });

  return data;
}

module.exports = parsePDF;
