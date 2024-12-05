const colors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFA500','#800080', '#00FFFF', '#808080', '#FFC0CB', '#A52A2A'  
];

let painting = false;
var tool=getSelectedTool();
let X=-1,Y=-1;
let mx=0,my=0;
let fill='no';
let previousBackgroundColor='white';
let actualBackgroundColor='white';
let shapes=[];
let selectedShapes=[];


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

  const canvasShapes=document.createElement('canvas');
  const contextShapes=canvasShapes.getContext('2d');
  canvasShapes.width=canvas.width;
  canvasShapes.height=canvas.height;

  const canvasBackground=document.createElement('canvas');
  const contextBackground=canvasBackground.getContext('2d');
  canvasBackground.width=canvas.width;
  canvasBackground.height=canvas.height;

  contextBackground.fillStyle = 'white';
  contextBackground.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(canvasBackground,0,0);

  const shapeList=document.querySelector('#shape-list');

  
  let brushColor= document.querySelector("#colorInput");
  let brushSize= document.querySelector("#brushSize");
  let backgroundColor=document.querySelector("#backgroundColorInput");

  const colorblocks=document.querySelectorAll(".color-block");
  colorblocks.forEach((block,index)=>{
    block.style.backgroundColor=colors[index]
    block.addEventListener("click",()=>{
      brushColor.value=colors[index];
    })
  })

  backgroundColor.addEventListener('input',()=>{
    contextBackground.fillStyle=backgroundColor.value;
    contextBackground.fillRect(0,0,canvas.width,canvas.height);

    context.drawImage(canvasBackground,0,0);
    context.drawImage(canvasShapes,0,0);
    context.drawImage(canvasDesen,0,0);
  })


  const saveLink=document.querySelector("#save");
  saveLink.addEventListener('click',()=>{
    saveLink.download='imagine.png';
    saveLink.href=canvas.toDataURL('imagine.png');
    saveLink.click;
  })


  canvas.addEventListener("mousedown",e=>{
    shapes.forEach(shape=>{
      if(shape.selected==true){
        shape.selected=false;
      }
    })
    drawAllShapes(); // Pentru a deselecta toate formele selectate

    if(tool==='brush'){
      painting=true;
      contextDesen.moveTo(mx,my); //Ca sa nu uneasca inceputul de linie cu urmatorul punct desenat cu brush-ul 
      draw(e);
    }
    else{
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
    else if(tool=='selection' && X>=0 && Y>=0){
      drawPreviewSelection();
    }
  });

  canvas.addEventListener("mouseup",(e)=>{
    if(tool==='brush'){
      painting=false;
      contextDesen.beginPath();
    }
    if(X+Y<0) return; //  Daca facem doar mouseup pe canvas se va considera punctul de start (-1;-1) 
    else if(tool==='line'){
      contextShapes.beginPath();
      contextShapes.moveTo(X,Y);
      contextShapes.lineTo(mx,my);
      contextShapes.lineWidth=brushSize.value;
      contextShapes.strokeStyle=brushColor.value;
      contextShapes.stroke();
      contextShapes.closePath();

      contextShapes.setLineDash([]);
      contextShapes.stroke();
      contextShapes.closePath();

      shapes.push({
        id:shapes.length+1,
        type:'line',
        selected:false,
        xStart:X,
        yStart:Y,
        xFinish:mx,
        yFinish:my,
        lineWidth:brushSize.value,
        strokeStyle:brushColor.value,
      })


    }
    else if(tool==='rectangle'){      
      if(fill==='yes'){
        contextShapes.fillStyle = brushColor.value;
        contextShapes.fillRect(Math.min(X,mx),Math.min(Y,my),Math.max(X,mx)-Math.min(X,mx),Math.max(Y,my)-Math.min(Y,my))
      }
      else{
        contextShapes.strokeStyle=brushColor.value;
        contextShapes.lineWidth=brushSize.value;
        contextShapes.strokeRect(Math.min(X,mx),Math.min(Y,my),Math.max(X,mx)-Math.min(X,mx),Math.max(Y,my)-Math.min(Y,my))
      }

      shapes.push({
        id:shapes.length+1,
        type:'rectangle',
        selected:false,
        fill:fill,
        x: Math.min(X,mx),
        y: Math.min(Y,my),
        width:Math.max(X,mx)-Math.min(X,mx),
        height:Math.max(Y,my)-Math.min(Y,my),
        strokeStyle:brushColor.value,
        fillStyle:brushColor.value,
        lineWidth:brushSize.value,
        strokeStyle:brushColor.value,
      })
    }
    else if(tool==='elipse'){
      contextShapes.beginPath();
      contextShapes.ellipse(
        (X+mx)/2,
        (Y+my)/2,
        (Math.max(X,mx)-Math.min(X,mx))/2,
        (Math.max(Y,my)-Math.min(Y,my))/2,
        0,
        0,
        Math.PI * 2
      )
      

      if(fill==='yes'){
        contextShapes.fillStyle=brushColor.value;
        contextShapes.fill();
      }
      else{
        contextShapes.setLineDash([])
        contextShapes.strokeStyle=brushColor.value;
        contextShapes.lineWidth=brushSize.value;
        contextShapes.stroke();
      }
      contextShapes.beginPath();

      shapes.push({
        id:shapes.length+1,
        type:'elipse',
        selected:false,
        fill:fill,
        xCenter:(X+mx)/2,
        yCenter:(Y+my)/2,
        radiusX:(Math.max(X,mx)-Math.min(X,mx))/2,
        radiusY:(Math.max(Y,my)-Math.min(Y,my))/2,
        fillStyle:brushColor.value,
        strokeStyle:brushColor.value,
        lineWidth:brushSize.value,
      })
    }
    else if(tool==='selection'){
      console.log(X,Y,mx,my);

      shapes.forEach(shape=>{
        switch (shape.type){
          case 'line':
            if(
              shape.xStart>=X && shape.xFinish<=mx &&
              shape.yStart>=Y && shape.yFinish<=my
            ){
              shape.selected=true;
              drawAllShapes();
            }
            break;
          case 'rectangle':
            if(
              shape.x>=X && shape.x+shape.width<=mx &&
              shape.y>=Y && shape.y+shape.height<my
            ){
              shape.selected=true;
              drawAllShapes();
            }
            break;
        }
      })
    }

    context.drawImage(canvasBackground,0,0);
    context.drawImage(canvasShapes,0,0);
    context.drawImage(canvasDesen,0,0);
    X=-1;
    Y=-1;

    if(tool!='brush' && tool!='selection'){
      const shape=shapes[shapes.length-1];
      addShapeInList(shape);
    }

  })

  function draw(e){
    if(!painting) return;
  
    contextDesen.lineWidth=brushSize.value;
    contextDesen.lineCap='round';
    contextDesen.strokeStyle=brushColor.value;
    
    contextDesen.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    contextDesen.stroke();
    contextDesen.beginPath();
    contextDesen.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);

    context.drawImage(canvasDesen,0,0);
  }

  function drawPreviewLine(){
    context.clearRect(0,0,canvas.width,canvas.height);
    context.drawImage(canvasBackground,0,0);
    context.drawImage(canvasShapes,0,0);
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
    context.drawImage(canvasBackground,0,0);
    context.drawImage(canvasShapes,0,0);
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
    context.drawImage(canvasBackground,0,0);
    context.drawImage(canvasShapes,0,0);
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

  function drawPreviewSelection(){
    context.clearRect(0,0,canvas.width,canvas.height);
    context.drawImage(canvasBackground,0,0);
    context.drawImage(canvasShapes,0,0);
    context.drawImage(canvasDesen,0,0);

    context.lineWidth= 2;
    context.strokeStyle='lightblue';
    context.setLineDash([5, 5])

    context.strokeRect(Math.min(X,mx),Math.min(Y,my),Math.max(X,mx)-Math.min(X,mx),Math.max(Y,my)-Math.min(Y,my))
  }

  const btnTest=document.querySelector("#testButton");
  btnTest.addEventListener('click',drawAllShapes);

  function drawAllShapes(){
    context.clearRect(0,0,canvas.width,canvas.height);
    contextShapes.clearRect(0,0,canvas.width,canvas.height);
    shapes.forEach(shape=>{
      if(shape.type==='line'){
        contextShapes.beginPath();
        contextShapes.moveTo(shape.xStart,shape.yStart);
        contextShapes.lineTo(shape.xFinish,shape.yFinish);
        contextShapes.lineWidth=shape.lineWidth;
        contextShapes.strokeStyle=shape.strokeStyle;
        if(shape.selected==true){
          contextShapes.strokeStyle="red";
        }
        contextShapes.stroke();
        contextShapes.closePath();

        contextShapes.setLineDash([]);
        contextShapes.stroke();
        contextShapes.closePath();
      }
      else if(shape.type==='rectangle'){
        if(shape.fill==='yes'){
          contextShapes.fillStyle = shape.fillStyle;
          if(shape.selected==true){
            contextShapes.fillStyle="red";
          }
          contextShapes.fillRect(shape.x,shape.y,shape.width,shape.height);
        }
        else{
          contextShapes.strokeStyle=shape.strokeStyle;
          contextShapes.lineWidth=shape.lineWidth;
          if(shape.selected==true){
            contextShapes.strokeStyle="red";
          }
          contextShapes.strokeRect(shape.x,shape.y,shape.width,shape.height);
        }
      }
      else if(shape.type==='elipse'){
        contextShapes.beginPath();
        contextShapes.ellipse(
          shape.xCenter,
          shape.yCenter,
          shape.radiusX,
          shape.radiusY,
          0,
          0,
          Math.PI * 2
        )
        
  
        if(shape.fill==='yes'){
          contextShapes.fillStyle=shape.fillStyle;
          if(shape.selected==true){
            contextShapes.fillStyle="red";
          }
          contextShapes.fill();
        }
        else{
          contextShapes.setLineDash([])
          contextShapes.strokeStyle=shape.strokeStyle;
          contextShapes.lineWidth=shape.lineWidth;
          if(shape.selected==true){
            contextShapes.strokeStyle="red";
          }
          contextShapes.stroke();
        }
        contextShapes.beginPath();
      }
    })


    context.drawImage(canvasBackground,0,0);
    context.drawImage(canvasShapes,0,0);
    context.drawImage(canvasDesen,0,0);
    X=-1;
    Y=-1;
  }
  function addShapeInList(shape){
    const container=document.createElement('div');
    const buttonRemove=document.createElement('button');
  
    container.innerText=shape.type + shape.id;
    buttonRemove.innerText="❌";
    container.append(buttonRemove);
    shapeList.append(container);

    container.classList.add("shape-list-container");
    container.style.color=shape.strokeStyle;
  
    buttonRemove.addEventListener('click',()=>{
      index=shapes.findIndex(s=>s.id===shape.id);
      shapes.splice(index,1);
      drawAllShapes();
      container.remove();
    })
  }
  function rewriteShapeList(){
    shapeList.innerHTML='';
    shapes.forEach(shape=>{
      const container=document.createElement('div');
      const buttonRemove=document.createElement('button');
    
      container.innerText=shape.type + shape.id;
      buttonRemove.innerText="❌";
      container.append(buttonRemove);
      shapeList.append(container);

      container.classList.add("shape-list-container");
      container.style.color=shape.strokeStyle;
    
      buttonRemove.addEventListener('click',()=>{
        index=shapes.findIndex(s=>s.id===shape.id);
        shapes.splice(index,1);
        drawAllShapes();
        container.remove();
      })
    })
  }

  document.addEventListener('keydown',(e)=>{
    if(e.key==='Delete'){
      for(let index=0;index<shapes.length;index++){
        if(shapes[index].selected==true){
          shapes.splice(index,1);
          index--;
        }
      }
      drawAllShapes();
      rewriteShapeList();
    }
  })
  
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



document.addEventListener("DOMContentLoaded",app)