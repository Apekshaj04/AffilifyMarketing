'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import styles from './AffiliatePortal.module.css';

export default function AffiliatePortal() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [popupNotification, setPopupNotification] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      const walletAffiliate = localStorage.getItem('walletAffiliate');
      if (walletAffiliate) {
        fetchNotifications(walletAffiliate);
      }
    };

    fetchData(); // Initial fetch

    const interval = setInterval(fetchData, 5000); // Fetch data every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);


  const fetchNotifications = async (affiliateAddress) => {
    try {
      const response = await fetch(`http://localhost:8080/api/notification/affiliate/${affiliateAddress}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data = await response.json();
      setNotifications(data);
      
      if (data.length > 0) {
        setPopupNotification(data[0]); 
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await fetch(`http://localhost:8080/api/notification/deleteNotification/${notificationId}`, {
        method: 'DELETE',
      });

      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));

      const nextNotification = notifications.find((n) => n._id !== notificationId);
      setPopupNotification(nextNotification || null);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handlePopupClose = () => {
    if (popupNotification) {
      deleteNotification(popupNotification._id);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userType');
    localStorage.removeItem('walletAffiliate')
    router.push('/');
  };

  return (
    <div className={styles.affiliatePortal}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <motion.div
          className={styles.logo}
          onClick={() => router.push('/Affiliate')}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Affilify
        </motion.div>
        <ul className={styles.navLinks}>
          <li><Link href="/Affiliate">Home</Link></li>
          <li><Link href="/Affiliate/Recommendations">Recommendations</Link></li>
          <li><Link href="/Affiliate/Analytics">Previous Products</Link></li>
          <li><Link href="/Affiliate/About">Your Details</Link></li>
        </ul>
        <button className={styles.signOutBtn} onClick={handleLogout}>Sign Out</button>
      </nav>

      {/* Notification Popup */}
      {popupNotification && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <h3>{popupNotification.company}</h3>
            <p>{popupNotification.message}</p>
            <button className={styles.popupBtn} onClick={handlePopupClose}>OK</button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Affiliate Dashboard
          </motion.h1>
          <h2>Maximize Your Earnings</h2>
          <p>Manage promotions, track conversions, and boost your affiliate success.</p>
          <motion.button
            className={styles.ctaButton}
            onClick={() => router.push('/Affiliate/Analytics')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Analytics
          </motion.button>
        </div>
        <motion.div
          className={styles.heroImage}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img src="/affiliate.jpg" alt="Dashboard Illustration" />
        </motion.div>
      </section>

      {/* Image-Text Sections */}
      <section className={styles.alternatingSection}>
        <div className={styles.imageWrapper}>
          <motion.img 
            src="/secure.png" 
            alt="Security"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <div className={styles.textWrapper}>
          <h3>Secure & Reliable</h3>
          <p>
          Our blockchain-based affiliate system ensures transparency and security. Every transaction is recorded on an immutable ledger, eliminating the risk of fraud. Smart contracts automate processes, ensuring trust and accuracy. Your data remains encrypted and protected from unauthorized access. With decentralized verification, there is no need for intermediaries, reducing vulnerabilities. Rest assured, your earnings and transactions are safeguarded at every step.</p>
        </div>
      </section>

      <section className={styles.alternatingSectionReverse}>
        <div className={styles.textWrapper}>
          <h3>Instant Payments</h3>
          <p>Earn commissions instantly through our automated payment system. No more waiting for payouts—our smart contracts ensure real-time transactions. Payments are processed securely and directly to your wallet, eliminating delays. With blockchain technology, all transactions are verifiable and irreversible. Enjoy hassle-free withdrawals without hidden fees or manual approvals. Your earnings are always accessible, ensuring a seamless and rewarding affiliate experience.</p>
        </div>
        <div className={styles.imageWrapper}>
          <motion.img 
            src="/payment.png" 
            alt="Instant Payments"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </section>
      <section className={styles.successStories}>
      <h2>Success Stories</h2>
      <div className={styles.storiesContainer}>
        <div className={styles.story}>
          <motion.img
            src="/random.jpeg"
            alt="Success Story 1"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          />
          <p>John Doe made over $10,000 in his first month using our affiliate program.</p>
        </div>
        <div className={styles.story}>
          <motion.img
            src="/random.jpeg"
            alt="Success Story 2"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          />
          <p>Jane Smith built a passive income stream with our trusted network.</p>
        </div>
      </div>
    
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2025 Affilify. All rights reserved.</p>
      </footer>
    </div>
  );
}
