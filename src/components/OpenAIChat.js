"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const OpenAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const fetchChats = async () => {
    try {
      const response = await fetch("/api/gemini/chat");
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const scrollToBottom = (behavior = "auto") => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom("auto");
  }, [isOpen]);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom("smooth");
  }, [messages]);

  const sendMessage = async () => {
    if (!input) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];

    setMessages(newMessages);
    setInput("");

    try {
      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await response.json();
      if (data.error) {
        console.error("Error sending message:", data.error);
        return;
      }
      const responseMessage = data.messages[data.messages.length - 1].content;

      setMessages([
        ...newMessages,
        { role: "assistant", content: responseMessage },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const deleteChat = async () => {
    try {
      await fetch("/api/gemini/chat", { method: "DELETE" });
      setMessages([]);
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const copyText = (text) => {
    const stripMarkdown = (md) => {
      if (!md) return "";
      let s = String(md);
      // Remove fenced code blocks
      s = s.replace(/```[\s\S]*?```/g, "");
      // Inline code
      s = s.replace(/`([^`]+)`/g, "$1");
      // Images: keep alt text
      s = s.replace(/!\[([^\]]*)\]\([^\)]+\)/g, "$1");
      // Links: keep link text
      s = s.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1");
      // Headings
      s = s.replace(/^\s{0,3}#{1,6}\s+/gm, "");
      // Blockquotes
      s = s.replace(/^>\s?/gm, "");
      // Bold/italic
      s = s.replace(/(\*\*|__)(.*?)\1/g, "$2");
      s = s.replace(/(\*|_)(.*?)\1/g, "$2");
      s = s.replace(/~~(.*?)~~/g, "$1");
      // Lists
      s = s.replace(/^\s*[-*+]\s+/gm, "");
      s = s.replace(/^\s*\d+\.\s+/gm, "");
      // Remove any leftover HTML tags
      s = s.replace(/<[^>]+>/g, "");
      // Normalize multiple blank lines
      s = s.replace(/\n{3,}/g, "\n\n");
      // Trim each line and overall
      s = s.split('\n').map(l => l.trimEnd()).join('\n').trim();
      return s;
    };

    const plain = stripMarkdown(text);
    navigator.clipboard.writeText(plain).then(() => {
      alert("Text copied to clipboard!");
    });
  };

  return (
    <div className="fixed bottom-5 left-2 md:left-1/4 z-50">
      <button className="btn btn-circle btn-primary" onClick={toggleChat}>
        AIder
      </button>
      {isOpen && (
        <>
          <input
            type="checkbox"
            id="chat-modal"
            className="modal-toggle"
            checked={isOpen}
            readOnly
          />
          <div className="modal">
            <div className="modal-box relative">
              <label
                htmlFor="chat-modal"
                className="btn btn-sm btn-error btn-circle absolute right-2 top-2"
                onClick={toggleChat}
              >
                ✖
              </label>
              <h2 className="text-lg font-bold">AIder Chat</h2>
              <div className="flex justify-between mt-4">
                <button
                  className="btn btn-sm btn-error btn-outline"
                  onClick={deleteChat}
                >
                  Delete Chat
                </button>
              </div>
              <div className="flex flex-col gap-2 overflow-y-auto h-96 mt-4">
                {messages?.map((msg, index) => (
                  <div
                    key={index}
                    className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
                  >
                    <div
                      className={`chat-bubble ${
                        msg.role === "user" ? "bg-accent text-accent-content" : "bg-neutral text-neutral-content"
                      }`}
                    >
                      <div className="prose max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.role === "assistant" && (
                        <button
                          className="btn btn-xs btn-outline btn-secondary ml-2"
                          onClick={() => copyText(msg.content)}
                        >
                          Copy
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef}></div>
              </div>
              <div className="mt-4">
                <textarea
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="input input-bordered w-full"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />

                <button
                  className="btn btn-primary mt-2 w-full"
                  onClick={sendMessage}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OpenAIChat;
