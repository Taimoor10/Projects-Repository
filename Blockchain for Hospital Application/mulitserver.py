import select
import socket
import queue
import itertools
import fullcode


class MainPeer:

    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.peers = list()
        self.Emptypeerlist = list()

    def makeConnection(self):

        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.setblocking(0)

        serveraddress = (self.host, self.port)
        print('Starting Server on: ', serveraddress)
        server.bind(serveraddress)
        server.listen(5)

        inputs = [server]
        outputs = []
        messagequeues = {}

        while inputs:
            print("Waiting for the next event")
            timeout = 1
            readable, writable, exceptional = select.select(inputs, outputs, inputs, timeout)
            self.numberofpeers()

            for s in readable:
                if s is server:
                    conn, clientaddress = s.accept()
                    print("New Connection from :", clientaddress)
                    self.Emptypeerlist.append(clientaddress)
                    peerlist = list(itertools.chain.from_iterable(self.Emptypeerlist))
                    peerip = peerlist[0]
                    conn.setblocking(0)
                    inputs.append(conn)
                    self.addpeer(peerip)

                    messagequeues[conn] = queue.Queue()
                else:
                    data = s.recv(1024)
                    if data:
                        print('Received "%s" from %s ' % (data, s.getpeername()))
                        messagequeues[s].put(data)
                        if s not in outputs:
                            outputs.append(s)
                    else:
                        print('Closing', clientaddress, ' after reading no data')
                        if s in outputs:
                            outputs.remove(s)
                        inputs.remove(s)
                        s.close()
                        del messagequeues[s]

            for s in writable:
                try:
                    nextmsg = messagequeues[s].get_nowait()
                except queue.Empty:
                    print('Output queue for', s.getpeername(), 'is empty')
                    outputs.remove(s)
                else:
                    print('Sending "%s" to %s' % (nextmsg, s.getpeername()))
                    s.send(nextmsg)

            for s in exceptional:
                print('Handling exceptional condition for', s.getpeername())
                inputs.remove(s)
                if s in outputs:
                    outputs.remove(s)
                s.close()
                del messagequeues[s]

    def addpeer(self, peerip):
        if peerip not in self.peers:
            self.peers.append(peerip)
            return True
        else:
            return False

    def numberofpeers(self):
        print(len(self.peers))

if __name__ == '__main__':
    objMainPeer = MainPeer('0.0.0.0', 8000)
    objMainPeer.makeConnection()




