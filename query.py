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
        embeddings=[model.encode(item["text"]).tolist()],
        documents=[item["text"]],
        metadatas=[item],  # filter on these!
        ids=[str(index)],  # unique for each doc
    )
    index = index + 1


QUERY = "如何使用 ProTable?"


results = collection.query(query_embeddings=model.encode(QUERY).tolist(), n_results=2)


for result in results["metadatas"][0]:
    print(result["path"])
