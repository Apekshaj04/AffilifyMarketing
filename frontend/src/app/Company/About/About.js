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
  const [newCategories, setNewCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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

  const handleAddCategory = () => {
    if (currentCategory && !newCategories.includes(currentCategory)) {
      setNewCategories([...newCategories, currentCategory]);
      setCurrentCategory('');
    }
  };

  const handleRemoveCategory = (index) => {
    const updatedCategories = [...newCategories];
    updatedCategories.splice(index, 1);
    setNewCategories(updatedCategories);
  };

  const handleSubmitCategories = async () => {
    if (!wallet || newCategories.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:8080/api/company/${wallet}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: newCategories
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update categories');
      }

      const updatedData = await response.json();
      setUserData(updatedData.company);
      setNewCategories([]);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating categories:', error);
    } finally {
      setIsSubmitting(false);
    }
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
              <div className={styles.infoItem}>
                <h3>Current Categories</h3>
                {userData?.category?.length > 0 ? (
                  <ul className={styles.categoryList}>
                    {userData.category.map((cat, index) => (
                      <li key={index}>{cat}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No categories added yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Category Management Section */}
          <div className={styles.categoryManagement}>
            <h3>Add New Product Categories</h3>
            <div className={styles.categoryInputGroup}>
              <input
                type="text"
                value={currentCategory}
                onChange={(e) => setCurrentCategory(e.target.value)}
                placeholder="Enter a category"
                className={styles.categoryInput}
              />
              <button 
                onClick={handleAddCategory}
                className={styles.addButton}
                disabled={!currentCategory}
              >
                Add
              </button>
            </div>
            
            {newCategories.length > 0 && (
              <>
                <div className={styles.newCategories}>
                  <h4>New Categories to Add:</h4>
                  <ul className={styles.categoryTags}>
                    {newCategories.map((cat, index) => (
                      <li key={index}>
                        {cat}
                        <button 
                          onClick={() => handleRemoveCategory(index)}
                          className={styles.removeTag}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={handleSubmitCategories}
                  className={styles.submitButton}
                  disabled={isSubmitting || newCategories.length === 0}
                >
                  {isSubmitting ? 'Submitting...' : 'Save Categories'}
                </button>
              </>
            )}

            {submitSuccess && (
              <div className={styles.successMessage}>
                Categories updated successfully!
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}