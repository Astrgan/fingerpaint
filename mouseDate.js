let prevEvent, currentEvent, speed;
let movementXP, movementYP, movementP, speedP, maxSpeedP, accelerationP, maxPositiveAccelerationP, maxNegativeAccelerationP;
document.documentElement.onmousemove=function(event){
    currentEvent=event;
}

let maxSpeed=0,prevSpeed=0,maxPositiveAcc=0,maxNegativeAcc=0;
setInterval(function(){
    if(prevEvent && currentEvent){
        let movementX=Math.abs(currentEvent.screenX-prevEvent.screenX);
        let movementY=Math.abs(currentEvent.screenY-prevEvent.screenY);
        let movement=Math.sqrt(movementX*movementX+movementY*movementY);

        movementXP=movementX;
        movementYP=movementY;
        movementP=Math.round(movement);

        //speed=movement/100ms= movement/0.1s= 10*movement/s
        speed=10*movement;//current speed

        speedP=Math.round(speed);
        maxSpeedP=Math.round(speed>maxSpeed?(maxSpeed=speed):maxSpeed);

        let acceleration=10*(speed-prevSpeed);

        accelerationP=Math.round(acceleration);

        if(acceleration>0){
            maxPositiveAccelerationP=Math.round(acceleration>maxPositiveAcc?(maxPositiveAcc=acceleration):maxPositiveAcc);
        }
        else{
            maxNegativeAccelerationP=Math.round(acceleration<maxNegativeAcc?(maxNegativeAcc=acceleration):maxNegativeAcc);
        }
    }
    // console.log(movementXP, movementYP, movementP, speedP, maxSpeedP, accelerationP, maxPositiveAccelerationP, maxNegativeAccelerationP)
    prevEvent=currentEvent;
    prevSpeed=speed;
},100);