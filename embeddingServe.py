from flask import Flask, request
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
import jsonpickle
import openai
import datetime
import uuid


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
        response = openai.ChatCompletion.create(
            model="Qwen", messages=messages, temperature=1
        )
    print(response)
    return response.choices[0].message.content


model = SentenceTransformer('BAAI/bge-large-zh-v1.5',cache_folder="D://hub/")

client = QdrantClient(url="http://localhost:6333")


app = Flask(__name__)


@app.route("/")
def hello_world():
    return "Hello, World!"


@app.route("/encode", methods=["POST"])
def encode():
    content = request.json
    return model.encode([content["text"]]).tolist()


@app.route("/zongjie", methods=["POST"])
def zongjie():
    query = request.json
    messages = [
        {
            "role": "user",
            "content":query['message']
        }
    ]
    return call_qwen(messages)


@app.route("/query", methods=["POST"])
def query():
    query_data = request.json

    if "query" not in query_data:
        return {"message": "query is required"}

    database = query_data["database"]
    if database is None or database == "":
        database = "test_collection"

    limit = 10
    if "limit" in query_data:
        limit = query_data["limit"]

    hits = client.search(
        collection_name=database,
        query_vector=model.encode(query_data["query"]).tolist(),
        limit=limit,
        score_threshold=8.0,
    )
    result_list = []

    for hit in hits:
        
        result_list.append(hit.model_dump()["payload"])

    return result_list

@app.route("/queryScore", methods=["POST"])
def queryScore():
    query_data = request.json

    if "query" not in query_data:
        return {"message": "query is required"}

    database = query_data["database"]
    if database is None or database == "":
        database = "test_collection"

    limit = 10
    if "limit" in query_data:
        limit = query_data["limit"]

    hits = client.search(
        collection_name=database,
        query_vector=model.encode(query_data["query"]).tolist(),
        limit=limit,
        score_threshold=8.0,
    )
    result_list = []

    for hit in hits:
        
        result_list.append(hit.model_dump())

    return result_list



@app.route("/answer", methods=["POST"])
def answer():
    query = request.json
    messages = [
        {
            "role": "user",
            "content": query['message']
        }
    ]
    return call_qwen(messages)



@app.route("/write_md", methods=["POST"])
def write_md():
    query_json = request.json
    current_date = datetime.date.today().strftime("%Y-%m-%d")
    file_name = f"./smartqa/{current_date}_{uuid.uuid4()}.md"

    with open(file_name, "w", encoding="utf-8") as file:
        file.write(query_json["text"])

    return {"success": True}
