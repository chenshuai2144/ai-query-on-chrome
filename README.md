[TechFlow](https://techflow.antdigital.dev/)
最近花了不少经历在搞 AI 相关的内容，经过一系列的尝试，也算是选定了一个方向，也是现在比较成熟的地方 文档搜索。

## 架构设计
首先我们来看看做一个文档搜索我们要做什么，和平常的文档搜索有什么不同。
![](https://cdn.nlark.com/yuque/0/2023/jpeg/84868/1692526231119-6ddcdbe8-2fae-4ca1-ba3a-754317b1cc4c.jpeg)

可以看到这个流程和原来的流程其实区别不大，唯一不同的是文档数据和用户的输入都需要一步向量化。那么为什么要向量化呢？
## embedding
向量化即 embedding ，可以翻译为的 "向量映射"， 抛开背后的技术，向量化的主要目标是为了找同义词。越“相似”的内容，向量化后距离越小。比如 喜悦 欢喜 愿意 快活 愉快 欢乐 快乐 忻悦 兴奋 夷愉 高兴 乐意 得意 雀跃 欢快 欢跃 欣喜 痛快 和 开心 向量化之后的距离应该很小。 也就是用户输入 开心 ，那么查询的结果就应该查出  喜悦 欢喜 愿意 快活 愉快 欢乐 快乐 忻悦 兴奋 夷愉 高兴 乐意 得意 雀跃 欢快 欢跃 欣喜 痛快。

[深度学习推荐系统 | Embedding，从哪里来，到哪里去](https://www.zhihu.com/tardis/zm/art/138310401?source_id=1005)

那么 embedding 的效果就决定了最后的查询效果。我们可以在 huggingface 排行榜中看看具体的效果。

| ank | Model | Average | AFQMC | ATEC | BQ | LCQMC | PAWSX | QBQTC | STS22 (zh) | STSB |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [bge-large-zh](https://huggingface.co/BAAI/bge-large-zh) | 54.98 | 44.57 | 49.75 | 62.93 | 75.45 | 22.45 | 38.92 | 67.24 | 78.51 |
| 2 | [bge-base-zh](https://huggingface.co/BAAI/bge-base-zh) | 54.12 | 42.53 | 48.28 | 61.21 | 74.98 | 20.65 | 38.01 | 68.64 | 78.66 |
| 3 | [bge-large-zh-noinstruct](https://huggingface.co/BAAI/bge-large-zh-noinstruct) | 53 | 43.06 | 48.29 | 60.53 | 74.71 | 16.64 | 35.2 | 67.19 | 78.41 |
| 4 | [m3e-base](https://huggingface.co/moka-ai/m3e-base) | 50.47 | 35.87 | 41.27 | 63.81 | 74.88 | 12.19 | 32.07 | 66.73 | 76.97 |
| 5 | [m3e-large](https://huggingface.co/moka-ai/m3e-large) | 50.42 | 36.53 | 41.8 | 65.2 | 74.2 | 15.95 | 32.65 | 62.91 | 74.16 |
| 6 | [bge-small-zh](https://huggingface.co/BAAI/bge-small-zh) | 49.45 | 33.93 | 43.17 | 55.47 | 72.61 | 9.97 | 36.45 | 67.54 | 76.48 |
| 7 | [multilingual-e5-base](https://huggingface.co/intfloat/multilingual-e5-base) | 46.49 | 29.67 | 37.01 | 45.45 | 74.15 | 12.14 | 28.81 | 65.64 | 79.05 |
| 8 | [text2vec-large-chinese](https://huggingface.co/GanymedeNil/text2vec-large-chinese) | 44.97 | 24.51 | 32.45 | 44.22 | 69.16 | 14.55 | 29.51 | 65.94 | 79.45 |
| 9 | [text2vec-base-chinese](https://huggingface.co/shibing624/text2vec-base-chinese) | 43.41 | 26.06 | 31.93 | 42.67 | 70.16 | 17.21 | 24.62 | 55.35 | 79.3 |
| 10 | [text-embedding-ada-002](https://beta.openai.com/docs/guides/embeddings/types-of-embedding-models) | 43.35 | 23.88 | 29.25 | 45.33 | 68.41 | 16.55 | 30.27 | 62.53 | 70.61 |

[MTEB Leaderboard - a Hugging Face Space by mteb](https://huggingface.co/spaces/mteb/leaderboard)

我选了一下排名第一的中文分词，试了试效果。这就是 embedding 的效果，远比我们的文本搜所要效果好。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/84868/1692532141928-ed291865-aee9-4674-8728-f4cc0975b052.png#averageHue=%23fcfcfb&clientId=u038b373e-cd69-4&from=paste&height=645&id=u1b5aa890&originHeight=1290&originWidth=1274&originalType=binary&ratio=2&rotation=0&showTitle=false&size=355355&status=done&style=none&taskId=u51fc7cd7-2a9a-49b3-937d-47fb72bd486&title=&width=637)

> 现在的训练集没怎么训练拼音的，拼音效果很差。


## 向量数据库
上面了解了一下 embedding 的效果，在实际的使用中我们不太可能实时的进行 embedding ，尤其是对巨量的数据来说，embedding 可能要好几个小时，为了用户体验我们一般会预先 embedding，embedding 的结果是一些向量，为了方便查找我们会使用专门的向量数据库来进行向量的管理。

向量数据库 现在已经非常成熟，我们可以随意选一下，很多老牌数据库也可以通过插件来实现向量数据库。

| 数据库名称 | 是否开源 | 社区影响力 | 编程语言 | 核心特性 |
| --- | --- | --- | --- | --- |
| Pinecone | 否 |  | 未知 | 向量存储与检索、全托管 |
| weaviate | 是 | 5.3k star | Go | 同时支持向量与对象的存储、支持向量检索与结构化过滤、具备主流模式成熟的使用案例。高速、灵活，不仅仅具备向量检索，还会支持推荐、总结等能力 |
| qdrant | 是 | 6.3k star | Rust | 向量存储与检索、云原生、分布式、支持过滤、丰富的数据类型、WAL日志写入 |
| milvus | 是 | 17.7k star | Go | 极高的检索性能: 万亿矢量数据集的毫秒级搜索非结构化数据的极简管理丰富的API跨平台实时搜索和分析可靠：具有很高的容灾与故障转移能力高度可拓展与弹性支持混合检索统一的Lambda架构社区支持、行业认可 |
| Chroma | 是 | 4.1k star | python | 轻量、内存级 |

如果自己想试试可以 Chroma 来试试效果，用起来和 nosql 数据库差不多。
[GitHub - chroma-core/chroma: the AI-native open-source embedding database](https://github.com/chroma-core/chroma)
## python 实现
各种路径都走通了，我们用 python 来实现一下这些功能，这里我们故意没用 langchain，用了 langchain 可以快速实现，但是每一步之间就不能做自由定制了。

```c
from FlagEmbedding import FlagModel
import chromadb
import json

# 读取JSON文件
with open("./src/app/pro.json", "r", encoding="utf-8") as file:
    json_data = file.read()

# 解析JSON数据
json_dict = json.loads(json_data)

client = chromadb.Client()

model = FlagModel(
    "BAAI/bge-base-zh", query_instruction_for_retrieval="为这个句子生成表示以用于检索相关文章："
)


collection = client.create_collection("pro-table")

index = 0
for item in json_dict:
    collection.add(
        // 默认的向量只是个二维的效果不是很好，这里使用第三方的
        embeddings=[model.encode(item["text"]).tolist()],
        documents=[item["text"]],
        metadatas=[item],  # filter on these!
        ids=[str(index)],  # unique for each doc
    )
    index = index + 1


QUERY = "如何使用 ProTable?"


results = collection.query(query_embeddings=model.encode(QUERY).tolist(), n_results=2)


print(results)
```

执行之后搜到了两条数据。
![image.png](https://cdn.nlark.com/yuque/0/2023/png/84868/1692547562700-1bf1b5fc-095e-4a08-9d6d-ef0f1b4e8894.png#averageHue=%232a2827&clientId=uadd8d54e-2ebe-4&from=paste&height=49&id=kfC3r&originHeight=97&originWidth=1545&originalType=binary&ratio=2&rotation=0&showTitle=false&size=27336&status=done&style=none&taskId=u9515ba7f-f192-45b1-9f0f-d854084a7f8&title=&width=772.5)
## 纯前端实现
用 python 实现效果挺好的，但是对我们前端来说我们有变成了调接口的人和 AI 没有任何关系，而且 embedding 和 向量数据库都需要巨大的服务器资源，如果能搬到前段实现，性能消耗也能减少很多的。根据上面的架构设计，其实只有三个地方需要大模型，最后一步可以做成列表就不需要 大模型了，所以我们找到能在浏览器中跑的 embedding 和 向量数据库就能试下纯前端。

简单 google 了一下，发现这两个东西还真的有浏览器端实现的，果不其然用了 WASM，这里我们使用了

- WebAI [GitHub - visheratin/web-ai: Run modern deep learning models in the browser.](https://github.com/visheratin/web-ai)
- Voy  [GitHub - tantaraio/voy: 🕸️🦀 A WASM vector similarity search written in Rust](https://github.com/tantaraio/voy)

我这里简单的写了个代码
```c
import { TextModel } from '@visheratin/web-ai/text';
  // Create text embeddings
  console.time('model-load');
  const model = await (await TextModel.create('gtr-t5-quant')).model;
  console.timeEnd('model-load');

  console.time('token processed');
  const processed = (await Promise.all(
    proJson
      .slice(0, 10)
      .map(async (q) => {
        try {
          // @ts-ignore
          return (await model.process(q.text)) as {
            result: number[];
          };
        } catch (error) {
          console.log(q.text);
          return '';
        }
      })
      .filter(Boolean)
  )) as {
    result: number[];
  }[];

  console.timeEnd('token processed');

  // Index embeddings with voy
  const data = processed.map(({ result }, i) => ({
    id: String(i),
    title: proJson[i].text,
    url: `/path/${i}`,
    embeddings: result,
  }));

  console.time('Voy insert');
  const resource = { embeddings: data };
  const { Voy } = await import('voy-search');

  const index = new Voy(resource);

  console.timeEnd('Voy insert');

  console.time('query Voy');
  const query = '如何使用 ProTable?';
  // Perform similarity search for a query embeddings
  // @ts-ignore
  const q = (await model.process(query)) as {
    result: Float32Array;
  };
  const result = index.search(q.result, 2);
  console.timeEnd('query Voy');
  // Display search result
  result.neighbors.forEach((result) => {
    console.log(`✨ voy similarity search result: "${result.url}"`, result.id);
    console.log(result);
  });
```

这里速度有点慢，尤其是的文档的向量化，如果要达到可用，要先预热一下，存在用户的本地的。或者在文档发布的时候直接生成，存到一个静态 json 中。
```c
model-load: 10266.1708984375 ms
token processed: 91146.5810546875 ms
Voy insert: 52.3447265625 ms
query Voy: 81.072021484375 ms
```


## 效果对比

### 输入数据
```c
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

```
### 问题 
有哪些异常状态？
### 效果
| embedding 模型 | 速度 | 结果 | chatgpt 3.5 总结 |
| --- | --- | --- | --- |
| bge-base-zh | 18s | ```c
 "chinese": [
    { "path": "【检验结果】 尿酸: 483 μmol/L ↑ 208-428" },
    { "path": "【一般检查】 体重指数: 26.98 ↑18.5-23.9" }
  ],
```
 | 以下是体检中不正常的指标：
- 尿酸: 483 μmol/L ↑ 208-428
- 体重指数: 26.98 ↑18.5-23.9

综合以上体检结果，存在以下问题：
1. 尿酸水平异常升高，超过正常范围。高尿酸可能与痛风、肾脏问题等相关。
2. 体重指数超过正常范围，表明体重过重或肥胖的风险增加，可能导致心血管疾病、糖尿病等问题。

建议您根据这些异常指标，咨询医生或专业健康机构，进一步了解和评估您的身体状况，并采取适当的措施来改善和管理相关问题。 |
| openai | 25s | ```c
  "opneai": [
    {
      "id": "3",
      "title": "【耳鼻喉科】 鼻腔: 过敏性鼻炎"
    },
    {
      "id": "8",
      "title": "甲状腺 B 超: 双侧甲状腺未见明显异常 心电图: 窦性心动过缓 (53 次/分) 体检小结依据 体重指数: 26.98 ↑18.5-23.9 既往史: 屈光不正 眼底: 双眼近视性眼底改变鼻腔: 过敏性鼻炎尿酸: 483 μmol/L ↑ 208-428"
    }
  ],
```
 | 
- 体重指数: 26.98 ↑18.5-23.9
- 心电图: 窦性心动过缓 (53 次/分)
- 眼底: 双眼近视性眼底改变
- 尿酸: 483 μmol/L ↑ 208-428

总结的体检问题：根据体检结果，患者存在以下问题：
1. 体重指数超过正常范围。
2. 心电图显示窦性心动过缓。
3. 眼底检查显示双眼近视性眼底改变。
4. 尿酸水平高于正常范围。

建议患者进一步就诊耳鼻喉科和甲状腺科，以便进行进一步的诊断和治疗。 |
| 纯前端 | 缓存前：12min， 缓存后 20s | ```c
"webai": [
    {
      "title": "【眼科】 本科既往史: 屈光不正 眼底:双眼近视性眼底改变"
    },
    { "title": "【耳鼻喉科】 鼻腔: 过敏性鼻炎" }
  ]
```
 | 以下是不正常的指标列表：
-  眼科： 
   - 本科既往史: 屈光不正
   - 眼底: 双眼近视性眼底改变
-  耳鼻喉科： 
   - 鼻腔: 过敏性鼻炎

综合以上体检问题，患者存在以下不正常指标：
- 眼科方面，患者有屈光不正和双眼近视性眼底改变的既往史。
- 在耳鼻喉科方面，患者被诊断为过敏性鼻炎。


需要进一步的医学评估和治疗来处理这些问题。请咨询专业医生以获取准确的诊断和治疗建议。 |

## 总结
### 一句话总结
如果对性能和效果要求较高，并且有足够的预算和资源，可以考虑选择 OpenAI，它提供最好的效果和速度。然而，需要注意数据安全性的问题。
如果对成本敏感，并且愿意投入研发资源，可以选择开源大模型。虽然效果中等，但可以根据自己的需求进行定制开发，并且数据存储在自己的服务器上，更加安全，如果有很好的技术人员，推荐选择这个。
如果对数据安全性要求较高，并且预算和资源有限，可以选择纯前端方案。尽管效果较差，但通过缓存可以提升性能，并且数据不会离开用户的电脑，安全性较高，同样的开发成本也不会太高，特别适合文档站。

### 对比表格
| **技术方案** | **问题** | **优势** |
| --- | --- | --- |
| 开源大模型 | 性价比低，需要自己投入研发
需要自己部署服务器，成本较高。 | 效果中等，可以自己定制开发
数据存在自己的服务器，更加安全 |
| openai | 数据需要经过 openai，安全性不强
不能针对性训练 | 效果最好，速度最快 |
| 纯前端 | 效果最差，可以能需要自己的 webai 模型
加载内容很大，不缓存需要分钟级别的等待 | 缓存后，性能最好
数据不出用户的电脑，安全性满分
 |

## 使用场景
在信息查询领域，成本最高的是embedding和向量数据库。对于大型文档数据库，建议使用常用的数据挂向量数据库插件，以最小程度侵入业务流程。

- 大型项目：使用自优化的嵌入技术和异步的向量数据库进行持久化。
- 小型项目：使用WebAI嵌入技术和预处理的向量JSON，再结合次抛（incremental）WASM向量数据库。
- 中等项目：对于500MB以下的数据，推荐使用次抛WASM向量数据库，嵌入选择OpenAI，以获得最佳整体性能。对于500MB以上的数据，搭配持久化向量数据库和自优化的嵌入技术，效果会更好。



