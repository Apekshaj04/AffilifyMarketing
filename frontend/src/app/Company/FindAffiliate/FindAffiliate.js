'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './FindAffiliate.module.css';

export default function FindAffiliate() {
  const router = useRouter();
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [companyAddress, setCompanyAddress] = useState('');

  useEffect(() => {
    const ca = localStorage.getItem('walletCompany');
    if (ca) {
      setCompanyAddress(ca);
    } else {
      setError('Company wallet address not found');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!companyAddress) return;

    const fetchAffiliatesWithScores = async () => {
      try {
        // console.log(companyAddress)
        const affiliatesRes = await fetch('http://localhost:8080/api/affiliate/getAffiliatesDescending');
        if (!affiliatesRes.ok) throw new Error('Failed to fetch affiliates');
        const affiliatesData = await affiliatesRes.json();
        
        const affiliatesWithDetails = await Promise.all(
          affiliatesData.affiliates.map(async (affiliate) => {
            try {
              const matchRes = await fetch(
                `http://localhost:8080/api/affiliate/match/${companyAddress}/${affiliate.walletAddress}`
              );
              const topCategoryRes = await fetch(
                `http://localhost:8080/api/affiliate/topMost/${affiliate.walletAddress}`
              );
              
              const matchData = await matchRes.json();
              const topCategoryData = await topCategoryRes.json();

              return {
                ...affiliate,
                matchScore: matchData?.score || 0,
                topCategory: topCategoryData?.topCategory || 'Not specified'
              };
            } catch (err) {
              console.error(`Error fetching details for ${affiliate.walletAddress}:`, err);
              return {
                ...affiliate,
                matchScore: 0,
                topCategory: 'Not specified'
              };
            }
          })
        );
        
        setAffiliates(affiliatesWithDetails);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAffiliatesWithScores();
  }, [companyAddress]); // Add companyAddress as dependency

  const handleContactClick = async (affiliate) => {
    setSelectedAffiliate(affiliate);
    setProductsLoading(true);
    setShowContactModal(true);
    
    try {
      const response = await fetch(
        `http://localhost:8080/api/company/getProductsByCompany/${companyAddress}`
      );
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };
  const handleRequestProduct = async (company,affiliateAddress,productId) => {
    try {
        if (!selectedAffiliate) {
            alert("No affiliate selected");
            return;
        }

        console.log('Attempting to request product with ID:', productId);

        // More flexible ID validation
        if (!productId || typeof productId !== 'string') {
            alert("Invalid product selected");
            return;
        }

        const response = await fetch(
            `http://localhost:8080/api/request/createRequest/${companyAddress}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    affiliateWallet: affiliateAddress,
                    product: productId
                    
                }),
            }
        );

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || "Failed to send request");
        }

        alert("Request sent successfully!");
        setShowContactModal(false);
    } catch (error) {
        console.error("Request Error:", error);
        alert(`Error: ${error.message}`);
    }
};
  const handleLogout = () => {
    router.push('/');
  };
  return (
    <div className={styles.companyPortal}>
      <nav className={styles.navbar}>   
        <motion.div
          className={styles.logo}
          onClick={() => router.push('/Company')}
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

      <main className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Find Affiliates</h1>
        
        {loading ? (
          <div className={styles.loading}>Loading affiliates...</div>
        ) : error ? (
          <div className={styles.error}>Error: {error}</div>
        ) : (
          <div className={styles.affiliatesGrid}>
            {affiliates.map((affiliate, index) => (
              <motion.div 
                key={affiliate.walletAddress}
                className={styles.affiliateCard}
              >
                <div className={styles.affiliateName}>
                  {affiliate.walletAddress.substring(0, 6)}...{affiliate.walletAddress.substring(38)}
                </div>
                <div className={styles.affiliateInfo}>
                  <div><span>Top Category:</span> {affiliate.topCategory}</div>
                  <div><span>Match Score:</span> {affiliate.matchScore.toFixed(2)}</div>
                  <div><span>Affiliate Score:</span> {affiliate.score}</div>
                </div>
                <button 
                  className={styles.contactBtn}
                  onClick={() => handleContactClick(affiliate)}
                >
                  Contact
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {showContactModal && (
        <div className={styles.modalOverlay}>
          <motion.div className={styles.contactModal}>
            <div className={styles.modalHeader}>
              <h2>Request Collaboration</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowContactModal(false)}
              >
                &times;
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <p>Select products to request from {selectedAffiliate?.walletAddress.substring(0, 10)}...</p>
              
              {productsLoading ? (
                <div className={styles.loading}>Loading products...</div>
              ) : products.length === 0 ? (
                <div className={styles.noProducts}>No products available</div>
              ) : (
                <ul className={styles.productList}>
                  {products.map(product => (
                    <li key={product._id} className={styles.productItem}>
                      <span>{product.name}</span>
                      <button onClick={() => handleRequestProduct(companyAddress, selectedAffiliate?.walletAddress, product._id)} className={styles.requestButton}>
    REQUEST
</button>

                     
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
