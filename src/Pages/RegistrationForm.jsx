import React, { useState, useEffect } from "react";
import axios from "axios";
import "./RegistrationForm.css";
import BankIDAuth from "./BankIDAuth";
import BankIDAuthButton from "./BankIDAuthButton";

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
  const [verificationInProgress, setVerificationInProgress] = useState(false);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/clients");
        setClients(response.data);
      } catch (err) {
        console.error("Error fetching clients:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. First register the client
      const registerResponse = await axios.post(
        "http://localhost:5000/api/clients/register",
        formData
      );

      // 2. Initiate BankID authentication
      const authResponse = await axios.post(
        "http://localhost:5000/api/bankid/start-mobile-auth",
        {
          personalNumber: formData.personalNumber,
          mobileNumber: formData.mobileNumber,
        }
      );

      // 3. Handle mobile vs desktop redirection
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        // Mobile - try to open BankID app directly
        window.location.href = `bankid:///?autostarttoken=${authResponse.data.authRef}&redirect=null`;

        // Fallback to web if app not installed
        setTimeout(() => {
          window.location.href = authResponse.data.redirectUrl;
        }, 500);
      } else {
        // Desktop - redirect to web flow
        window.location.href = authResponse.data.redirectUrl;
      }
    } catch (error) {
      console.error("Registration error:", error);
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  // In your React component
  const handleBankIDAuth = async () => {
    try {
      // 1. Initiate BankID auth
      const authResponse = await axios.post("/api/bankid/auth", {
        personalNumber: formData.personalNumber,
        mobileNumber: formData.mobileNumber,
      });

      // 2. Open BankID app or redirect
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        window.location.href = `bankid:///?autostarttoken=${authResponse.data.sessionId}`;
      } else {
        window.open(authResponse.data.authUrl, "_blank");
      }

      // 3. Poll for completion
      const pollCompletion = setInterval(async () => {
        const statusResponse = await axios.get(
          `/api/bankid/status/${authResponse.data.sessionId}`
        );

        if (statusResponse.data.status === "completed") {
          clearInterval(pollCompletion);
          const customerData = await axios.post("/api/customer/data", {
            sessionId: authResponse.data.sessionId,
          });

          setCustomerData(customerData.data);
          setVerificationComplete(true);
        }
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.message || "BankID authentication failed");
    }
  };

  // In RegistrationForm.jsx - Update the startVerification function
  const startVerification = async () => {
    setVerificationInProgress(true);
    setError(null);

    try {
      console.log("Starting verification with:", {
        personalNumber: formData.personalNumber,
        mobileNumber: formData.mobileNumber,
      });

      const response = await axios.post(
        "http://localhost:5000/api/clients/verify-and-fetch",
        {
          personalNumber: formData.personalNumber,
          mobileNumber: formData.mobileNumber,
        },
        {
          timeout: 120000, // 2 minute timeout
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      console.log("Verification response:", response.data);

      if (response.data.status === "success") {
        setSuccessMessage("Verification completed successfully!");
        setVerificationComplete(true);
        setCustomerData(response.data.data);
      } else {
        throw new Error(response.data.message || "Verification failed");
      }
    } catch (error) {
      console.error("Detailed verification error:", {
        message: error.message,
        response: error.response?.data,
        code: error.code,
        stack: error.stack,
      });

      let errorMessage = "Verification failed";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        if (error.response.data.details) {
          errorMessage += ` (${error.response.data.details})`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setVerificationComplete(false);
    } finally {
      setVerificationInProgress(false);
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
    setVerificationInProgress(false);
    setVerificationComplete(false);
    setCustomerData(null);
  };

  <BankIDAuth
    personalNumber={formData.personalNumber}
    mobileNumber={formData.mobileNumber}
    onSuccess={() => {
      setSuccessMessage("BankID authentication successful!");
      setVerificationComplete(true);
    }}
    onError={(err) => {
      setError(err.message || "BankID authentication failed");
    }}
  />;

  <BankIDAuthButton
    personalNumber={formData.personalNumber}
    mobileNumber={formData.mobileNumber}
    onSuccess={() => {
      setSuccessMessage("BankID authentication successful!");
      setVerificationComplete(true);
      // Proceed with registration
    }}
    onError={(error) => {
      setError(error);
      setVerificationComplete(false);
    }}
  />;

  return (
    <div className="registration-container">
      <h1>New Client Registration</h1>
      <h2>Client Registration with BankID Verification</h2>

      {success && (
        <div className="success-message">
          <div className="success-icon">✓</div>
          <div className="success-text">
            <h3>{successMessage}</h3>
            {verificationInProgress && (
              <div className="auth-status pending">
                <div className="spinner"></div>
                <p>Verifying with BankID...</p>
              </div>
            )}
            {verificationComplete && (
              <div className="auth-status success">✓ Verification complete</div>
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

      {!verificationComplete ? (
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
              disabled={verificationInProgress}
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
              disabled={verificationInProgress}
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
              disabled={verificationInProgress}
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
              disabled={verificationInProgress}
            />
          </div>

          <div className="button-group">
            <button
              type="submit"
              className="submit-btn"
              disabled={isSubmitting || verificationInProgress}
            >
              {isSubmitting ? "Processing..." : "Register & Verify with BankID"}
            </button>
            <button type="button" onClick={handleClear} className="clear-btn">
              Clear
            </button>
          </div>
        </form>
      ) : (
        <div className="customer-data">
          <h3>Customer Details</h3>
          <div className="data-section">
            <h4>Personal Information</h4>
            <pre>{JSON.stringify(customerData.person, null, 2)}</pre>
          </div>
          <div className="data-section">
            <h4>Tax Deductions</h4>
            <pre>{JSON.stringify(customerData.deduction, null, 2)}</pre>
          </div>
          <div className="data-section">
            <h4>Property Information</h4>
            <pre>{JSON.stringify(customerData.property, null, 2)}</pre>
          </div>
          <button type="button" onClick={handleClear} className="clear-btn">
            Register New Client
          </button>
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;
