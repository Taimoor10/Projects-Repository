import socket
import struct
import threading
import time
import traceback

def btdebug( msg ):
    """ Prints a messsage to the screen with the name of the current thread """
    print("[%s] %s" % (str(threading.currentThread().getName()), msg))

class BTpeerConnection:

    def __init__(self, peerid, port, host, sock=None, debug=True):
        self.id = peerid
        self.debug = debug

        if not sock:
            self.s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.s.connect((host, int(port)))
        else:
            self.s = sock

        self.sd = self.s.makefile('rw')

    def __makemsg(self, msgtype, msgdata):
        msglen = len(msgdata)
        msg = struct.pack( "!4sL%ds".encode('utf-8') % msglen, msgtype.encode('utf-8'), msglen, msgdata.encode('utf-8'))
        return msg

    def __debug(self, msg):
        if self.debug:
            btdebug(msg)

    def senddata(self, msgtype, msgdata):
        try:
            msg = self.__makemsg(msgtype, msgdata)
            self.sd.write(str(msg))
            self.sd.flush()
        except KeyboardInterrupt:
            raise
        except:
            if self.debug:
                traceback.print_exc()
            return False
        return True

    def recvdata(self):
        try:
            msgtype = self.sd.read(4)
            if not msgtype:
                return(None, None)

            lenstr = self.sd.read(4)
            msglen = int(struct.unpack("!L", lenstr)[0])
            msg = ""

            while len(msg) != msglen:
                data = self.sd.read(min(2048, msglen - len(msg)))
                if not len(data):
                    break
                msg += data

            if len(msg) != msglen:
                return (None, None)
        except KeyboardInterrupt:
            raise
        except:
            if self.debug:
                traceback.print_exc()
            return(None, None)

    def close(self):
        self.s.close()
        self.s = None
        self.sd = None

    def __str__(self):
        return "|%s|" % self.peerid

if __name__ == '__main__':
    objClient = BTpeerConnection(1, 8000, '0.0.0.0', sock=None, debug=True)
    objClient.senddata("String", "OK Computer")
