let painting = false;
var tool=getSelectedTool();
let X=-1,Y=-1;
let mx=0,my=0;
let fill='no';
let previousBackgroundColor='white';
let actualBackgroundColor='white';


function getSelectedTool(){
  const tools= document.querySelectorAll('.tool');
  for(const tool of tools){
    if(tool.classList.contains('selectedTool')){
      let res=tool.getAttribute('data-tool');
      return res;
    }
  }
  return null;
}

function app(){
  const canvas=document.querySelector('#canvas');
  const context=canvas.getContext('2d');

  const canvasDesen=document.createElement('canvas');
  const contextDesen=canvasDesen.getContext('2d');
  canvasDesen.width=canvas.width;
  canvasDesen.height=canvas.height;

  const canvasBackground=document.createElement('canvas');
  const contextBackground=canvasBackground.getContext('2d');
  canvasBackground.width=canvas.width;
  canvasBackground.height=canvas.height;

  contextBackground.fillStyle = 'white';
  contextBackground.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(canvasBackground,0,0);

  
  let brushColor= document.querySelector("#colorInput");
  let brushSize= document.querySelector("#brushSize");
  let backgroundColor=document.querySelector("#backgroundColor");

  backgroundColor.addEventListener('input',()=>{
    previousBackgroundColor=actualBackgroundColor;
    actualBackgroundColor=backgroundColor.value;

    changeBackground(previousBackgroundColor,actualBackgroundColor,context,canvas);
  })


  canvas.addEventListener("mousedown",e=>{
    if(tool==='brush'){
      painting=true;
      context.moveTo(mx,my); //Ca sa nu uneasca inceputul de linie cu urmatorul punct desenat cu brush-ul 
      draw(e);
    }
    else if(tool==="line"){
      X=e.clientX-canvas.offsetLeft;
      Y=e.clientY-canvas.offsetTop;
    }
    else if(tool==="rectangle"){
      X=e.clientX-canvas.offsetLeft;
      Y=e.clientY-canvas.offsetTop;
    }
    else if(tool==="elipse"){
      X=e.clientX-canvas.offsetLeft;
      Y=e.clientY-canvas.offsetTop;
    }
  })

  canvas.addEventListener("mousemove",e=>{
    mx=e.clientX-canvas.offsetLeft;
    my=e.clientY-canvas.offsetTop;

    if(tool==="brush"){
      draw(e);
    }
    else if(tool==="line" && X>=0 && Y>=0){
      drawPreviewLine();
    }
    else if(tool==="rectangle" && X>=0 && Y>=0){
      drawPreviewRectangle();
    }
    else if(tool==="elipse" && X>=0 && Y>=0){
      drawPreviewElipse();
    }
  });

  canvas.addEventListener("mouseup",()=>{
    if(tool==='brush'){
      painting=false;
      context.beginPath();

      contextDesen.drawImage(canvas,0,0);
    }
    else if(tool==='line'){
      context.beginPath();
      context.moveTo(X,Y);
      context.lineTo(mx,my);
      context.lineWidth=brushSize.value;
      context.strokeStyle=brushColor.value;
      context.stroke();
      context.closePath();

      context.setLineDash([]);
      context.stroke();
      context.closePath();

      contextDesen.drawImage(canvas,0,0);
      X=-1;
      Y=-1;
    }
    else if(tool==='rectangle'){
      context.clearRect(0, 0, canvas.width, canvas.height); // Conturul ramane vizibil asa ca refacem desenul fara conturul pentru preview
      context.drawImage(canvasDesen, 0, 0);                 //
      
      if(fill==='yes'){
        context.fillStyle = brushColor.value;
        context.fillRect(Math.min(X,mx),Math.min(Y,my),Math.max(X,mx)-Math.min(X,mx),Math.max(Y,my)-Math.min(Y,my))
      }
      else{
        context.strokeStyle=brushColor.value;
        context.lineWidth=brushSize.value;
        context.strokeRect(Math.min(X,mx),Math.min(Y,my),Math.max(X,mx)-Math.min(X,mx),Math.max(Y,my)-Math.min(Y,my))
      }
      

      contextDesen.drawImage(canvas,0,0);
      X=-1;
      Y=-1;
    }
    else if(tool==='elipse'){
      context.clearRect(0, 0, canvas.width, canvas.height); // Conturul ramane vizibil asa ca refacem desenul fara conturul pentru preview
      context.drawImage(canvasDesen, 0, 0);                 //

      context.beginPath();
      context.ellipse(
        (X+mx)/2,
        (Y+my)/2,
        (Math.max(X,mx)-Math.min(X,mx))/2,
        (Math.max(Y,my)-Math.min(Y,my))/2,
        0,
        0,
        Math.PI * 2
      )
      
      context.setLineDash([])
      context.fillStyle=brushColor.value;
      context.strokeStyle=brushColor.value;
      if(fill==='yes'){
        context.fill();
      }
      context.stroke();
      context.closePath();

      contextDesen.drawImage(canvas,0,0);
      X=-1;
      Y=-1;
    }
  })

  function draw(e){
    if(!painting) return;
  
    context.lineWidth=brushSize.value;
    context.lineCap='round';
    context.strokeStyle=brushColor.value;
    
    context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    context.stroke();
    context.beginPath();
    context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
  }

  function drawPreviewLine(){
    context.clearRect(0,0,canvas.width,canvas.height);
    context.drawImage(canvasDesen,0,0);

    context.beginPath();
    context.moveTo(X,Y);
    context.lineTo(mx, my);
    context.lineWidth = brushSize.value;
    context.strokeStyle = "lightgray";
    context.stroke();
    context.closePath();
  }

  function drawPreviewRectangle(){
    context.clearRect(0,0,canvas.width,canvas.height);
    context.drawImage(canvasDesen,0,0);

    if(fill==="yes"){
      context.lineWidth = 2;
    }
    else{
      context.lineWidth= brushSize.value;
    }
    
    context.strokeStyle = "lightgray";

    context.strokeRect(Math.min(X,mx),Math.min(Y,my),Math.max(X,mx)-Math.min(X,mx),Math.max(Y,my)-Math.min(Y,my))
  }

  function  drawPreviewElipse(){
    context.clearRect(0,0,canvas.width,canvas.height);
    context.drawImage(canvasDesen,0,0);

    context.lineWidth=2;
    context.strokeStyle="lightGray";
    context.setLineDash([5, 5])
    context.strokeRect(Math.min(X,mx),Math.min(Y,my),Math.max(X,mx)-Math.min(X,mx),Math.max(Y,my)-Math.min(Y,my))

    if(fill==="yes"){
      context.lineWidth=1;
    }
    else{
      context.lineWidth=brushSize.value;
    }
    context.beginPath();
    context.ellipse(
      (X+mx)/2,
      (Y+my)/2,
      (Math.max(X,mx)-Math.min(X,mx))/2,
      (Math.max(Y,my)-Math.min(Y,my))/2,
      0,
      0,
      Math.PI * 2
    )
    context.setLineDash([])
    context.stroke();
    context.closePath();
  }

}



function selectTool(e){
  document.querySelectorAll('.tool').forEach(tool=>{
    tool.classList.remove('selectedTool');
  })
  e.classList.add('selectedTool');

  tool=getSelectedTool();
}

function setFill(e){
  fill=e.value;
}

function changeBackground(previousBackgroundColor,actualBackgroundColor,context,canvas){
  const imageData= context.getImageData(0,0,canvas.width,canvas.height);
  const data=imageData.data;

  pcRGB=getBgColorRGB(previousBackgroundColor);
  ncRGB=getBgColorRGB(actualBackgroundColor);
    
  for (let i = 0; i < data.length; i+=4){
    const r=data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if(r===pcRGB.r && g===pcRGB.g && b===pcRGB.b){


      data[i]=ncRGB.r;
      data[i+1]=ncRGB.g;
      data[i+2]=ncRGB.b;
    }
  }

  context.putImageData(imageData, 0, 0);
}

function getBgColorRGB(color){
  const allBgColors = {
    white: { r: 255, g: 255, b: 255 },
    black: { r: 0, g: 0, b: 0 },
    red: { r: 255, g: 0, b: 0 },
    green: { r: 0, g: 255, b: 0 },
    blue: { r: 0, g: 0, b: 255 },
    gray: { r: 128, g: 128, b: 128 }
  };
  return allBgColors[color] || null;
}


document.addEventListener("DOMContentLoaded",app)