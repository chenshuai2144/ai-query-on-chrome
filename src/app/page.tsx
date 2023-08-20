'use client';

import Image from 'next/image';

import { TextModel } from '@visheratin/web-ai/text';
import { useEffect, useState } from 'react';

import proJson from './pro.json';

const run = async (props: { onMessage: (message: string) => void }) => {
  // Create text embeddings
  console.time('model-load');
  props.onMessage('正在加载模型...');
  const model = await (await TextModel.create('gtr-t5-quant')).model;
  console.timeEnd('model-load');

  props.onMessage('序列化文档列表...');
  const processed = (await Promise.all(
    proJson
      .slice(0, 10)
      .map(async (q) => {
        try {
          // @ts-ignore
          return (await model.process(q.text)) as {
            result: number[];
          };
        } catch (error) {
          console.log(q.text);
          return '';
        }
      })
      .filter(Boolean)
  )) as {
    result: number[];
  }[];

  props.onMessage('正在初始化数据库...');
  // Index embeddings with voy
  const data = processed.map(({ result }, i) => ({
    id: String(i),
    title: proJson[i].text,
    url: proJson[i].path,
    embeddings: result,
  }));

  console.time('Voy insert');
  const resource = { embeddings: data };
  const { Voy } = await import('voy-search');

  const index = new Voy(resource);

  console.timeEnd('Voy insert');

  console.time('query Voy');

  props.onMessage('准备完成...');
  const query = '如何使用 ProTable?';
  // Perform similarity search for a query embeddings
  // @ts-ignore
  const q = (await model.process(query)) as {
    result: Float32Array;
  };
  const result = index.search(q.result, 2);
  // Display search result
  result.neighbors.forEach((result) => {
    console.log(`✨ voy similarity search result: "${result.url}"`, result.id);
    console.log(result);
  });
};

export default function Home() {
  const [loading, serLoading] = useState(true);
  const [message, setMessage] = useState('正在初始化');
  useEffect(() => {
    run({
      onMessage: setMessage,
    }).then(() => {
      serLoading(false);
    });
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 48,
          }}
        >
          <Image
            className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
            src="/icon-256x256.png"
            alt="Next.js Logo"
            width={128}
            height={128}
            priority
          />
          AI Query On Chrome
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: 48,
        }}
      >
        <div className="relative mb-3" data-te-input-wrapper-init>
          <label htmlFor="exampleFormControlInput1">查询文案： </label>
          <input type="text" id="exampleFormControlInput1" />
        </div>
      </div>
      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        {message}
      </div>
    </main>
  );
}
