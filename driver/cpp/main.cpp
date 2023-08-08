#include <iostream>
#include "mpu.h"

int main(int argc, char *argv[]){
    float gyro[2];
    float temp;

    MPU6050 mpu;

    mpu.calcOffset(false, 0,0);
    mpu.init_MPU();

    while(1) {
        mpu.update();
        mpu.getGyro(gyro);
        mpu.getTemp(temp);
        printf("%f,%f,%f,%f\r",temp, gyro[0], gyro[1], gyro[2]);
        fflush(stdout);
    }    

    return 0;
}