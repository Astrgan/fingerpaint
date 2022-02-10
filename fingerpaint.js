let drawing = false;
let context, student;

function drawBackground() {
    let background = new Image();
    background.src = "./img/duck.jpg";

    background.onload = function () {
        context.canvas.getContext("2d").drawImage(background, 0, 0);
    }
}

window.onload=function()
{
    document.getElementById('btnClear').addEventListener('click', function(){
        context.clearRect(0,0, context.canvas.width, context.canvas.height);
        drawBackground();
    }, false);
    
    //Back Button
    document.getElementById('btnBack').addEventListener('click', function(){
            document.getElementById('myCanvas').style.display = "block";
            document.getElementById('saveArea').style.display = "none";
            document.getElementById('tools').style.display = "block";
            
        }, false);

    document.getElementById('btn-group').addEventListener('click', function (e) {
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
    }, false);

    /*
        //Save
       /* document.getElementById('btnSave').addEventListener('click', function(){
                document.getElementById('myCanvas').style.display = "none";
                document.getElementById('saveArea').style.display = "block";
                document.getElementById('tools').style.display = "none";

                var dataURL = document.getElementById('myCanvas').toDataURL();
                document.getElementById('canvasImg').src = dataURL;
            }, false);*/
    
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

    })



    drawBackground();
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

function handleDown(e)
{
    drawing = !drawing; 
    console.log(drawing);
    context.moveTo(e.clientX, e.clientY);
    context.beginPath();
    console.log('presMouse')
}

function handleUp()
{
    drawing = !drawing;
    console.log(drawing);
}