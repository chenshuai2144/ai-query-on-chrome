from flask import Flask, request
from FlagEmbedding import FlagModel
from qdrant_client import QdrantClient
import jsonpickle


model = FlagModel(
    "BAAI/bge-base-zh", query_instruction_for_retrieval="为这个句子生成表示以用于检索相关文章："
)

client = QdrantClient(url="http://localhost:6333")


app = Flask(__name__)


@app.route("/")
def hello_world():
    return "Hello, World!"


@app.route("/encode", methods=["POST"])
def encode():
    content = request.json
    return model.encode(content["text"]).tolist()


@app.route("/query", methods=["POST"])
def query():
    query = request.json

    hits = client.search(
        collection_name="test_collection",
        query_vector=model.encode(query["text"]).tolist(),
        limit=10,
    )
    json_string = jsonpickle.encode(hits)
    return json_string
