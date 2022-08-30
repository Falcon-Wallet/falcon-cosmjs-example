import {useEffect, useState} from 'react'
import Head from 'next/head'
import {assertIsDeliverTxSuccess, SigningStargateClient} from "@cosmjs/stargate";
import Select from "react-select";

const CHAINS = [
   {
      label: "Cosmoshub",
      value: {
         chainId: 'cosmoshub-4',
         rpcUrl: 'https://rpc-cosmoshub.whispernode.com',
         gasLimit: '80000',
         gasPrice: '0.01',
         baseDenom: 'uatom'
      }
   },
   {
      label: 'Osmosis',
      value: {
         chainId: 'osmosis-1',
         rpcUrl: 'https://rpc-osmosis.blockapsis.com',
         gasLimit: '200000',
         gasPrice: '5000',
         baseDenom: 'uosmo'

      }
   },
   {
      label: 'Injective',
      value: {
         chainId: 'injective-1',
         rpcUrl: 'https://injective-rpc.quickapi.com:443',
         gasLimit: '800000',
         gasPrice: '25000000',
         baseDenom: 'inj'

      }
   },
   {
      label: 'Evmos',
      value: {
         chainId: 'evmos_9001-2',
         rpcUrl: 'https://rpc-evmos.whispernode.com',
         gasLimit: '140000',
         gasPrice: '25000000000',
         baseDenom: 'aevmos'

      }
   }
]

export default function Home() {
   const [selectedChain, setSelectedChain] = useState(CHAINS[0])
   const [connected, setConnected] = useState(false);
   const [address, setAddress] = useState('');
   const [toAddress, setToAddress] = useState('')
   const [amount, setAmount] = useState('');

   const {rpcUrl, baseDenom, gasPrice, gasLimit, chainId} = selectedChain.value

   const connect = async () => {
      if (!window.falcon) {
         alert('Please install the Falcon Wallet extension');
      }

      try {
         setAddress('');
         await window.falcon.connect();
         setConnected(true);

         // Get address
         const account = await window.falcon.getAccount(chainId);
         setAddress(account.address);
      } catch (e) {
         // User declined connection
         console.log(e);
      }
   }

   useEffect(connect, [chainId])

   const send = async (e) => {
      e.preventDefault();
      if (!toAddress || !amount) {
         return;
      }

      // Getting offline signer
      const offlineSigner = await window.falcon.getOfflineSigner(chainId);
      console.log('offlineSigner', offlineSigner)
      const [account] = await offlineSigner.getAccounts();
      console.log('account', account)
      console.log('rpcUrl', rpcUrl)

      // Create client using signer
      const client = await SigningStargateClient.connectWithSigner(
         rpcUrl,
         offlineSigner
      )

      const parsedAmount = parseFloat(amount) * Math.pow(10, 6);
      const coin = {
         denom: baseDenom,
         amount: parsedAmount.toString(),
      }
      const fee = {
         amount: [{
            denom: baseDenom,
            amount: gasPrice,
         },],
         gas: gasLimit,
      }

      const result = await client.sendTokens(account.address, toAddress, [coin], fee, "Send tokens");
      assertIsDeliverTxSuccess(result);
   }

   const onChangeChain = (newValue) => setSelectedScoreIndex(availableScores.indexOf(newValue))


   return (
      <div className="container">
         <Head>
            <title>Falcon CosmJs Example</title>
         </Head>

         <main>
            <h1 className="header">Falcon CosmJS Example</h1>
            {connected ? (
               <div>
                  <Select options={CHAINS}
                          value={selectedChain}
                          defaultValue={CHAINS[0]}
                          onChange={setSelectedChain}></Select>
                  <p>Address: <b>{address}</b></p>
                  <h2 className="header">Send</h2>
                  <form onSubmit={send}>
                     <div className="form-group">
                        <label htmlFor="recipient">Address: </label>
                        <input id="recipient" type="text" onChange={(e) => setToAddress(e.target.value)}
                               value={toAddress}/>
                     </div>
                     <div className="form-group">
                        <label htmlFor="amount">Amount ({baseDenom}): </label>
                        <input id="amount" type="text" onChange={(e) => setAmount(e.target.value)} value={amount}/>
                     </div>
                     <button type="submit">Submit</button>
                  </form>
               </div>
            ) : (
               <div className="header">
                  <button onClick={connect}>Connect</button>
               </div>
            )}
         </main>
         <style jsx>{`
           .container {
             padding: 2em;
             max-width: 600px;
             width: 100vw;
             margin: 0 auto;
             border: #4c4c4c22 solid 2px;
             border-radius: 12px;
           }

           .form-group {
             display: flex;
             flex-direction: row;
             justify-content: space-between;
             margin-bottom: 1em;
             width: 100%;
           }

           .header {
             text-align: center;
             margin-top: 0.5em;
             margin-bottom: 1em;
           }
         `}</style>

         <style jsx global>{`
           html,
           body {
             padding: 0;
             margin: 0;
             font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
             Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
             sans-serif;
           }

           input {
             width: 400px;
           }

           * {
             box-sizing: border-box;
           }

           html, body {
             height: 100%;
           }
           
           #__next {
             display: flex;
             justify-content: center;
             align-items: center;
             height: 100%;
             width: 100%;

           }
         `}</style>
      </div>
   )
}
