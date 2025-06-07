import React, { useState } from "react";
import axios from "axios";

const BankIDAuthButton = ({
  personalNumber,
  mobileNumber,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("idle");

  const handleAuth = async () => {
    if (!personalNumber || !mobileNumber) {
      onError("Personal number and mobile number are required");
      return;
    }

    setIsLoading(true);
    setStatus("initiating");

    try {
      const response = await axios.post("/api/bankid/authenticate", {
        personalNumber,
        mobileNumber,
      });

      if (response.data.status === "success") {
        setStatus("completed");
        onSuccess();
      } else {
        throw new Error(response.data.message || "Authentication failed");
      }
    } catch (error) {
      setStatus("error");
      onError(error.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bankid-auth-container">
      <button
        onClick={handleAuth}
        disabled={isLoading || !personalNumber || !mobileNumber}
        className="bankid-auth-button"
      >
        {isLoading ? "Processing..." : "Authenticate with BankID"}
      </button>

      {status === "initiating" && (
        <p className="auth-status">Opening BankID authentication...</p>
      )}

      {status === "error" && (
        <p className="auth-error">Authentication failed. Please try again.</p>
      )}
    </div>
  );
};

export default BankIDAuthButton;
