from fastapi import FastAPI
from ai_module import ask_ai
from api_module import get_weather, get_news

app = FastAPI()

@app.get("/ask_ai")
def ask(question: str):
    return {"answer": ask_ai(question)}

@app.get("/weather")
def weather(city: str):
    return {"weather": get_weather(city)}

@app.get("/news")
def news(topic: str = "general"):
    return {"news": get_news(topic)}
