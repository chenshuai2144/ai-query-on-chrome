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
          zIndex: 999,
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
            value={database === 'yuque_collection' ? 'qwen' : model}
            disabled={database === 'yuque_collection'}
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
      </div>

      <ProChat
        request={
          model === 'qwen' || database === 'yuque_collection'
            ? '/api/qwen?database=' + database
            : '/api/hello?database=' + database
        }
        userMeta={{
          avatar: '🐱',
          title: 'miumiu',
          backgroundColor: token.colorPrimaryBg,
        }}
        helloMessage="你好，我是 antd 文档小助手，有什么可以帮助你的吗？"
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
