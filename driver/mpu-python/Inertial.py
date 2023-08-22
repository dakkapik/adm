import time, sys, json, math
import smbus2

MPU6050_ADDR = 0x68
PWR_MGMT_1   = 0x6B
SMPLRT_DIV   = 0x19
CONFIG       = 0x1A
GYRO_CONFIG  = 0x1B
ACCEL_CONFIG = 0x1C
INT_ENABLE   = 0x38
ACCEL_XOUT_H = 0x3B
ACCEL_YOUT_H = 0x3D
ACCEL_ZOUT_H = 0x3F
TEMP_OUT_H   = 0x41
GYRO_XOUT_H  = 0x43
GYRO_YOUT_H  = 0x45
GYRO_ZOUT_H  = 0x47
#AK8963 registers
AK8963_ADDR  = 0x0C
AK8963_ST1   = 0x02
HXH          = 0x04
HYH          = 0x06
HZH          = 0x08
AK8963_ST2   = 0x09
AK8963_CNTL  = 0x0A

bus =  smbus2.SMBus(1) # start comm with i2c bus

class Gyroscope():
	def __init__(self, sense_index = 0) -> None:
		self.sense_index = sense_index
		self.config_config_val = [250.0,500.0,1000.0,2000.0]
		pass
	
	def read(self):
		gyro_x = self.reader(GYRO_XOUT_H)
		gyro_y = self.reader(GYRO_YOUT_H)
		gyro_z = self.reader(GYRO_ZOUT_H)
		return gyro_x, gyro_y, gyro_z

	def angles(self):
		gyro_x, gyro_y, gyro_z = self.read()
		wX = (gyro_x/(2.0**15.0))*self.config_config_val[self.sense_index]
		wY = (gyro_y/(2.0**15.0))*self.config_config_val[self.sense_index]
		wZ = (gyro_z/(2.0**15.0))*self.config_config_val[self.sense_index]

		return wX, wY,wZ

	def reader(self, register):
		# read accel and gyro values
		high = bus.read_byte_data(MPU6050_ADDR, register)
		low = bus.read_byte_data(MPU6050_ADDR, register+1)

		# combine higha and low for unsigned bit value
		value = ((high << 8) | low)
		
		# convert to +- value
		if(value > 32768):
			value -= 65536
		return value

class Accelerometer():
	def __init__(self, sense_index = 0) -> None:
		self.sense_index = sense_index
		self.sense_config_val = [2.0,4.0,8.0,16.0]
		pass

	def read(self):
		# raw acceleration bits
		acc_x = self.reader(ACCEL_XOUT_H)
		acc_y = self.reader(ACCEL_YOUT_H)
		acc_z = self.reader(ACCEL_ZOUT_H)
		return acc_x, acc_y, acc_z

	def normalize(self):
		acc_x, acc_y, acc_z = self.read()
		a_x = (acc_x/(2.0**15.0))*self.sense_config_val[self.sense_index]
		a_y = (acc_y/(2.0**15.0))*self.sense_config_val[self.sense_index]
		a_z = (acc_z/(2.0**15.0))*self.sense_config_val[self.sense_index]
		return a_x, a_y, a_z

	def angles(self):
		a_x, a_y, a_z = self.normalize()
		x = math.atan2 ( a_y, math.sqrt ( a_z *  a_z  + a_x * a_x)) * (180 / math.pi)
		y = math.atan2 (- a_x, math.sqrt( a_z *  a_z + a_y * a_y)) * (180 / math.pi)
		z = math.atan2 (math.sqrt( a_x *  a_x + a_y * a_y), a_z) * (180 / math.pi)
		return x, y, z

	def reader(self, register):
		# read accel and gyro values
		high = bus.read_byte_data(MPU6050_ADDR, register)
		low = bus.read_byte_data(MPU6050_ADDR, register+1)

		# combine higha and low for unsigned bit value
		value = ((high << 8) | low)
		
		# convert to +- value
		if(value > 32768):
			value -= 65536
		return value

class Magnetometer():
	def __init__(self, sense_index =0) -> None:
		self.sense_index = sense_index
		self.sense_config_val = [4900.0]
		pass

	def read(self):
		loop_count = 0

		while 1:
			mag_x = self.reader(HXH)
			mag_y = self.reader(HYH)
			mag_z = self.reader(HZH)

			if bin(bus.read_byte_data(AK8963_ADDR,AK8963_ST2))=='0b10000':
				return mag_x, mag_y, mag_z
			loop_count+=1

	def normalize(self):
		mag_x, mag_y, mag_z = self.read()
		m_x = (mag_x/(2.0**15.0))*self.sense_config_val[self.sense_index]
		m_y = (mag_y/(2.0**15.0))*self.sense_config_val[self.sense_index]
		m_z = (mag_z/(2.0**15.0))*self.sense_config_val[self.sense_index]
		return m_x, m_y, m_z
	
	def heading(self):
		m_x, m_y, m_z= self.normalize()
		heading = math.atan2( m_x, m_y ) * (180/ math.pi) 
		return m_x, m_y, m_z, heading

	def reader(self, register):
		# read magnetometer values
		low = bus.read_byte_data(AK8963_ADDR, register-1)
		high = bus.read_byte_data(AK8963_ADDR, register)
		# combine higha and low for unsigned bit value
		value = ((high << 8) | low)
		# convert to +- value
		if(value > 32768):
			value -= 65536
		return value

class InertialSensor():
	def __init__(self) -> None:
		self.config_MPU()
		self.config_AK()
		self.gyro = Gyroscope()
		self.accel = Accelerometer()
		self.mag = Magnetometer()

		self.inertial = [ 0,0,0 ]

		self.time_init = time.time()
		self.prev_time = 0

		self.cycle = 0
		
	def setTimeRef(self):
		self.prev_time = time.time()

	def getTimeEleapsed(self):
		return time.time() - self.prev_time

	def read_raw_data(self):
		gyro = self.gyro.read()
		accel = self.accel.read()
		mag = self.mag.read()
		t = time.time() - self.time_init
		c = self.cycle
		self.cycle = self.cycle + 1
		return gyro, accel, mag, t, c

	def read_angles(self):
		gyro = self.gyro.angles()
		accel = self.accel.angles()
		mag = self.mag.heading()

		t = time.time() - self.time_init
		c = self.cycle
		self.cycle = self.cycle + 1
		return gyro, accel, mag, t, c
	
	def comp_filter(self):
		self.setTimeRef()

		gyro = self.gyro.angles()
		accel = self.accel.angles()
		mag = self.mag.heading()

		t = self.getTimeEleapsed()

		self.inertial[0] += 0.96* ( (self.inertial[0] +  gyro[0]) *  t ) + 0.04*accel[0]
		self.inertial[1] += 0.96* ( (self.inertial[1] +  gyro[1]) *  t ) + 0.04*accel[1]
		self.inertial[2] += 0.96* ( (self.inertial[2] +  gyro[2]) *  t ) + 0.04*accel[2]

		t = time.time() - self.time_init
		c = self.cycle
		self.cycle = self.cycle + 1

		return gyro, accel, mag, t, c, self.inertial

	def config_MPU(self):
		samp_rate_div = 0 # sample rate = 8 kHz/(1+samp_rate_div)
		bus.write_byte_data(MPU6050_ADDR, SMPLRT_DIV, samp_rate_div)
		time.sleep(0.1)
		# reset all sensors
		bus.write_byte_data(MPU6050_ADDR,PWR_MGMT_1,0x00)
		time.sleep(0.1)
		# power management and crystal settings
		bus.write_byte_data(MPU6050_ADDR, PWR_MGMT_1, 0x01)
		time.sleep(0.1)
		#Write to Configuration register
		bus.write_byte_data(MPU6050_ADDR, CONFIG, 0)
		time.sleep(0.1)
		#Write to Gyro configuration register
		gyro_config_sel = [0b00000,0b010000,0b10000,0b11000] # byte registers
		gyro_config_vals = [250.0,500.0,1000.0,2000.0] # degrees/sec
		gyro_indx = 0
		bus.write_byte_data(MPU6050_ADDR, GYRO_CONFIG, int(gyro_config_sel[gyro_indx]))
		time.sleep(0.1)
		#Write to Accel configuration register
		accel_config_sel = [0b00000,0b01000,0b10000,0b11000] # byte registers
		accel_config_vals = [2.0,4.0,8.0,16.0] # g (g = 9.81 m/s^2)
		accel_indx = 0                            
		bus.write_byte_data(MPU6050_ADDR, ACCEL_CONFIG, int(accel_config_sel[accel_indx]))
		time.sleep(0.1)
		# interrupt register (related to overflow of data [FIFO])
		bus.write_byte_data(MPU6050_ADDR, INT_ENABLE, 1)
		time.sleep(0.1)
	
	def config_AK(self):
		bus.write_byte_data(AK8963_ADDR,AK8963_CNTL,0x00)
		time.sleep(0.1)
		AK8963_bit_res = 0b0001 # 0b0001 = 16-bit
		AK8963_samp_rate = 0b0110 # 0b0010 = 8 Hz, 0b0110 = 100 Hz
		AK8963_mode = (AK8963_bit_res <<4)+AK8963_samp_rate # bit conversion
		bus.write_byte_data(AK8963_ADDR,AK8963_CNTL,AK8963_mode)
		time.sleep(0.1)