main:
	gcc main.cpp mpu.cpp -lstdc++ -lwiringPi -lpthread  -o exec -lm 
	# gcc main.cpp mpu.cpp -lstdc++ -lwiringPi -o exec
	./exec

servo:
	gcc servo.cpp -lstdc++ -lwiringPi -lpthread -o exec -lm
	./exec

gyro:
	gcc gyro.cpp -lstdc++ -lwiringPi -lpthread -o exec -lm
	./exec

test:
	gcc test.cpp -lstdc++ -o test -lm
	./test
	rm test

clean: 
	rm exec