#define _USE_MATH_DEFINES
 
#include <iostream>

#define Device_Address 0x68	/*Device Address/Identifier for MPU6050*/

#define PWR_MGMT_1   0x6B
#define SMPLRT_DIV   0x19
#define CONFIG       0x1A
#define GYRO_CONFIG  0x1B
#define ACCEL_CONFIG 0x1c
#define INT_ENABLE   0x38
#define ACCEL_XOUT_H 0x3B
#define ACCEL_YOUT_H 0x3D
#define ACCEL_ZOUT_H 0x3F
#define GYRO_XOUT_H  0x43
#define GYRO_YOUT_H  0x45
#define GYRO_ZOUT_H  0x47
#define TEMP_OUT_H   0x4A

class MPU6050 {
    public:
        MPU6050 ();
        short read_raw_data(int addr);
        void calcOffset(bool console, uint16_t delayBefore, uint16_t delayAfter);
        void update();
        void init_MPU();
        void getTemp(float temp);
        void getGyro(float (&gyroArray)[2]);
        void getAcc(float (&accArray)[2]);
        void getMag(float (&magArray)[2]);
        
    private:
        int fd;
        
        int16_t rawAccX, rawAccY, rawAccZ, rawTemp, rawGyroX, rawGyroY, rawGyroZ;
        
        float gyroXoffset= 1.45;
        float gyroYoffset= 1.23;
        float gyroZoffset= -1.32;

        float sX,sY,sZ, vX, vY, vZ,dvX, dvY, dvZ;

        float temp, accX, accY, accZ, gyroX, gyroY, gyroZ;

        float angleGyroX, angleGyroY, angleGyroZ,
        angleAccX, angleAccY, angleAccZ;

        float angleX, angleY, angleZ;
        // float accX, accY, accZ;
        float magX,magY,magZ;

        float interval;
        long preInterval;

        float accCoef = 0.02f;
        float gyroCoef = 0.98f;
};
