"use client";
import React, { useState, useEffect } from "react";
import Web3 from "web3";
import lighthouse from "@lighthouse-web3/sdk";
import styles from "./User.module.css"; 

const TFIL_CONTRACT_ADDRESS = "0xFD5A8868130f518405b1fcc007613e0610999695";
const TFIL_ABI = [
  {
    inputs: [
      { internalType: "address payable", name: "receiver", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferNative",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

const User = () => {
  const [inputValue, setInputValue] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [productCount, setProductCount] = useState(null);
  const [company, setCompany] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cid, setCID] = useState("");
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [links, setLinks] = useState('');
  const [productName, setProductName] = useState('');
  const [productData, setProductData] = useState(null);
  const [walletData, setWalletData] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      connectWallet();
    } else {
      alert("MetaMask not detected! Please install MetaMask.");
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) throw new Error("MetaMask is not installed.");
      const web3Instance = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      setAccount(accounts[0]);
      setWeb3(web3Instance);
    } catch (err) {
      setError(`MetaMask Connection Error: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage("");
    setCID("");
    setLoading(true);

    try {
      if (!account) throw new Error("Wallet not connected. Please connect to MetaMask.");

      console.log("Fetching wallet address for affiliate link...");
      const walletRes = await fetch(
        `http://localhost:8080/api/affiliate/getWalletByLink?affiliateLink=${inputValue}`
      );

      if (!walletRes.ok) throw new Error("Wallet address not found for this affiliate link.");
      console.log("WALLET LINK RECIEVED")
      const walletDataResponse = await walletRes.json();
      if (!walletDataResponse.walletAddress) {
        throw new Error("Invalid wallet data received from server");
      }
      
      const wallet = walletDataResponse.walletAddress.trim().toLowerCase();
      setWalletData(walletDataResponse);
      setWalletAddress(wallet);
      setLinks(walletDataResponse.link);

      if (wallet === account.toLowerCase()) {
        throw new Error("You cannot click your own affiliate link.");
      }

      // Get product info to get the productId
      console.log("Fetching product information...");
      console.log(inputValue)
      const productRes = await fetch(`http://localhost:8080/api/affiliate/product-by-link?link=${inputValue}`);
        console.log("productRes recieved")
      if (!productRes.ok) {
        throw new Error("Product not found for this affiliate link.");
      }
      
      const productDataResponse = await productRes.json();
      console.log("Product data:", productDataResponse);
      
      if (!productDataResponse.product || !productDataResponse.product._id) {
        throw new Error("Invalid product data received from server");
      }
      
      setProductData(productDataResponse);
      const productId = productDataResponse.product._id;
      console.log("Product ID:", productId);
      
      setProductName(productDataResponse.product.name || "Unknown Product");

      console.log("Tracking click...");
      const countRes = await fetch(`http://localhost:8080/api/affiliate/incrementCount`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateAddress: wallet, 
          productId: productId
        }),
      });

      if (!countRes.ok) {
        const errorData = await countRes.json();
        throw new Error(errorData.message || "Error tracking click.");
      }

      const countData = await countRes.json();
      setProductCount(countData.affiliateClicks);
      setCompany(countData.company || "Unknown Company");
      setSuccessMessage(countData.successMessage || "Click tracked successfully");

      console.log("Uploading data to Lighthouse...");
      const apiKey = "b08bf0e8.fc223d7999874dae973c3e43028d9a21"; 

      const affiliateData = JSON.stringify({
        affiliateLink: inputValue,
        affiliateWallet: wallet,
        senderWallet: account,
        productClicks: countData.affiliateClicks,
        productId: productId, 
        company: countData.company,
        timestamp: new Date().toISOString()
      });

      const blob = new Blob([affiliateData], { type: "application/json" });
      const file = new File([blob], "affiliate_data.json");
      console.log(blob)
      const response = await lighthouse.upload([file], apiKey);
      console.log("Lighthouse Upload Response:", response);

      if (response.data && response.data.Hash) {
        setCID(response.data.Hash);
        setSuccessMessage(`Data stored on IPFS: ${response.data.Hash}`);

        await sendTFIL(account, wallet, response.data.Hash);
      } else {
        throw new Error("Failed to upload data to IPFS");
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError(err.message);
      setProductCount(null);
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  const sendTFIL = async (fromAddress, toAddress, ipfsCID) => {
    try {
      console.log("Initiating Token Transfer...");
      console.log("From:", fromAddress);
      console.log("To:", toAddress);
  
      if (!web3) throw new Error("Web3 not initialized. Ensure MetaMask is connected.");
  
      const contract = new web3.eth.Contract(TFIL_ABI, TFIL_CONTRACT_ADDRESS);
      const amountToSend = web3.utils.toWei("0.05", "ether");
      const amountInEther = web3.utils.fromWei(amountToSend, "ether");
  
      console.log("Sending amount:", amountInEther, "ETH");
      
      const tx = await contract.methods.transferNative(toAddress, amountToSend).send({
        from: fromAddress,
        value: amountToSend,
      });
  
      console.log("Transaction Sent! Hash:", tx.transactionHash);
      setSuccessMessage(`Transaction Successful! Hash: ${tx.transactionHash}`);
  
      if (ipfsCID) {
        console.log("Sending Notification...");
        await sendNotification(toAddress, ipfsCID);
      }
      
      const companyId = productData.product.Company;
      console.log("Company ID:", companyId);
  
      console.log("Fetching company wallet address...");
      const companyWallet = await fetch(`http://localhost:8080/api/company/wallet/${companyId}`);
      console.log("Companywallet",companyWallet);
      if (!companyWallet.ok) {
        throw new Error(`Failed to fetch company wallet: ${companyWallet.status}`);
      }
      
      const companyData = await companyWallet.json();
      
      if (!companyData || !companyData.walletAddress) {
        throw new Error("Invalid company wallet data received");
      }
      
      console.log("Company Wallet Address:", companyData.walletAddress);
      
      // Explicitly convert and check the price
      const priceValue = parseFloat(amountInEther);
      console.log("Price for transaction record:", priceValue);
      
      if (isNaN(priceValue)) {
        console.warn("Price is NaN, using default 0.05");
      }
      console.log("Company walletAdress",companyData.walletAddress)
      console.log(productName)
      console.log(toAddress)
      console.log(cid)
      console.log("Recording transaction...");
      const response = await fetch("http://localhost:8080/api/transact/createTransaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          affiliateAddress: toAddress,
          companyAddress:company.walletAddress,
          productName: productName,
          price: isNaN(priceValue) ? 0.05 : priceValue, 
          cid: cid
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Transaction recording failed: ${errorData.message || response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Transaction recording response:", data);
      setSuccessMessage(`Transaction completed and recorded. Hash: ${tx.transactionHash}`);
  
    } catch (err) {
      console.error("Transaction Failed:", err);
      setError(`Transaction Failed: ${err.message}`);
    }
  };
  
  const sendNotification = async (toAddress, ipfsCID) => {
    try {
      console.log("Sending notification to:", toAddress);
      const notificationRes = await fetch("http://localhost:8080/api/notification/addNotification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateAddress: toAddress,
          company: "REMINDER", 
          message: `You have received a commission payment of 0.05 TFIL. IPFS Data: ${ipfsCID}`,
          cid: ipfsCID,
        }),
      });

      if (!notificationRes.ok) {
        const errorData = await notificationRes.json();
        throw new Error(`Notification failed: ${errorData.message || notificationRes.statusText}`);
      }

      console.log("Notification sent successfully.");
    } catch (error) {
      console.error("Error sending notification:", error);
      // We don't want to fail the whole process if notification fails
      // Just log the error
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Affiliate Click Tracker</h2>

      {!account ? (
        <button onClick={connectWallet} className={styles.button}>
          Connect MetaMask
        </button>
      ) : (
        <p>Connected Wallet: <strong>{account}</strong></p>
      )}

      <form onSubmit={handleSubmit}>
        <label>Enter Affiliate Link:</label>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={styles.input}
          placeholder="Enter affiliate link"
          required
        />

        <button type="submit" className={styles.button} disabled={loading || !account}>
          {loading ? "Processing..." : "Submit"}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}
      {successMessage && <p className={styles.success}>{successMessage}</p>}
      
      {cid && (
        <div className={styles.resultSection}>
          <h3>Transaction Details</h3>
          <p>IPFS CID: <a href={`https://gateway.lighthouse.storage/ipfs/${cid}`} target="_blank" rel="noopener noreferrer">{cid}</a></p>
          {productCount && <p>Total Clicks: {productCount}</p>}
          {walletAddress && <p>Affiliate Wallet: {walletAddress}</p>}
          {productName && <p>Product: {productName}</p>}
        </div>
      )}
    </div>
  );
};

export default User;