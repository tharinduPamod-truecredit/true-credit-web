// In your React app (src/pages/ViewQR.js)
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function ViewQR() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [qrData, setQrData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/qr-code/${token}`
        );
        setQrData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load QR code");
        setLoading(false);
      }
    };

    fetchQRCode();
  }, [token]);

  if (loading) return <div>Loading QR code...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="qr-container">
      <h2>Mobile BankID Authentication</h2>
      <p>Please scan this QR code with your Mobile BankID app:</p>

      {qrData && (
        <>
          <img
            src={`${process.env.REACT_APP_API_URL}${qrData.qrCodePath}`}
            alt="Mobile BankID QR Code"
            style={{ width: "300px", height: "300px" }}
          />
          <p>Expires at: {new Date(qrData.expiresAt).toLocaleString()}</p>

          <button
            onClick={() => navigate("/bankid-auth", { state: { qrData } })}
          >
            Proceed to Authentication
          </button>
        </>
      )}
    </div>
  );
}

export default ViewQR;
