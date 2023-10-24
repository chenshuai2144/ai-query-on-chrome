const { Octokit } = require('octokit');
const fs = require('fs');
const prettier = require('prettier');
const fetch = require('node-fetch');

const github = new Octokit({
  debug: process.env.NODE_ENV === 'development',
  auth: process.env.GITHUB_TOKEN || process.env.GITHUB_AUTH,
  request: { fetch },
});

const getIssue = async (owner, repo) => {
  const map = new Map();
  const iterator = github.paginate.iterator(github.rest.issues.listForRepo, {
    owner: owner,
    repo: repo,
    per_page: 100,
    state: 'closed',
    since: '2023-05-01T00:00:00Z',
  });

  if (!fs.existsSync(__dirname + `/../issues/${owner}/${repo}`)) {
    fs.mkdirSync(__dirname + `/../issues/${owner}/${repo}`, {
      recursive: true,
    });
  }

  // iterate through each response
  for await (const { data: issues } of iterator) {
    for (const issue of issues) {
      if (map.has(issue.title)) continue;
      map.set(issue.title, issue.number);

      if (
        !issue.pull_request &&
        issue.state !== 'open' &&
        issue.title.length > 12
      ) {
        console.log('Issue #%d: %s', issue.number, issue.title);
        try {
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
        } catch (error) {
          continue;
        }
      }
    }
  }
};

// getIssue('ant-design', 'ant-design').catch(console.error);
// getIssue('umijs', 'umi').catch(console.error);
// getIssue('ant-design', 'pro-components').catch(console.error);
getIssue('ant-design', 'ant-design-pro').catch(console.error);
