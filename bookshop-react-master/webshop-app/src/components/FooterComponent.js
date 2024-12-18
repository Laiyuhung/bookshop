import React from "react";
import { FaFacebookSquare, FaTwitterSquare, FaLinkedin, FaInstagramSquare } from "react-icons/fa";
import "../css/FooterComponent.css"; // 確保 CSS 文件路徑正確

function FooterComponent({ position, page }) {
    return (
        <footer
            className={`footer ${position === "absolute" ? "footer-absolute" : ""} ${
                page === "Home" ? "footer-home" : ""
            }`}
        >
            <div className="footer-content">
                <p className="copyright">© 2024 默窩 All Copyrights Reserved</p>
                <ul className="footer-list">
                    <li className="footer-item">
                        <a
                            href="https://www.facebook.com"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Facebook"
                        >
                            <FaFacebookSquare />
                        </a>
                    </li>
                    <li className="footer-item">
                        <a
                            href="https://www.twitter.com"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Twitter"
                        >
                            <FaTwitterSquare />
                        </a>
                    </li>
                    <li className="footer-item">
                        <a
                            href="https://www.linkedin.com"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="LinkedIn"
                        >
                            <FaLinkedin />
                        </a>
                    </li>
                    <li className="footer-item">
                        <a
                            href="https://www.instagram.com"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Instagram"
                        >
                            <FaInstagramSquare />
                        </a>
                    </li>
                </ul>
            </div>
        </footer>
    );
}

export default FooterComponent;
