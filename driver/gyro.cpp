#include <wiringPiI2C.h>
#include <wiringPi.h>

#define _USE_MATH_DEFINES
 
#include <stdlib.h>
#include <stdio.h>
#include <iostream>

#include <chrono>
#include <thread>
#include <cmath>
#include <math.h>

uint16_t delayBefore = 1000;
uint16_t delayAfter = 3000;

float gyroXoffset, gyroYoffset, gyroZoffset;

using namespace std::chrono;

milliseconds ms = duration_cast< milliseconds >(
    system_clock::now().time_since_epoch()
);

#define Device_Address 0x68	/*Device Address/Identifier for MPU6050*/

#define PWR_MGMT_1   0x6B
#define SMPLRT_DIV   0x19
#define CONFIG       0x1A
#define GYRO_CONFIG  0x1B
#define INT_ENABLE   0x38
#define ACCEL_XOUT_H 0x3B
#define ACCEL_YOUT_H 0x3D
#define ACCEL_ZOUT_H 0x3F
#define GYRO_XOUT_H  0x43
#define GYRO_YOUT_H  0x45
#define GYRO_ZOUT_H  0x47

#define AK8963_XOUT_H    0x04
#define AK8963_YOUT_H    0x06
#define AK8963_ZOUT_H    0x08
#define AK8963_CNTL      0x0A	

int fd;

void MPU6050_Init(){
	
	wiringPiI2CWriteReg8 (fd, SMPLRT_DIV, 0x07);	/* Write to sample rate register */
	wiringPiI2CWriteReg8 (fd, PWR_MGMT_1, 0x01);	/* Write to power management register */
	wiringPiI2CWriteReg8 (fd, CONFIG, 0);		/* Write to Configuration register */
	wiringPiI2CWriteReg8 (fd, GYRO_CONFIG, 24);	/* Write to Gyro Configuration register */
	wiringPiI2CWriteReg8 (fd, INT_ENABLE, 0x01);	/* Write to interrupt enable register */
	wiringPiI2CWriteReg8 (fd, AK8963_CNTL, 0x02);	/* Write to magnetometer Control register */

} 

short read_raw_data(int addr){
	short high_byte,low_byte,value;
	high_byte = wiringPiI2CReadReg8(fd, addr);
	low_byte = wiringPiI2CReadReg8(fd, addr+1);
	value = (high_byte << 8) | low_byte;
	return value;
}

void setGyroOffsets (float x, float y, float z) {
	gyroXoffset = x;
  gyroYoffset = y;
  gyroZoffset = z;
}

void calcOffsets(bool console){
	float x = 0, y = 0, z = 0;
	int16_t rx, ry, rz;

//   delay(delayBefore);
	if(console){
//     Serial.println();
//     Serial.println("========================================");
//     Serial.println("Calculating gyro offsets");
//     Serial.print("DO NOT MOVE MPU6050");
  }
  for(int i = 0; i < 3000; i++){
    if(console && i % 1000 == 0){
    //   Serial.print(".");
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
    // Serial.println();
    // Serial.println("Done!");
    // Serial.print("X : ");Serial.println(gyroXoffset);
    // Serial.print("Y : ");Serial.println(gyroYoffset);
    // Serial.print("Z : ");Serial.println(gyroZoffset);
    // Serial.println("Program will start after 3 seconds");
    // Serial.print("========================================");
	// delay(delayAfter);
  }
}
short read_raw_data_magnet(int addr){
	short high_byte,low_byte,value;
	high_byte = wiringPiI2CReadReg8(fd, addr);
	low_byte = wiringPiI2CReadReg8(fd, addr-1);
	value = (high_byte << 8) | low_byte;
	return value;
}

void ms_delay(int val){
	int i,j;
	for(i=0;i<=val;i++)
		for(j=0;j<1200;j++);
}

int main(){
	int16_t Acc_rawX, Acc_rawY, Acc_rawZ,Gyr_rawX, Gyr_rawY, Gyr_rawZ, magnet_rawX, magnet_rawY, magnet_rawZ;
	float Acceleration_angle[3];
	float Gyro_angle[3];
	float Total_angle[3];
	float magnet[3];
	float elapsedTime, time, timePrev;
	int i;
	float rad_to_deg = 180/3.141592654;
	
	setGyroOffsets(1.45, 1.23, -1.32);

	fd = wiringPiI2CSetup(Device_Address);   /*Initializes I2C with device Address*/
	MPU6050_Init();		                 /* Initializes MPU6050 */
	
	while(1)
	{
		timePrev = time;  // the previous time is stored before the actual time read
		time = ms.count();  // actual time read
		elapsedTime = (time - timePrev) * 0.001;
		
		Acc_rawX = read_raw_data(ACCEL_XOUT_H);
		Acc_rawY = read_raw_data(ACCEL_YOUT_H);
		Acc_rawZ = read_raw_data(ACCEL_ZOUT_H);
		
		/*---X---*/
		Acceleration_angle[0] = atan((Acc_rawY/16384.0)/sqrt(pow((Acc_rawX/16384.0),2) + pow((Acc_rawZ/16384.0),2)))*rad_to_deg;
		/*---Y---*/
		Acceleration_angle[1] = atan(-1*(Acc_rawX/16384.0)/sqrt(pow((Acc_rawY/16384.0),2) + pow((Acc_rawZ/16384.0),2)))*rad_to_deg;
		
		Acceleration_angle[2] = atan(sqrt(Acc_rawX*Acc_rawX + Acc_rawY*Acc_rawY)/Acc_rawZ) *rad_to_deg;
	
		Gyr_rawX = read_raw_data(GYRO_XOUT_H);
		Gyr_rawY = read_raw_data(GYRO_YOUT_H);
		Gyr_rawZ = read_raw_data(GYRO_ZOUT_H);

		/*---X---*/
		Gyro_angle[0] = Gyr_rawX/131.0; 
		/*---Y---*/
		Gyro_angle[1] = Gyr_rawY/131.0;
        Gyro_angle[2] = Gyr_rawZ/131.0;
        // Gyro_angle[2] = Gyr_rawZ/65.5;

		Gyro_angle[0] -= gyroXoffset;
		Gyro_angle[1] -= gyroYoffset;
        Gyro_angle[2] -= gyroZoffset;


		magnet_rawX = read_raw_data_magnet(AK8963_XOUT_H);
		magnet_rawY = read_raw_data_magnet(AK8963_YOUT_H);
		magnet_rawZ = read_raw_data_magnet(AK8963_ZOUT_H);
		
		/*---X---*/
		magnet[0] = magnet_rawX/131.0;
		/*---Y---*/
		magnet[1] = magnet_rawY/131.0;
        magnet[2] = magnet_rawZ/131.0;
		
		/*---X axis angle---*/
		Total_angle[0] = 0.98 *(Total_angle[0] + Gyro_angle[0]*elapsedTime) + 0.02*Acceleration_angle[0];
		/*---Y axis angle---*/
		Total_angle[1] = 0.98 *(Total_angle[1] + Gyro_angle[1]*elapsedTime) + 0.02*Acceleration_angle[1];

		Total_angle[2] = Total_angle[2] + Gyro_angle[2]*elapsedTime;

		printf("%f,%f,%f,%f,%f,%f\r", Total_angle[0], Total_angle[1], Total_angle[2], magnet[0], magnet[1], magnet[2]);

		fflush(stdout);
	}
	return 0;
}

