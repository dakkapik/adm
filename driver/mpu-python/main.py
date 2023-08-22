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
        
        gyro, accel, mag, time, cycle, inertial = sensor.comp_filter()

        sio.emit('py-mpu', gyro, accel, mag, time, cycle, inertial)

sio.connect('http://192.168.2.13:3000')
sio.wait()