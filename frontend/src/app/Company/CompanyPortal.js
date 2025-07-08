'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './CompanyPortal.module.css';

export default function CompanyPortal() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('userType');
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
          <li><Link href="/Company/FindAffiliate">Find Affiliates</Link></li>
          <li><Link href="/Company/About">About</Link></li>
        </ul>
        <button className={styles.signOutBtn} onClick={handleLogout}>Sign Out</button>
      </nav>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Company Dashboard
          </motion.h1>
          <h2>Expand Your Reach</h2>
          <p>Manage products, track performance, and grow your brand with affiliates.</p>
          <motion.button
            className={styles.ctaButton}
            onClick={() => router.push('/Company/AddProduct')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add a Product
          </motion.button>
        </div>
        <motion.div
          className={styles.heroImage}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <img src="/company.jpg" alt="Dashboard Illustration" />
        </motion.div>
      </section>

      {/* Image-Text Sections */}
      <section className={styles.alternatingSection}>
        <div className={styles.imageWrapper}>
          <motion.img src="/marketing.jpg" alt="Marketing"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <div className={styles.textWrapper}>
          <h3>Boost Your Sales</h3>
          <p>Leverage affiliate marketing to increase product visibility and sales. Our system connects you with high-performing affiliates who drive targeted traffic. Expand your reach without upfront advertising costs, paying only for actual conversions. Track affiliate performance and optimize partnerships for maximum ROI. With automated tracking and commission payouts, managing your campaigns becomes effortless. Watch your revenue grow as affiliates promote your products across multiple channels.</p>
        </div>
      </section>

      <section className={styles.alternatingSectionReverse}>
        <div className={styles.textWrapper}>
          <h3>Real-Time Analytics</h3>
          <p>Monitor performance and optimize strategies with real-time data insights. Gain instant access to key metrics such as clicks, conversions, and earnings. Identify top-performing affiliates and adjust commissions to maximize results. Use AI-driven insights to refine marketing strategies and boost engagement. Detect trends early and make data-driven decisions for sustained growth. Stay ahead of the competition with detailed reports and actionable analytics.</p>
        </div>
        <div className={styles.imageWrapper}>
          <motion.img src="/real.jpeg" alt="Real-Time Analytics"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2025 Affilify. All rights reserved.</p>
      </footer>
    </div>
  );
}
