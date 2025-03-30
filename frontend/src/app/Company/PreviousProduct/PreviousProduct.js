'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './PreviousProduct.module.css';

export default function PreviousProduct() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const walletAddress = typeof window !== 'undefined' ? localStorage.getItem('walletCompany') : null;

  useEffect(() => {
    if (!walletAddress) return;

    fetch(`http://localhost:8080/api/company/getProductsByCompany/${walletAddress}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setTotalProducts(data.totalProducts || 0);
      })
      .catch((err) => console.error('Error fetching products:', err));
  }, [walletAddress]);

  const handleLogout = () => {
    localStorage.removeItem('userType');
    router.push('/');
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const chartData = products.map((product, index) => ({
    name: product.category,
    value: 1,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className={styles.previousProductPage}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <motion.div className={styles.logo} onClick={() => router.push('/Company')}>Affilify</motion.div>
        <ul className={styles.navLinks}>
          <li><Link href="/Company">Home</Link></li>
          <li><Link href="/Company/AddProduct">Add Product</Link></li>
          <li><Link href="/Company/PreviousProduct">Previous Products</Link></li>
          <li><Link href="/Company/About">About</Link></li>
        </ul>
        <button className={styles.signOutBtn} onClick={handleLogout}>Sign Out</button>
      </nav>
      
      {/* Content */}
      <section className={styles.contentSection}>
        <h1>Previous Products</h1>
        <p>Total Products: {totalProducts}</p>

        {/* Product List */}
        <div className={styles.productList}>
          {products.map((product) => (
            <div key={product._id} className={styles.productCard}>
              <img src={product.image} alt={product.name} className={styles.productImage} />
              <div className={styles.productInfo}>
                <h3>{product.name}</h3>
                <p><strong>Category:</strong> {product.category} - {product.sub_category}</p>
                <p><strong>Price:</strong> ₹{product.price}</p>
             <a 
  href={product.link.startsWith("http") ? product.link : `https://${product.link}`} 
  target="_blank" 
  rel="noopener noreferrer" 
  className={styles.productLink}
>
  View Product
</a>
              </div>
            </div>
          ))}
        </div>

        {/* Pie Chart */}
        <div className={styles.chartContainer}>
          <h2>Product Category Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
