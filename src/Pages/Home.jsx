import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="page-container">
      <div className="content-wrapper">
        <h2>Welcome to TRUE CREDIT</h2>
        <p>You can use to verify the financial ability of clients.</p>

        <div className="card-container">
          <Link to="/client-management" className="card-link">
            <div className="card">
              <h3>Client Management</h3>
              <p>You can use to manage client details.</p>
            </div>
          </Link>

          {/* <div className="card">
            <h3>Credit Cards</h3>
            <p>Find the perfect card for your lifestyle.</p>
          </div> */}

          <Link to="/report-analysis" className="card-link">
            <div className="card">
              <h3>Report Analysis</h3>
              <p>You can see the reports of clients.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
