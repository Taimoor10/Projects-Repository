import datetime
import hashlib as hasher
import json
import os
import MySQLdb as mysql
import requests

from flask import Flask
from flask_socketio import SocketIO
from flask import request
from pathlib import Path

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
socketio = SocketIO(app)
currentnodeurl = '192.168.128.89:8002'


@app.route("/AddtoDatabase", methods=['GET'])
def AddIntoDB():

    mydb = mysql.connect(
        host="localhost",
        user="root",
        passwd="persietheo",
        db="Hospital"
    )
    mycursor = mydb.cursor()

    try:
        for block in blockchain:
            index = block.index
            timestamp = block.timestamp
            data = block.data
            previoushash = block.previoushash
            hash = block.hash

            sql = "INSERT IGNORE INTO Hospital.Patients VALUES(%s, %s, %s, %s, %s, %s)"
            val = (index, timestamp, data, previoushash, hash, currentnodeurl)
            mycursor.execute(sql, val)
            mydb.commit()
            print(mycursor.rowcount, "record inserted")
        return "OK Computer"
    except KeyboardInterrupt:
        print("Transaction failed")


class Blockchain:
    def __init__(self, index, timestamp, data, previoushash, hash):
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previoushash = previoushash
        self.hash = hash

class Block:
    def __init__(self, index, timestamp, data, previoushash):
        self.index = index
        self.timestamp = timestamp
        self.data = data
        self.previoushash = previoushash
        self.hash = self.hashblock()

    def hashblock(self):
        sha = hasher.sha256()
        sha.update(self.attributes().encode("utf-8"))
        return sha.hexdigest()

    def attributes(self):
        return str(self.index) + str(self.timestamp) + str(self.data) + str(self.previoushash)


def creategenesisblock():

    block = Block(0, datetime.datetime.now(), {
        "proof-of-work": 9,
        "Patient Data": "None",
    },  "0")
    return block


def writetofile():
    ret = []
    try:
        blockchain_file = Path("/Users/muhammad.taimoor/PycharmProjects/Blockchain/2ndNode.json")
        if not blockchain_file.exists():
            with open('2ndNode.json', mode='w', encoding='utf-8') as f:
                json.dump([], f)
        else:
            with open('2ndNode.json', mode='w', encoding='utf-8') as feedsjson:
                for block in blockchain:
                    ret.append({
                        "index": block.index,
                        "timestamp": str(block.timestamp),
                        "data": block.data,
                        "previoushash": block.previoushash,
                        "hash": block.hash,
                        "currentnodeurl": currentnodeurl,
                        "networknodes": networknodes
                    })
                json.dump(ret, feedsjson, indent=4)
    except KeyboardInterrupt:
        print("Transaction failed")
    finally:
        feedsjson.close()


def writetopeersfile():

    try:
        peersfile = Path("/Users/muhammad.taimoor/PycharmProjects/Blockchain/peers.json")
        if not peersfile.exists():
            with open('peers.json', mode='w', encoding='utf-8') as p:
                json.dump([], p)
        else:
            with open('peers.json', mode='w', encoding='utf-8') as feedjson:
                json.dump(networknodes, feedjson, indent=4)
    except KeyboardInterrupt:
        print("Failed")
    finally:
        feedjson.close()


blockchain = []
peerlist = list()
transactions = []
networknodes = []


@app.route('/getpatientdata', methods=['GET'])
def getdata():
    ret = []

    peerip = request.environ['REMOTE_ADDR']
    if peerip not in peerlist:
        peerlist.append(peerip)
    print("Request from: ", peerip)

    currentnodeurl = request.environ['HTTP_HOST']
    print(currentnodeurl)

    def hashblock(index, timestamp, data, previoushash):
        sha = hasher.sha256()
        attributes = str(index) + str(timestamp) + str(data) + str(previoushash)
        sha.update(attributes.encode("utf-8"))
        return sha.hexdigest()

    for i in range(len(blockchain)):
        if i == 0:
            print("Genesis Block")
        else:
            currentblock = blockchain[i]
            previousblock = blockchain[i-1]
            calculatedhash = hashblock(currentblock.index, currentblock.timestamp, currentblock.data, currentblock.previoushash)
            if currentblock.hash != calculatedhash or currentblock.previoushash != previousblock.hash:
                return json.dumps("Data is Invalid")

    blockchain_file = Path("/Users/muhammad.taimoor/PycharmProjects/Blockchain/2ndNode.json")
    if not blockchain_file.exists():
        with open('2ndNode.json', mode='w', encoding='utf-8') as f:
            json.dump([], f)
    else:
        with open('2ndNode.json', mode='w', encoding='utf-8') as feedsjson:
            for block in blockchain:
                ret.append({
                    "index": block.index,
                    "timestamp": str(block.timestamp),
                    "data": block.data,
                    "previoushash": block.previoushash,
                    "hash": block.hash,
                    "currentnodeurl": currentnodeurl
                })
            json.dump(ret, feedsjson, indent=4)
        print(ret)

    senddata = []
    for block in blockchain:
        if block.index == 0:
            print("Genesis Block")
        else:
            senddata += block.data["Patient Data"]
    senddata.reverse()
    return json.dumps(senddata)


@app.route('/getblockchain', methods=['GET'])
def makeconnection():
    ret = []

    peerip = request.environ['REMOTE_ADDR']
    if peerip not in peerlist:
        peerlist.append(peerip)
    print("Get Blockchain Request from: ", peerip)

    def hashblock(index, timestamp, data, previoushash):
        sha = hasher.sha256()
        attributes = str(index) + str(timestamp) + str(data) + str(previoushash)
        sha.update(attributes.encode("utf-8"))
        return sha.hexdigest()

    for i in range(len(blockchain)):
        if i == 0:
            print("Genesis Block")
        else:
            currentblock = blockchain[i]
            previousblock = blockchain[i-1]
            calculatedhash = hashblock(currentblock.index, currentblock.timestamp, currentblock.data, currentblock.previoushash)
            if currentblock.hash != calculatedhash or currentblock.previoushash != previousblock.hash:
                return json.dumps("Chain is Invalid")

    blockchain_file = Path("/Users/muhammad.taimoor/PycharmProjects/Blockchain/2ndNode.json")
    if not blockchain_file.exists():
        with open('2ndNode.json', mode='w', encoding='utf-8') as f:
            json.dump([], f)
    else:
        with open('2ndNode.json', mode='w', encoding='utf-8') as feedsjson:
            for block in blockchain:
                ret.append({
                    "index": block.index,
                    "timestamp": str(block.timestamp),
                    "data": block.data,
                    "previoushash": block.previoushash,
                    "hash": block.hash,
                    "currentnodeurl": currentnodeurl
                })
            json.dump(ret, feedsjson, indent=4)
        print(ret)
        return json.dumps(ret)


@app.route('/hospital', methods=['POST'])
def get():
    ret = []

    def hashblock(index, timestamp, data, previoushash):
        sha = hasher.sha256()
        attributes = str(index) + str(timestamp) + str(data) + str(previoushash)
        sha.update(attributes.encode("utf-8"))
        return sha.hexdigest()

    for i in range(len(blockchain)):
        if i == 0:
            print("Genesis Block")
        else:
            currentblock = blockchain[i]
            previousblock = blockchain[i - 1]
            calculatedhash = hashblock(currentblock.index, currentblock.timestamp, currentblock.data, currentblock.previoushash)
            if currentblock.hash != calculatedhash or currentblock.previoushash != previousblock.hash:
                return json.dumps("Chain is Invalid")

    if request.method=='POST':
        transaction = request.get_json()
        print(transaction)

        if transaction['PatientId'] == '':
            return "Patient ID is missing"
        elif transaction['BloodPressure'] == '':
            return "Blood Pressure is missing"
        elif transaction['BodyTemperature'] == '':
            return "Body Temperature is missing"
        elif transaction['MachineSupport'] == '':
            return "Machine Support is missing"
        elif transaction['DateTime'] == '':
            return "Date Time is missing"

        peerip = request.environ['REMOTE_ADDR']
        if peerip not in peerlist:
            peerlist.append(peerip)
        print("Request from: ", peerip)

        transactions.append(transaction)
        print(transaction)
        print("New transaction")
        print("PatientId: {}".format(transaction['PatientId']))
        print("BloodPressure: {}".format(transaction['BloodPressure']))
        print("BodyTemperature: {}".format(transaction['BodyTemperature']))
        print("MachineSupport: {}".format(transaction['MachineSupport']))
        print("DateTime: {}".format(transaction['DateTime']))

        lastblock = blockchain[len(blockchain) - 1]
        lastproof = lastblock.data["proof-of-work"]
        lastproof = int(lastproof)
        proof = proofofwork(lastproof)

        '''if len(transactions) < 2:
            return json.dumps("Two transactions per block, 1 more transaction required")'''

        if len(transactions) == 0:
            return json.dumps("No Pending Transacations")

        data = {
            "proof-of-work": proof,
            "Patient Data": list(transactions)
        }
        lastblockindex = int(lastblock.index)
        index = lastblockindex + 1
        timestamp = datetime.datetime.now()

        transactions[:] = []

        block = Block(index, timestamp, data, lastblock.hash)

        if block.hash != block.hashblock() or block.previoushash != lastblock.hash:
            print("Chain is Invalid")
        else:
            blockchain.append(block)
            json.dumps({
                "index": index,
                "timestamp": str(timestamp),
                "data": data,
                "previoushash": lastblock.hash,
                "hash": block.hash,
                "currentnodeurl": currentnodeurl
            }) + "\n"

    writetofile()

    for block in blockchain:
        ret.append({
            "index": block.index,
            "timestamp": str(block.timestamp),
            "data": block.data,
            "previoushash": block.previoushash,
            "hash": block.hash,
            "currentnodeurl": currentnodeurl
        })
    return json.dumps(ret)


@app.route('/searchpatient', methods=['GET'])
def getpatientname():

    if request.method == 'GET':

        peerip = request.environ['REMOTE_ADDR']
        if peerip not in peerlist:
            peerlist.append(peerip)
        print("Search Patient Request from: ", peerip)

        patientID = request.args.get('PatientId')
        ret = []
        jdata = json.load(open("/Users/muhammad.taimoor/PycharmProjects/Blockchain/2ndNode.json"))
        for data in jdata:
            if data['index'] == 0:
                print("Genesis Block")
            else:
                for patientdata in data['data']['Patient Data']:
                    if patientdata['PatientId'] == patientID:
                        ret.append({
                            "BloodPressure": patientdata['BloodPressure'],
                            "BodyTemperature": patientdata['BodyTemperature'],
                            "MachineSupport": patientdata['MachineSupport'],
                            "DateTime": patientdata['DateTime']
                        })
    return json.dumps(ret)


@app.route('/getlongestchain', methods=['GET'])
def getlongestchain():
    global blockchain
    ret = []

    response = requests.get("http://192.168.128.89:8003/getblockchain").json()
    peerip = request.environ['REMOTE_ADDR']
    print("Received Response from", peerip)

    if len(blockchain) >= len(response):
        return "Blockchain is Up to Date"
    else:
        blockchain.clear()
        for b in response:
            blockchain.append(Blockchain(b['index'], b['timestamp'], b['data'], b['previoushash'], b['hash']))

    writetofile()

    for block in blockchain:
        ret.append({
            "index": block.index,
            "timestamp": str(block.timestamp),
            "data": block.data,
            "previoushash": block.previoushash,
            "hash": block.hash,
            "currentnodeurl": currentnodeurl
        })
    return json.dumps(ret)


@app.route('/registerandbroadcast', methods=['GET', 'POST'])
def registerandbroadcast():

    global networknodes

    if currentnodeurl not in networknodes:
        networknodes.append(currentnodeurl)
        try:
            writetopeersfile()
            response = requests.post("http://192.168.128.89:8003/registernode", data=json.dumps(currentnodeurl))
            response = response.content.decode('utf-8')
            print(response)
            networknodes.append(response)
            print(networknodes)
            writetopeersfile()
            return json.dumps(networknodes)
        except KeyboardInterrupt:
            raise
    else:
        try:
            writetopeersfile()
            response = requests.post("http://192.168.128.89:8003/registernode", data=json.dumps(currentnodeurl))
            response = response.content.decode('utf-8')
            print(response)
            networknodes.append(response)
            print(networknodes)
            writetopeersfile()
            return json.dumps(networknodes)
        except KeyboardInterrupt:
            raise


@app.route('/getpeerlist', methods=['GET'])
def getpeerinfo():
    print(peerlist)


def proofofwork(lastproof):
    incrementor = lastproof + 1
    while not (incrementor % 9 == 0 and incrementor % lastproof == 0):
        incrementor += 1
    return incrementor


if __name__ == '__main__':

    blockchain_file = Path("/Users/muhammad.taimoor/PycharmProjects/Blockchain/2ndNode.json")
    peersfile = Path("/Users/muhammad.taimoor/PycharmProjects/Blockchain/peers.json")

    if peersfile.exists():
        if os.stat('peers.json').st_size == 0:
            networknodes.append(currentnodeurl)
            writetopeersfile()
        else:
            with open('peers.json') as p:
                print(networknodes)
                peers = json.loads(p.read())
                networknodes = peers
                print(networknodes)

    if blockchain_file.exists():
        if os.stat('2ndNode.json').st_size == 0:
            blockchain.append(creategenesisblock())
            writetofile()
        else:
            with open('2ndNode.json') as f:
                data = json.loads(f.read())
                for b in data:
                    blockchain.append(Blockchain(b['index'], b['timestamp'], b['data'], b['previoushash'], b['hash']))
    socketio.run(app, '192.168.128.89', 8002)