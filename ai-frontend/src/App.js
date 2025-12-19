import React from "react";
import Chat from "./components/Chat";

function App() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        fontFamily: "Arial",
      }}
    >
      {/* SIDEBAR */}
      <div
        style={{
          width: "260px",
          background: "#202123",
          color: "white",
          padding: "16px",
        }}
      >
        <h3>AI Assistant</h3>
        <hr />
        <p style={{ opacity: 0.7 }}>New Chat</p>
        <p style={{ opacity: 0.7 }}>History</p>
      </div>

      {/* CHAT AREA */}
      <div
        style={{
          flex: 1,
          background: "#f5f5f5",
          overflow: "hidden",
        }}
      >
        <Chat />
      </div>
    </div>
  );
}

export default App;
