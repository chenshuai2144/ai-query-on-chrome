const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const md2json = require('./mdToJson');

const dirPath = path.join(__dirname, '..', 'faq_docs');
const dir = fs.readdirSync(dirPath);

const issues = dir
  .map((mdfile) => {
    const content = fs.readFileSync(path.join(dirPath, mdfile), 'utf-8');
    return md2json(content)
      .map((item) => {
        return item.header;
      })
      .filter((item) => item);
  })
  .flat(1);

fs.writeFileSync(
  path.join(dirPath, 'issues.json'),
  JSON.stringify(issues, null, 2)
);

var variance = function (numbers) {
  var mean = 0;
  var sum = 0;
  for (var i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }
  mean = sum / numbers.length;
  sum = 0;
  for (var i = 0; i < numbers.length; i++) {
    sum += Math.pow(numbers[i] - mean, 2);
  }
  return sum / numbers.length;
};

const dupIssue = [];
const query = async () => {
  for await (const item of issues) {
    const content = await fetch('http://127.0.0.1:5000/queryScore', {
      method: 'POST',
      body: JSON.stringify({
        query: item,
        limit: 5,
        database: 'faq_collection',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json());

    fs.writeFileSync(
      path.join(
        __dirname,
        '..',
        'dupIssue',
        item.replaceAll('/', '').replaceAll(' ', '') + '.md'
      ),
      `# ${item}

${content.map((item) => `* ${item.payload.text}`).join('\n\n')}
      `
    );
  }
};

query();
