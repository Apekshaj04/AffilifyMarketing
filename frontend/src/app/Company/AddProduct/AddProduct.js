'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './AddProduct.module.css';

export default function AddProduct() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    sub_category: '',
    image: '',
    link: '',
    company: '',
  });

  useEffect(() => {
    const fetchCompany = async () => {
      const walletAddress = localStorage.getItem('walletCompany');
      if (walletAddress) {
        try {
          const response = await fetch(`http://localhost:8080/api/company/getCompanyByWallet/${walletAddress}`);
          const data = await response.json();
          if (response.ok) {
            setFormData((prevData) => ({ ...prevData, company: data._id }));
          } else {
            alert(data.message || 'Company not found');
          }
        } catch (error) {
          console.error('Error fetching company:', error);
        }
      }
    };
    fetchCompany();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const walletAddress = localStorage.getItem('walletCompany');  // ✅ Define walletAddress

    if (!walletAddress) {
        alert("Wallet address not found. Please log in again.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/company/addProduct/${walletAddress}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            alert('Product added successfully!');
            router.push('/Company/PreviousProduct');
        } else {
            alert('Failed to add product.');
        }
    } catch (error) {
        console.error('Error adding product:', error);
    }
};

  const handleLogout = () => {
    localStorage.removeItem('userType');
    router.push('/');
  };

  return (
    <div className={styles.addProductPage}>
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

      {/* Form Section */}
      <section className={styles.formSection}>
        <h2>Add a New Product</h2>
        <form onSubmit={handleSubmit} className={styles.productForm}>
          <input type="text" name="name" placeholder="Product Name" value={formData.name} onChange={handleChange} required />
          <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required />
          <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleChange} required />
          <input type="text" name="sub_category" placeholder="Sub-Category" value={formData.sub_category} onChange={handleChange} required />
          <input type="text" name="image" placeholder="Image URL" value={formData.image} onChange={handleChange} required />
          <input type="text" name="link" placeholder="Product Link" value={formData.link} onChange={handleChange} required />
          <button type="submit" className={styles.submitBtn}>Add Product</button>
        </form>
      </section>
    </div>
  );
}
