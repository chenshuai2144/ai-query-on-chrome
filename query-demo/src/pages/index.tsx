import Image from 'next/image';
import { Inter } from 'next/font/google';
import { useMemo, useState } from 'react';
import Markdown from 'react-markdown';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const [loading, setLoading] = useState(false);

  const [text, setText] = useState('');

  const [model, setModel] = useState('openai');

  const fetchDataStream = async (query: string) => {
    try {
      setLoading(true);
      setText('');
      const response = await fetch(
        model === 'openai' ? '/api/hello' : '/api/qwen',
        {
          method: 'POST',
          body: JSON.stringify({
            query,
            database: new URLSearchParams(window.location.search).get(
              'database'
            ),
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status !== 200) return;
      const reader = response?.body?.getReader();
      if (!reader) return;

      const process = ({
        done,
        value: chunk,
      }: ReadableStreamReadResult<Uint8Array>): Promise<
        ReadableStreamReadResult<Uint8Array>
      > => {
        if (done) {
          setLoading(false);
          console.log('Stream finished');
          return Promise.resolve({ done: true, value: new Uint8Array() });
        }
        const decodedChunk = new TextDecoder().decode(chunk);

        setText((text) => text + decodedChunk);
        return reader.read().then((result) => process(result));
      };
      await process(await reader.read());
    } catch (error) {
      console.error(error);
    }
  };

  const query = async () => {
    const query = (document.getElementById('query') as HTMLInputElement).value;
    const database =
      new URLSearchParams(window.location.search).get('database') || undefined;
    window.history.pushState({}, '', `?query=${query}&database=${database}`);
    if (!query) return;
    await fetchDataStream(query);
  };

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'auto',
        backgroundImage:
          "url('https://tailwindcss.com/_next/static/media/hero-dark@90.dba36cdf.jpg')",
        backgroundSize: '100% 100%',
      }}
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          left: 'auto',
          width: 200,
        }}
        className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none"
      >
        <a
          className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          By
          <Image
            src="/vercel.svg"
            alt="Vercel Logo"
            style={{
              filter: 'invert(1)',
            }}
            width={100}
            height={24}
            priority
          />
        </a>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 32,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 24,
              cursor: 'pointer',
              transition: 'all 0.3',
              opacity: model === 'qwen' ? 1 : 0.5,
              transform: model === 'qwen' ? 'scale(1.2)' : undefined,
            }}
            onClick={() => {
              setModel('qwen');
            }}
          >
            通义千问
          </div>

          <div
            style={{
              fontSize: 24,
              cursor: 'pointer',
              transition: 'all 0.3',
              opacity: model === 'openai' ? 1 : 0.5,
              transform: model === 'openai' ? 'scale(1.2)' : undefined,
            }}
            onClick={() => {
              setModel('openai');
            }}
          >
            openai
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <input
            defaultValue={
              typeof window !== 'undefined'
                ? (new URLSearchParams(window.location.search).get(
                    'query'
                  ) as string)
                : ''
            }
            placeholder="请输入需要查询的内容"
            style={{
              padding: 12,
              fontSize: 18,
              color: 'rgba(255,255,255,0.85)',
              width: '62vw',
              borderRadius: 4,
              backgroundColor: 'rgba(255,255,255,0.25)',
              outline: 'none',
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
            id="query"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                query();
              }
            }}
          />
          <button
            style={{
              fontSize: 18,
              background: 'rgb(9.4%,56.5%,85%)',
              height: 51,
              color: '#fff',
              width: 120,
              borderTopRightRadius: 4,
              borderBottomRightRadius: 4,
            }}
            onClick={() => {
              query();
            }}
          >
            {loading ? '查询中...' : '查询'}
          </button>
        </div>

        {text ? (
          <div
            className="markdown-body"
            style={{
              width: 'calc(62vw + 120px)',
              padding: 24,
              marginTop: 24,
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(255,255,255,0.25)',
              borderRadius: 4,
              boxShadow: '0 0 8px rgba(0,0,0,0.15)',
            }}
          >
            {text && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                <div>查询结果：</div>
                <div>
                  <Markdown>{text}</Markdown>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
