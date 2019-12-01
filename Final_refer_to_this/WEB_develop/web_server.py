import socket
import time
import os

SERVER_ADDR = (HOST, PORT)='localhost',8888
SERVER_QUEUE = 10

def handle_request(client_connection):
	request = client_connection.recv(1024)
	print(
		'Child PID: {pid}\nParent PID: {ppid}'.format(
			pid=os.getpid(),
			ppid=os.getppid()
			)
		)
	print (request)

	http_response = """\
HTTP/1.1 200 OK

zhang lin 
"""
	client_connection.sendall(http_response.encode())
	time.sleep(60)
	# client_connection.close()
	

def serve_forever():
	listen_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
	listen_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
	listen_socket.bind(SERVER_ADDR)
	listen_socket.listen(SERVER_QUEUE)
	print(HOST);
	print ('Serving HTTP on  {port}'.format( port=PORT))
	print('Parent PID (ppid): {PID}\n'.format(PID=os.getpid()))
	while True:
		client_connection, client_address = listen_socket.accept()
		pid = os.fork()
		if pid==0:
			listen_socket.close()
			handle_request(client_connection)
			client_connection.close()
			os._exit(0)
		# else:
			# client_connection.close()
		# handle_request(client_connection)


if __name__ == '__main__':
	serve_forever()