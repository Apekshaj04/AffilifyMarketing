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

      if (!walletRes.ok) throw new Error("Wallet address not found.");
      const walletData = await walletRes.json();
      const wallet = walletData.walletAddress?.trim().toLowerCase();
      setWalletAddress(wallet);

      if (wallet === account) {
        throw new Error("You cannot click your own affiliate link.");
      }

      console.log("Tracking click...");
      const countRes = await fetch("http://localhost:8080/api/affiliate/trackClick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: wallet,
          affiliateLink: inputValue,
          senderWalletAddress: account,
        }),
      });

      if (!countRes.ok) {
        const errorData = await countRes.json();
        throw new Error(errorData.message || "Error tracking click.");
      }

      const countData = await countRes.json();
      setProductCount(countData.affiliateClicks);
      setCompany(countData.company || "Unknown Company");
      setSuccessMessage(countData.successMessage);

      console.log("Uploading data to Lighthouse...");
      const apiKey = "b08bf0e8.fc223d7999874dae973c3e43028d9a21"; 

      const affiliateData = JSON.stringify({
        affiliateLink: inputValue,
        affiliateWallet: wallet,
        senderWallet: account,
        productClicks: countData.affiliateClicks,
        productId: countData.productId, 
        company: countData.company,
      });

      const blob = new Blob([affiliateData], { type: "application/json" });
      const file = new File([blob], "affiliate_data.json");

      const response = await lighthouse.upload([file], apiKey);
      console.log("Lighthouse Upload Response:", response);

      if (response.data.Hash) {
        setCID(response.data.Hash);
        setSuccessMessage(`Data stored on IPFS: ${response.data.Hash}`);

        await sendTFIL(account, wallet, response.data.Hash);
      }
    } catch (err) {
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

      if (!web3) throw new Error("Web3 not initialized. Ensure MetaMask is connected.");

      const contract = new web3.eth.Contract(TFIL_ABI, TFIL_CONTRACT_ADDRESS);
      const amountToSend = web3.utils.toWei("0.05", "ether");

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
    } catch (err) {
      console.error("Transaction Failed:", err);
    }
  };

  const sendNotification = async (toAddress, ipfsCID) => {
    try {
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
        throw new Error("Failed to send notification.");
      }

      console.log("Notification sent successfully.");
    } catch (error) {
      console.error("Error sending notification:", error);
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
   
    </div>
  );
};

export default User;
