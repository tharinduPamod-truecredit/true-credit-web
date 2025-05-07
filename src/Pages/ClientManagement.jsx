import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCriiptoVerify } from "@criipto/verify-react";
import "./ClientManagement.css";

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { redirectTo, claims } = useCriiptoVerify({
    action: "redirect",
    acrValues: "urn:grn:authn:se:bankid:same-device",
    loginHint: "bankid",
    redirectUri: window.location.origin + "/auth-callback",
  });

  // Handle successful authentication
  useEffect(() => {
    if (claims) {
      window.location.href = `/clientform?personnummer=${claims.personal_identity_number}`;
    }
  }, [claims]);

  // Fetch clients from the backend API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/clients");
        // Transform the data to match your frontend structure
        const formattedClients = response.data.map((client) => ({
          id: client.id,
          name: client.customer_name,
          status: client.is_verified ? "Verified" : "Pending",
          email: client.email,
          phone: client.mobile_number,
          lastUpdate: new Date().toLocaleDateString(), // Or use actual update time if available
        }));
        setClients(formattedClients);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error("Error fetching clients:", err);
      }
    };

    fetchClients();
  }, []);

  const handleBankIDAuth = () => {
    redirectTo();
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
  );

  if (loading) {
    return <div className="loading">Loading clients...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="client-management">
      <div className="header">
        <h1>Client Management</h1>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search your client"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="auth-options">
        <button onClick={handleBankIDAuth} className="bankid-auth-btn">
          <img src="/bankid-logo.svg" alt="BankID" />
          Add New Client with BankID
        </button>

        <span className="auth-divider">or</span>

        <Link
          to="/clientform"
          className="add-client-btn"
          onClick={() => setIsMenuOpen(false)}
        >
          Add Client Manually
        </Link>
      </div>

      <div className="client-list">
        {filteredClients.length > 0 ? (
          filteredClients.map((client) => (
            <div key={client.id} className="client-card">
              <div className="client-info">
                <div className="name-status">
                  <h3>{client.name}</h3>
                  <span className={`status ${client.status.toLowerCase()}`}>
                    {client.status}
                  </span>
                </div>
                <p>Email: {client.email}</p>
                <p>TP: {client.phone}</p>
              </div>
              <div className="last-update">
                <span>{client.lastUpdate}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="no-clients">
            {searchTerm ? "No matching clients found" : "No clients available"}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientManagement;
