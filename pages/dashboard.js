import { useContext } from 'react';
import { UserContext } from '@/lib/UserContext';
import { magic } from '@/lib/magic';
import { useRouter } from 'next/router';
import { createWeb3 } from '@/lib/web3';


export default function Dashboard() {
  const [user, setUser] = useContext(UserContext);
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
      const accounts = await web3.eth.getAccounts()
      const toAddress = '0xE700b2C6184583c7E8863970Dd128d680F751A09';
      const tokenAddress = '0xB56a8d3d776181cc5aa752a46270959650B9FE74'

      // Send an ether transaction
      const txnParams = {
        from: accounts[0],
        to: toAddress,
        value: web3.utils.toWei(0.01, "ether"),
        gas: 21000
      };


      await web3.eth
        .sendTransaction(txnParams)
        .on("transactionHash", (hash) => {
          console.log("Transaction hash:", hash);
        })
        .then((receipt) => {
          console.log("Transaction receipt:", receipt);
        })
        .catch((error) => {
          console.error(error);
        });

      try {
        const contract = new web3.eth.Contract(abi, `${tokenAddress}`);
        const magicAccountBalance = await contract.methods.balanceOf(accounts[0]).call();
        console.log(magicAccountBalance)

        // let data = contract.methods.transfer(toAddress, 100).encodeABI();
        // let txObj = {
        //   gas: 2700,
        //   gasPrice: 2700,
        //   "to": accounts[0],
        //   "value": "0x00",
        //   "data": data,
        // }

        //   web3.eth.accounts.signTransaction(txObj, privateKey, (err, signedTx) => {
        //     if (err) {
        //       console.log(err)
        //     } else {
        //       console.log(signedTx);

        //       return web3.eth.sendSignedTransaction(signedTx.rawTransaction, (err, res) => {
        //         if (err) {
        //           console.log(err)
        //         } else {
        //           console.log(res);
        //         }
        //       });

        //     }
        //   });
      } catch (e) {
        console.log(e)
      }

    }
  }

  return (
    <>
      {user?.issuer && (
        <>
          <h1>Dashboard</h1>
          <h2>Email</h2>
          <p>{user.email}</p>
          <h2>Wallet Address</h2>
          <p>{user.publicAddress}</p>
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