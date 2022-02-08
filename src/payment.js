import React, { useState, useEffect, useRef } from "react";
import { ethers, utils } from "ethers";
import abi from "./Fund.json";
import "./payment.css";

export default function PaymentPage() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isFundOwner, setIsFundOwner] = useState(false);
  const [inputValue, setInputValue] = useState({
    withdraw: "",
    deposit: "",
    fundName: "",
  });
  const [fundOwnerAddress, setFundOwnerAddress] = useState(null);
  const [customerTotalBalance, setCustomerTotalBalance] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const [currentFundName, setCurrentFundName] = useState(null);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [error, setError] = useState(null);
  const contractAddress = "0x87484b3b0821CcEE85834a4e7a78d7C9962658D7";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        setIsWalletConnected(true);
        setCustomerAddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Please install a MetaMask wallet to use our fund.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getFundName = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const fundContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let fundName = await fundContract.fundName();
        fundName = utils.parseBytes32String(fundName);
        setCurrentFundName(fundName.toString());
        // setCurrentFundName(fundName);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our fund.");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getFundBalance = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let balance = await contract.getFundBalance({});
        balance = utils.formatEther(balance);
        console.log("Total balance is ", balance);
        setTotalBalance(balance);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our bank.");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const setFundNameHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const txn = await contract.setFundName(
          utils.formatBytes32String(inputValue.fundName)
        );
        console.log("Setting Fund Name...");
        await txn.wait();
        console.log("Fund Name Changed", txn.hash);
        await getFundName();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our fund.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getFundOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let owner = await contract.Owner();
        setFundOwnerAddress(owner);

        const [account] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsFundOwner(true);
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our fund.");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const customerBalanceHanlder = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let balance = await contract.getCustomerBalance();
        setCustomerTotalBalance(utils.formatEther(balance));
        console.log("Retrieved balance...", balance);
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our fund.");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const deposityMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const txn = await contract.depositMoney({
          value: ethers.utils.parseEther(inputValue.deposit),
        });
        console.log("Deposting money...");
        await txn.wait();
        console.log("Deposited money...done", txn.hash);

        customerBalanceHanlder();
        getFundBalance();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our fund.");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const withDrawMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let myAddress = await signer.getAddress();
        console.log("provider signer...", myAddress);

        const txn = await contract.withDrawMoney(
          ethers.utils.parseEther(inputValue.withdraw)
        );
        console.log("Withdrawing money...");
        await txn.wait();
        console.log("Money with drew...done", txn.hash);

        getFundBalance();
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our fund.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (event) => {
    setInputValue((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getFundName();
    getFundOwnerHandler();
    customerBalanceHanlder();
    getFundBalance();
  }, [isWalletConnected]);

  return (
    <main className="main-container mx-auto">
      <h2 className="headline mt-5">
        <span className="headline-gradient">Fund Contract Project</span> 💰
      </h2>
      <section className="customer-section px-10 pt-1 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-2 text-center">
          {currentFundName === "" && isFundOwner ? (
            <p>"Setup the name of your fund." </p>
          ) : (
            <p className=" font-bold">{currentFundName}</p>
          )}
        </div>
        <div className="mt-2 mb-3">
          <form className="form-style d-flex flex-column">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="deposit"
              placeholder="0.0000 ETH"
              value={inputValue.deposit}
            />
            <button className="btn-purple" onClick={deposityMoneyHandler}>
              Deposit Money In ETH
            </button>
          </form>
        </div>
        <div className="mt-5 ps-5">
          <p>
            <span className="font-bold">Customer Balance: </span>
            {customerTotalBalance}
          </p>
        </div>
        <div className="mt-2 ps-5">
          <p>
            <span className="font-bold">Fund Owner Address: </span>
            {fundOwnerAddress}
          </p>
        </div>
        <div className="mt-2 ps-5">
          {isWalletConnected && (
            <p>
              <span className="font-bold">Your Wallet Address: </span>
              {customerAddress}
            </p>
          )}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
      {isFundOwner && (
        <section className="fund-owner-section">
          <div className="mx-auto col-10">
            <h2 className="text-xl border-b-2 border-indigo-500 px-5 py-4 font-bold text-center">
              Fund Admin Panel
            </h2>
            <div className="text-center mb-3 text-info">
              <span className="me-3">Total balance:</span>
              <span>{totalBalance} ether</span>
            </div>
            <div className="p-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style col-6"
                  onChange={handleInputChange}
                  name="fundName"
                  placeholder="Enter a Name for Your Fund"
                  value={inputValue.fundName}
                />
                <button className="btn-grey col-4" onClick={setFundNameHandler}>
                  Set Fund Name
                </button>
              </form>
            </div>
            <div className="mt-3 p-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style col-6"
                  onChange={handleInputChange}
                  name="withdraw"
                  placeholder="0.0000 ETH"
                  value={inputValue.withdraw}
                />
                <button
                  className="btn-grey col-4"
                  onClick={withDrawMoneyHandler}
                >
                  Withdraw Money
                </button>
              </form>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
