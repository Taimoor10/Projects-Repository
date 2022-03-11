using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using Newtonsoft.Json;
using MySql.Data.MySqlClient;
using System.Net.Sockets;
using System.Net.WebSockets;
using System.Net;

namespace Testing
{

    class DatabaseConnection
    {
        public static MySqlConnection GetConnection()
        {
            string username = "127.0.0.1";
            string database = "TestDB";
            string uid = "root";
            string password = "persietheo";
            string str = "SERVER=" + username + "; Initial Catalog = "+database+"; uid = "+uid+"; pwd = "+password+";";
            MySqlConnection con = new MySqlConnection(str);
            con.Open();
            return con;
        }
    }

    public class Block
    {
        public int index { get; set; }
        public DateTime TimeStamp {get; set;}
        public String PreviousHash {get; set;}
        public String Hash {get; set;}
        //public String Data {get; set;}
        public IList<Transaction> Transactions { get; set; }
        public int Nonce { get; set; } = 0;

        public Block(DateTime timeStamp, string previousHash, IList<Transaction> transactions)
        {
            index = 0;
            TimeStamp = timeStamp;
            PreviousHash = previousHash;
            //Data = data;
            Transactions = transactions;
            Hash = CalculateHash();
        }

        public string CalculateHash()
        {
            SHA256 sha256 = SHA256.Create();
            byte[] inputBytes = Encoding.ASCII.GetBytes($"{TimeStamp}--{PreviousHash ?? ""}-{JsonConvert.SerializeObject(Transactions)}-{Nonce}");
            byte[] outputBytes = sha256.ComputeHash(inputBytes);
            string nonce = Convert.ToBase64String(outputBytes);
            return Convert.ToBase64String(outputBytes);
        }

        public void Mine(int difficulty)
        {
            var leadingzeros = new string('0', difficulty);
            while(this.Hash == null || this.Hash.Substring(0, difficulty) != leadingzeros)
            {
                this.Nonce++;
                this.Hash = this.CalculateHash();
            }
        }
    }

    //Transaction Class
    public class Transaction
    {
        public string FromAddress { get; set; }
        public string ToAddress { get; set; }
        public int Amount { get; set; }

        public Transaction(string fromAddress , string toAddress , int amount)
        {
            FromAddress = fromAddress;
            ToAddress = toAddress;
            Amount = amount;
        }
    }

    public class BlockChain
    {
        public IList<Block> Chain { set; get; }
        IList<Transaction> PendingTransactions = new List<Transaction>();

        public BlockChain()
        {
            DeleteDataFromTable();
            InitializeChain();
            AddGenesisBlock();
        }

        public void InitializeChain()
        {
            Chain = new List<Block>();
        }


        public Block CreateGenesisBlock()
        {
            return new Block(DateTime.Now, null, null);
        }

        public void AddGenesisBlock()
        {
            Chain.Add(CreateGenesisBlock());
        }

        public Block GetLatestBlock()
        {
            return Chain[Chain.Count - 1];
        }

        //Proof Of Work
        public int difficulty { set; get; } = 2;
        public int Reward { set; get; } = 3;

        public void CreateTransaction(Transaction transaction)
        {
            PendingTransactions.Add(transaction);
        }

        public void ProcessPendingTransactions(string minerAddress)
        {
            Block block = new Block(DateTime.Now, GetLatestBlock().Hash, PendingTransactions);
            AddBlockToChain(block);
            PendingTransactions = new List<Transaction>();
            CreateTransaction(new Transaction(null, minerAddress, Reward));
        }

        //Delete Data from Table
        public void DeleteDataFromTable()
        {
            MySqlConnection conn = DatabaseConnection.GetConnection();
            string query = "Delete from BlockData";
            try
            {
                MySqlCommand cmd = new MySqlCommand(query);
                cmd.Connection = conn;
                int querycheck = cmd.ExecuteNonQuery();
            }
            catch(MySqlException ex)
            {
                Console.WriteLine(ex.Message);
            }
            conn.Close();
        }

        public void AddBlockToChain(Block block)
        {
            Block latestBlock = GetLatestBlock();
            block.index = latestBlock.index + 1;
            block.PreviousHash = latestBlock.Hash;
            block.Hash = block.CalculateHash();
            block.Mine(this.difficulty);
            Chain.Add(block);

        }

        public void GenesisBlock()
        {
            for (int i = 0; i < Chain.Count-1; i++)
            {
                Block block1 = Chain[i];
                if (block1.index == 0)
                {
                    Console.WriteLine("Genesis Block: " + block1.TimeStamp + block1.Transactions + block1.PreviousHash);
                    break;
                }
            }
        }

        public int NumberOfBlocksInChain()
        {
            return Chain.Count;
        }

        public bool isValid()
        {
            for (int i = 1; i < Chain.Count; i++)
            {
                Block currentBlock = Chain[i];
                Block PreviousBlock = Chain[i - 1];

                Console.WriteLine("current Block hash: " + currentBlock.index + " :" + currentBlock.Hash);
                Console.WriteLine("current Block CalculatedHash: " + currentBlock.CalculateHash());

                if (currentBlock.Hash != currentBlock.CalculateHash())
                {
                    return false;
                }

                if (currentBlock.PreviousHash != PreviousBlock.Hash)
                {
                    return false;
                }
            }
            return true;
        }

        public static void Main()
        {
            var startTime = DateTime.Now;
            BlockChain testChain = new BlockChain();
            testChain.CreateTransaction(new Transaction("Matt", "Tam", 10));
            testChain.ProcessPendingTransactions("Bill");
   
            testChain.CreateTransaction(new Transaction("Rob", "Bob", 20));
            testChain.CreateTransaction(new Transaction("Bob", "Rob", 30));
            testChain.ProcessPendingTransactions("Bill");
            testChain.CreateTransaction(new Transaction("Liam", "Noel", 4));
            testChain.ProcessPendingTransactions("Jack");
            testChain.CreateTransaction(new Transaction("Thom", "Jonny", 7));
            testChain.ProcessPendingTransactions("Jack");

            var endTime = DateTime.Now;
            Console.ForegroundColor = ConsoleColor.DarkGreen;
            Console.WriteLine($"Duration : {endTime - startTime}");

            Console.WriteLine(testChain);
            Console.WriteLine(JsonConvert.SerializeObject(testChain, Formatting.Indented));
            Console.ResetColor();
            Console.WriteLine($"Is Chain Valid : {testChain.isValid()}");

            testChain.GenesisBlock();
            Console.WriteLine("Number of Blocks: " + testChain.NumberOfBlocksInChain());
        }
    }
}
