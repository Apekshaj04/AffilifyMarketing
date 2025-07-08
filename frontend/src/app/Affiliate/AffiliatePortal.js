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
  const [requestNotification, setRequestNotification] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [productId,setProductId] = useState('')

  useEffect(() => {
    const wa = localStorage.getItem('walletAffiliate');
    if (!wa) {
      router.push('/login');
      return;
    }
    setWalletAddress(wa);
    
    const fetchData = () => {
      fetchNotifications(wa);
      fetchRequestNotifications(wa);
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [router]);

  const fetchNotifications = async (affiliateAddress) => {
    try {
      const response = await fetch(`http://localhost:8080/api/notification/affiliate/${affiliateAddress}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data);
      if (data.length > 0 && !popupNotification) {
        setPopupNotification(data[0]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  const fetchRequestNotifications = async (affiliateAddress) => {
    try {
        const response = await fetch(`http://localhost:8080/api/request/getRequest/${affiliateAddress}`);
        if (!response.ok) throw new Error('Failed to fetch requests');

        const data = await response.json();
        if (data.length > 0 && !requestNotification) {
            console.log("🔹 Request Data:", data[0]);

            // Fetch company details
            const companyResponse = await fetch(`http://localhost:8080/api/company/getCompanyByWallet/${data[0].companyAddress}`);
            if (!companyResponse.ok) throw new Error('Failed to fetch company details');
            const companyDetails = await companyResponse.json();  // Extract JSON

            // Fetch product details
            const productResponse = await fetch(`http://localhost:8080/api/product/${data[0].product}`);
            if (!productResponse.ok) throw new Error('Failed to fetch product details');
            const productDetails = await productResponse.json();  // Extract JSON

            // Update data object
            data[0].companyAddress = companyDetails.name;  // Assuming 'name' exists in the response
            data[0].product = productDetails.name;         // Assuming 'name' exists in the response

            console.log("🔹 Updated Request Data:", data[0]);

            setRequestNotification(data[0]);
        }
    } catch (error) {
        console.error('❌ Error fetching requests:', error);
    }
};

  const deleteNotification = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/request/${id}`, {
        method: 'DELETE'
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
      setPopupNotification(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteRequest = async (id) => {
    try {
      await fetch(`http://localhost:8080/api/request/${id}`, {
        method: 'DELETE'
      });
      setRequestNotification(null);
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const handleAcceptRequest = async () => {
    if (!requestNotification) return;

    try {
        // Fetch the request details
        const notify = await fetch(
            `http://localhost:8080/api/request/getRequest/${walletAddress}`
        );

        if (!notify.ok) {
            console.error("❌ Fetch failed:", notify.status, notify.statusText);
            return;
        }

        const dataN = await notify.json();
        console.log("✅ Full API Response:", dataN);

        // Ensure data is an array and has at least one item
        if (!Array.isArray(dataN) || dataN.length === 0) {
            console.warn("⚠️ No product data found in response!");
            return;
        }

        const productID = dataN[0]?.product; // Access the first object in the array
        if (!productID) {
            console.warn("⚠️ No valid product ID found!");
            return;
        }

        setProductId(productID); // Update state asynchronously
        console.log("📦 Product ID:", productID);

        // Wait for `productID` to be retrieved before making the second request
        const response = await fetch(
            `http://localhost:8080/api/affiliate/affiliateProduct/${productID}`, 
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ walletAddress })
            }
        );

        const data = await response.json();
        if (response.ok) {
            alert(`🎉 Product affiliated successfully! Your link: ${data.affiliateLink}`);
            deleteRequest(requestNotification._id);
        } else {
            alert(`🚨 Error: ${data.message}`);
        }
    } catch (error) {
        console.error('❌ Error accepting request:', error);
        alert('Failed to accept request');
    }
};

  const handleRejectRequest = () => {
    if (requestNotification) {
      deleteRequest(requestNotification._id);
    }
  };

  const handlePopupClose = () => {
    if (popupNotification) {
      deleteNotification(popupNotification._id);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('walletAffiliate');
    localStorage.removeItem('userType');
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

      {/* Notification Popups */}
      {popupNotification && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <h3>{popupNotification.company}</h3>
            <p>{popupNotification.message}</p>
            <button className={styles.popupBtn} onClick={handlePopupClose}>OK</button>
          </div>
        </div>
      )}

      {requestNotification && (
        <div className={styles.popup}>
          <div className={styles.popupContent}>
            <h3>New Collaboration Request</h3>
            <p>{requestNotification.companyAddress} wants you to promote: {requestNotification.product}</p>
            <div className={styles.requestButtons}>
              <button className={styles.ctaButton} onClick={handleAcceptRequest}>
                Accept
              </button>
              &nbsp;
              &nbsp;
              <button className={styles.ctaButton} onClick={handleRejectRequest}>
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
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

      {/* Feature Sections */}
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
          <p>Our blockchain-based system ensures transparency and security for all your transactions.</p>
        </div>
      </section>

      <section className={styles.alternatingSectionReverse}>
        <div className={styles.textWrapper}>
          <h3>Instant Payments</h3>
          <p>Receive your earnings immediately with our automated payment system.</p>
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

      {/* Success Stories */}
      <section className={styles.successStories}>
        <h2>Success Stories</h2>
        <div className={styles.storiesContainer}>
          <div className={styles.story}>
            <img src="/random.jpeg" alt="Success Story" />
            <p>I earned $10,000 in my first month!</p>
          </div>
          <div className={styles.story}>
            <img src="/random.jpeg" alt="Success Story" />
            <p> The best affiliate program Ive joined!</p>
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