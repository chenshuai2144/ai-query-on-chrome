from flask import Flask, request
from FlagEmbedding import FlagModel
from qdrant_client import QdrantClient
import jsonpickle
import openai

# To start an OpenAI-like Qwen server, use the following commands:
#   git clone https://github.com/QwenLM/Qwen-7B;
#   cd Qwen-7B;
#   pip install fastapi uvicorn openai pydantic sse_starlette;
#   python openai_api.py;
#
# Then configure the api_base and api_key in your client:
openai.api_base = "http://localhost:8000/v1"
openai.api_key = "none"


def call_qwen(messages, functions=None):
    if functions:
        response = openai.ChatCompletion.create(
            model="Qwen", messages=messages, functions=functions
        )
    else:
        response = openai.ChatCompletion.create(model="Qwen", messages=messages,temperature=1)
    print(response)
    return response.choices[0].message.content


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


@app.route("/zongjie", methods=["POST"])
def zongjie():
    query = request.json
    messages = [
        {
            "role": "user",
            "content": "将这段文案总结为一段言简意骇的内容，里面包含所有的信息，但是做了一些精简 \n\n "+query["text"]+" \n\n",
        }
    ]
    return call_qwen(messages)


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
