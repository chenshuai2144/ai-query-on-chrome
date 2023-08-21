'use client';

import Image from 'next/image';

import { TextModel } from '@visheratin/web-ai/text';
import { useEffect, useRef, useState } from 'react';
import { SearchResult, Voy } from 'voy-search';

const proJson = `
【一般检查】 体重指数: 26.98 ↑18.5-23.9

【外科】 本科既往史: T161980417 无殊

【眼科】 本科既往史: 屈光不正 眼底:双眼近视性眼底改变

【耳鼻喉科】 鼻腔: 过敏性鼻炎

【检验结果】 尿酸: 483 μmol/L ↑ 208-428

甘油三酯: 1.82 mmol/L ↑ 0.00-1.70

【B 超结果】 膀胱、前列腺 B 超: 前列腺超声检查未见明显异常

肝胆脾胰双肾 B 超(空腹): 轻度脂肪肝

甲状腺 B 超: 双侧甲状腺未见明显异常 心电图: 窦性心动过缓 (53 次/分) 体检小结依据 体重指数: 26.98 ↑18.5-23.9 既往史: 屈光不正 眼底: 双眼近视性眼底改变鼻腔: 过敏性鼻炎尿酸: 483 μmol/L ↑ 208-428

甘油三酯: 1.82 mmol/L ↑ 0.00-1.70 B 超: 轻度脂肪肝 心电图: 窦性心动过缓 (53 次/分)

【超重】 我国成人体重指数正常范围为 18.5-23.9; 24-27.9 为超重; 超过 28 为肥胖。超重的原因有摄入过多、消耗较少、多食少动 ，还与遗传因素和脂肪代谢异常有关。肥胖人群会增加心脑血 管疾病、动脉粥样硬化、高血压、高血脂、高血糖等疾病风险 ，所以应积极控制体重，建议: 1. 规律饮食、控制进食速度。2. 减少膳食热量，控制碳水化合物、食用油和脂肪、精白米,近视眼底改变过敏性鼻炎尿酸增高甘油三脂(TG)增高、肥肉等的摄入。3. 减重，科学有氧运动，每周 150 分钟，每周 3-5 天中等强度以 上运动，适当增加对抗性运动。 4.必要时接收专业减重教育与运动指导。

【双眼近视眼底改变】 1、注意用眼卫生，常做眼保健操。 2、定期检查视力，采光要充足，阅读距离保持 30-35 厘米。 3、积极锻炼身体，躺着、乘车、走路均不要看书。

【过敏性鼻炎】 1、防止接触过敏原，如花粉、皮毛、尘埃、冷气等。 2、查过敏原。 3、增强体质。 4、耳鼻喉科随诊。

【尿酸增高】 尿酸是体内嘌呤代谢异常所致的终产物，易在受寒、劳累、饮 酒、高蛋白、高嘌呤饮食而诱发痛风，建议: 1. 改善生活方式: 坚持运动和控制体重，每日中等强度运动 30 分钟以上。2.调节和改善饮食结构: 避免偏食，低脂、低糖、低蛋白清淡 饮食，严格控制高嘌呤(内脏、海鲜)等食物摄入;多饮水。3.有烟酒嗜好者戒烟限酒，尤其禁啤酒和白酒。 4.结合临床，定期复查，如有不适，请内科就诊。

【甘油三脂(TG)增高】 高脂血症包括高胆固醇血症、高甘油三酯血症、低密度胆固醇 增高，和/或兼有的混合型高脂血症。高脂血症是动脉粥样硬化 和心脑血管疾病发生的主要原因，也是代谢综合征的重要表现 之一。因此，调整血脂水平可预防动脉粥样硬化，明显减少心 血管疾病的发生，建议: 1. 低盐低脂饮食，多进食蔬菜水果。 2.有氧运动: 直到出汗和呼吸加深但无明显喘气。建议每周 3-5 天，每周 150 分钟，如: 慢跑、游泳、羽毛球、竞走、太极拳等 。 3.定期复查血脂，内科就诊，必要时在医生指导下药物调脂治疗。

【轻度脂肪肝】 脂肪肝是由于体内过多的脂肪沉积在肝脏所致。常见于代谢障 碍性疾病，如糖尿病、高血脂、肥胖等。亦见于经常饮酒者。 脂肪肝有时会引起肝功能的异常。建议: 1、合理膳食，荤素搭配，控制高热量、高脂肪、高能量的食品 进食量，尽量少吃甜食;戒烟限酒。2、控制体重，坚持一定量的运动方式: 竞走、游泳等，加强体 内脂肪的消耗。3、慎用药物，以避免对肝脏的进一步损害。4、定期复查肝功能、血脂，肝胆 B 超，追踪观察，内科随诊。

【窦性心动过缓】 正常心率 60-100 次/分，大多数心动过缓无重要的临床意义，例 如运动员、经常运动健身者，少数见于冠心病、病窦综合征等 。建议: 1. 窦性心动过缓心率不低于每分钟 50 次，无症状者，一般无需 治疗。 2.如心率低于每分钟 40 次，且出现头晕、乏力等症状者，心内 科就诊。 脂肪肝窦性心动过缓

`
  .split('\n')
  .filter(Boolean);

const run = async (props: { onMessage: (message: string) => void }) => {
  // Create text embeddings
  console.time('model-load');
  props.onMessage('正在加载模型...');
  const model = await (await TextModel.create('gtr-t5-quant')).model;

  props.onMessage('序列化文档列表...');
  const processed = (await Promise.all(
    proJson
      .map(async (q) => {
        console.log(q);
        try {
          // @ts-ignore
          return (await model.process(q)) as {
            result: number[];
          };
        } catch (error) {
          console.log(q);
          return '';
        }
      })
      .filter(Boolean)
  )) as {
    result: number[];
  }[];

  props.onMessage('正在初始化数据库...');
  // Index embeddings with voy
  const data = processed.map(({ result }, i) => ({
    id: String(i),
    title: proJson[i],
    url: proJson[i],
    embeddings: result,
  }));

  console.time('Voy insert');
  const resource = { embeddings: data };
  const { Voy } = await import('voy-search');

  const index = new Voy(resource);

  console.timeEnd('Voy insert');

  console.time('query Voy');

  props.onMessage('准备完成...');

  return index;
};

export default function Home() {
  const [loading, serLoading] = useState(true);
  const [message, setMessage] = useState('正在初始化');
  const dataBaseRef = useRef<Voy>();
  const [resultList, setResultList] = useState<SearchResult['neighbors']>([]);
  useEffect(() => {
    run({
      onMessage: setMessage,
    }).then((voy) => {
      dataBaseRef.current = voy;
      serLoading(false);
    });
  }, []);

  const query = async (keyword: string) => {
    if (!keyword) return '';
    // @ts-ignore
    const q = (await model.process(keyword)) as {
      result: Float32Array;
    };
    setResultList(dataBaseRef.current?.search(q.result, 2).neighbors || []);
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 48,
          }}
        >
          <Image
            className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
            src="/icon-256x256.png"
            alt="Next.js Logo"
            width={128}
            height={128}
            priority
          />
          AI Query On Chrome
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: 48,
        }}
      >
        <div className="relative mb-3" data-te-input-wrapper-init>
          <label htmlFor="exampleFormControlInput1">查询文案： </label>
          <input
            type="text"
            disabled={loading}
            id="exampleFormControlInput1"
            defaultValue="有哪些异常状态？"
            onKeyDown={(e) => {
              if (loading) return;
              if (e.key === '') {
                query(
                  (
                    document.getElementById(
                      'exampleFormControlInput1'
                    ) as HTMLInputElement
                  )?.value
                );
              }
            }}
          />
        </div>
        <div>
          {resultList.length > 0 ? '查询结果:' : ''}
          {resultList.map((item) => {
            return <div key={item.id}>{item.title}</div>;
          })}
        </div>
      </div>
      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        {message}
      </div>
    </main>
  );
}
