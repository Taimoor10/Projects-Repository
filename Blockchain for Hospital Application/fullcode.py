import datetime
import hashlib as hasher
import json
import requests
import sys

from flask import Flask
from flask import request

node = Flask(__name__)

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
        "transactions": None,
    },  "0")

mineraddress = "q3nf394hjg-random-miner-address-34nf3i4nflkn3oi"

blockchain = []
peernodes = []
mining = True

transactions = []


@node.route('/txion', methods=['POST'])
def transaction():
    if request.method =='POST':
        transaction = request.get_json()
        transactions.append(transaction)
        print("New transaction")
        print("FROM: {}".format(transaction['from']))
        print("TO: {}".format(transaction['to']))
        print("AMOUNT: {}\n".format(transaction['amount']))

        return "Transaction submission successful\n"


@node.route('/blocks', methods=['GET'])
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


@node.route('/mine', methods=['GET'])
def mine():
    lastblock = blockchain[len(blockchain)-1]
    lastproof = lastblock.data['proof-of-work']
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
    index = lastblock.index + 1
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

def main():
    port = 5000
    if len(sys.argv) > 1:
        port = sys.argv[1]
    blockchain.append(creategenesisblock())
    node.run(debug=True, host='0.0.0.0')

if __name__ == '__main__':
    main()