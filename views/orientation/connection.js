const domain = (new URL(window.location.href));
const socket = io(domain.host);
let tics = 0;
let startTime = Date.now();


// THIS MUST COME FROM A CENTRAL SETTING POINT
const DISPLAY_INTEGRATED  =  'DISPLAY_INTEGRATED'

socket.on("connect", () => {
    socket.emit("ID", DISPLAY_INTEGRATED);
})

socket.on('py-data', (g,a,m,t,c,o) => {

    const gyro =    {x: parseFloat(o[0]), y:parseFloat(o[1]), z: parseFloat(o[2])}
    const accel =   {x: parseFloat(a[0]), y:parseFloat(a[1]), z: parseFloat(a[2])}
    const mag =     {x: parseFloat(m[0]), y:parseFloat(m[1]), z: parseFloat(m[2])}

    updateGyroDisplay(gyro);
    // updateAccelDisplay(accel);
    // updateMagDisplay(mag);

    updateHeading(m[3]);

    if(tics === 0) {
        gAxis.x = gyro.x;
        gAxis.y = gyro.y;
        gAxis.z = gyro.z;

        aAxis.x = accel.x;
        aAxis.y = accel.y;
        aAxis.z = accel.z;

        mAxis.x = mag.x;
        mAxis.y = mag.y;
        mAxis.z = mag.z;
    } else {

        gDelta.x = gAxis.x + gyro.x;
        gDelta.y = gAxis.y + gyro.y;
        gDelta.z = gAxis.z + gyro.z;

        aDelta.x = aAxis.x + accel.x;
        aDelta.y = aAxis.y + accel.y;
        aDelta.z = aAxis.z + accel.z;

        mDelta.x = mAxis.x + mag.x;
        mDelta.y = mAxis.y + mag.y;
        mDelta.z = mAxis.z + mag.z;
    }
    tics++
})
