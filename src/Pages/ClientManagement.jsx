import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ClientManagement.css";

const ClientManagement = () => {
  const [clients, setClients] = useState([
    {
      id: 1,
      name: "Erik Perera",
      status: "Pending",
      email: "Test1@gmail.com",
      phone: "012234",
      lastUpdate: "Last Update",
    },
    {
      id: 2,
      name: "John",
      status: "Verified",
      email: "Test2@gmail.com",
      phone: "098765",
      lastUpdate: "Last Update",
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [setIsMenuOpen, isMenuOpen] = useState(false);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
  );

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

      <div className="add-client-btn">
        <Link
          to="/clientform"
          className="add-client-btn"
          onClick={() => setIsMenuOpen(false)}
        >
          Add New a Client
        </Link>
      </div>

      <div className="client-list">
        {filteredClients.map((client) => (
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
        ))}
      </div>
    </div>
  );
};

export default ClientManagement;
