import React, { useState, useEffect } from "react";
import axios from "axios";

const BankIDAuth = ({ personalNumber, mobileNumber, onSuccess, onError }) => {
  const [authRef, setAuthRef] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [authWindow, setAuthWindow] = useState(null);

  const initiateAuth = async () => {
    try {
      setStatus("starting");
      const response = await axios.post("/api/bankid/auth", {
        personalNumber,
        mobileNumber,
      });

      setAuthRef(response.data.authRef);
      setStatus("started");

      // Open BankID auth window
      const windowFeatures = "width=600,height=800";
      const authWindow = window.open(
        response.data.nextStep,
        "bankid_auth",
        windowFeatures
      );
      setAuthWindow(authWindow);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to initiate BankID");
      setStatus("error");
      onError(err);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await axios.get(`/api/bankid/status/${authRef}`);
      if (response.data.status === "completed") {
        setStatus("completed");
        if (authWindow) authWindow.close();
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to check status");
      setStatus("error");
      onError(err);
    }
  };

  useEffect(() => {
    if (authRef && status === "started") {
      const interval = setInterval(checkStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [authRef, status]);

  useEffect(() => {
    return () => {
      if (authWindow) authWindow.close();
    };
  }, [authWindow]);

  return (
    <div className="bankid-auth">
      {status === "idle" && (
        <button onClick={initiateAuth} className="bankid-button">
          Authenticate with BankID
        </button>
      )}

      {status === "starting" && <p>Starting BankID authentication...</p>}

      {status === "started" && (
        <div>
          <p>Please complete authentication in the BankID window</p>
          <button onClick={() => authWindow.focus()}>Return to BankID</button>
        </div>
      )}

      {status === "completed" && (
        <p className="success">✓ BankID authentication complete</p>
      )}

      {error && <p className="error">Error: {error}</p>}
    </div>
  );
};

export default BankIDAuth;
