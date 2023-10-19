const { Octokit } = require('octokit');
const fs = require('fs');
const prettier = require('prettier');
const fetch = require('node-fetch');
require('path');

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
