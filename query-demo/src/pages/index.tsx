import { Button, Input, Select, message, theme } from 'antd';
import { useState } from 'react';

const utf8Decoder = new TextDecoder('utf-8');

export default function Home() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  return (
    <main
      style={{
        minWidth: '100vw',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        overflowY: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: 800,
          padding: 64,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        <Select
          disabled={loading}
          size="large"
          style={{
            width: '100%',
          }}
          title={title}
          options={[
            {
              label: '陈某身体怎么样？',
              value: '陈某身体怎么样？',
            },
            {
              label: '百信有哪些产品',
              value: '百信有哪些产品',
            },
            {
              label: '百信有哪些荣誉',
              value: '百信有哪些荣誉',
            },
          ]}
          placeholder="请输入问题"
          onSelect={(value) => {
            setText('');
            if (!value) {
              message.warning('请输入问题');
              return;
            }
            if (value.length < 5) {
              message.warning('问题不能少于5个字');
              return;
            }
            let tempText = '';
            setLoading(true);
            fetch('/api/qwen?database=yuque_collection', {
              method: 'POST',
              body: JSON.stringify({
                messages: [
                  {
                    content: value,
                    role: 'user',
                  },
                ],
              }),
            }).then((response) => {
              const reader = response?.body?.getReader();

              return reader?.read().then(async function process({
                done,
                value: chunk,
              }): Promise<any> {
                if (done) {
                  console.log('Stream finished');
                  setLoading(false);
                  return;
                }
                setText((responseText) => {
                  return (
                    responseText + utf8Decoder.decode(chunk, { stream: true })
                  );
                });

                tempText += utf8Decoder.decode(chunk, { stream: true });
                console.log(
                  'Received data chunk',
                  utf8Decoder.decode(chunk, { stream: true })
                );

                return reader.read().then(process);
              });
            });
          }}
        />
        <div
          style={{
            minHeight: '400px',
          }}
        >
          {text}
        </div>
      </div>
    </main>
  );
}
