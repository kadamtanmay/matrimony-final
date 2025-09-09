import React from 'react';
import { motion } from 'framer-motion';
import { fadeIn } from '../Animation';
import './Footer.css';

const Footer = () => {
  return (
    <motion.footer className="footer flowbite-style" variants={fadeIn} initial="hidden" animate="visible">
      <div className="container">
        <div className="w-full text-center">
          <div className="w-full justify-between sm:flex sm:items-center sm:justify-between">
            {/* Footer Brand */}
            <div className="footer-brand">
              <a href="/" className="text-decoration-none">
                <span className="footer-brand-name">💍 Matrimony</span>
              </a>
            </div>
            
            {/* Footer Links */}
            <div className="footer-links">
              <a href="#" className="footer-link">About</a>
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Terms of Service</a>
              <a href="#" className="footer-link">Contact</a>
            </div>
          </div>
          
          {/* Footer Copyright */}
          <div className="footer-copyright">
            <p>© 2024 <a href="#" className="text-decoration-none">Matrimony™</a>. All rights reserved.</p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
