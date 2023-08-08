import time, socketio
from Inertial import InertialSensor

sio = socketio.Client()
sensor = InertialSensor()

time.sleep(1) # delay necessary to allow mpu9250 to settle

@sio.event
def disconnect():
    print('disconnected from server')

@sio.event
def connect():
    print('connection established')
    sio.emit("ID", 'python-gyro-client')

    initLoop()

def initLoop ():
    print("EMITING")
    while sio.handle_sigint:
        # try:
        data = sensor.read_data()

        sio.emit('py-mpu', data)

sio.connect('http://192.168.2.13:3000')
sio.wait()