import React, { useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "./Login.css";
import { CircleSpinner } from "react-spinners-kit";

const firebaseConfig = {
  apiKey: "AIzaSyB_qLicpliukvefE1zSfptsgSbevB6pC3k",
  authDomain: "ipclawsassistant.firebaseapp.com",
  projectId: "ipclawsassistant",
  storageBucket: "ipclawsassistant.appspot.com",
  messagingSenderId: "193242864084",
  appId: "1:193242864084:web:6e9a88895985089f535e41",
  measurementId: "G-2E10SSK0W6",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    setIsLoading(true); // Set isLoading to true before redirecting
    firebase
      .auth()
      .signInWithRedirect(provider)
      .catch((error) => {
        console.log(error);
        setIsLoading(false); // Set isLoading back to false if an error occurs
      });
  };

  return (
    <div className="login-container">
      <header className="header">
        <h1>IPC Laws Assistant</h1>
      </header>
      <button className="google-signin-button" onClick={handleGoogleSignIn}>
        {isLoading ? (
          <CircleSpinner
            size={40}
            color="#001122"
            frontColor="#001122"
            backColor="#001122"
          />
        ) : (
          <img
            className="google-icon"
            src={require("./google-icon.png")}
            alt="Google Logo"
          />
        )}
      </button>
    </div>
  );
};

export default Login;