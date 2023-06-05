from  mpu9250_i2c import *
import socketio
sio = socketio.Client()

@sio.event
def disconnect():
    print('disconnected from server')



time.sleep(1) # delay necessary to allow mpu9250 to settle

@sio.event
def connect():
    print('connection established')
    sio.emit("ID", 'python-gyro-client')
    # print('recording data')
    initLoop()

# aX,aY,aZ,wX,wY,wZ,mX,mY,mZ,h = 0,0,0,0,0,0,0,0,0,0


def initLoop ():

    while 1:
        # try:
        ax,ay,az,wx,wy,wz = mpu6050_conv() # read and convert mpu6050 data
        mx,my,mz,heading = AK8963_conv() # read and convert AK8963 magnetometer data
        # except:
            # continue
        
        aX = str(ax)
        aY = str(ay)
        aZ = str(az)
        wX = str(wx)
        wY = str(wy)
        wZ = str(wz)
        mX = str(mx)
        mY = str(my)
        mZ = str(mz)
        h = str(heading)

        sio.emit('py-mpu',' '+aX+','+aY+','+aZ
                 +','+wX+','+wY+','+wZ
                 +','+mX+','+mY+','+mZ+','+h)



        # sio.emit('acc',wx,wy,wz)
        # sio.emit('mag',mx,my,mz)
        # sio.emit('heading',heading)
        # print('{}'.format('-'*30))
        # print('accel [g]: x = {0:2.2f}, y = {1:2.2f}, z =  {2:2.2f} '.format(ax,ay,az))
        # print('gyro [dps]:  x = {0:2.2f}, y = {1:2.2f}, z = {2:2.2f}'.format(wx,wy,wz))
        # print('mag [uT]:   x = {0:2.2f}, y = {1:2.2f}, z = {2:2.2f}'.format(mx,my,mz))
        # print('heading:   x = {0:2.2f}'.format(heading))
        # print('{}'.format('-'*30))
    
        time.sleep(1)

# initLoop ()
        
sio.connect('http://192.168.2.12:3000')
sio.wait()