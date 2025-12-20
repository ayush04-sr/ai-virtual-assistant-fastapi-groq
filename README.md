# AI Assistant – FastAPI + Groq

An AI-powered chat assistant built with **React (Frontend)** and **FastAPI + Groq (Backend)**.  
This project provides a ChatGPT-like experience with support for text, voice input, file uploads, camera capture, chat history, and dark mode.

---

## 🚀 Features

- 🤖 Real-time AI chat
- ⌨️ Text input with Enter-to-send
- 🎙️ Voice input using microphone
- 📁 File upload (multiple files supported)
- 📷 Camera capture and image upload
- 🗂️ Chat history with rename, share, archive & delete options
- 🌙 Dark mode / Light mode toggle
- 🧠 AI response formatting (headings, lists, bold text)

---

## 🛠️ Tech Stack

### Frontend
- React.js
- JavaScript
- Web Speech API
- Media Devices API (Camera)

### Backend
- FastAPI
- Groq AI API
- Python

---

## 📦 Installation

### 1️⃣ Clone the repository

git clone https://github.com/ayush04-sr/ai-assistant-fastapi-groq.git
cd ai-assistant-fastapi-groq

2️⃣ Frontend Setup
cd frontend
npm install
npm start

3️⃣ Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt
uvicorn main:app --reload
