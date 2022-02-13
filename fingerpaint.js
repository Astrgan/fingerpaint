let drawing = false;
let context, student, openRequest, db;
let prevEvent, currentEvent, speed;
let movementXP, movementYP, movementP, speedP, maxSpeedP, accelerationP, maxPositiveAccelerationP, maxNegativeAccelerationP;

let maxSpeed =0,prevSpeed=0,maxPositiveAcc=0,maxNegativeAcc=0, clientX, clientY, transaction, store;

window.onload=function()
{
    openRequest = indexedDB.open("DBStudents",3);
    openRequest.onupgradeneeded = function(e) {
        console.log("DB - Upgrading...");
        let thisDB = e.target.result;
        if (!thisDB.objectStoreNames.contains("students")) {
            let objectStore = thisDB.createObjectStore("students", {keyPath: "id", autoIncrement: true});
            objectStore.createIndex("name","name", {unique:false});
            objectStore.createIndex("created","created", {unique:false});
        }
    }
    openRequest.onsuccess = function(e) {
        console.log("DB - Success!");
        db = e.target.result;
    }
    openRequest.onerror = function(e) {
        console.log("DB - Error");
        console.dir(e);
    }

    //Size Canvas
    context = document.getElementById('myCanvas').getContext("2d");
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight-60;

    //Style line
    context.strokeStyle = "yellow";
    context.lineJoin = "round";
    let radPoint = 18;
    context.lineWidth = radPoint;
    student = ((document.getElementById('dropdown-menu').children)[0]).children[0].innerHTML;
    document.getElementById('btnGroupDrop').innerText = student;
    document.getElementById('exampleModalLabel').innerText = student;

    //Hide Save Area
    document.getElementById('saveArea').style.display = "none";
    document.getElementById('dropdown-menu').addEventListener('click', function (e) {
        student = e.target.textContent;
        document.getElementById('btnGroupDrop').innerText = student;
        document.getElementById('exampleModalLabel').innerText = student;
    });
    document.getElementById('btnClear').addEventListener('click', function(){
        console.log("btnClear")
        context.clearRect(0,0, context.canvas.width, context.canvas.height);
        drawBackground();
    }, false);
    
    //Back Button
    document.getElementById('btnBack').addEventListener('click', function(){
            document.getElementById('myCanvas').style.display = "block";
            document.getElementById('saveArea').style.display = "none";
            document.getElementById('tools').style.display = "block";
            
        }, false);

    document.getElementById('btn-group').addEventListener('click', ev => changeColor(ev), false);
    document.getElementById('btnStart').addEventListener('click', startProcess, false);
    document.getElementById('btnEnd').addEventListener('click', endProcess, false);
    /*
        //Save
       /* document.getElementById('btnSave').addEventListener('click', function(){
                document.getElementById('myCanvas').style.display = "none";
                document.getElementById('saveArea').style.display = "block";
                document.getElementById('tools').style.display = "none";

                var dataURL = document.getElementById('myCanvas').toDataURL();
                document.getElementById('canvasImg').src = dataURL;
            }, false);*/
    drawBackground();
}//onLoad

function changeColor(e) {
    switch (e.target.getAttribute('data-element')) {
        case 'red':
            console.log('red');
            context.strokeStyle = 'red';
            document.getElementById('cursor').style.backgroundColor = 'red';
            break;
        case 'yellow':
            console.log('yellow');
            context.strokeStyle = 'yellow';
            document.getElementById('cursor').style.backgroundColor = 'yellow';
            break;
        case 'blue':
            console.log('blue');
            context.strokeStyle = 'blue';
            document.getElementById('cursor').style.backgroundColor = 'blue';
            break;
    }
}

function drawBackground() {
    console.log('drawBackground');
    let background = new Image();
    background.src = "./img/duck.jpg";

    background.onload = function () {
        context.canvas.getContext("2d").drawImage(background, 0, 0);
    }
}

function handleMouseMove(e)
{
    // console.log(e.clientX);
    // console.log(e.clientY);
    currentEvent=e;
    clientX = e.clientX+10;
    clientY = e.clientY+10;
    if(drawing)
    {
        context.lineTo(clientX, clientY);
        context.closePath();
        context.stroke();
        context.moveTo(clientX, clientY);
    } else
    {
        context.moveTo(clientX, clientY);
    }

    let person = {
        created:new Date(),
        name:student,
        drawing:drawing,
        mouseData:getMouseData(),
    }
    console.log(person)
    transaction = db.transaction(["students"],"readwrite");
    store = transaction.objectStore("students");
    let request = store.add(person);
}

function handleDown(e) {
    if (e.buttons==1){
        drawing = !drawing;
        context.moveTo(e.clientX, e.clientY);
        context.beginPath();
    }
}

function handleUp() {
    console.log('handleUp');
    drawing = !drawing;
}

function startProcess() {
    console.log('startProcess')
    //Mouse movement
    document.onmousemove = handleMouseMove;
    document.onmousedown = handleDown;
    document.onmouseup   = handleUp;
}

function endProcess() {
    document.onmousemove = null;
    document.onmousedown = null;
    document.onmouseup   = null;

    let transaction = db.transaction(["students"],"readwrite");
    let store = transaction.objectStore("students");
    // let request = store.getAll();
    // request.onsuccess = function(e) {
    //     console.log(e.target.result);
    // }

    let index = store.index("name");
    let request = index.getAll(student);
    request.onsuccess = function(e) {
        // console.log(e.target.result);
        let text = [];
        for (const item of e.target.result) {
            text.push(item);
            text.push('\n')
        }
        console.log(text.join(""));
        console.log(text.join(e.target.result));
        let blob = new Blob([text.join("")], { type: "text/plain;charset=utf-8" });
        saveAs(blob, student + new Date() +'.txt');


    }
}
/*

function startRec() {
    // set MIME type of recording as video/webm
    media_recorder = new MediaRecorder(camera_stream, { mimeType: 'video/webm' });

    // event : new recorded video blob available
    media_recorder.addEventListener('dataavailable', function(e) {
        blobs_recorded.push(e.data);
    }
}
*/

function calcMouseData() {
    if (prevEvent && currentEvent) {
        let movementX = Math.abs(currentEvent.screenX - prevEvent.screenX);
        let movementY = Math.abs(currentEvent.screenY - prevEvent.screenY);
        let movement = Math.sqrt(movementX * movementX + movementY * movementY);

        movementXP = movementX;
        movementYP = movementY;
        movementP = Math.round(movement);

        //speed=movement/100ms= movement/0.1s= 10*movement/s
        speed = 10 * movement;//current speed

        speedP = Math.round(speed);
        maxSpeedP = Math.round(speed > maxSpeed ? (maxSpeed = speed) : maxSpeed);

        let acceleration = 10 * (speed - prevSpeed);

        accelerationP = Math.round(acceleration);

        if (acceleration > 0) {
            maxPositiveAccelerationP = Math.round(acceleration > maxPositiveAcc ? (maxPositiveAcc = acceleration) : maxPositiveAcc);
        } else {
            maxNegativeAccelerationP = Math.round(acceleration < maxNegativeAcc ? (maxNegativeAcc = acceleration) : maxNegativeAcc);
        }
    }
    // console.log(movementXP, movementYP, movementP, speedP, maxSpeedP, accelerationP, maxPositiveAccelerationP, maxNegativeAccelerationP)
    prevEvent = currentEvent;
    prevSpeed = speed;

}

function getMouseData() {
    return mouseData = {
        movementXP:movementXP,
        movementYP:movementYP,
        movementP:movementP,
        speedP:speedP,
        maxSpeedP:maxSpeedP,
        accelerationP:accelerationP,
        maxPositiveAccelerationP:maxPositiveAccelerationP,
        maxNegativeAccelerationP:maxNegativeAccelerationP,
        clientX:clientX,
        clientY:clientY
    }
}

setInterval(function(){
    calcMouseData();
},100);
