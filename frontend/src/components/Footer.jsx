import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="footer-section brand">
                    <h2><span className="brand-highlight">Student</span> Note Books</h2>
                    <p>Your one-stop destination for quality educational supplies.</p>
                    <p>78/1, Balasubaryalu street, Opp Fire Service,<br />Aannor Theatre Road, Erode – 638001</p>
                    <p>Email: studentnotebookerode@gmail.com</p>
                </div>

                <div className="footer-section links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/shop">Shop Now</a></li>
                        <li><a href="/cart">Cart</a></li>
                    </ul>
                </div>

                <div className="footer-section legal">
                    <h3>Legal</h3>
                    <ul>
                        <li><a href="/terms">Terms of Service</a></li>
                        <li><a href="/privacy">Privacy Policy</a></li>
                        <li>GST No.: 33EWCPS3407M2ZA</li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} Student Note Books. Developed by Kongu Engineering College.
            </div>
        </footer>
    );
};

export default Footer;
