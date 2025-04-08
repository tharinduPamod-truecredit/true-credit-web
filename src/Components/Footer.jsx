const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>TRUE CREDIT</h3>
          <p>Your financial solutions provider.</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Us</h4>
          <p>Email: info@truecredit.com</p>
          <p>Phone: (123) 456-7890</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} TRUE CREDIT. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
