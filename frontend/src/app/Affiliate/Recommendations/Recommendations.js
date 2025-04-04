'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './Recommendations.module.css';

export default function Recommendations() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [popupNotification, setPopupNotification] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [activeProduct, setActiveProduct] = useState(null);
  useEffect(() => {
    const fetchWalletData = () => {
      const storedWalletAddress = localStorage.getItem('walletAffiliate') || '0x1234...abcd';
      setWalletAddress(storedWalletAddress);

      if (storedWalletAddress) {
        fetchRecentlyAffiliated(storedWalletAddress);
        fetchNotifications(storedWalletAddress);
      }
    };

    fetchWalletData(); // Initial fetch


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
  const handleError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };
  const fetchRecentlyAffiliated = async (wallet) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8080/api/affiliate/getRecentlyAffiliated?walletAddress=${wallet}`);
      const data = await response.json();
  
      console.log("🔹 Recently Affiliated API Response:", data);
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch recently affiliated products.');
      }
  
      const validProducts = data.recentlyAffiliated?.filter(product => product && product._id) || [];
  
      console.log("✅ Valid Recent Products:", validProducts);
      setRecentProducts(validProducts);
  
      // Call fetchRecommendations only after recentProducts is set
      fetchRecommendations(validProducts);
    } catch (err) {
      console.error("❌ Fetch Error:", err.message);
      handleError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRecommendations = async (recentProductsList) => {
    try {
      setLoading(true);
      
      const validProducts = recentProductsList.filter(p => p.category && p.sub_category);
  
      let response;
      if (validProducts.length > 0) {
        response = await fetch('http://localhost:8000/recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            main_category: validProducts[0].category,
            sub_category: validProducts[0].sub_category,
            actual_price: validProducts[0].price || 0
          }),
        });
      } else {
        response = await fetch('http://localhost:8080/api/product/recommendAllProducts');
      }
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error("Failed to fetch recommendations.");
      }
  
      const recommendationsArray = Array.isArray(data) 
        ? data 
        : (data.recommendations || data.products || [data]).filter(Boolean);
  
      // 🔥 **Ensure proper filtering of recently affiliated products**
      const newRecommendations = recommendationsArray.filter(recommendedProduct => 
        !recentProductsList.some(recentProduct => recentProduct._id === recommendedProduct._id)
      );
  
      console.log("🎯 Filtered Recommendations (excluding recently affiliated):", newRecommendations);
      
      setRecommendedProducts(newRecommendations);
    } catch (err) {
      console.error("❌ Recommendation Fetch Error:", err.message);
      handleError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  

  const generateAffiliateCode = async (product) => {
    if (!walletAddress) return handleError("Wallet not connected. Please log in.");
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/affiliate/affiliateProduct/${product._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: walletAddress
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to generate affiliate link');
      }

      setActiveProduct({
        ...product, 
        affiliateLink: data.affiliateLink
      });
      
    } catch (err) {
      handleError(err.message);
      console.error("Affiliate link error:", err);
    }
    setLoading(false);
  };

  const trackAffiliateClick = async (product) => {
    if (!walletAddress) return handleError("Wallet not connected. Please log in.");
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/affiliate/trackClick', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          walletAddress: walletAddress
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to track click');
      }

      const updateProducts = (products) => products.map(p => 
        p._id === product._id 
          ? {...p, clickCount: (p.clickCount || 0) + 1} 
          : p
      );

      setRecommendedProducts(prevProducts => updateProducts(prevProducts));
      
    } catch (err) {
      handleError("Failed to track URL click.");
      console.error("Click tracking error:", err);
    }
    setLoading(false);
  };

  const processAffiliatePurchase = async (product) => {
    if (!walletAddress) return handleError("Wallet not connected. Please log in.");
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/affiliate/process-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product._id,
          walletAddress: walletAddress
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process purchase');
      }

      alert("Purchase processed successfully!");
    } catch (err) {
      handleError("Failed to process purchase.");
      console.error("Purchase processing error:", err);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('walletAffiliate');
    router.push('/');
  };

  return (
    <div className={styles.recommendationsPage}>
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

      {/* Main Content */}
      
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
        <div className={styles.headerSection}>
          <motion.h1
            className={styles.pageTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Recommended Products
          </motion.h1>
          <p className={styles.pageDescription}>
            High-converting products tailored to your audience. Generate affiliate links and start earning commissions today.
          </p>
        </div>

        {loading && <p className={styles.loadingText}>Fetching products...</p>}

        {/* Recently Affiliated Products */}
        <h2 className={styles.sectionTitle}>Your Recently Affiliated Products</h2>
        <br />
        <div className={styles.productGrid}>
          {recentProducts.length === 0 ? (
            <p className={styles.noProducts}>No affiliated products found.</p>
          ) : (
            recentProducts.map((product, index) => (
              product ? (
                <motion.div key={`recent-${index}`} className={styles.productCard}>
                  <div className={styles.productImageContainer}>
                    <img 
                      src={product?.image || "/placeholder-image.jpg"} 
                      alt={product?.name || "No image available"} 
                      className={styles.productImage} 
                    />
                    <div className={styles.categoryLabel}>{product?.sub_category || "Category"}</div>
                  </div>
                  
                  <div className={styles.productContent}>
                    <h3 className={styles.productName}>{product?.name || "Unknown Product"}</h3>
                    <p className={styles.productDescription}>{product?.description || "No description available"}</p>
                    
                    <div className={styles.productStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Price</span>
                        <span className={styles.statValue}>₹{product?.price?.toLocaleString() || "N/A"}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Commission</span>
                        <span className={styles.statValue}>{product?.commission || "N/A"}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Clicks</span>
                        <span className={styles.statValue}>{product?.clickCount || 0}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Conv. Rate</span>
                        <span className={styles.statValue}>{product?.conversionRate || "N/A"}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Affiliated Link </span>
                        <span className={styles.statValue}>{product.affiliateLink}</span>
                      </div>
                    
                    </div>
                  </div>
                </motion.div>
              ) : null
            ))
          )}
        </div>

        {/* Recommended Products */}
        <h2 className={styles.sectionTitle}>Recommended for You</h2>
        <div className={styles.productGrid}>
          {recommendedProducts.length === 0 ? (
            <p className={styles.noProducts}>No recommendations available.</p>
          ) : (
            recommendedProducts.map((product, index) => (
              product ? (
                <motion.div key={`recommend-${index}`} className={styles.productCard}>
                  <div className={styles.productImageContainer}>
                    <img 
                      src={product?.image || "/placeholder-image.jpg"} 
                      alt={product?.name || "No image available"} 
                      className={styles.productImage} 
                    />
                    <div className={styles.categoryLabel}>{product?.sub_category || "Category"}</div>
                  </div>
                  
                  <div className={styles.productContent}>
                    <h3 className={styles.productName}>{product?.name || "Unknown Product"}</h3>
                    <p className={styles.productDescription}>{product?.description || "No description available"}</p>
                    
                    <div className={styles.productStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Price</span>
                        <span className={styles.statValue}>₹{product?.price?.toLocaleString() || "N/A"}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Commission</span>
                        <span className={styles.statValue}>{product?.commission || "N/A"}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Clicks</span>
                        <span className={styles.statValue}>{product?.clickCount || 0}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Conv. Rate</span>
                        <span className={styles.statValue}>{product?.conversionRate || "N/A"}</span>
                      </div>
                    </div>
                    
                    <div className={styles.actionButtons}>
                      <button 
                        className={styles.primaryButton}
                        onClick={() => generateAffiliateCode(product)}
                        disabled={loading}
                      >
                        Generate Link
                      </button>
                     
                    </div>
                    
                    {activeProduct && activeProduct._id === product._id && activeProduct.affiliateLink && (
                      <div className={styles.affiliateLinkContainer}>
                        <p className={styles.affiliateLinkLabel}>Your Affiliate Link:</p>
                        <div className={styles.affiliateLinkWrapper}>
                          <input 
                            type="text" 
                            value={activeProduct.affiliateLink} 
                            className={styles.affiliateLinkInput} 
                            readOnly 
                          />
                          <button 
                            className={styles.copyButton}
                            onClick={() => {
                              navigator.clipboard.writeText(activeProduct.affiliateLink);
                              alert("Affiliate link copied to clipboard!");
                            }}
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : null
            ))
          )}
        </div>
      </div>

      {/* Error Toast */}
      {error && (
        <div className={styles.errorToast}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}