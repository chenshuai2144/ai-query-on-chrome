﻿const { Octokit } = require('octokit');
const fs = require('fs');
const prettier = require('prettier');
const fetch = require('node-fetch');
const glob = require('glob');
const { join } = require('path');

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

const getAllMdList = () => {
  const fileList = glob
    .globSync(__dirname + `/../**/**/*.md`)
    .map((item) => {
      return item.replace(join(__dirname, '..'), '');
    })
    .map((item) => {
      return fs.readFileSync(join(__dirname, '..', item), 'utf-8');
    });
  return fileList;
};
