const fetch = require('node-fetch');
const getAllMdList = require('./getAllMdList');
const md2json = require('./mdToJson');
// 导入 '@qdrant/js-client-rest' 包中的 QdrantClient
const { QdrantClient } = require('@qdrant/js-client-rest');

// 连接到本地运行的 Qdrant
const client = new QdrantClient({ url: 'http://127.0.0.1:6333' });

// 准备数据的函数
const prepareData = async () => {
  const collectionName = 'faq_collection';

  // 获取已存在的集合列表
  let result = await client.getCollections();

  // 提取集合名称
  const collectionNames = result.collections.map(
    (collection) => collection.name
  );

  // 如果集合已存在，则删除它
  if (collectionNames.includes(collectionName)) {
    await client.deleteCollection(collectionName);
  }

  // 创建新的集合
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

  console.log('集合列表:', result.collections);

  // 创建 'text' 字段的索引
  await client.createPayloadIndex(collectionName, {
    field_name: 'text',
    field_schema: 'keyword',
    wait: true,
  });

  // 创建 'url' 字段的索引
  await client.createPayloadIndex(collectionName, {
    field_name: 'url',
    field_schema: 'keyword',
    wait: true,
  });

  // 获取所有的 Markdown 文件列表
  const list = getAllMdList('faq_docs');
  let index = 0;
  let subIndex = 1;
  for await (const item of list) {
    const points = [];
    const lines = md2json(item.content);
    for await (const line of lines) {
      if (!line.text || !line.header) {
        continue;
      }

      // 使用 fetch 发送 POST 请求，将文本行编码为向量
      const vector = await fetch('http://127.0.0.1:5000/encode', {
        method: 'POST',
        body: JSON.stringify({
          text: line.header + line.text,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((res) => res.text())
        .then((res) => {
          try {
            return eval(res);
          } catch (error) {
            return undefined;
          }
        });

      if (!vector) continue;
      // 将点的信息添加到 points 数组中
      points.push({
        id: index * 10 + subIndex,
        vector,
        payload: {
          text: line.header + line.text,
          url: item.path.split('.').at(0),
        },
      });
      subIndex++;
    }
    if (points.length < 1) {
      continue;
    }

    try {
      await client.upsert(collectionName, {
        points: points,
      });

      index++;
    } catch (error) {
      continue;
    }
    // 将点数据插入到集合中
  }
};

// 调用准备数据的函数
prepareData();
