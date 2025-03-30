'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './About.module.css';

export default function About() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const wa = localStorage.getItem('walletCompany');
    if (!wa) {
      console.error('No wallet address found');
      return;
    }
    setWallet(wa);
    
    fetch(`http://localhost:8080/api/company/${wa}`)
      .then(response => response.json())
      .then(data => setUserData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const handleLogout = () => {
    console.log('User logged out');
    router.push('/');
  };

  return (
    <div className={styles.companyPortal}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <motion.div
          className={styles.logo}
          onClick={() => router.push('/Company')}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Affilify
        </motion.div>
        <ul className={styles.navLinks}>
          <li><Link href="/Company">Home</Link></li>
          <li><Link href="/Company/AddProduct">Add Product</Link></li>
          <li><Link href="/Company/PreviousProduct">Previous Products</Link></li>
          <li><Link href="/Company/About">About</Link></li>
        </ul>
        <button className={styles.signOutBtn} onClick={handleLogout}>Sign Out</button>
      </nav>

      <div className={styles.pageContainer}>
        <motion.div
          className={styles.detailsCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.cardHeader}>
            <h1>Your Account Details</h1>
            <button className={styles.editButton} disabled>Edit Details</button>
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.profileSection}>
              <div className={styles.avatarSection}>
                <div className={styles.avatar}>{userData?.name?.charAt(0) || '?'}</div>
              </div>
              <div className={styles.basicInfo}>
                <h2>{userData?.name || 'Unknown User'}</h2>
                <p className={styles.earnings}><strong>Email:</strong> {userData?.email || 'N/A'}</p>
              </div>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <h3>Wallet Address</h3>
                <p>{wallet || 'N/A'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
