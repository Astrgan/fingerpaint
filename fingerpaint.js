let drawing = false;
let context, student, openRequest, db;

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

    //Mouse movement
    document.onmousemove = handleMouseMove;
    document.onmousedown = handleDown;
    document.onmouseup = handleUp;

    //Style line
    context.strokeStyle = "yellow";
    context.lineJoin = "round";
    let radPoint = 18;
    context.lineWidth = radPoint;

    //Hide Save Area
    document.getElementById('saveArea').style.display = "none";
    document.getElementById('dropdown-menu').addEventListener('click', function (e) {
        student = e.target.textContent;
        document.getElementById('btnGroupDrop').innerText = student;
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
    let clientX = e.clientX+10;
    let clientY = e.clientY+10;
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
}

function handleDown(e) {
    drawing = !drawing;
    context.moveTo(e.clientX, e.clientY);
    context.beginPath();
}

function handleUp() {
    drawing = !drawing;
}

function startProcess() {
    console.log('startProcess')
    let transaction = db.transaction(["students"],"readwrite");
    let store = transaction.objectStore("students");

    let person = {
        name:student,
        created:new Date()
    }
    let request = store.add(person);
}

function endProcess() {
    let transaction = db.transaction(["students"],"readwrite");
    let store = transaction.objectStore("students");
    let request = store.getAll();
    request.onsuccess = function(e) {
        console.log(e.target.result);
    }

    let index = store.index("name");
    request = index.getAll(student);
    request.onsuccess = function(e) {
        console.log(e.target.result);
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
