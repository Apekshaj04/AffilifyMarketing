'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './AffiliateDetail.module.css';

export default function AffiliateDetail() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    Email: '',
    Phone: '',
    Address: '',
  });
  const [notifications, setNotifications] = useState([]);
  const [popupNotification, setPopupNotification] = useState(null);

  const wallet = typeof window !== 'undefined' ? localStorage.getItem('walletAffiliate') : null;

 
  useEffect(() => {
    if (!wallet) {
      router.push('/');
      return;
    }

    const fetchAffiliateData = () => {
      fetch(`http://localhost:8080/api/affiliate/${wallet}`)
        .then(res => res.json())
        .then(data => {
          setUserData(data);
          setFormData({
            fullName: data?.fullName || '',
            Email: data?.Email || '',
            Phone: data?.Phone || '',
            Address: data?.Address || '',
          });
        })
        .catch(err => console.error('Error fetching affiliate details:', err))
        .finally(() => setLoading(false));
    };

    fetchNotifications(wallet);
    fetchAffiliateData(); // Initial fetch

    const interval = setInterval(fetchAffiliateData, 5000); // Fetch every 5 seconds

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [wallet]);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8080/api/affiliate/${wallet}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedData = await response.json();
      setUserData(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating details:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('walletAffiliate');
    router.push('/');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.affiliateDetails}>
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
      <div className={styles.pageContainer}>
        <motion.div
          className={styles.detailsCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.cardHeader}>
            <h1>Your Account Details</h1>
            {!isEditing ? (
              <button className={styles.editButton} onClick={() => setIsEditing(true)}>Edit Details</button>
            ) : (
              <button className={styles.cancelButton} onClick={() => {
                setFormData({
                  fullName: userData?.fullName || '',
                  Email: userData?.Email || '',
                  Phone: userData?.Phone || '',
                  Address: userData?.Address || '',
                });
                setIsEditing(false);
              }}>Cancel</button>
            )}
          </div>

          {!isEditing ? (
            <div className={styles.profileInfo}>
              <div className={styles.profileSection}>
                <div className={styles.avatarSection}>
                  <div className={styles.avatar}>{userData?.fullName?.charAt(0) || '?'}</div>
                  <div className={styles.userLevel}>
                    <span className={styles.levelBadge}>{userData?.affiliateLevel || 'N/A'}</span>
                  </div>
                </div>
                <div className={styles.basicInfo}>
                  <h2>{userData?.fullName || 'Unknown User'}</h2>
                  <p className={styles.joinDate}>Member since: {userData?.joinDate || 'N/A'}</p>
                  <p className={styles.earnings}>Total Earnings: {userData?.totalEarnings || 'N/A'}</p>
                </div>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <h3>Contact Information</h3>
                  <p><strong>Email:</strong> {userData?.Email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {userData?.Phone || 'N/A'}</p>
                  <p><strong>Address:</strong> {userData?.Address || 'N/A'}</p>
                </div>
                <div className={styles.infoItem}>
                  <h3>Wallet Address</h3>
                  <p>{wallet || 'N/A'}</p>
                </div>
              </div>
            </div>
          ) : (
            <form className={styles.editForm} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="fullName">Full Name</label>
                  <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="Email">Email Address</label>
                  <input type="email" id="Email" name="Email" value={formData.Email} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="Phone">Phone Number</label>
                  <input type="tel" id="Phone" name="Phone" value={formData.Phone} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="Address">Address</label>
                  <input type="text" id="Address" name="Address" value={formData.Address} onChange={handleChange} />
                </div>
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.saveButton}>Save Changes</button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
