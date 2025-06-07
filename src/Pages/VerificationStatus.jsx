// VerificationStatus.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerificationStatus = () => {
  const [status, setStatus] = useState("checking");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkVerificationStatus = async () => {
      const authRef = localStorage.getItem("bankidAuthRef");
      if (!authRef) {
        setError("No authentication reference found");
        setStatus("error");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/bankid/status/${authRef}`
        );

        if (response.data.status === "completed") {
          setStatus("completed");
          // Fetch customer details or redirect to success page
          navigate("/registration-success");
        } else {
          setStatus("pending");
          // Continue polling
          setTimeout(checkVerificationStatus, 2000);
        }
      } catch (err) {
        setError(err.response?.data?.error || "Verification check failed");
        setStatus("error");
      }
    };

    checkVerificationStatus();
  }, [navigate]);

  return (
    <div className="verification-status">
      {status === "checking" && <p>Verifying your authentication...</p>}
      {status === "pending" && (
        <p>Waiting for BankID authentication to complete...</p>
      )}
      {status === "completed" && <p>Verification successful! Redirecting...</p>}
      {status === "error" && (
        <div className="error">
          <p>{error}</p>
          <button onClick={() => navigate("/register")}>Try Again</button>
        </div>
      )}
    </div>
  );
};

export default VerificationStatus;
