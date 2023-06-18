import React, { useState, useRef, useEffect } from "react";
import "./App.css";

const API_KEY = "";
const systemMessage = {
  role: "system",
  content:
    "Act like an Indian Police officer expert. You will be given a scenario, and you have to provide the IPC section codes for that particular crime case. Just provide the section codes and explain why they are being used.",
};

function App() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      message:
        "Hello! I'm IPC Laws Assistant. I can assist you with any crime case and tell you which sections to apply.",
      sender: "ChatGPT",
    },
  ]);

  const messagesRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  };

  const handleSend = async () => {
    const inputElement = document.querySelector(".input-box");
    const userMessage = inputElement.value.trim();

    if (userMessage !== "") {
      const newMessage = {
        message: userMessage,
        sender: "user",
      };

      const newMessages = [...messages, newMessage];
      setMessages(newMessages);

      inputElement.value = "";

      setIsTyping(true);
      await processMessageToChatGPT(newMessages);
    }
  };

  const processMessageToChatGPT = async (chatMessages) => {
    setIsLoading(true); // Set isLoading to true to show the loading animation

    try {
      const response = await sendMessageToChatGPT(chatMessages);
      if (response && response.choices && response.choices.length > 0) {
        const answer = response.choices[0].message.content;
        const newMessage = {
          message: answer,
          sender: "ChatGPT",
        };
        const newMessages = [...chatMessages, newMessage];
        setMessages(newMessages);
      }
    } catch (error) {
      setErrorMessage("Error occurred during API request."); // Set error message if an error occurs
    }

    setIsTyping(false);
    setIsLoading(false); // Set isLoading back to false to hide the loading animation
  };

  const sendMessageToChatGPT = async (chatMessages) => {
    const apiMessages = chatMessages.map((message, index) => {
      const role = index % 2 === 0 ? "user" : "assistant";
      return { role, content: message.message };
    });

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...apiMessages],
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    }).then((data) => data.json());

    return response;
  };

  const renderInput = () => {
    if (isLoading) {
      return <div className="loading-animation"></div>;
    } else {
      return (
        <textarea
          className="input-box"
          placeholder="Type your message..."
          rows={1}
          onChange={(event) => {
            if (event.target.value.split("\n").length > 5) {
              event.target.rows = event.target.value.split("\n").length;
            } else {
              event.target.rows = 1;
            }
          }}
        ></textarea>
      );
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>IPC Laws Assistant</h1>
      </header>
      <div id="chatbot" className={`chatbot ${isExpanded ? "expanded" : ""}`}>
        <div className="messages" ref={messagesRef}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.sender === "ChatGPT" ? "chatgpt" : "user"
              }`}
            >
              {message.message}
            </div>
          ))}
        </div>
        <div className={`input ${isExpanded ? "expanded" : ""}`}>
          {renderInput()}
          <button className="submit-button" onClick={handleSend}>
            Send
          </button>
          {isTyping && <div className="typing-indicator"></div>}
          {errorMessage && <div className="error-message">{errorMessage}</div>}
        </div>
      </div>
    </div>
  );
}

export default App;
