import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method === 'POST') {
    try {
      const { query } = await req.json();

      const content = await fetch('http://127.0.0.1:5000/query', {
        method: 'POST',
        body: JSON.stringify({
          query,
          limit: 10,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => res.json());

      const chatData = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-16k',
        messages: [
          {
            role: 'user',
            content: `\n
"answer":${JSON.stringify(content)}
\n
请基于以上的内容总结一个 md 格式回答，例如：
            `,
          },
        ],
        temperature: 0.5,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 2000,
      });

      return new Response(
        JSON.stringify({
          content: chatData.choices?.[0]?.message?.content,
          document: content,
        })
      );
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
    const res = new Response({
      status: 405,
      statusText: 'Method not allowed',
    });
    return res;
  }
}
