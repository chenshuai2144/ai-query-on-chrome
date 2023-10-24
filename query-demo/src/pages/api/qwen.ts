import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'http://localhost:8000/v1',
  apiKey: 'none',
});

export const config = {
  runtime: 'edge',
};

export default async function handler(req: any) {
  if (req.method === 'POST') {
    try {
      const { query, database } = await req.json();

      const content = await fetch('http://127.0.0.1:5000/query', {
        method: 'POST',
        body: JSON.stringify({
          query,
          limit: 5,
          database: database,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json());

      const stream = new ReadableStream({
        async start(controller) {
          const chatData = await openai.chat.completions.create({
            model: 'Qwen',
            messages: [
              {
                role: 'user',
                content: `问题："""${query}"""
可能的答案:"""${JSON.stringify(content)}"""

基于以上的问题和可能的答案总结一个得体并且言简意骇的回答，只需要输出回答即可。
                `,
              },
            ],
            stream: true,
            temperature: 0.9,
          });
          const encoder = new TextEncoder();
          for await (const part of chatData) {
            controller.enqueue(
              encoder.encode(part.choices[0]?.delta?.content || '')
            );
          }

          // 发送参考链接
          controller.enqueue(
            encoder.encode('\n###################' + JSON.stringify(content))
          );
          // 完成后，关闭流
          controller.close();
        },
      });
      // 返回流
      return new Response(stream);
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
