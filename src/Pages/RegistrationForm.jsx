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
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrExpiry, setQrExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

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
      if (verificationResponse.data.status === "success") {
        setSuccessMessage(
          "Registration and verification completed successfully!"
        );
        setSuccess(true);
      } else {
        throw new Error(
          verificationResponse.data.message || "Verification failed"
        );
      }
    } catch (error) {
      console.error("Verification error:", error);
      setError(
        error.message ||
          "Failed to complete registration. Please contact support."
      );
      // Allow retry
      setAuthSession(null);
      setAuthStatus(null);
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

      setQrCodeUrl(qrResponse.data.qrCodeDataUrl);
      setAuthToken(qrResponse.data.authRef);
      setQrExpiry(new Date(qrResponse.data.expiresAt));
      startAuthPolling(qrResponse.data.authRef);
      console.log("QR response:", qrResponse.data);

      // Start countdown timer
      const timer = setInterval(() => {
        const now = new Date();
        const expiry = new Date(response.data.expiresAt);
        const secondsLeft = Math.round((expiry - now) / 1000);

        setTimeLeft(secondsLeft > 0 ? secondsLeft : 0);

        if (secondsLeft <= 0) {
          clearInterval(timer);
          setError("QR code has expired. Please generate a new one.");
        }
      }, 100000);

      // Store timer reference for cleanup
      setPollingInterval(timer);

      // Start authentication status polling
      startAuthPolling(qrResponse.data.authRef);

      if (qrResponse.data.status === "success") {
        setAuthSession(qrResponse.data.reference);
        setSuccessMessage(
          "A Mobile BankID QR code has been sent to your email. " +
            "Please check your inbox and scan the QR code with your Mobile BankID app to authenticate."
        );
        setSuccess(true);

        // If the backend returns the QR code directly
        if (qrResponse.data.qrCodeDataUrl) {
          setQrCodeUrl(qrResponse.data.qrCodeDataUrl);
        }

        // Start polling for authentication status
        startAuthPolling(qrResponse.data.reference);
      }

      const response = await axios.post(
        "http://localhost:5000/api/bankid/init",
        {
          personalNumber: formData.personalNumber,
          mobileNumber: formData.mobileNumber,
          email: formData.email,
          name: formData.name,
        }
      );
      setAuthToken(response.data.authToken);
      setQrCodeUrl(response.data.qrCodeDataUrl);
      startAuthPolling(response.data.authToken);
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

  const handleAuthenticate = async () => {
    if (!authToken) return;

    try {
      setIsLoading(true);
      await axios.post("http://localhost:5000/api/bankid/authenticate", {
        authToken,
      });
      // Polling will handle the status update
    } catch (error) {
      console.error("Authentication error:", error);
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
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
            <li>
              Open the <strong>BankID</strong> app on your mobile device
            </li>
            <li>Tap "Scan QR code" in the app</li>
            <li>Point your camera at the QR code</li>
            <li>Confirm the login in the app</li>
          </ol>
          <p className="warning">
            Note: This will not work with regular QR scanners - you must use the
            official BankID app
          </p>
        </div>
      )}
      {qrCodeUrl && (
        <div className="qr-container">
          <h3>Scan with BankID App</h3>
          <img src={qrCodeUrl} alt="BankID QR Code" />
          {timeLeft !== null && (
            <div className={`qr-timer ${timeLeft < 30 ? "warning" : ""}`}>
              Expires in: {timeLeft}s
            </div>
          )}
          {timeLeft === 0 && (
            <button onClick={handleSubmit}>Generate New QR Code</button>
          )}
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;
