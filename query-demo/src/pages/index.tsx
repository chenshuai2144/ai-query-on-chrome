import { Inter } from 'next/font/google';
import { useState } from 'react';
import { ProChat } from '@ant-design/pro-chat';
import { Segmented, theme } from 'antd';

export default function Home() {
  const [model, setModel] = useState('qwen');
  const [database, setDatabase] = useState('test_collection');
  const { token } = theme.useToken();
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
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 12,
          position: 'sticky',
          top: 0,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div>
          模型：
          <Segmented
            value={model}
            onChange={(e) => setModel(e.toString())}
            options={[
              {
                label: '通义千问',
                value: 'qwen',
              },
              {
                label: 'openai',
                value: 'openai',
              },
            ]}
          />
        </div>
        <div>
          文档库：
          <Segmented
            value={database}
            onChange={(e) => setDatabase(e.toString())}
            options={[
              {
                label: 'antd 系列',
                value: 'test_collection',
              },
              {
                label: '双百业务',
                value: 'docs_collection',
              },
            ]}
          />
        </div>
      </div>

      <ProChat
        request={
          model === 'qwen'
            ? '/api/qwen?database=' + database
            : '/api/hello?database=' + database
        }
        userMeta={{
          avatar: '🐱',
          title: 'miumiu',
          backgroundColor: token.colorPrimaryBg,
        }}
        assistantMeta={{
          avatar: '🤖',
          title: '小助手',
          backgroundColor: token.colorSuccessBg,
        }}
        onResetMessage={async () => {
          console.log('数据清空');
        }}
        config={{
          model: database,
        }}
      />
    </main>
  );
}
