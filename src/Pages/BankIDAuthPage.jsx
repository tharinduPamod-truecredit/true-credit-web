import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./BankIDAuthPage.css";

const BankIDAuthPage = () => {
  const { authRef } = useParams();
  const navigate = useNavigate();
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [status, setStatus] = useState("pending"); // pending, completed, failed, expired
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(120); // 2 minutes countdown
  const pollingIntervalRef = useRef(null);
  const qrRefreshIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const [refreshError, setRefreshError] = useState(null);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (qrRefreshIntervalRef.current)
        clearInterval(qrRefreshIntervalRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // Initialize authentication session
  useEffect(() => {
    if (!authRef) {
      setError("Invalid authentication reference");
      setStatus("failed");
      return;
    }

    const initAuthSession = async () => {
      try {
        const validationResponse = await axios.get(
          `http://localhost:5000/api/clients/validate-session/${authRef}`
        );

        console.log("Validation response:", validationResponse.data);

        if (!validationResponse.data.isValid) {
          setError("Session is invalid or expired");
          setStatus("expired");
          return;
        }

        // Verify QR code data exists and is valid
        if (!validationResponse.data.qrCodeDataUrl) {
          throw new Error("No QR code data received from server");
        }

        setQrCodeUrl(validationResponse.data.qrCodeDataUrl);
        startPolling(authRef);
        startCountdown();
      } catch (err) {
        console.error("Session initialization error:", err);
        setError(err.response?.data?.error || "Failed to initialize session");
        setStatus("failed");
      }
    };

    initAuthSession();

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (qrRefreshIntervalRef.current)
        clearInterval(qrRefreshIntervalRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [authRef]);

  const startCountdown = () => {
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          setStatus("expired");
          setError("Authentication session expired. Please try again.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startPolling = (sessionToken) => {
    // Clear any existing intervals
    if (qrRefreshIntervalRef.current)
      clearInterval(qrRefreshIntervalRef.current);
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    // QR refresh every 1 second
    qrRefreshIntervalRef.current = setInterval(async () => {
      try {
        const qrResponse = await axios.get(
          `http://localhost:5000/api/clients/current-qr/${sessionToken}`
        );

        // Only update if QR code changed
        if (qrResponse.data.qrDataUrl !== qrCodeUrl) {
          setQrCodeUrl(qrResponse.data.qrDataUrl);
        }
      } catch (qrError) {
        if (qrError.response?.status === 404) {
          console.log("Session expired during refresh");
          clearIntervals();
          setError("Session expired. Please start again.");
          setStatus("expired");
        } else {
          console.error("QR refresh error:", qrError);
        }
      }
    }, 1000);

    // Status polling every 2 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const statusResponse = await axios.get(
          `http://localhost:5000/api/bankid/status/${sessionToken}`
        );

        if (statusResponse.data.status === "completed") {
          clearIntervals();
          setStatus("completed");
          setTimeout(() => {
            navigate("/registration-success");
          }, 2000);
        }
      } catch (statusError) {
        if (statusError.response?.status === 404) {
          clearIntervals();
          setError("Session expired. Please start again.");
          setStatus("expired");
        } else {
          console.error("Status polling error:", statusError);
        }
      }
    }, 2000);
  };
  const clearIntervals = () => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    if (qrRefreshIntervalRef.current)
      clearInterval(qrRefreshIntervalRef.current);
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);
  };

  const handleRetry = () => {
    navigate("/"); // Navigate back to registration form
  };

  // Then in your QR refresh interval:
  qrRefreshIntervalRef.current = setInterval(async () => {
    try {
      const qrResponse = await axios.get(
        `http://localhost:5000/api/clients/current-qr/${sessionToken}`,
        { timeout: 5000 } // Add timeout
      );

      setRefreshError(null);
      setQrCodeUrl(qrResponse.data.qrDataUrl);
    } catch (qrError) {
      if (qrError.response?.status === 404) {
        setRefreshError("Session expired - please start over");
        clearIntervals();
        setStatus("expired");
      } else {
        setRefreshError("QR refresh issue - trying again...");
        console.error("QR refresh error:", qrError);
      }
    }
  }, 1000);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="bankid-auth-container">
      <div className="auth-header">
        <h1>BankID Authentication</h1>
        <p>Please authenticate with your Mobile BankID to continue</p>
      </div>

      {error && (
        <div className="auth-error">
          <div className="error-icon">!</div>
          <div className="error-message">{error}</div>
          {status === "expired" && (
            <button onClick={handleRetry} className="retry-button">
              Try Again
            </button>
          )}
        </div>
      )}

      {status === "pending" && (
        <div className="auth-instructions">
          <h3>How to authenticate:</h3>
          <ol>
            <li>Open the BankID app on your mobile device</li>
            <li>Tap "Scan QR code" in the app</li>
            <li>Point your camera at the QR code below</li>
            <li>Confirm the authentication in the app</li>
          </ol>
          <div className="countdown">
            Time remaining: {formatTime(countdown)}
          </div>
        </div>
      )}

      {status === "completed" && (
        <div className="auth-success">
          <div className="success-icon">✓</div>
          <h3>Authentication Successful!</h3>
          <p>You will be redirected shortly...</p>
        </div>
      )}

      {qrCodeUrl && status === "pending" ? (
        <div className="qr-code-wrapper">
          <img
            src={qrCodeUrl}
            alt="BankID QR Code"
            className="qr-code"
            onError={(e) => {
              console.error("QR code failed to load");
              e.target.style.display = "none";
            }}
          />
          <div className="qr-code-refresh-indicator">
            <div className="spinner"></div>
            <span>Refreshing QR code...</span>
          </div>
        </div>
      ) : (
        <div className="qr-code-placeholder">
          {status === "pending" ? "Loading QR code..." : null}
        </div>
      )}

      <div className="auth-footer">
        <p>
          Having trouble?{" "}
          <a
            href="https://www.bankid.com/en/help"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get help with BankID
          </a>
        </p>
      </div>
    </div>
  );
};

export default BankIDAuthPage;
