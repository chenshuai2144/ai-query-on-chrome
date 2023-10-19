const fs = require('fs');
const glob = require('glob');
const { join } = require('path');
const slash = require('slash2');

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
        relayPath: item,
      };
    });
  return fileList;
};

module.exports = getAllMdList;
