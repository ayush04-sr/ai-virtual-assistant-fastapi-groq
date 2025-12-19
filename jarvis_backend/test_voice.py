from voice_module import listen, speak

print("Say something...")
text = listen()
print("You said:", text)

speak("You said " + text)
