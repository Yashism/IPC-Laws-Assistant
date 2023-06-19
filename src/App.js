import React, { useState, useRef, useEffect } from "react";
import { CircleSpinner, ImpulseSpinner } from "react-spinners-kit";
import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import Login from "./Login";

function App() {
  const [isExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoading2, setIsLoading2] = useState(true);
  const [isLoading3, setIsLoading3] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([
    {
      message:
        "Hello! I'm IPC Laws Assistant. I can assist you with any crime case and tell you which are the applicable sections. Enter in any language you prefer.",
      sender: "ChatGPT",
    },
  ]);
  const messagesRef = useRef(null);
  const [user, setUser] = useState(null);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
      setIsLoading2(false);
      const storedApiKey = localStorage.getItem("apiKey");
      if (storedApiKey) {
        setApiKey(storedApiKey);
        // Check if the API key is valid
        checkApiKey(storedApiKey);
      } else {
        setApiKeyDialogOpen(true);
      }
    });
  }, []);

  const checkApiKey = async (key) => {
    setIsLoading3(true);

    try {
      // Send a test request to OpenAI API to check if the key is valid
      const response = await fetch(
        "https://api.openai.com/v1/engines/davinci",
        {
          method: "GET",
          headers: {
            Authorization: "Bearer " + key,
          },
        }
      );

      if (response.ok) {
        // Key is valid
        setIsLoading3(false);
        setIsLoading(false);
        setApiKeyDialogOpen(false);
      } else {
        // Key is invalid
        setApiKeyDialogOpen(true);
        setApiKey(""); // Clear the API key input
        setErrorMessage(
          "Invalid API key. Please enter a valid OpenAI API key."
        );
        setIsLoading3(false);
      }
    } catch (error) {
      setApiKeyDialogOpen(true);
      setApiKey(""); // Clear the API key input
      setErrorMessage(
        "Error occurred during API request. Please enter a valid OpenAI API key."
      );
      setIsLoading3(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  const handleSend = async () => {
    const userMessage = userInput.trim();

    if (userMessage !== "") {
      const newMessage = {
        message: userMessage,
        sender: "user",
      };

      const newMessages = [...messages, newMessage];
      setMessages(newMessages);

      setUserInput(""); // Clear the user input

      setIsTyping(true);
      await processMessageToChatGPT(newMessages);
    }
  };

  const processMessageToChatGPT = async (chatMessages) => {
    setIsLoading(true);

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
      if (error && error.response && error.response.status === 401) {
        // If error is 401, open the API key dialog
        setApiKeyDialogOpen(true);
        setApiKey(""); // Clear the API key input
        setErrorMessage("Unauthorized. Please enter your OpenAI API key.");
      } else {
        setErrorMessage("Error occurred during API request."); // Set error message if an error occurs
      }
    }

    setIsTyping(false);
    setIsLoading(false);
  };

  const sendMessageToChatGPT = async (chatMessages) => {
    const apiMessages = chatMessages.map((message, index) => {
      const role = index % 2 === 0 ? "user" : "assistant";
      return { role, content: message.message };
    });

    const apiRequestBody = {
      model: "gpt-3.5-turbo",
      messages: apiMessages,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    }).then((data) => data.json());

    return response;
  };

  const renderInput = () => {
    if (isLoading) {
      return (
        <div className="loading-indicator">
          <ImpulseSpinner
            size={35}
            color="#001122"
            frontColor="#001122"
            backColor="#001122"
          />
        </div>
      );
    } else {
      return (
        <textarea
          className="input-box"
          placeholder="Type your message..."
          rows={1}
          value={userInput}
          onChange={(event) => {
            setUserInput(event.target.value);
            if (event.target.value.split("\n").length > 5) {
              event.target.rows = event.target.value.split("\n").length;
            } else {
              event.target.rows = 1;
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              handleSend();
            }
          }}
        ></textarea>
      );
    }
  };

  if (isLoading2) {
    // Display the loading indicator for the first time only
    return (
      <div className="loading-container">
        <CircleSpinner
          size={50}
          color="#001122"
          frontColor="#001122"
          backColor="#001122"
        />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  if (apiKeyDialogOpen) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>IPC Laws Assistant</h1>
        </header>
        <div className="api-key-dialog">
          <h2>OpenAI API Key</h2>
          <input
            type="text"
            placeholder="Enter your OpenAI API key..."
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
          />
          {isLoading3 ? (
            <div className="loading-indicator">
              <CircleSpinner
                size={30}
                color="#001122"
                frontColor="#001122"
                backColor="#001122"
              />
            </div>
          ) : (
            <button
              className="submit-button"
              onClick={() => {
                checkApiKey(apiKey);
                localStorage.setItem("apiKey", apiKey);
              }}
            >
              Confirm
            </button>
          )}
          {errorMessage && <div className="error-message">{errorMessage}</div>}
        </div>
      </div>
    );
  }

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
          <button
            className="submit-button"
            onClick={handleSend}
            disabled={!apiKey}
          >
            Send
          </button>
          {isTyping && <div className="typing-indicator"></div>}
        </div>
      </div>
    </div>
  );
}

export default App;
