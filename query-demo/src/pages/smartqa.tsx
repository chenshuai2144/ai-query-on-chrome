import { ProChat } from '@ant-design/pro-chat';
import { Button, Input, message, theme } from 'antd';
import { useState } from 'react';

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
            if (!value || value.length < 10) {
              message.warning('请输入问题');
              return;
            }
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
            }).then((res) => {});
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
          disabled={loading || title.length < 10 || text.length < 20}
          onClick={() => {
            fetch('/api/save', {
              method: 'POST',
              body: JSON.stringify({
                text: `## ${title}
${text}`,
              }),
            });
          }}
        >
          保存为一个文档
        </Button>
      </div>
    </main>
  );
}
