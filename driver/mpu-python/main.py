import time, socketio
from Inertial import InertialSensor

EMITTER_PI = 'EMITTER_PI'

sio = socketio.Client()
sensor = InertialSensor()

time.sleep(1) # delay necessary to allow mpu9250 to settle

@sio.event
def disconnect():
    print('disconnected from server')

@sio.event
def connect():
    print('connection established')
    sio.emit("ID", EMITTER_PI)

    initLoop()

def initLoop ():
    print("EMITING")
    while sio.handle_sigint:
        
        data = sensor.comp_filter()

        gyro, accel, mag, time, cycle, inertial = data

        sio.emit('py-mpu', data)

sio.connect('http://192.168.2.13:3000')
sio.wait()