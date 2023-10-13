const { Octokit } = require('octokit');
const fs = require('fs');
const prettier = require('prettier');
const fetch = require('node-fetch');
const glob = require('glob');
const { join } = require('path');
const slash = require('slash2');

const github = new Octokit({
  debug: process.env.NODE_ENV === 'development',
  auth: process.env.GITHUB_TOKEN || process.env.GITHUB_AUTH,
  request: { fetch },
});

const getIssue = async (owner, repo) => {
  const iterator = github.paginate.iterator(github.rest.issues.listForRepo, {
    owner: owner || 'ant-design',
    repo: repo || 'ant-design',
    per_page: 100,
    state: 'closed',
    since: '2023-01-01T00:00:00Z',
  });

  if (!fs.existsSync(__dirname + `/../issues/${owner}/${repo}`)) {
    fs.mkdirSync(__dirname + `/../issues/${owner}/${repo}`, {
      recursive: true,
    });
  }

  // iterate through each response
  for await (const { data: issues } of iterator) {
    for (const issue of issues) {
      if (
        !issue.pull_request &&
        issue.state !== 'open' &&
        issue.title.length > 12
      ) {
        console.log('Issue #%d: %s', issue.number, issue.title);
        const comments = await github.rest.issues.listComments({
          repo: repo || 'ant-design',
          owner: owner || 'ant-design',
          issue_number: issue.number,
        });
        if (comments.data.length < 1) {
          continue;
        }
        const text = comments.data
          .map((item) => {
            if (item.user.login.includes('github-actions')) {
              return '';
            }
            return `
## ${item.user.login}

${item.body}
          `;
          })
          .join('\n\n');
        fs.writeFileSync(
          __dirname + `/../issues/${owner}/${repo}/${issue.number}.md`,
          await prettier
            .format(
              `
# ${issue.title}
        
${issue.labels
  .map((item) => {
    if (typeof item === 'string') {
      return item;
    }
    return item.name;
  })
  .map((item) => `\`${item}\``)}

${issue.body}


${text}
        `,
              {
                filepath: 'foo.md',
              }
            )
            .then((res) => res.replace(/\n\n\n/g, '\n\n'))
        );
      }
    }
  }
};

// getIssue('ant-design', 'ant-design').catch(console.error);
// getIssue('umijs', 'umi').catch(console.error);
// getIssue('ant-design', 'pro-components').catch(console.error);
// getIssue('ant-design', 'ant-design-pro').catch(console.error);

const pathMap = {
  'ant-design': 'https://github.com/ant-design/ant-design/blob/master',
  umijs: 'https://github.com/umijs/umi/blob/master',
  'ant-design-pro': 'https://github.com/ant-design/ant-design-pro/blob/master',
  'pro-components': 'https://github.com/ant-design/pro-components/blob/master',
};

const getAllMdList = (path = '/') => {
  const fileList = glob
    .globSync(slash(join(__dirname, '..', path, '/**/**/*.md')), {
      ignore: ['**/node_modules/**', 'README.md'],
    })
    .map((item) => {
      return item.replace(join(__dirname, '..'), '');
    })
    .map((item) => {
      const pathList = slash(item).split('/');
      let path = slash(item);
      if (pathList[1] === 'issues') {
        path =
          'https://github.com/' +
          pathList[2] +
          '/' +
          pathList[3] +
          '/issues/' +
          pathList[4].split('.')[0];
      } else {
        const repo = pathMap[pathList[1]];
        if (repo) {
          path = slash(item).replace('/' + pathList[1], repo);
        }
        console.log(slash(item).replace('/' + pathList[1], repo));
      }

      return {
        content: fs.readFileSync(join(__dirname, '..', item), 'utf-8'),
        path: path,
      };
    });
  return fileList;
};

const zongjie = async () => {
  const list = getAllMdList('issues');

  for await (const item of list) {
    console.log(item.path);

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

// zongjie();
const { QdrantClient } = require('@qdrant/js-client-rest');

// TO connect to Qdrant running locally
const client = new QdrantClient({ url: 'http://127.0.0.1:6333' });

const prepareData = async () => {
  const collectionName = 'test_collection';

  let result = await client.getCollections();

  const collectionNames = result.collections.map(
    (collection) => collection.name
  );

  if (collectionNames.includes(collectionName)) {
    await client.deleteCollection(collectionName);
  }

  await client.createCollection(collectionName, {
    vectors: {
      size: 1024,
      distance: 'Euclid',
    },
    optimizers_config: {
      default_segment_number: 2,
    },
    replication_factor: 2,
  });
  result = await client.getCollections();

  console.log('List of collections:', result.collections);

  await client.createPayloadIndex(collectionName, {
    field_name: 'text',
    field_schema: 'keyword',
    wait: true,
  });

  await client.createPayloadIndex(collectionName, {
    field_name: 'url',
    field_schema: 'keyword',
    wait: true,
  });

  const list = getAllMdList();
  let index = 0;
  let subIndex = 1;
  for await (const item of list) {
    const points = [];
    const lines = item.content.split('#');
    console.log(item.path);
    for await (const line of lines) {
      if (line.length < 10) {
        continue;
      }
      const vector = await fetch('http://127.0.0.1:5000/encode', {
        method: 'POST',
        body: JSON.stringify({
          text: line,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.text())
        .then((res) => eval(res));

      points.push({
        id: index * 10 + subIndex,
        vector,
        payload: {
          text: line,
          url: item.path,
        },
      });
      subIndex++;
    }
    if (points.length < 1) {
      continue;
    }

    await client.upsert(collectionName, {
      points: points,
    });

    index++;
  }
};

prepareData();
