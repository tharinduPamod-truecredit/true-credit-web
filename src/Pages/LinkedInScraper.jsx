import React, { useState } from "react";

function LinkedInScraper() {
  const [profileUrl, setProfileUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [scrapedData, setScrapedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "http://localhost:5000/api/scrape-linkedin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profileUrl,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || "Scraping failed");
      }

      setScrapedData(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>LinkedIn Profile Scraper</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>LinkedIn Profile URL:</label>
          <input
            type="url"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            placeholder="https://www.linkedin.com/in/username"
            required
          />
        </div>

        <div className="form-group">
          <label>LinkedIn Email (optional):</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Only needed for private profiles"
          />
        </div>

        <div className="form-group">
          <label>LinkedIn Password (optional):</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Only needed for private profiles"
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Scraping..." : "Scrape Profile"}
        </button>
      </form>

      {error && (
        <div className="error">
          <p>{error}</p>
          {error.includes("authwall") && (
            <p>Please provide valid LinkedIn credentials</p>
          )}
        </div>
      )}

      {scrapedData && (
        <div className="results">
          <h3>Results:</h3>
          <p>
            <strong>Name:</strong> {scrapedData.name}
          </p>
          <p>
            <strong>Skills:</strong>
          </p>
          <ul>
            {scrapedData.skills?.length > 0 ? (
              scrapedData.skills.map((skill, i) => <li key={i}>{skill}</li>)
            ) : (
              <li>No skills found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default LinkedInScraper;
