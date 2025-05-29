import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./RegistrationForm.css";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    personalNumber: "",
    mobileNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Start the BankID authentication session
      const response = await axios.post(
        "http://localhost:5000/api/clients/start-bankid-auth",
        formData
      );

      if (response.data.status === "success") {
        // Redirect directly to the BankID auth page with the authRef
        navigate(`/bankid-auth/${response.data.authRef}`);
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(
        error.response?.data?.error ||
          "Failed to initiate BankID authentication"
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
    setError(null);
  };

  return (
    <div className="registration-container">
      <h1>New Client Registration</h1>
      <h2>Client Registration with BankID Verification</h2>

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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
        </div>

        <div className="button-group">
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Register & Verify with BankID"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="clear-btn"
            disabled={isSubmitting}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
