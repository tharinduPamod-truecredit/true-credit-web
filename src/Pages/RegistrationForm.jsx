import React, { useState } from "react";
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
  const [bankIdStarted, setBankIdStarted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBankIDInitiation = async (personalNumber) => {
    try {
      setBankIdStarted(true);
      const response = await axios.post(
        "http://localhost:5000/api/clients/initiate-bankid",
        { personalNumber }
      );

      if (response.data.bankidUrl) {
        // Open BankID in a new window
        const bankIdWindow = window.open(
          response.data.bankidUrl,
          "_blank",
          "width=500,height=600"
        );

        // Start polling for verification status
        pollForVerificationStatus(personalNumber, bankIdWindow);
      }
    } catch (error) {
      setBankIdStarted(false);
      setError(error.response?.data?.error || "BankID initiation failed");
    }
  };

  const pollForVerificationStatus = async (personalNumber, bankIdWindow) => {
    let attempts = 0;
    const maxAttempts = 30; // ~2.5 minutes with 5s interval

    const interval = setInterval(async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/clients/verify-and-fetch",
          { personalNumber }
        );

        if (response.data.status === "success") {
          clearInterval(interval);
          if (bankIdWindow) bankIdWindow.close();
          setSuccessMessage(
            "Registration and BankID verification complete! Customer details fetched successfully."
          );
          setSuccess(true);
          handleClear();
        }
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          if (bankIdWindow) bankIdWindow.close();
          setBankIdStarted(false);
          setError("BankID verification timed out. Please try again.");
        }
      }
    }, 5000); // Poll every 5 seconds
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // First, register the client
      const response = await axios.post(
        "http://localhost:5000/api/clients/register",
        formData
      );

      // Then initiate BankID flow
      await handleBankIDInitiation(formData.personalNumber);

      setSuccessMessage(
        "Registration successful! Please complete BankID verification in the popup window."
      );
      setSuccess(true);
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
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
    setBankIdStarted(false);
  };

  return (
    <div className="registration-container">
      <h1>New Client Registration</h1>
      <h2>Client Registration for BankID verification</h2>

      {success && (
        <div className="success-message">
          <div className="success-icon">✓</div>
          <div className="success-text">
            <h3>Registration Successful!</h3>
            <p>{successMessage}</p>
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
          />
        </div>

        <div className="button-group">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || bankIdStarted}
          >
            {isSubmitting
              ? "Submitting..."
              : bankIdStarted
              ? "Waiting for BankID..."
              : "Submit"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="clear-btn"
            disabled={bankIdStarted}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
