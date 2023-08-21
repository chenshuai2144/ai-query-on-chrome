from FlagEmbedding import FlagModel
import chromadb

# 读取JSON文件
with open("./chenshuai.md", "r", encoding="utf-8") as file:
    json_data = file.read()

# 解析JSON数据
json_dict = json_data.split("\n")

client = chromadb.Client()

model = FlagModel(
    "BAAI/bge-base-zh", query_instruction_for_retrieval="为这个句子生成表示以用于检索相关文章："
)


collection = client.create_collection("pro-table")
index = 0
for item in json_dict:
    if item != "":
        collection.add(
            embeddings=[model.encode(item).tolist()],
            documents=[item],
            metadatas=[
                {
                    "path": item,
                }
            ],  # filter on these!
            ids=[str(index)],  # unique for each doc
        )
        index = index + 1


QUERY = "有哪些异常状态？"


results = collection.query(query_embeddings=model.encode(QUERY).tolist(), n_results=2)


for result in results["metadatas"][0]:
    print(result)
