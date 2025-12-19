import requests

def get_weather(city: str):
    api_key = "749de9be04ad1989f2005b25ea34332e"  # Replace with your key
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
    data = requests.get(url).json()
    return f"{data['weather'][0]['description']}, {data['main']['temp']}°C"







def get_news(topic="general"):
    api_key = "019b1cb17a6640b3aff844e256863e2d"
    url = f"https://newsapi.org/v2/everything?q={topic}&language=en&sortBy=publishedAt&apiKey={api_key}"
    data = requests.get(url).json()
    articles = data.get("articles", [])
    return [f"{a['title']} - {a['source']['name']}" for a in articles[:5]]
