from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from ai_module import ask_ai
from api_module import get_weather, get_news
import re
import os

app = FastAPI()

# ---------- CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- UPLOAD FOLDER ----------
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---------- AI ----------
@app.get("/ask_ai")
def ask(question: str):
    q = question.lower().strip()

    weather_match = re.search(r"weather in ([a-zA-Z\s]+)", q)
    if weather_match:
        return {"answer": get_weather(weather_match.group(1).strip())}

    if q == "weather":
        return {"answer": "Please specify a city for weather."}

    news_match = re.search(r"news (about|on)?\s*([a-zA-Z\s]+)", q)
    if news_match:
        return {"answer": "\n".join(get_news(news_match.group(2).strip()))}

    if q == "news":
        return {"answer": "\n".join(get_news("general"))}

    return {"answer": ask_ai(question)}

# ---------- FILE UPLOAD (AI USE KE LIYE) ----------
@app.post("/upload_and_ask")
async def upload_and_ask(files: list[UploadFile] = File(...), question: str = ""):
    """
    Upload files and immediately send their content + question to AI
    """
    combined_content = ""

    for file in files:
        content = await file.read()
        decoded_content = ""
        try:
            decoded_content = content.decode("utf-8")  # text files
        except:
            decoded_content = f"<binary file: {file.filename}>"  # non-text files
        combined_content += f"\nFile {file.filename} content:\n{decoded_content}\n"

        # Save file anyway
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as f:
            f.write(content)

    # Combine question + file content
    ai_input = combined_content + "\nQuestion:\n" + question
    ai_response = ask_ai(ai_input)

    return {
        "status": "success",
        "uploaded_files": [f.filename for f in files],
        "ai_answer": ai_response
    }





