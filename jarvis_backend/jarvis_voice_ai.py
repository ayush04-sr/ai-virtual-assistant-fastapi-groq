from voice_module import listen, speak
import requests

API_URL = "http://127.0.0.1:8000/ask_ai"

def ask_ai_voice():
    speak("I'm listening...")
    text = listen()
    if text.strip() == "":
        speak("Sorry, I didn't hear anything.")
        return
    speak("You said " + text)
    
    # Send voice text to your FastAPI AI
    params = {"question": text}
    response = requests.get(API_URL, params=params)
    
    if response.status_code == 200:
        answer = response.json().get("answer", "No response from AI.")
        print("AI:", answer)
        speak(answer)
    else:
        speak("Something went wrong while contacting the AI server.")

if __name__ == "__main__":
    while True:
        ask_ai_voice()
