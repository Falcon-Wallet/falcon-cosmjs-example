import { useState } from 'react'
import Head from 'next/head'
import { assertIsBroadcastTxSuccess, SigningStargateClient } from "@cosmjs/stargate";

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('');

  const chainId = 'osmosis-1';
  const rpcUrl = 'https://rpc-osmosis.blockapsis.com';

  const connect = async () => {
    if (!window.falcon) {
      alert('Please install the Falcon Wallet extension');
    }
    try {
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

  const send = async (e) => {
    e.preventDefault();
    if (!toAddress || !amount) {
      return;
    }

    // Getting offline signer
    const offlineSigner = await window.falcon.getOfflineSigner(chainId);
    const [account] = await offlineSigner.getAccounts();

    // Create client using signer
    const client = await SigningStargateClient.connectWithSigner(
      rpcUrl,
      offlineSigner
    )

    const parsedAmount = parseFloat(amount) * Math.pow(10, 6);
    const coin = {
      denom: 'uosmo',
      amount: parsedAmount.toString(),
    }
    const fee = {
      amount: [{
        denom: 'uosmo',
        amount: '5000',
      },],
      gas: '200000',
    }
    const result = await client.sendTokens(account.address, toAddress, [coin], fee, "Send tokens");
    assertIsBroadcastTxSuccess(result);
  }

  return (
    <div className="container">
      <Head>
        <title>Falcon CosmJs Example</title>
      </Head>

      <main>
        <h1 className="header">Falcon CosmJS Example</h1>
        {connected ? (
          <div>
            <p>Chain ID: {chainId}</p>
            <p>Address: {address}</p>
            <h2 className="header">Send</h2>
            <form onSubmit={send}>
              <div className="form-group">
                <label htmlFor="recipient">Recipient: </label>
                <input id="recipient" type="text" onChange={(e) => setToAddress(e.target.value)} value={toAddress} />
              </div>
              <div className="form-group">
                <label htmlFor="amount">Amount (OSMO): </label>
                <input id="amount" type="text" onChange={(e) => setAmount(e.target.value)} value={amount} />
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
          padding: 1em;
          max-width: 600px;
          width: 100vw;
          margin: 0 auto;
        }

        .form-group {
          margin-bottom: 1em;
        }
        
        .header {
          text-align: center;
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

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  )
}
