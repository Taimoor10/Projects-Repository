import socket

class Client:

    Host = '0.0.0.0'
    Port = 8000

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((Host, Port))
        s.sendall(b'OK Computer')
        data = s.recv(1024)

    print('Received', repr(data))