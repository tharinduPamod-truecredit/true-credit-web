import React, { useState, useEffect } from "react";
import "./RegistrationForm.css";
import axios from "axios";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    personalNumber: "",
    mobileNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [authSession, setAuthSession] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const startAuthPolling = (reference) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/clients/check-bankid-status/${reference}`
        );

        console.log("Polling response:", response.data);

        if (response.data.status === "completed") {
          clearInterval(interval);
          setPollingInterval(null);
          setAuthStatus("completed");
          setSuccessMessage("BankID authentication completed successfully!");
          completeRegistration();
        }
      } catch (error) {
        console.error("Polling error:", error);
        if (error.response?.status === 404) {
          // Session expired
          clearInterval(interval);
          setPollingInterval(null);
          setError("Authentication session expired. Please try again.");
          setAuthStatus("expired");
        }
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(interval);
  };

  const completeRegistration = async () => {
    try {
      // Verify and fetch customer details
      const verificationResponse = await axios.post(
        "http://localhost:5000/api/clients/verify-and-fetch",
        {
          personalNumber: formData.personalNumber,
        }
      );

      console.log("Verification complete:", verificationResponse.data);
      setSuccessMessage(
        "Registration and verification completed successfully!"
      );
      setSuccess(true);
    } catch (error) {
      console.error("Verification error:", error);
      setError("Failed to complete registration. Please contact support.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. First register the client
      const registrationResponse = await axios.post(
        "http://localhost:5000/api/clients/register",
        formData
      );

      console.log("Registration response:", registrationResponse.data);

      // 2. Generate BankID QR code
      const qrResponse = await axios.post(
        "http://localhost:5000/api/clients/send-bankid-qr",
        {
          personalNumber: formData.personalNumber,
          mobileNumber: formData.mobileNumber,
          email: formData.email,
          customerName: formData.customerName,
        }
      );

      console.log("QR response:", qrResponse.data);

      if (qrResponse.data.status === "success") {
        setAuthSession(qrResponse.data.reference || formData.personalNumber);
        setSuccessMessage(
          "A Mobile BankID QR code has been sent to your email. " +
            "Please check your inbox and scan the QR code with your Mobile BankID app to authenticate."
        );
        setSuccess(true);

        // Start polling for authentication status
        startAuthPolling(qrResponse.data.reference || formData.personalNumber);
      }
    } catch (error) {
      console.error("Registration error:", {
        message: error.message,
        response: error.response?.data,
      });

      let errorMessage = "Registration failed. Please try again.";
      if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
        if (error.response.data?.error) {
          errorMessage += ` (${error.response.data.error})`;
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      customerName: "",
      email: "",
      personalNumber: "",
      mobileNumber: "",
    });
    setSuccess(false);
    setError(null);
    setAuthSession(null);
    setAuthStatus(null);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  return (
    <div className="registration-container">
      <h1>New Client Registration</h1>
      <h2>Client Registration with BankID Verification</h2>

      {success && (
        <div className="success-message">
          <div className="success-icon">✓</div>
          <div className="success-text">
            <h3>Registration Initiated!</h3>
            <p>{successMessage}</p>
            {authStatus === "pending" && (
              <div className="auth-status">
                <div className="spinner"></div>
                <p>Waiting for BankID authentication...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <div className="error-icon">!</div>
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="customerName">Customer Name</label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            required
            disabled={authSession}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={authSession}
          />
        </div>

        <div className="form-group">
          <label htmlFor="personalNumber">
            Personal Number (YYYYMMDD-XXXX)
          </label>
          <input
            type="text"
            id="personalNumber"
            name="personalNumber"
            value={formData.personalNumber}
            onChange={handleChange}
            pattern="\d{8}-\d{4}"
            title="Please enter in format YYYYMMDD-XXXX"
            required
            disabled={authSession}
          />
        </div>

        <div className="form-group">
          <label htmlFor="mobileNumber">Mobile Number</label>
          <input
            type="tel"
            id="mobileNumber"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
            disabled={authSession}
          />
        </div>

        <div className="button-group">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || authSession}
          >
            {isSubmitting ? "Processing..." : "Register & Verify with BankID"}
          </button>
          <button type="button" onClick={handleClear} className="clear-btn">
            {authSession ? "Cancel Verification" : "Clear"}
          </button>
        </div>
      </form>

      {authSession && (
        <div className="auth-instructions">
          <h3>BankID Authentication Instructions</h3>
          <ol>
            <li>Check your email for the QR code</li>
            <li>Open your Mobile BankID app</li>
            <li>Scan the QR code to authenticate</li>
            <li>Wait for the verification to complete</li>
          </ol>
          <p className="note">
            Note: This process will timeout after 15 minutes of inactivity.
          </p>
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;
