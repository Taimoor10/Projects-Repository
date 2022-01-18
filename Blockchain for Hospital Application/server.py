import socket
import threading
import traceback

def btdebug(msg):
    print("[%s] %s" % (str(threading.currentThread().getName()), msg))

class MainPeer:

    Host = '0.0.0.0'  # localhost
    Port = 8000

    def __init__(self, serverport, peerid, serverhost):

        self.serverport = serverport
        self.serverhost = serverhost
        self.peers = {}
        self.shutdown = False

        if serverhost:
            self.serverhost = serverhost
        else:
            self.__initserverhost()

        if peerid:
            self.myid = peerid
        else:
            self.myid = '%s:%d' % (self.serverhost, self.serverport)

    def __initserverhost(self):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect(("www.google.com", 80))
        self.serverhost = s.getsockname()[0]
        s.close()

    def __debug(self, msg):
        if self.debug:
            btdebug(msg)

    def addpeer(self, peerid):
        if peerid not in self.peers:
            self.peers[peerid] = (self.Host, int(self.Port))
            return True
        else:
            return False

    def numberofpeers(self):
        print(len(self.peers))

    def startserver(self):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            s.bind((self.Host, self.Port))
            s.listen()
            while 1:
                print("Listening...")
                conn, addr = s.accept()
                name = conn.getpeername()
                self.handlepeer(conn, name)

    def handlepeer(self,conn, name):
        with conn:
            print('Connected by', name)
            self.addpeer(conn)
            self.numberofpeers()
            while True:
                data = conn.recv(1024)
                if not data:
                    break
                conn.sendall(data)


if __name__ == '__main__':
    objMainPeer = MainPeer(8000, 1, '0.0.0.0')

    t = threading.Thread(target=objMainPeer.startserver)
    t.setDaemon(True)
    t.start()
    while True:
        pass




