using System;
using MySql.Data.MySqlClient;

namespace Testing
{
    public class DBConnection
    {
        public MySqlConnection connection;
        public string server;
        public string database;
        public string uid;
        public string password;
        public string connectionString;

        public DBConnection()
        {
            Initialize();
        }

        //Initialize Connection
        public void Initialize()
        {
            server = "127.0.0.1";
            database = "TestDB";
            uid = "root";
            password = "persietheo";
            connectionString = "SERVER=" + server + ";" + "DATABASE=" + database + ";" + "UID=" + uid + ";" + "PASSWORD=" + password + ";";

            connection = new MySqlConnection(connectionString);
        }

        //Open Connection to Database
        public bool OpenConnection()
        {
            try
            {
                connection.Open();
                return true;
            }

            catch (MySqlException ex)
            {
                switch (ex.Number)
                {
                    case 0:
                        Console.WriteLine("Cannot connect to server.  Contact administrator");
                        break;

                    case 1045:
                        Console.WriteLine("Invalid username/password, please try again");
                        break;
                }
                return false;
            }
        }

        //Close connection
        public bool CloseConnection()
        {
            try
            {
                connection.Close();
                return true;
            }
            catch(MySqlException ex)
            {
                Console.WriteLine(ex.Message);
                return false;
            }
        }

        //Insert statement
        public void Insert()
        {

        }

        //Update statement
        public void Update()
        {

        }

        //Delete statement
        public void Delete()
        {

        }

    }
}
