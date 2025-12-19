import React, { useState, useRef, useEffect } from "react";

function Chat() {
  const [activeMenuChatId, setActiveMenuChatId] = useState(null);
  const [question, setQuestion] = useState("");
  const [listening, setListening] = useState(false);
const recognitionRef = useRef(null);
  const [darkMode, setDarkMode] = useState(false);
  const [micLang, setMicLang] = useState("en-IN");
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [cameraActive, setCameraActive] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const videoRef = useRef(null);
  // 🔹 History ke liye
const [chatHistory, setChatHistory] = useState([]);
const [currentChatId, setCurrentChatId] = useState(null);
const [messages, setMessages] = useState([]);

  const canvasRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    
  }, [messages, files]);

const newChat = () => {
  const id = Date.now();

  const chat = {
    id,
    title: "New Chat",
    messages: [],
  };

  setChatHistory(prev => [chat, ...prev]);
  setMessages([]);
  setCurrentChatId(id);
};



  // ---------------- AI Chat ----------------
  const askAI = async () => {
  if (!question.trim() && files.length === 0) return;

  setMessages((p) => [...p, { text: question, sender: "user" }]);
  if (!currentChatId) {
  newChat();
}

setChatHistory(prev =>
  prev.map(chat =>
    chat.id === currentChatId
      ? {
          ...chat,
          messages: [...chat.messages, { text: question, sender: "user" }],
          title:
            chat.title === "New Chat"
              ? question.slice(0, 20)
              : chat.title,
        }
      : chat
  )
);

  setQuestion("");

  try {
    if (files.length > 0) {
      // FILE + QUESTION ek saath
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("question", question);

      const res = await fetch("http://127.0.0.1:8000/upload_and_ask", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setMessages((p) => [...p, { text: data.ai_answer, sender: "ai" }]);
      setFiles([]); // chip clear
    } else {
      // sirf question
      const res = await fetch(
        `http://127.0.0.1:8000/ask_ai?question=${encodeURIComponent(question)}`
      );
      const data = await res.json();
      setMessages((p) => [...p, { text: data.answer, sender: "ai" }]);
      setChatHistory(prev =>
  prev.map(chat =>
    chat.id === currentChatId
      ? {
          ...chat,
          messages: [...chat.messages, { text: data.answer, sender: "ai" }],
        }
      : chat
  )
);

    }
  } catch {
    setMessages((p) => [
      ...p,
      { text: "Error connecting to AI backend", sender: "ai" },
    ]);
  }
};


  
  const handleFiles = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles);
    setFiles(newFiles);      // sirf file store hogi
    setShowPlusMenu(false);  // + menu close
  };

  const handleFileChange = (e) => handleFiles(e.target.files);
  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };
  const handleDragOver = (e) => e.preventDefault();



const startMic = () => {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Mic not supported");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = micLang; // 🔥 language toggle
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = () => setListening(true);

  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    setQuestion((p) => (p ? p + " " + text : text));
  };

  recognition.onend = () => setListening(false);

  recognition.start();
  recognitionRef.current = recognition;
};
const stopMic = () => {
  recognitionRef.current?.stop();
  setListening(false);
};



  // ---------------- Camera ----------------
  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (err) {
      console.error("Camera access denied", err);
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      const file = new File([blob], `photo_${Date.now()}.png`, { type: "image/png" });
      handleFiles([file]);
    });
    stopCamera();
  };

  const stopCamera = () => {
    const stream = videoRef.current.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };



 /* 👇 STEP-4 FUNCTIONS YAHA ADD KARO */

  const deleteChat = (id) => {
    const updated = chatHistory.filter(chat => chat.id !== id);
    setChatHistory(updated);
    setActiveMenuChatId(null);

    if (id === currentChatId) {
      setMessages([]);
      setCurrentChatId(null);
    }
  };

  const renameChat = (id) => {
    const newName = prompt("Enter new chat name");
    if (!newName) return;

    setChatHistory(prev =>
      prev.map(chat =>
        chat.id === id ? { ...chat, title: newName } : chat
      )
    );
    setActiveMenuChatId(null);
  };

  const archiveChat = (id) => {
    setChatHistory(prev =>
      prev.map(chat =>
        chat.id === id ? { ...chat, archived: true } : chat
      )
    );
    setActiveMenuChatId(null);
  };

  const shareChat = (chat) => {
    const text = chat.messages
      .map(m => `${m.sender}: ${m.text}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    alert("Chat copied to clipboard");
  };

  

  // ---------------- AI Content Formatter ----------------
  const renderAIContent = (text) => {
    let html = text
      .replace(/^### (.*)$/gm, "<h3>🔹 $1</h3>")
      .replace(/^## (.*)$/gm, "<h2>📌 $1</h2>")
      .replace(/^# (.*)$/gm, "<h1>⭐ $1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/^\d+\.\s+(.*)$/gm, "<li>➡️ $1</li>")
      .replace(/^\-\s+(.*)$/gm, "<li>👉 $1</li>")
      .replace(/\n/g, "<br/>");

    html = html.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
    return { __html: html };
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        fontFamily: "Arial",
        background: darkMode ? "#121212" : "#f5f5f5",
      }}
    >

    

      {/* SIDEBAR */}
      <div
        style={{
          width: "240px",
          background: "#1c1c1c",
          color: "#fff",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>AI Assistant</h2>
        <button onClick={newChat}>+ New Chat</button>

        <div style={{ opacity: 0.7 }}>History</div>
        <div style={{ marginTop: "10px" }}>
  {chatHistory.map(chat => (
    <div
  key={chat.id}
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px",
    marginBottom: "6px",
    borderRadius: "6px",
    cursor: "pointer",
    background:
      chat.id === currentChatId ? "#444" : "#2a2a2a",
  }}
>
  {/* CHAT TITLE */}
  <span
    onClick={() => {
      setCurrentChatId(chat.id);
      setMessages(chat.messages);
    }}
    style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}
  >
    {chat.title}
  </span>

  {/* THREE DOT MENU */}
  <span
    onClick={(e) => {
      e.stopPropagation();
      setActiveMenuChatId(
        activeMenuChatId === chat.id ? null : chat.id
      );
    }}
    style={{ padding: "0 6px", cursor: "pointer" }}
  >
    ⋮
  </span>

  {/* CONTEXT MENU */}
  {activeMenuChatId === chat.id && (
  <div
    style={{
      position: "absolute",
      left: "220px",
      background: "#1e1e1e",
      borderRadius: "10px",
      padding: "6px",
      width: "180px",
      zIndex: 1000,
    }}
  >
    <MenuItem
      text="📤 Share"
      onClick={() => shareChat(chat)}
    />

    <MenuItem
      text="👥 Start group chat"
      onClick={() => alert("Group chat coming soon")}
    />

    <MenuItem
      text="✏️ Rename"
      onClick={() => renameChat(chat.id)}
    />

    <MenuItem
      text="📦 Archive"
      onClick={() => archiveChat(chat.id)}
    />

    <MenuItem
      text="🗑️ Delete"
      danger
      onClick={() => deleteChat(chat.id)}
    />
  </div>
)}

</div>

  ))}
</div>

      </div>

      {/* CHAT SECTION */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            flex: 1,
            margin: "10px",
            padding: "14px",
            overflowY: "auto",
            background: darkMode ? "#1e1e1e" : "#FFF7E6",
            borderRadius: "10px",
            border: "1px solid #ccc",
            position: "relative",
          }}
        >
           
           



          {/* THEME TOGGLE */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              position: "fixed",
              top: "16px",
              right: "16px",
              borderRadius: "20px",
              padding: "6px 14px",
              border: "none",
              cursor: "pointer",
              background: darkMode ? "#FFF7E6" : "#222",
              color: darkMode ? "#000" : "#fff",
              zIndex: 1000,
            }}
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>

          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                marginBottom: "14px",
                padding: "14px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                background:
                  m.sender === "user"
                    ? darkMode
                      ? "#FFF7E6"
                      : "#000"
                    : darkMode
                    ? "#2a2a2a"
                    : "#fff",
                color:
                  m.sender === "user"
                    ? darkMode
                      ? "#000"
                      : "#fff"
                    : darkMode
                    ? "#fff"
                    : "#000",
              }}
            >
              <strong>{m.sender === "ai" ? "AI:" : "You:"}</strong>
              {m.sender === "ai" ? (
                <div
                  className="ai-message"
                  style={{ marginTop: "6px" }}
                  dangerouslySetInnerHTML={renderAIContent(m.text)}
                />
              ) : (
                <div style={{ marginTop: "6px" }}>{m.text}</div>
              )}
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT BAR */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "10px",
            borderTop: "1px solid #ccc",
            background: darkMode ? "#121212" : "#ffffff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            

            {/* File Upload Button */}
            <div style={{ position: "relative", marginRight: "8px" }}>
  <button
  onClick={() => setShowPlusMenu(!showPlusMenu)}
  style={{
    cursor: "pointer",
    background: "#000",   // ✅ BLACK
    color: "#fff",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    border: "none",

    /* ➕ plus sign center */
    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    fontSize: "22px",
    fontWeight: "bold",
    lineHeight: "1",
  }}
  title="Add"
>
  +
</button>


  {showPlusMenu && (
    <div
      style={{
        position: "absolute",
        bottom: "44px",
        left: "0",
        background: "#fff",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        padding: "8px",
        zIndex: 1000,
        minWidth: "140px",
      }}
    >
      {/* FILE OPTION */}
      <label style={{ cursor: "pointer", display: "block", marginBottom: "6px" }}>
        📁 Upload File
        <input
          type="file"
          multiple
          hidden
          onChange={handleFileChange}
        />
      </label>

      {/* CAMERA OPTION */}
      <div
        style={{ cursor: "pointer" }}
        onClick={startCamera}
      >
        📷 Camera
      </div>
    </div>
  )}
</div>


            {/* Text Input */}
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askAI()}
              placeholder="Message AI..."
              style={{
                flex: 1,
                padding: "10px 16px",
                borderRadius: "20px",
                border: "1px solid #ccc",
                marginRight: "8px",
              }}
            />

            <button
 
  onClick={listening ? stopMic : startMic}
  style={{
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    border: "none",
    marginRight: "6px",
    background: listening ? "#dc3545" : "#000",
    color: "#fff",
    cursor: "pointer",

    /* 🔥 CENTER ICON */
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    lineHeight: "1",
  }}
>
  {listening ? "⏹️" : "🎙️"}
</button>

            {/* Send Button */}
            <button
              onClick={askAI}
              style={{
                padding: "10px 18px",
                background: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "20px",
              }}
            >
              Send
            </button>
          </div>

          {/* Camera Preview */}
          {cameraActive && (
            <div style={{ marginTop: "6px", position: "relative" }}>
              <video ref={videoRef} style={{ width: "200px", borderRadius: "8px" }} />
              <button
                onClick={capturePhoto}
                style={{
                  position: "absolute",
                  bottom: "4px",
                  left: "4px",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: "#28a745",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Capture
              </button>
              <button
                onClick={stopCamera}
                style={{
                  position: "absolute",
                  bottom: "4px",
                  right: "4px",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  background: "#dc3535ff",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>
          )}

          
        </div>
      </div>
    </div>
  );
}

/* 👇 STEP-3 YAHA ADD KARO */
const MenuItem = ({ text, danger, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: "8px 10px",
      cursor: "pointer",
      borderRadius: "6px",
      color: danger ? "#ff4d4f" : "#fff",
    }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.background = "#333")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.background = "transparent")
    }
  >
    {text}
  </div>
);

export default Chat;
