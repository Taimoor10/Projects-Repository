import socket
import pickle

class Client:

    def __init__(self, host, port):
        self.host = host
        self.port = port

    def startclient(self):

        serveraddress = (self.host, self.port)

        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect(serveraddress)
            data = s.recv(1024)
            try:
                data = pickle.loads(data)
            except EOFError:
                data = {}
        print('Received', repr(data))


if __name__ == '__main__':
    objClient = Client('0.0.0.0', 5001)
    objClient.startclient()