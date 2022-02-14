let drawing = false;
let context, student, openRequest, db;
let prevEvent, currentEvent, speed;
let movementXP, movementYP, movementP, speedP, maxSpeedP, accelerationP, maxPositiveAccelerationP, maxNegativeAccelerationP;
let camera_stream = null;
let media_recorder = null;
let blobs_recorded = [];
let maxSpeed =0,prevSpeed=0,maxPositiveAcc=0,maxNegativeAcc=0, clientX, clientY, transaction, store, canvas, fileName, color;

async function getCameraStream() {
    try {
        camera_stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
    } catch (error) {
        alert(error.message);
    }
}

window.onload=function()
{
    camera_stream = getCameraStream();
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
    canvas = document.getElementById('myCanvas');
    context = canvas.getContext("2d");
    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight-60;

    //Style line
    color = "yellow";
    context.strokeStyle = color;
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
        context.clearRect(0,0, context.canvas.width, context.canvas.height);
        drawBackground();
    }, false);

    //Back Button
    document.getElementById('btnBack').addEventListener('click', function(){
        canvas.style.display = "block";
        document.getElementById('saveArea').style.display = "none";
        document.getElementById('tools').style.display = "block";

    }, false);

    document.getElementById('btn-group').addEventListener('click', ev => changeColor(ev), false);
    document.getElementById('btnStart').addEventListener('click', startProcess, false);
    document.getElementById('btnEnd').addEventListener('click', endProcess, false);
    drawBackground();
}//onLoad

function changeColor(e) {
    switch (e.target.getAttribute('data-element')) {
        case 'red':
            console.log('red');
            color = 'red';
            context.strokeStyle = color;
            document.getElementById('cursor').style.backgroundColor = 'red';
            break;
        case 'yellow':
            console.log('yellow');
            color = 'yellow';
            context.strokeStyle = color;
            document.getElementById('cursor').style.backgroundColor = 'yellow';
            break;
        case 'blue':
            console.log('blue');
            color = 'blue';
            context.strokeStyle = color;
            document.getElementById('cursor').style.backgroundColor = 'blue';
            break;
    }
}

function drawBackground() {
    let y = 200;

    context.strokeStyle = 'yellow';
    context.beginPath();
    context.ellipse(context.canvas.width/2, context.canvas.height/2+50, 200, 200/2-50,  Math.PI, 0, 2 * Math.PI);
    context.stroke();

    context.strokeStyle = 'blue';
    context.beginPath();
    context.ellipse(context.canvas.width/2, context.canvas.height/2+y, 300, y/2-20,  Math.PI, 0, 2 * Math.PI);
    context.stroke();

    context.strokeStyle = 'red';
    context.beginPath();
    context.ellipse(context.canvas.width/2, context.canvas.height/2-110, 100, 80,  Math.PI*.5, 0, 2 * Math.PI);
    context.stroke();
    context.strokeStyle = color;
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
    transaction = db.transaction(["students"],"readwrite");
    store = transaction.objectStore("students");
    let request = store.add(person);
}

function handleDown(e) {
    if (e.buttons==1){
        drawing = true;
        context.moveTo(e.clientX, e.clientY);
        context.beginPath();
    }
}

function handleUp() {
    drawing = false;
}

function startProcess() {
    $('#modal').modal('hide')
    //Mouse movement
    document.onmousemove = handleMouseMove;
    document.onmousedown = handleDown;
    document.onmouseup   = handleUp;
    document.getElementById('btnEnd').disabled = false;
    document.getElementById('btnBegan').disabled = true;
    startRec();
}

function endProcess() {
    document.onmousemove = null;
    document.onmousedown = null;
    document.onmouseup   = null;
    fileName = student + ' ' + new Date();
    media_recorder.stop();
    let transaction = db.transaction(["students"],"readwrite");
    let store = transaction.objectStore("students");
    let index = store.index("name");
    let request = index.getAll(student);
    request.onsuccess = function(e) {
        let text = [];
        text.push('created' + ';' + 'name' + ';' + 'drawing' + ';');
        for(let name in e.target.result[0].mouseData) {
            text.push(name);
            text.push(';')
        }
        text.push('\n')

        function transformDate(created) {
            let tzoffset = created.getTimezoneOffset() * 60000; //offset in milliseconds
            return (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
        }

        for (const item of e.target.result) {
            text.push(transformDate(item.created) + ';' + item.name + ';' + item.drawing + ';');

            for(let name in item.mouseData) {
                text.push(item.mouseData[name]);
                text.push(';')
            }

            text.push('\n')
        }
        let blob = new Blob([text.join("")], { type: "text/plain;charset=utf-8" });
        saveAs(blob, fileName +'.txt');

        canvas.toBlob((blob) => {
            console.log('save png')
            saveAs(blob, fileName +".png");
        });
        document.getElementById('btnEnd').disabled = true;
        document.getElementById('btnBegan').disabled = false;
    }
}

function startRec() {
    // set MIME type of recording as video/webm
    media_recorder = new MediaRecorder(camera_stream, { mimeType: 'video/webm' });
    // event : new recorded video blob available
    media_recorder.addEventListener('dataavailable', function(e) {
        blobs_recorded.push(e.data);
    });

    media_recorder.addEventListener('stop', function() {
        // create local object URL from the recorded video blobs
        let blob = new Blob(blobs_recorded, { type: 'video/webm' });
        saveAs(blob, fileName +'.webm');
    });
    media_recorder.start(1000);
}


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
        clientX:clientX,
        clientY:clientY,
        movementXP:movementXP,
        movementYP:movementYP,
        movementP:movementP,
        speedP:speedP,
        maxSpeedP:maxSpeedP,
        accelerationP:accelerationP,
        maxPositiveAccelerationP:maxPositiveAccelerationP,
        maxNegativeAccelerationP:maxNegativeAccelerationP
    }
}

setInterval(function(){
    calcMouseData();
},100);