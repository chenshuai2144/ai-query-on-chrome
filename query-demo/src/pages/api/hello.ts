import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

export const config = {
  runtime: 'edge',
};

export default async function handler(req: any) {
  if (req.method === 'POST') {
    try {
      const database = req.nextUrl.searchParams.get('database');
      const { messages } = await req.json();
      const content = await fetch('http://127.0.0.1:5000/query', {
        method: 'POST',
        body: JSON.stringify({
          query: messages?.at?.(-1)?.content,
          limit: 5,
          database: database || 'test_collection',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json());

      const stream = new ReadableStream({
        async start(controller) {
          const chatData = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo-16k',
            messages: [
              {
                role: 'user',
                content: `\n
    问题："""${messages?.at?.(-1)?.content}"""
    答案:"""${JSON.stringify(content)}"""
    \
    基于以上的问题和可能的答案一步步的总结一个得体并且完善的回答，只需要输出回答即可。
    例如：
      > 在.umijs.js中无法使用require.context，因为.umijs.js不是在浏览器环境下运行，而是通过node的fs进行处理。
                `,
              },
            ],
            temperature: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            max_tokens: 2000,
            stream: true,
          });
          const encoder = new TextEncoder();
          for await (const part of chatData) {
            controller.enqueue(
              encoder.encode(part.choices[0]?.delta?.content || '')
            );
          }

          // 发送参考链接
          controller.enqueue(
            encoder.encode(
              '\n ##### 参考文档 \n\n' +
                content
                  .map((item: any) => {
                    if (database === 'docs_collection') {
                      const url = `https://antdigital.com/docs/${item.url
                        .split('/')
                        .at(-1)
                        .split('.')
                        .at(0)
                        .split('_#_')
                        .join('/')}`;
                      return `* [${url}](${url})`;
                    }
                    if (database === 'yuque_collection') {
                      const url = `https://yuque.antfin.com/${item.url
                        .split('_')
                        .join('/')}`.replace('/yuque/docs/', '');
                      return `* [${url}](${url})`;
                    }
                    return `* [${item.url}](${item.url})`;
                  })
                  .join('\n')
            )
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
