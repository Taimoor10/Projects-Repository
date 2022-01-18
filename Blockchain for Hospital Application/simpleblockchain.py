import hashlib as hasher
from flask import Flask
from flask import request
import json
import requests
import datetime
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
        data = str(self.index) + str(self.timestamp) + str(self.data) + str(self.previoushash)
        sha.update(data.encode("utf-8"))
        return sha.hexdigest()


def creategenesisblock():
    return Block(0, datetime.datetime.now(), {
        "proof-of-work": 9,
        "transactions": None
    },  "0")

mineraddress = "q3nf394hjg-random-miner-address-34nf3i4nflkn3oi"
blockchain = []
blockchaincopy = blockchain
blockchain.append(creategenesisblock())
thisnodetransactions = []
peernodes = []
mining = True

@node.route('/txion', methods=['POST'])
def transaction():
    newtxion = request.get_json()
    thisnodetransactions.append(newtxion)
    print("New Transaction")
    print("FROM: {}".format(newtxion['from'].encode('ascii', 'replace')))
    print("TO: {}".format(newtxion['to'].encode('ascii', 'replace')))
    print("AMOUNT: {}\n".format(newtxion['amount']))
    return "Transaction Submission Successful\n"

@node.route('/blocks', methods=['GET'])
def get_blocks():
  chaintosend = blockchain
  blocklist = ""
  for i in range(len(chaintosend)):
    block = chaintosend[i]
    blockindex = str(block.index)
    blocktimestamp = str(block.timestamp)
    blockdata = str(block.data)
    blockhash = block.hash
    blockprevioushash = block.previoushash
    assembled = json.dumps({
    "index": blockindex,
    "timestamp": blocktimestamp,
    "data": blockdata,
    "hash": blockhash,
    "previoushash": blockprevioushash
    }) + '\n'
    if blocklist == "":
      blocklist = (assembled)
    else:
      blocklist += assembled
  return blocklist

def findnewchains():
    otherchains = []
    for nodeurl in peernodes:
        block = requests.get(nodeurl + "/blocks").content
        block = json.loads(block)
    return otherchains

def consensus():
    otherchains = findnewchains()
    global blockchain
    longestchain = blockchain
    for chain in otherchains:
        if len(longestchain) < len(chain):
            longestchain = chain
    blockchain = longestchain

def nextblock(lastblock):
    index = lastblock.index + 1
    timestamp = datetime.datetime.now()
    data = "Block Number: "+str(index)
    previoushash = lastblock.hash
    return Block(index, timestamp, datetime, previoushash)

def proofofwork(lastproof):
    incrementor = lastproof+1
    while not(incrementor % 9 == 0 and incrementor % lastproof == 0):
        incrementor += 1
    return incrementor

@node.route('/mine', methods=['GET'])
def mine():
    lastblock = blockchain[len(blockchain)-1]
    lastproof = lastblock.data['proof-of-work']
    proof = proofofwork(lastproof)
    if len(thisnodetransactions) != 0:
        thisnodetransactions.append(
            {"from": "network", "to": mineraddress, "amount": 1}
        )
    else:
        return

    newblockdata={
        "proof-of-work": proof,
        "transactions": list(thisnodetransactions)
    }
    newblockindex = lastblock.index + 1
    newblocktimestamp = thistimestamp = datetime.datetime.now()
    lastblockhash = lastblock.hash
    thisnodetransactions[:] = []
    minedblock = Block(
        newblockindex,
        newblocktimestamp,
        newblockdata,
        lastblockhash
    )

    if minedblock.hash != minedblock.hashblock() or minedblock.previoushash != lastblock.hash:
        print("Chain is Invalid")
    else:
        blockchain.append(minedblock)
        return json.dumps({
            "index": newblockindex,
            "timestamp": str(newblocktimestamp),
            "data": newblockdata,
            "hash": minedblock.hash,
            "previoushash": lastblockhash
        }) + "\n"


def isChainValid():
    i = 1
    global blockchain
    for i in range(1, len(blockchain)):
        currentblock = blockchain[i]
        previousblock = blockchain[i-1]

        print("Current Block Index: ", currentblock.index)
        print("Current Block Hash: ", currentblock.hash)
        print("Current Block CalculatedHash: ", currentblock.hashblock())
        print("Previous Block Hash: ", previousblock.hash)
        print("Previous Block PreviousHash: ", previousblock.previoushash)
        print("Current Block PreviousHash: ", currentblock.previoushash)

        if currentblock.hash != currentblock.hashblock():
            print("Chain is Invalid")
            return False
        elif currentblock.previoushash != previousblock.hash:
            print("Chain is Invalid")
            return False
        else:
            print("Chain is Valid")


if __name__ == '__main__':
    node.debug = True
node.run()

'''blockchain = [creategenesisblock()]
previousblock = blockchain[0]
numofblockstoadd = 5

for i in range(0, numofblockstoadd):
    if isChainValid()==True:
        blocktoadd = nextblock(previousblock)
        blockchain.append(blocktoadd)
        previousblock = blocktoadd
    else:
        print("Chain is Invalid, New blocks cannot be added")


    print("Block #{} has been added".format(blocktoadd.index))
    print("Hash: {}\n".format(blocktoadd.hash))
    print("Previous Hash: {}\n".format(blocktoadd.previoushash))'''



