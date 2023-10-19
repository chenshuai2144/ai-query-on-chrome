const fs = require('fs');
const prettier = require('prettier');
const fetch = require('node-fetch');
const { join } = require('path');
const getAllMdList = require('./getAllMdList');

const zongjie = async () => {
  const list = getAllMdList('issues');

  for await (const item of list) {
    if (!item.content.includes('#')) {
      continue;
    }
    const content = await fetch('http://127.0.0.1:5000/zongjie', {
      method: 'POST',
      body: JSON.stringify({
        text: item.content,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.text());

    fs.writeFileSync(
      join(__dirname, '..', item.path),
      await prettier.format(content, {
        filepath: 'foo.md',
      })
    );
  }
};

zongjie();
