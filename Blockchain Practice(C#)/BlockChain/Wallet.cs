using System;
using System.Collections.Generic;
using System.Linq;
using NBitcoin;
using QBitNinja.Client;
using QBitNinja.Client.Models;

namespace BlockChain
{
    public class Wallet
    {
        public Wallet()
        {
            
        }

        //Generating the Mnemonic code
        public void MssGenerateMnemo(out string ssMnemo)
        {
            Mnemonic mnemonic = new Mnemonic(Wordlist.English, WordCount.Twelve);
            ssMnemo = mnemonic.ToString();

        }

        //Generating Private keys and giving corresponding addres
        public void MssGenerateAddress(string ssMnemo, int ssKeynumber, bool ssIsTestNet, out string ssAddress, out string ssPrivateKey)
        {
            Network net;
            if (ssIsTestNet)
                net = Network.TestNet;
            else
                net = Network.Main;
            Mnemonic restoreNnemo = new Mnemonic(ssMnemo);
            ExtKey masterKey = restoreNnemo.DeriveExtKey();
            KeyPath keypth = new KeyPath("m/44'/0'/0'/0/" + ssKeynumber);
            ExtKey key = masterKey.Derive(keypth);
            ssAddress = key.PrivateKey.PubKey.GetAddress(net).ToString();
            ssPrivateKey = key.PrivateKey.GetBitcoinSecret(net).ToString();
        }

        //Spent and unspent balance
        public void MssGetBalance(string ssAddress, bool ssIsUnspentOnly, bool ssIsTestNet, out decimal ssBalance, out decimal ssConfirmedBalance)
        {
            Network net;
            if (ssIsTestNet)
                net = Network.TestNet;
            else
                net = Network.Main;
            QBitNinjaClient client = new QBitNinjaClient(net);
            var balance = client.GetBalance(new BitcoinPubKeyAddress(ssAddress), ssIsUnspentOnly).Result;
            ssBalance = 0.0M;
            ssConfirmedBalance = 0.0M;
            if (balance.Operations.Count > 0)
            {
                var unspentCoins = new List<Coin>();
                var unspentCoinsConfirmed = new List<Coin>();
                foreach (var operation in balance.Operations)
                {
                    unspentCoins.AddRange(operation.ReceivedCoins.Select(coin => coin as Coin));
                    if (operation.Confirmations > 0)
                        unspentCoinsConfirmed.AddRange(operation.ReceivedCoins.Select(coin => coin as Coin));
                }
                ssBalance = unspentCoins.Sum(x => x.Amount.ToDecimal(MoneyUnit.BTC));
                ssConfirmedBalance = unspentCoinsConfirmed.Sum(x => x.Amount.ToDecimal(MoneyUnit.BTC));
            }
        }

        public void MssTransfer(string ssPrivateKey, decimal ssTransferValue, string ssToAddress, decimal ssMinerFee, bool ssIsTestNet, out string ssTransactionId)
        {
            Network net;
            if (ssIsTestNet)
                net = Network.TestNet;
            else
                net = Network.Main;
            var transaction = new Transaction();
            var bitcoinPrivateKey = new BitcoinSecret(ssPrivateKey);
            var fromAddress = bitcoinPrivateKey.GetAddress().ToString();
            decimal addressBalance = 0;
            decimal addressBalanceConfirmed = 0;
            MssGetBalance(fromAddress, true, ssIsTestNet, out addressBalance, out addressBalanceConfirmed);
            if (addressBalanceConfirmed <= ssTransferValue)
                throw new Exception("The address doesn't have enough funds!");
            QBitNinjaClient client = new QBitNinjaClient(net);
            var balance = client.GetBalance(new BitcoinPubKeyAddress(fromAddress), true).Result;

            //Add trx in
            //Get all transactions in for that address

            int txsIn = 0;
            if (balance.Operations.Count > 0)
            {
                var unspentCoins = new List<Coin>();
                foreach (var operation in balance.Operations)
                {
                    //string transaction = operation.TransactionId.ToString();

                    foreach (Coin receivedCoin in operation.ReceivedCoins)
                    {
                        OutPoint outpointToSpend = receivedCoin.Outpoint;
                        transaction.Inputs.Add(new TxIn() { PrevOut = outpointToSpend });
                        transaction.Inputs[txsIn].ScriptSig = bitcoinPrivateKey.ScriptPubKey;
                        txsIn = txsIn + 1;
                    }
                }
            }

            //add address to send money
            var toPubKeyAddress = new BitcoinPubKeyAddress(ssToAddress);
            TxOut toAddressTxOut = new TxOut()
            {
                Value = new Money((decimal)ssTransferValue, MoneyUnit.BTC),
                ScriptPubKey = toPubKeyAddress.ScriptPubKey
            };
            transaction.Outputs.Add(toAddressTxOut);
            //add address to send change
            decimal change = addressBalance - ssTransferValue - ssMinerFee;
            if (change > 0)
            {
                var fromPubKeyAddress = new BitcoinPubKeyAddress(fromAddress);
                TxOut changeAddressTxOut = new TxOut()
                {
                    Value = new Money((decimal)change, MoneyUnit.BTC),
                    ScriptPubKey = fromPubKeyAddress.ScriptPubKey
                };
                transaction.Outputs.Add(changeAddressTxOut);
            }

            // sign transaction
            transaction.Sign(bitcoinPrivateKey, false);
            //Send transaction
            BroadcastResponse broadcastResponse = client.Broadcast(transaction).Result;
            if (!broadcastResponse.Success)
                throw new Exception("Error broadcasting transaction " + broadcastResponse.Error.ErrorCode + " : " + broadcastResponse.Error.Reason);
            ssTransactionId = transaction.GetHash().ToString();
        }

        public static void main()
        {
            Wallet obj = new Wallet();
        }

    }
}
