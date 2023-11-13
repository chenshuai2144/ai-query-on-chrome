import { Button, Input, message, theme } from 'antd';
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
        }}
      >
        <Input.Search
          disabled={loading}
          size="large"
          title={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入问题"
          onSearch={(value) => {
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
        <Input.TextArea
          rows={20}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
          }}
          placeholder="查询后将会生成回答"
        />

        <Button
          style={{
            width: 200,
          }}
          size="large"
          type="primary"
          disabled={loading || title.length < 5 || text.length < 20}
          onClick={() => {
            fetch('/api/save', {
              method: 'POST',
              body: JSON.stringify({
                text: `## ${title}
${text}`,
              }),
            }).then((res) => {
              message.success('保存成功');
              setText('');
              setTitle('');
            });
          }}
        >
          保存为一个文档
        </Button>
      </div>
    </main>
  );
}
