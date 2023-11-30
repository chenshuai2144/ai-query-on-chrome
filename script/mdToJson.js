const md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true,
});

// 读取Markdown文件

const md2json = (markdown) => {
  try {
    // 将Markdown解析为json
    var result = md.parse(markdown, {});
    let json = [];
    let text = '';
    let header = '';
    result.forEach((item) => {
      if (item.type === 'heading_close') {
        header = text;
        text = '';
        return;
      }
      if (item.type === 'heading_open') {
        json.push({
          header,
          text,
        });
        text = '';
        return;
      }
      text += item.content;
    });
    return json;
  } catch (error) {
    // 使用 # 号来做切分
    return markdown.split('\n#').filter((item) => item);
  }
};

module.exports = md2json;
