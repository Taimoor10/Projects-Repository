import datetime
import hashlib as hasher
import json
import os
import pickle
import requests
from flask import Flask, render_template
from flask_socketio import SocketIO
from flask_socketio import send, emit
from flask import request, jsonify
from pathlib import Path


app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret'
socketio = SocketIO(app)


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
    return Block(0, datetime.datetime.now(), {
        "proof-of-work": 9,
        "transactions": "None",
    },  "0")


mineraddress = "q3nf394hjg-random-miner-address-34nf3i4nflkn3oi"
blockchain = []
peernodes = []
peerlist = list()
mining = True
transactions = []
EmptypeerList = list()


@app.route('/getblockchain', methods=['GET'])
def makeconnection():
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
            previousblock = blockchain[i-1]
            print(currentblock.hash)
            calculatedhash = hashblock(currentblock.index, currentblock.timestamp, currentblock.data, currentblock.previoushash)
            print(calculatedhash)
            if currentblock.hash != calculatedhash or currentblock.previoushash != previousblock.hash:
                return json.dumps("Chain is Invalid")

    for block in blockchain:
        ret.append({
            "index": str(block.index),
            "timestamp": str(block.timestamp),
            "data": str(block.data),
            "previoushash": block.previoushash,
            "hash": block.hash
        })

    return json.dumps(ret)


@socketio.on('txevent', namespace='/clients')
def gettransacationdata(message):
        print(blockchain)
        peerip = request.environ['REMOTE_ADDR']
        if peerip not in peerlist:
            peerlist.append(peerip)

        transactions.append(message)
        print("New transaction")
        print("Transaction Data:", message)

        socketio.emit('gettx', "Transaction submission successful", namespace='/clients')


@socketio.on('savechain', namespace='/clients')
def saveblockchain():
    ret = []

    blockchain_file = Path("/Users/muhammad.taimoor/PycharmProjects/Blockchain/blockchain.json")
    if not blockchain_file.exists():
        with open('blockchain.json', mode='w', encoding='utf-8') as f:
            json.dump([], f)
    else:
        with open('blockchain.json', mode='w', encoding='utf-8') as feedsjson:
            for block in blockchain:
                print(block.data)
                print(type(block.data))
                ret.append({
                    "index": block.index,
                    "timestamp": str(block.timestamp),
                    "data": block.data,
                    "previoushash": block.previoushash,
                    "hash": block.hash
                })
            json.dump(ret, feedsjson, indent=4)
        print(ret)

    socketio.emit('getreply', "Blockchain Saved", namespace='/clients')


@app.route('/getlivepeers', methods=['GET'])
def getlivepeers():
    retpeers = []
    for peers in peerlist:
        HOST_UP = True if os.system("ping -c 1 " + peers) is 0 else False
        retpeers.append(peers)
        print("Peer ID: ", HOST_UP)
        return json.dumps(retpeers)


@app.route('/blocks', methods=['GET'])
def getblocks():
    ret = []
    for block in consensus():
        ret.append({
            "index": str(block.index),
            "timestamp": str(block.timestamp),
            "data": str(block.data),
            "previoushash": block.previoushash,
            "hash": block.hash
        })
    return json.dumps(ret)


def consensus():
    global blockchain
    longestchain = blockchain
    for chain in findotherchains():
        if len(longestchain) < len(chain):
            longestchain = chain
    return updateblockchain(longestchain)


def updateblockchain(src):
    if len(src) <= len(blockchain):
        return blockchain
    ret = []
    for b in src:
        ret.append(Block(b['index'], b['timestamp'], b['data'], b['previoushash'], b['hash']))
    return ret


def findotherchains():
    ret = []
    for peer in peernodes:
        response = requests.get('http://%s/blocks' % peer)
        if response.status_code == 200:
            print("Blocks from Peer: " + response.content)
            ret.append(json.loads(response.content))
    return ret


@app.route('/mine', methods=['GET'])
def mine():
    lastblock = blockchain[len(blockchain)-1]
    print(lastblock.data)
    lastproof = lastblock.data["proof-of-work"]
    lastproof = int(lastproof)
    proof = proofofwork(lastproof)
    if len(transactions) != 0:
        transactions.append(
            {"from": "network", "to": mineraddress, "amount": 1}
        )
    else:
        return json.dumps("No Pending Transacations")

    data = {
        "proof-of-work": proof,
        "transactions": list(transactions)
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
        return json.dumps({
            "index": index,
            "timestamp": str(timestamp),
            "data": data,
            "previoushash": lastblock.hash,
            "hash": block.hash
        }) + "\n"


def proofofwork(lastproof):
    incrementor = lastproof + 1
    while not (incrementor % 9 == 0 and incrementor % lastproof == 0):
        incrementor += 1
    return incrementor


@socketio.on('myevent', namespace='/test')
def handlemessage(message):
    print('Received Message:' + str(message))
    emit('my event', message, broadcast=True)


@socketio.on('myevent', namespace='/test2')
def handleevent2(json):
    print("Received Json:" + str(json))
    emit('json event', json, broadcast=True)


if __name__ == '__main__':

    blockchain_file = Path("/Users/muhammad.taimoor/PycharmProjects/Blockchain/blockchain.json")
    if blockchain_file.exists():
        if os.stat('blockchain.json').st_size == 0:
            blockchain.append(creategenesisblock())
        else:
            with open('blockchain.json') as f:
                data = json.loads(f.read())
                for b in data:
                    print(b['data'])
                    blockchain.append(Blockchain(b['index'], b['timestamp'], b['data'], b['previoushash'], b['hash']))
                    print(type(blockchain))
        socketio.run(app, '0.0.0.0', 8000)
        #'{"favorited": false, "contributors": null}'