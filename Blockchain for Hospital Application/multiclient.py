import socket
import sys

class Client:

    def __init__(self, host, port):
        self.host = host
        self.port = port


    def startclient(self):
        messages = ['OK Computer is the message', 'It will be sent', 'in parts', ]
        serveraddress = (self.host, self.port)

        socks = [socket.socket(socket.AF_INET, socket.SOCK_STREAM),
                      socket.socket(socket.AF_INET, socket.SOCK_STREAM), ]
        print('Connecting to %s port %s' % serveraddress)

        for s in socks:
            s.connect(serveraddress)

        for message in messages:
            for s in socks:
                print('%s: sending "%s"' % (s.getsockname(), message))
                s.send(message.encode())

            for s in socks:
                data = s.recv(1024)
                print('%s: received "%s"' % (s.getsockname(), data))
                if not data:
                    print('Closing Socket', s.getsockname())
                    s.close()


if __name__ == '__main__':
    objClient = Client('0.0.0.0', 8000)
    objClient.startclient()