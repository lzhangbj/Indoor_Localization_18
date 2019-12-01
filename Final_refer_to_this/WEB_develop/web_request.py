import socket

# create a socket and connect to a server
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.connect(('localhost', 8888))
HOST, PORT = sock.getsockname()[:2]
print(HOST, PORT)
print(sock.fileno())

# send and receive some data
sock.sendall(b'test')
data = sock.recv(1024)
print(data.decode())