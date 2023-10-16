import Image from 'next/image';
import { Inter } from 'next/font/google';
import { useState } from 'react';
import Markdown from 'react-markdown';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    content: '',
    document: [] as { text: string; url: string }[],
  });

  const fetchData = async (query: string) => {
    setLoading(true);
    setData({ content: '', document: [] });

    const msg = await fetch('/api/hello', {
      method: 'POST',
      body: JSON.stringify({ query }),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => {
      return res.json();
    });
    setData(msg);
    setLoading(false);
  };

  const query = () => {
    const query = (document.getElementById('query') as HTMLInputElement).value;
    window.history.pushState({}, '', `?query=${query}`);
    if (!query) return;
    fetchData(query);
  };
  return (
    <main
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
            className="dark:invert"
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
            border: '1px solid #e5e7eb',
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
              width: '62vw',
              borderRadius: 4,
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
              background: '#1890ff',
              height: 51,
              color: '#fff',
              paddingInline: 32,
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

        {data.content ? (
          <div
            className="markdown-body"
            style={{
              width: 'calc(62vw + 100px)',
              padding: 24,
              marginTop: 24,
              border: '1px solid #e5e7eb',
              borderRadius: 4,
            }}
          >
            {data.content && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div>查询结果：</div>
                <div>
                  <Markdown>{data?.content}</Markdown>
                </div>
                <div> 参考文档：</div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {data?.document?.map((item) => (
                    <div key={item.text}>
                      <a
                        href={item.url}
                        style={{
                          color: '#1890ff',
                          cursor: 'pointer',
                        }}
                        target="_blank"
                      >
                        {item.url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
