'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import styles from './Auth.module.css';

export default function Auth() {
  const [userType, setUserType] = useState('affiliate');
  const [isLogin, setIsLogin] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  // Function to connect MetaMask wallet
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);

      } catch (error) {
        setErrorMessage('Error connecting wallet. Please try again.');
      }
    } else {
      alert('MetaMask is not installed. Please install it to continue.');
    }
  };

  // Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission (Login/Register)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!walletAddress) {
      setErrorMessage('Please connect your MetaMask wallet first.');
      return;
    }

    try {
      setLoading(true);
      const endpoint = isLogin ? '/login' : '/register';
      const url = `http://localhost:8080/api/${userType}${endpoint}`;
      const response = await axios.post(url, { walletAddress, ...formData });

      alert(response.data.message);

      if (isLogin) {
        // Store user type & wallet in localStorage after successful login
        localStorage.setItem('userType', userType);
        if(userType==='affiliate'){
          localStorage.setItem('walletAffiliate',walletAddress);
        }
        else{
          localStorage.setItem('walletCompany',walletAddress);
        }
        localStorage.setItem('wallet', walletAddress);
        router.push(userType === 'affiliate' ? '/Affiliate' : '/Company');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.overlay}></div>
      <div className={styles.formBox}>
        <h1 className={styles.header}>Affilify</h1>
        <h3>{isLogin ? 'Login as' : 'Register as'} {userType === 'affiliate' ? 'Affiliate' : 'Company'}</h3>

        {/* User Type Toggle */}
        <div className={styles.toggleButtons}>
          <button 
            className={userType === 'affiliate' ? styles.activeButton : ''} 
            onClick={() => setUserType('affiliate')}
          >
            Affiliate
          </button>
          <button 
            className={userType === 'company' ? styles.activeButton : ''} 
            onClick={() => setUserType('company')}
          >
            Company
          </button>
        </div>

        {/* Wallet Connect */}
        <button className={styles.walletButton} onClick={connectWallet} disabled={!!walletAddress}>
          {walletAddress ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect MetaMask'}
        </button>

        {/* Error Message */}
        {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && userType === 'company' && (
            <>
              <input 
                className={styles.inputField} 
                type='text' 
                name='name' 
                placeholder='Company Name' 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
              <input 
                className={styles.inputField} 
                type='email' 
                name='email' 
                placeholder='Company Email' 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </>
          )}
          <button className={styles.submitButton} type='submit' disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        {/* Toggle Login/Register */}
        <p className={styles.toggleText}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <span onClick={() => setIsLogin(!isLogin)} className={styles.toggleLink}>
            {isLogin ? ' Register' : ' Login'}
          </span>
        </p>
      </div>
    </div>
  );
}
