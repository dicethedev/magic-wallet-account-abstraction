import { useContext, useState, useEffect } from 'react';
import { UserContext } from '@/lib/UserContext';
import Skeleton from 'react-loading-skeleton';
import { magic } from '@/lib/magic';
import { useRouter } from 'next/router';
import { createWeb3 } from '@/lib/web3';


export default function Dashboard() {
  const [user, setUser] = useContext(UserContext);
  const [balance, setBalance] = useState(null);
  const [transactionHash, setTransactionHash] = useState("");
  // Create our router
  const router = useRouter();

  const logout = () => {
    // Call Magic's logout method, reset the user state, and route to the login page
    magic.user.logout().then(() => {
      setUser({ user: null });
      router.push('/login');
    });
  };


  const onSend = async () => {
    const web3 = await createWeb3(magic)

    const abi = [
      {
        constant: true,
        inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function',
      },
      {
        constant: false,
        inputs: [{ 'name': '_to', 'type': 'address' }, { 'name': '_value', 'type': 'uint256' }],
        name: 'transfer',
        outputs: [{ 'name': '', 'type': 'bool' }], 'type': 'function'
      }
    ];

    if (web3) {
      try {
        const accounts = await web3.eth.getAccounts();
        const toAddress = '0xE1Cd14a61Dd0a4053A15031D6f2E5c12029b7AdF';
        const tokenAddress = '0xb58dA0b9D67C2b34e9a4D5C9a16B48172fDC24DF';

        const contract = new web3.eth.Contract(abi, tokenAddress);
    
       // Set the gas price and gas limit
      const gasPrice = await web3.eth.getGasPrice();
      const transferAmount = '20'; // Amount of tokens to transfer

      const transferAmountWei = web3.utils.toWei(transferAmount, 'ether');

      // Estimate the gas limit for the transaction
      const gasLimit = await contract.methods.transfer(toAddress, transferAmountWei).estimateGas({ from: accounts[0] });

      // Build the transaction object
      const txnParams = {
        from: accounts[0],
        to: tokenAddress,
        data: contract.methods.transfer(toAddress, transferAmountWei).encodeABI(),
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
}

  const getBalance = async () => {
    const web3 = await createWeb3(magic);

    if (web3) {
      const accounts = await web3.eth.getAccounts();
      const tokenAddress = '0xb58dA0b9D67C2b34e9a4D5C9a16B48172fDC24DF';
      const contractABI = [
        {
          constant: true,
          inputs: [{ name: '_owner', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: 'balance', type: 'uint256' }],
          type: 'function',
        }
      ];

      try {
        const contract = new web3.eth.Contract(contractABI, tokenAddress);
        const balanceResult = await contract.methods.balanceOf(accounts[0]).call();

          // Convert the balance from Wei to Ether (assuming token has 18 decimal places)
          let tokenBalance = web3.utils.fromWei(balanceResult, 'ether');
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
              <p>{transactionHash}</p>
              <h2><a href={`https://mumbai.polygonscan.com/tx/${transactionHash}`} target="_blank" rel="noopener noreferrer">View Transaction</a>
              </h2>
            </>
          )}
          </div>
          <button onClick={logout}>Logout</button>
          <center>
            <button onClick={onSend} style={{
              display: 'block'
            }}>Send Erc20 Token</button>
          </center>
        </>
      )}
    </>
  );
}