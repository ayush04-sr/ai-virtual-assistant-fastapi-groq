function Message({ text, sender }) {
  return (
    <div style={{ textAlign: sender === "ai" ? "left" : "right", margin: "10px 0" }}>
      <b>{sender === "ai" ? "AI: " : "You: "}</b> {text}
    </div>
  );
}

export default Message;
