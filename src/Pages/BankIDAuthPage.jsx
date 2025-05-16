import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BankIDAuthPage = () => {
  const [status, setStatus] = useState("Verifying your authentication link...");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const authenticateWithBankID = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/clients/authenticate-bankid",
          { token }
        );

        if (response.data.status === "success") {
          setStatus("Authentication successful!");
          setSuccess(true);

          // Redirect after 3 seconds
          setTimeout(() => {
            navigate("/registration-success");
          }, 3000);
        }
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.response?.data?.details ||
            "Authentication failed. Please try again."
        );
        setStatus("Authentication failed");
      }
    };

    authenticateWithBankID();
  }, [token, navigate]);

  return (
    <div className="auth-container">
      <h1>Mobile BankID Authentication</h1>

      {error ? (
        <div className="alert alert-error">
          <div className="error-icon">!</div>
          <div>{error}</div>
        </div>
      ) : (
        <div className="status-message">
          {success ? (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <div>{status}</div>
            </div>
          ) : (
            <div>{status}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default BankIDAuthPage;
