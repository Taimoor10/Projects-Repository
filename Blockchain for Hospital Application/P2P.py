import socket
import struct
import threading
import time
import traceback
import P2Pclient


def btdebug(msg):
    print("[%s] %s" % (str(threading.currentThread().getName()), msg))

class BTpeer:
    def __init__(self, maxpeers, serverport, myid=None, serverhost=None):
        self.debug = 0

        self.maxpeers = int(maxpeers)
        self.serverport = int(serverport)
        if serverhost:
            self.serverhost = serverhost
        else:
            self.__initserverhost()

        if myid:
            self.myid = myid
        else:
            self.myid = '%s:%d' % (self.serverhost, self.serverport)

        self.peerlock = threading.Lock()
        self.peers = {}
        self.shutdown = False

        self.handlers = {}
        self.router = None

    def __initserverhost(self):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(("www.google.com", 80))
        self.serverhost = s.getsockname()[0]
        s.close()

    def __debug(self, msg):
        if self.debug:
            btdebug(msg)

    def __handlepeer(self, clientsock):
        self.__debug('New Child' + str(threading.currentThread().getName()))
        self.__debug('Connected changed' + str(clientsock.getpeername()))

        host, port = clientsock.getpeername()
        peerconn = P2Pclient.BTpeerConnection(None, host, port, clientsock, debug=False)

        try:
            msgtype, msgdata = peerconn.recvdata()
            if msgtype:
                msgtype = msgtype.upper()
            if msgtype not in self.handlers:
                self.__debug('Not handled: %s: %s' % (msgtype, msgdata))
            else:
                self.__debug('Handling peer msg: %s: %s' % (msgtype, msgdata))
                self.handlers[msgtype](peerconn, msgdata)
        except KeyboardInterrupt:
            raise
        except:
            if self.debug:
                traceback.print_exc()

        self.__debug('Disconnecting' + str(clientsock.getpeername))
        peerconn.close()

    def __runstabilizer(self, stabilizer, delay):
        while not self.shutdown:
            stabilizer()
            time.sleep(delay)

    def setmyid(self, myid):
        self.myid = myid

    def startstabilizer(self, stablilizer, delay):
        t = threading.Thread(target=self.__runstabilizer(), args=[stablilizer, delay])
        t.start()

    def addhandler(self, msgtype, handler):
        assert len(msgtype) == 4
        self.handlers[msgtype] = handler

    def addrouter(self, router):
        self.router = router

    def addpeer(self, peerid, host, port):
        if peerid not in self.peers and (self.maxpeers == 0 or len(self.peers) < self.maxpeers):
            self.peers[peerid] = (host, int(port))
            return True
        else:
            return False

    def getpeer(self, peerid):
        assert peerid in self.peers
        return self.peers[peerid]

    def removepeer(self, peerid):
        if peerid in self.peers:
            del self.peers[peerid]

    def addpeerat(self, loc, peerid, host, port):
        self.peers[loc] = (peerid, host, int(port))

    def getpeerat(self, loc):
        if loc not in self.peers:
            return None
        return self.peers[loc]

    def removepeerat(self, loc):
        self.removepeer(self, loc)

    def getpeerids(self):
        return self.peers.keys()

    def numberofpeers(self):
        return len(self.peers)

    def maxpeersreached(self):
        assert self.maxpeers == 0 or len(self.peers) <= self.maxpeers
        return self.maxpeers > 0 and len(self.peers)==self.maxpeers

    def makeserversocket(self, port, backlog=5):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind(('', port))
        s.listen(backlog)
        return s

    def sendtopeer(self, peerid, msgtype, msgdata, waitreply=True):
        if self.router:
            nextpid, host, port = self.router(peerid)
        if not self.router or not nextpid:
            self.__debug('Unable to route %s to %s' % (msgtype, peerid))
            return None
        return self.connectandsend(host, port, msgtype, msgdata, pid=nextpid, waitreply=waitreply)

    def connectandsend(self, host, port, msgtype, msgdata, pid=None, waitreply=True):
        msgreply = []
        try:
            peerconn = P2Pclient.BTpeerConnection(pid, host, port, debug=self.debug)
            peerconn.senddata(msgtype, msgdata)
            self.__debug('Sent %s: %s' % (pid, msgtype))

            if waitreply:
                onereply = peerconn.recvdata()
                while(onereply != (None,None)):
                    msgreply.append(onereply)
                    self.__debug('Got reply %s: %s' % (pid, str(msgreply)))
                    onereply = peerconn.recvdata()
            peerconn.close()
        except KeyboardInterrupt:
            raise
        except:
            if self.debug:
                traceback.print_exc()
        return msgreply

    def checklivepeers(self):
        todelete = []
        for pid in self.peers:
            isconnected = False
            try:
                self.__debug('Check live %s' % pid)
                host, port = self.peers[pid]
                peerconn = P2Pclient.BTpeerConnection(pid, host, port, debug=self.debug)
                peerconn.senddata('PING', '')
                isconnected = True
            except:
                todelete.append(pid)
            if isconnected:
                peerconn.close()
        self.peerlock.acquire()
        try:
            for pid in todelete:
                if pid in self.peers:
                    del self.peers[pid]
        finally:
            self.peerlock.release()

    def mainloop(self):
        s = self.makeserversocket(self.serverport)
        s.settimeout(2)
        self.__debug('Server Started: %s (%s:%d)' % (self.myid, self.serverhost, self.serverport))

        while not self.shutdown:
            try:
                self.__debug('Listening for connections...')
                while 1:
                    clientsock, clientaddr = s.accept()
                    clientsock.settimeout(None)

                    t = threading.Thread(target=self.__handlepeer, args=[clientsock])
                    t.start()
            except KeyboardInterrupt:
                print('KeyboardInterrupt: Stopping Mainloop')
                self.shutdown = True
                continue
            except:
                if self.debug:
                    traceback.print_exc()
                    continue

        self.__debug('Main loop exiting')
        s.close()


if __name__ == '__main__':
    objbtPeer = BTpeer(5, 8000, myid=None, serverhost='0.0.0.0')
    objbtPeer.addpeer(1, '0.0.0.0', 8000)
    s = objbtPeer.mainloop()
    s = objbtPeer.numberofpeers()



