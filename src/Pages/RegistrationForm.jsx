import React, { useState } from "react";
import "./RegistrationForm.css";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    personalNumber: "",
    mobileNumber: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log("Form submitted:", formData);
    alert("Registration submitted successfully!");
  };

  const handleClear = () => {
    setFormData({
      customerName: "",
      email: "",
      address: "",
      city: "",
      zipCode: "",
      personalNumber: "",
      mobileNumber: "",
    });
  };

  return (
    <div className="registration-container">
      <h1>New Client Registration</h1>
      <h2>Client Registration for BankID verification</h2>

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
          <label htmlFor="address">Address</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group city-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group zip-group">
            <label htmlFor="zipCode">ZIP Code</label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="personalNumber">Personal Number</label>
          <input
            type="text"
            id="personalNumber"
            name="personalNumber"
            value={formData.personalNumber}
            onChange={handleChange}
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
          <button type="submit" className="submit-btn">
            Submit
          </button>
          <button type="button" onClick={handleClear} className="clear-btn">
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;
