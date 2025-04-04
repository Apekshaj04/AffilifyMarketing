// 
import Web3 from "web3";
const transferNativeToken = async (receiver, amount) => {
    try {
      if (!window.ethereum) throw new Error("MetaMask not detected");
  
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: "eth_requestAccounts" });
  
      const contractAddress = "0xFD5A8868130f518405b1fcc007613e0610999695"; // Replace with actual contract address
      const contractABI = [
        {
            "inputs": [
                {
                    "internalType": "address payable",
                    "name": "receiver",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "transferNative",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        }
    ]
  
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const sender = (await web3.eth.getAccounts())[0];
  
      const tx = await contract.methods.transferNative(receiver, amount).send({
        from: sender,
        value: amount,
      });
  
      console.log("Transaction Hash:", tx.transactionHash);
      return tx.transactionHash;
    } catch (error) {
      console.error("Transaction Error:", error);
      return null;
    }
  };
  