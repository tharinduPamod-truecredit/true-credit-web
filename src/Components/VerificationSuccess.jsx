import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const VerificationSuccess = () => {
  return (
    <div className="verification-container">
      <h1>Email Verified Successfully!</h1>
      <p>
        Thank you for verifying your email address. You can now log in to your
        account.
      </p>
    </div>
  );
};

export default VerificationSuccess;
