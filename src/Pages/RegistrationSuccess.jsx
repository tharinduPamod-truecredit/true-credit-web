import React from "react";
import { useNavigate } from "react-router-dom";
import "./RegistrationSuccess.css";

const RegistrationSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Registration Successful!</h1>
        <p>Your account has been successfully created and verified.</p>
        <button onClick={() => navigate("/")} className="home-button">
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
