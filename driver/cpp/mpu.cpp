#include "mpu.h"

#include <wiringPi.h>
#include <wiringPiI2C.h>
// #include "includes/wiringPi.h"
// #include "includes/wiringPiI2C.h"



#include <cmath>
#include <math.h>

MPU6050::MPU6050 (){
	//check if fd is successfull connect
  fd = wiringPiI2CSetup(Device_Address); 
}

short MPU6050::read_raw_data(int addr){
	short high_byte,low_byte,value;
	high_byte = wiringPiI2CReadReg8(MPU6050::fd, addr);
	low_byte = wiringPiI2CReadReg8(MPU6050::fd, addr+1);
	value = (high_byte << 8) | low_byte;
	return value;
}

void MPU6050::calcOffset(bool console, uint16_t delayBefore, uint16_t delayAfter) {
    float x = 0, y = 0, z = 0;
	int16_t rx, ry, rz;

    delay(delayBefore);
    if(console){
        std::cout << "Calculating gyro offsets" << std::endl;
    }
  for(int i = 0; i < 3000; i++){
    if(console && i % 1000 == 0){
      printf(".");
    }
    rx = read_raw_data(GYRO_XOUT_H);
    ry = read_raw_data(GYRO_YOUT_H);
    rz = read_raw_data(GYRO_ZOUT_H);

    x += ((float)rx) / 65.5;
    y += ((float)ry) / 65.5;
    z += ((float)rz) / 65.5;
  }
  gyroXoffset = x / 3000;
  gyroYoffset = y / 3000;
  gyroZoffset = z / 3000;

  if(console){
	  std::cout << "Calculating gyro offsets" << std::endl;
	  std::cout << "X: " << gyroXoffset << std::endl;
	  std::cout << "Y: " << gyroXoffset << std::endl;
	  std::cout << "Z: " << gyroXoffset << std::endl;
	delay(delayAfter);
	}
}

void MPU6050::update(){
	rawAccX = read_raw_data(ACCEL_XOUT_H);
	rawAccY = read_raw_data(ACCEL_YOUT_H);
	rawAccZ = read_raw_data(ACCEL_ZOUT_H);
	rawGyroX = read_raw_data(GYRO_XOUT_H);
	rawGyroY = read_raw_data(GYRO_YOUT_H);
	rawGyroZ = read_raw_data(GYRO_ZOUT_H);
  rawTemp = read_raw_data(TEMP_OUT_H);

	temp = (rawTemp + 12412.0) / 340.0;

	accX = ((float)rawAccX) / 16384.0;
	accY = ((float)rawAccY) / 16384.0;
	accZ = ((float)rawAccZ) / 16384.0;

	angleAccX = atan2(accY, sqrt(accZ * accZ + accX * accX)) * 360 / 2.0 / M_PI;
	angleAccY = atan2(accX, sqrt(accZ * accZ + accY * accY)) * 360 / -2.0 / M_PI;

	gyroX = ((float)rawGyroX) / 65.5;
	gyroY = ((float)rawGyroY) / 65.5;
	gyroZ = ((float)rawGyroZ) / 65.5;

	gyroX -= gyroXoffset;
	gyroY -= gyroYoffset;
	gyroZ -= gyroZoffset;

	interval = (millis() - preInterval) * 0.001;

	angleGyroX += gyroX * interval;
	angleGyroY += gyroY * interval;
	angleGyroZ += gyroZ * interval;

	

	vX = dvX + accX*interval;
	vY = dvX + accX*interval;
	vZ = dvX + accX*interval;

	sX = (sX*interval) + (0.5 * accX * (interval*interval));
	sY = (sY*interval) + (0.5 * accY * (interval*interval));
	sZ = (sZ*interval) + (0.5 * accZ * (interval*interval));

	angleX = (gyroCoef * (angleX + gyroX * interval)) + (accCoef * angleAccX);
	angleY = (gyroCoef * (angleY + gyroY * interval)) + (accCoef * angleAccY);
	angleZ = angleGyroZ;

	preInterval = millis();
}

void MPU6050::init_MPU () {
    wiringPiI2CWriteReg8 (fd, SMPLRT_DIV, 0x07);	/* Write to sample rate register */
    wiringPiI2CWriteReg8 (fd, CONFIG, 0x00);		/* Write to Configuration register */
    wiringPiI2CWriteReg8 (fd, GYRO_CONFIG, 24);	/* Write to Gyro Configuration register */
    // ^^^ was 24
    // wiringPiI2CWriteReg8 (fd, ACCEL_CONFIG,0x00); 
    wiringPiI2CWriteReg8 (fd, PWR_MGMT_1, 0x01);	/* Write to power management register */
    wiringPiI2CWriteReg8 (fd, INT_ENABLE, 0x01);	/*Write to interrupt enable register ???*/
    angleGyroX = 0;
    angleGyroY = 0;
    angleX = angleAccX;
    angleY = angleAccY;
    preInterval = millis();

    update();
}

void MPU6050::getGyro(float (&gyroArray)[2]){

  gyroArray[0] = angleX;
  gyroArray[1] = angleY;
  gyroArray[2] = angleZ;
}

void MPU6050::getTemp(float tempOut) {
  tempOut = temp; 
}