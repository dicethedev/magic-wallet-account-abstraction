import { useContext, useState, useEffect } from "react";
import { UserContext } from "@/lib/UserContext";
import Skeleton from "react-loading-skeleton";
import { magic } from "@/lib/magic";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { createWeb3 } from "@/lib/web3";
import contractABI from "../lib/abi";

export default function Dashboard() {
  const [user, setUser] = useContext(UserContext);
  const [balance, setBalance] = useState(null);
  const [transactionHash, setTransactionHash] = useState("");
  const [amountToMint, setAmountToMint] = useState("");
  const [loadingMint, setLoadingMint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recipientAddress, setRecipientAddress] = useState(""); // State for recipient address
  const [amountToSend, setAmountToSend] = useState("");
  // Create our router
  const router = useRouter();

  const logout = () => {
    // Call Magic's logout method, reset the user state, and route to the login page
    magic.user.logout().then(() => {
      setUser({ user: null });
      router.push("/login");
    });
  };

  const onSend = async () => {
    const web3 = await createWeb3(magic);

    if (web3) {
      try {
        const accounts = await web3.eth.getAccounts();
        const toAddress = "0xE1Cd14a61Dd0a4053A15031D6f2E5c12029b7AdF";
        const tokenAddress = "0xb58dA0b9D67C2b34e9a4D5C9a16B48172fDC24DF";

        const contract = new web3.eth.Contract(contractABI, tokenAddress);

        // Set the gas price and gas limit
        const gasPrice = await web3.eth.getGasPrice();
        const transferAmount = "20"; // Amount of tokens to transfer

        const transferAmountWei = web3.utils.toWei(transferAmount, "ether");

        // Estimate the gas limit for the transaction
        const gasLimit = await contract.methods
          .transfer(toAddress, transferAmountWei)
          .estimateGas({ from: accounts[0] });

        // Build the transaction object
        const txnParams = {
          from: accounts[0],
          to: tokenAddress,
          data: contract.methods
            .transfer(toAddress, transferAmountWei)
            .encodeABI(),
          gasPrice: gasPrice,
          gas: gasLimit,
        };

        await web3.eth
          .sendTransaction(txnParams)
          .on("transactionHash", (hash) => {
            console.log("Transaction hash:", hash);
            setTransactionHash(hash);
          })
          .then((receipt) => {
            console.log("Transaction receipt:", receipt);
          })
          .catch((error) => {
            console.error(error);
          });
      } catch (error) {
        console.log(error);
      }
    }
  };

  const getBalance = async () => {
    const web3 = await createWeb3(magic);

    if (web3) {
      const accounts = await web3.eth.getAccounts();
      const tokenAddress = "0x53Fd48ba422a9fF4f02cCC5B82CC144862861998";
      try {
        const contract = new web3.eth.Contract(contractABI, tokenAddress);
        const balanceResult = await contract.methods
          .balanceOf(accounts[0])
          .call();

        console.log(accounts[0], "this is account");

        let tokenBalance = web3.utils.fromWei(balanceResult, "ether");

        tokenBalance = Math.round(parseFloat(tokenBalance));
        setBalance(tokenBalance.toString());
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    getBalance();
  }, []);

  const mint = async (recipientAddress) => {
    setLoadingMint(true);
    setError("");

    try {
      const provider = new ethers.BrowserProvider(magic.rpcProvider);
      const signer = await provider.getSigner();
      const contractAddress = "0x53Fd48ba422a9fF4f02cCC5B82CC144862861998";

      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // Convert amount to Wei (assuming token has 18 decimals)
      const amountInWei = ethers.parseEther(amountToMint.toString());

      // Populate the transaction
      const transaction = await contract.mint.populateTransaction(
        amountInWei,
        recipientAddress
      );

      const result = await magic.wallet.sendGaslessTransaction(
        recipientAddress,
        transaction
      );

      console.log("Transaction hash:", result);
      setTransactionHash(result);

      // Wait for the transaction to be mined
      const receipt = await provider.waitForTransaction(result);
      console.log("Transaction receipt:", receipt);

      getBalance(); // Optionally refresh balance after minting
    } catch (error) {
      console.error("An error occurred during minting:", error);
      setError("An error occurred during minting: " + error.message);
    } finally {
      setLoadingMint(false);
    }
  };

  //gasless Transaction return this result
  // {"request_id":"45debd2a-318a-40b7-8faa-451033aff14a","state":"PENDING","success":true}

  const sendSepolia = async () => {
    const web3 = await createWeb3(magic);

    if (web3) {
      try {
        setLoading(true); // Start loading state

        const accounts = await web3.eth.getAccounts();
        const fromAddress = accounts[0];

        // Convert the amount to send from Ether to Wei
        const amountInWei = web3.utils.toWei(amountToSend, "ether");

        // Create the transaction object
        const txnParams = {
          from: fromAddress,
          to: recipientAddress,
          value: amountInWei,
          gas: 21000, // Gas limit for a basic transfer
        };

        // Send the transaction
        await web3.eth
          .sendTransaction(txnParams)
          .on("transactionHash", (hash) => {
            console.log("Transaction hash:", hash);
            setTransactionHash(hash);
          })
          .on("receipt", (receipt) => {
            console.log("Transaction receipt:", receipt);
            setLoading(false); // End loading state
          })
          .on("error", (error) => {
            console.error("Transaction error:", error);
            setLoading(false); // End loading state
          });
      } catch (error) {
        console.error("Error sending Sepolia:", error);
        setLoading(false); // End loading state
      }
    }
  };

  return (
    <>
      {user?.issuer && (
        <>
          <h1>Dashboard</h1>
          <h2>Email</h2>
          <p>{user.email}</p>
          <h2>Wallet Address</h2>
          <p>{user.publicAddress}</p>
          <h2>Balance</h2>
          {balance !== null ? (
            <p>{balance}</p>
          ) : (
            <Skeleton width={100} height={20} />
          )}

          <div>
            {transactionHash && (
              <>
                <h2>Transaction Hash</h2>
                <p>
                  {typeof transactionHash === "string"
                    ? transactionHash
                    : JSON.stringify(transactionHash)}
                </p>
                <h2>
                  <a
                    href={`https://mumbai.polygonscan.com/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Transaction
                  </a>
                </h2>
                {/* <h2>
                  <a
                    href={`https://sepolia.etherscan.io//tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Transaction
                  </a>
                </h2> */}
              </>
            )}
          </div>
          <button onClick={logout}>Logout</button>
          <center>
            <button
              onClick={onSend}
              style={{
                display: "block",
              }}
            >
              Send Erc20 Token
            </button>
          </center>
          <center>
            <input
              type="number"
              placeholder="Amount to Mint"
              value={amountToMint}
              onChange={(e) => setAmountToMint(e.target.value)}
              style={{ marginBottom: "10px" }}
            />
            <button
              onClick={() => mint(user.publicAddress)}
              style={{ display: "block" }}
              disabled={loadingMint} // Disable button while loading
            >
              {loadingMint ? "Minting..." : "Mint Tokens"}
            </button>
            {error && (
              <p style={{ color: "red" }}>
                {typeof error === "string" ? error : JSON.stringify(error)}
              </p>
            )}
          </center>

          <div>
            <h2>Send Sepolia ETH</h2>
            <input
              type="text"
              placeholder="Recipient Address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              style={{ width: "300px", marginBottom: "10px" }}
            />
            <br />
            <input
              type="text"
              placeholder="Amount to Send"
              value={amountToSend}
              onChange={(e) => setAmountToSend(e.target.value)}
              style={{ width: "300px", marginBottom: "10px" }}
            />
            <br />
            <button onClick={sendSepolia} disabled={loading}>
              {loading ? "Sending..." : "Send Sepolia ETH"}
            </button>
          </div>
        </>
      )}
    </>
  );
}
