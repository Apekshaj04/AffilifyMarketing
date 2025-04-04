'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import styles from './Analytics.module.css';

Chart.register(...registerables);

export default function Analytics() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [walletAffiliate, setWalletAffiliate] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [popupNotification, setPopupNotification] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    const fetchWalletAffiliate = () => {
      if (typeof window !== 'undefined') {
        const storedWallet = localStorage.getItem('walletAffiliate');
        console.log("Retrieved walletAffiliate from localStorage:", storedWallet);
        
        if (storedWallet) {
          setWalletAffiliate(storedWallet);
          fetchNotifications(storedWallet);
          fetchTransactions(storedWallet);
        }
      }
    };

    fetchWalletAffiliate(); // Initial fetch

    const interval = setInterval(fetchWalletAffiliate, 5000); // Repeat every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  const fetchTransactions = async (affiliateAddress) => {
    if (!affiliateAddress) return;
    
    try {
      const response = await fetch(`http://localhost:8080/api/transact/affiliate/${affiliateAddress}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      
      const data = await response.json();
      console.log("Fetched transactions:", data);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

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

  // Fetch products from API
  const fetchProducts = useCallback(async (walletAddress) => {
    if (!walletAddress) {
      console.warn("fetchProducts called with empty walletAddress");
      return;
    }

    console.log("Fetching products for wallet:", walletAddress);

    try {
      const response = await fetch(`http://localhost:8080/api/affiliate/getRecentlyAffiliated?walletAddress=${walletAddress}`);
      
      console.log("API Response Status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products. Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched products:", data);

      // Ensure response structure matches expectations
      if (data && Array.isArray(data.recentlyAffiliated)) {
        setProducts(data.recentlyAffiliated);
      } else {
        console.warn("API returned unexpected format:", data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]); // Reset on error
    }
  }, []);

  // Trigger fetch when walletAffiliate is set
  useEffect(() => {
    if (walletAffiliate) {
      console.log("Triggering fetchProducts with walletAffiliate:", walletAffiliate);
      fetchProducts(walletAffiliate);
    }
  }, [walletAffiliate, fetchProducts]);

  // Process products into category counts
  const categories = {};
  products.forEach((product) => {
    if (product?.category) {
      categories[product.category] = (categories[product.category] || 0) + 1;
    }
  });

  console.log("Processed categories for charts:", categories);

  // Bar Chart Data
  const barChartData = {
    labels: Object.keys(categories),
    datasets: [
      {
        label: 'Products by Category',
        data: Object.values(categories),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  // Pie Chart Data
  const pieChartData = {
    labels: Object.keys(categories),
    datasets: [
      {
        data: Object.values(categories),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
      },
    ],
  };

  // Logout function
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userType');
      localStorage.removeItem('walletAffiliate')
    }
    router.push('/');
  };

  // Format wallet address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <div className={styles.analyticsPage}>
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
      
      <div className={styles.content}>
        <h1 className={styles.dashboardTitle}>Analytics Dashboard</h1>
        
        <div className={styles.chartContainer}>
          {products.length > 0 ? (
            <>
              <div className={styles.chart}><Bar data={barChartData} /></div>
              <div className={styles.chart}><Pie data={pieChartData} /></div>
            </>
          ) : (
            <p>No chart data available.</p>
          )}
        </div>
        
        {/* Transaction History Section */}
        <div className={styles.transactionSection}>
          <h2 className={styles.sectionTitle}>Transaction History</h2>
          {transactions.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.transactionTable}>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Price (ETH)</th>
                    <th>Company</th>
                    <th>Affiliate</th>
                    <th>CID</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction, index) => (
                    <tr key={index}>
                      <td>{transaction.productName}</td>
                      <td>{transaction.price}</td>
                      <td title={transaction.companyAddress}>{formatAddress(transaction.companyAddress)}</td>
                      <td title={transaction.affiliateAddress}>{formatAddress(transaction.affiliateAddress)}</td>
                      <td title={transaction.cid}>{transaction.cid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No transaction history available.</p>
          )}
        </div>
      </div>
    </div>
  );
}