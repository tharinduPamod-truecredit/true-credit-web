import React, { useState, useEffect, useRef } from "react";
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
  const [sessionId, setSessionId] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const pollingIntervalRef = useRef(null);
  const qrRefreshIntervalRef = useRef(null);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (qrRefreshIntervalRef.current)
        clearInterval(qrRefreshIntervalRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const startDynamicQRPolling = async (sessionId) => {
    // First clear any existing intervals
    if (qrRefreshIntervalRef.current)
      clearInterval(qrRefreshIntervalRef.current);
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    // Get initial QR code
    await fetchQRCode(sessionId);

    // Set up QR refresh every second
    qrRefreshIntervalRef.current = setInterval(async () => {
      await fetchQRCode(sessionId);
    }, 1000);

    // Set up authentication status polling (every 3 seconds)
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/clients/check-bankid-status/${sessionId}`
        );

        if (response.data.status === "completed") {
          clearIntervals();
          setAuthStatus("completed");
          setSuccessMessage("BankID authentication completed successfully!");
          await completeRegistration();
        }
      } catch (error) {
        console.error("Polling error:", error);
        if (error.response?.status === 404) {
          clearIntervals();
          setError("Authentication session expired. Please try again.");
          setAuthStatus("expired");
        }
      }
    }, 3000);
  };

  const fetchQRCode = async (sessionId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/clients/dynamic-qr/current/${sessionId}`
      );
      setQrCodeUrl(response.data.qrDataUrl);
    } catch (error) {
      console.error("Failed to fetch QR code:", error);
    }
  };

  const clearIntervals = () => {
    if (qrRefreshIntervalRef.current)
      clearInterval(qrRefreshIntervalRef.current);
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    qrRefreshIntervalRef.current = null;
    pollingIntervalRef.current = null;
  };

  const completeRegistration = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/clients/verify-and-fetch",
        { personalNumber: formData.personalNumber }
      );

      if (response.data.status === "success") {
        setSuccessMessage(
          "Registration and verification completed successfully!"
        );
        setSuccess(true);
      } else {
        throw new Error(response.data.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError(error.message || "Failed to complete registration.");
      setSessionId(null);
      setAuthStatus(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Start dynamic session
      const response = await axios.post(
        "http://localhost:5000/api/clients/start-dynamic-session",
        formData
      );

      if (response.data.status === "success") {
        setSessionId(response.data.sessionId);
        setQrCodeUrl(response.data.initialQrDataUrl);
        setSuccessMessage("Scan the QR code with your Mobile BankID app");
        setSuccess(true);

        // Start QR refresh interval
        const interval = setInterval(async () => {
          try {
            const qrResponse = await axios.get(
              `http://localhost:5000/api/clients/current-qr/${response.data.sessionId}`
            );
            setQrCodeUrl(qrResponse.data.qrDataUrl);
          } catch (qrError) {
            console.error("QR refresh error:", qrError);
            if (qrError.response?.status === 404) {
              clearInterval(interval);
              setError("Session expired. Please start again.");
            }
          }
        }, 1000);

        // Auto-clear after 2 minutes
        setTimeout(() => {
          clearInterval(interval);
          if (!authStatus) {
            setError("Authentication timed out. Please try again.");
          }
        }, 120000);
      }
    } catch (error) {
      console.error("Registration error:", {
        message: error.message,
        response: error.response?.data,
      });

      let errorMessage = "Registration failed. Please try again.";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        if (error.response.data.details) {
          errorMessage += ` (${error.response.data.details})`;
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
    setSessionId(null);
    setAuthStatus(null);
    setQrCodeUrl(null);
    clearIntervals();
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
            {authStatus === "completed" ? (
              <div className="auth-status success">
                ✓ Authentication complete
              </div>
            ) : (
              <div className="auth-status pending">
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
            disabled={sessionId}
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
            disabled={sessionId}
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
            pattern="\d{6}-\d{4}"
            title="Please enter in format YYMMDD-XXXX"
            required
            disabled={sessionId}
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
            disabled={sessionId}
          />
        </div>

        <div className="button-group">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || sessionId}
          >
            {isSubmitting ? "Processing..." : "Register & Verify with BankID"}
          </button>
          <button type="button" onClick={handleClear} className="clear-btn">
            {sessionId ? "Cancel Verification" : "Clear"}
          </button>
        </div>
      </form>

      {sessionId && (
        <div className="auth-instructions">
          <h3>BankID Authentication Instructions</h3>
          <ol>
            <li>
              Open the <strong>BankID</strong> app on your mobile device
            </li>
            <li>Tap "Scan QR code" in the app</li>
            <li>Point your camera at the QR code below</li>
            <li>Confirm the login in the app</li>
          </ol>
          <p className="warning">
            Note: The QR code refreshes every second for security
          </p>
        </div>
      )}

      {qrCodeUrl && (
        <div className="qr-code-container">
          <img src={qrCodeUrl} alt="BankID QR Code" className="qr-code" />
          <p>Scan this QR code with your Mobile BankID app</p>
          <p className="qr-refresh-note">(QR code refreshes automatically)</p>
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;
