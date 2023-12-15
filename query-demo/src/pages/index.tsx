import { ProChat } from '@ant-design/pro-chat';
import { theme } from 'antd';

export default function Home() {
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
      <ProChat
        request={'/api/qwen?database=faq_collection'}
        userMeta={{
          avatar: '🐱',
          title: 'miumiu',
          backgroundColor: token.colorPrimaryBg,
        }}
        helloMessage="你好，我是文档小助手，有什么可以帮助你的吗？"
        assistantMeta={{
          avatar: '🤖',
          title: '小助手',
          backgroundColor: token.colorSuccessBg,
        }}
        onResetMessage={async () => {
          console.log('数据清空');
        }}
      />
    </main>
  );
}
