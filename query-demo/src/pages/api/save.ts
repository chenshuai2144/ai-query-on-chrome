import OpenAI from 'openai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: any) {
  if (req.method === 'POST') {
    try {
      const { text } = await req.json();

      await fetch('http://127.0.0.1:5000/write_md', {
        method: 'POST',
        body: JSON.stringify({
          text,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // 返回流
      return new Response('保存成功');
    } catch (error) {
      const res = new Response(
        JSON.stringify({
          // @ts-ignore
          message: 'Internal server error' + error.message,
        }),
        {
          status: 500,
        }
      );
      return res;
    }
  } else {
    const res = new Response(
      JSON.stringify({
        status: 405,
        statusText: 'Method not allowed',
      })
    );
    return res;
  }
}
