//-------------------------------------------------------
function compareCoords(c1,c2) {
    let v1 = Object.values(c1);
    let v2 = Object.values(c2);
    
    if(v1[0] === v2[0]) {
        if(v1[1] === v2[1]) return true;
    }
    return false;
}
//-------------------------------------------------------
function copyCoords(r) {
    let kr = Object.keys(r);
    if (kr[0] === "x") {
        return {x : r.x, y : r.y};
    }
    else if (kr[0] === "nx") {
        return {x : r.nx, y : r.ny};
    }
    else return false;
}
//-------------------------------------------------------
function addCoords(c1,c2) {
    let k1 = Object.keys(c1);
    let k2 = Object.keys(c2);
    if (k1[0] === "x" &&  k2[0] === "x") {        
        return {x : c1.x + c2.x, y : c1.y + c2.y};
    }
    else if (k1[0] === "nx" &&  k2[0] === "nx") {
        return {x : c1.nx + c2.nx, y : c1.ny + c2.ny};
    }
    else return false;
}

//-------------------------------------------------------
function subCoords(c1,c2) {
    let k1 = Object.keys(c1);
    let k2 = Object.keys(c2);
    if (k1[0] === "x" &&  k2[0] === "x") {        
        return {x : c1.x - c2.x, y : c1.y - c2.y};
    }
    else if (k1[0] === "nx" &&  k2[0] === "nx") {
        return {x : c1.nx - c2.nx, y : c1.ny - c2.ny};
    }
    else return false;
}
//-------------------------------------------------------
function maxNumber(...args){
    let max = args[0];
    for(let i = 1; i < args.length; i++){  
        if (args[i]>max) max=args[i];
    }
    return max;             
}
function minNumber(...args){
    let min = args[0];
    for(let i = 1; i < args.length; i++){  
        if (args[i]<min) min=args[i];
    }
    return min;               
}
//-------------------------------------------------------  
function sortCoordsByDirection(direction, arr){
    if(direction == "Horizontal"){
        arr.sort(function (a, b) {
            return a.x - b.x;
          });
    }
    if(direction == "Vertical"){
        arr.sort(function (a, b) {
            return a.y - b.y;
          });
    }
    return arr;
}
//-------------------------------------------------------
function multiplyMatrixAB(A,B){
    //A,B - массивы, вида(a0,а1,а2,а3)
    //умножение матриц размера 2*2 вида (а0 а2) на  (в0 в2)
    //                                  (а1 а3)     (в1 в3)
    let C = [   A[0]*B[0]+A[2]*B[1],
                A[1]*B[0]+A[3]*B[1],
                A[0]*B[2]+A[2]*B[3],
                A[1]*B[2]+A[3]*B[3] ];
    return C;
}
//-------------------------------------------------------

function rotateAroundPoint(a,b,C){
    //a,b - координаты, вида(a{x,y},b{x,y})
    //a - точка вращаемая, b - точка центра вращения
    //C - массив, вида(a0,а1,а2,а3)
    //вычисление координат а'=(a-b)*C-(a-b)
    let delta = {x:a.x-b.x, y:a.y-b.y};
    let point = {   x:delta.x*C[0]+delta.y*C[1]+b.x,
                    y:delta.x*C[2]+delta.y*C[3]+b.y};  
    return point;
}
//------------------------------------------------------- 
//находит центр из двух крайних точек массива args 
function centerArray(...args){
    let min = minNumber(...args);
    let max = maxNumber(...args);
    
    return (min+max)/2;               
}
//------------------------------------------------------- 
function matrixTransformIntoArray(transform, numberArgs = 4){
    let buff = transform.slice(7,-1);
    return buff.split(" ", numberArgs).map(Number);
}
//------------------------------------------------------- 
function matrixDirection(matrixArr){
    let matrixBuff = matrixTransformIntoArray(matrixArr, 4);
    let matrix = matrixBuff.join("");
    switch(matrix) {
        case '1001':  // 0 градусов
            return 0;
      
        case '01-10':  // 90 градусов
            return 90;
        
        case '-100-1':  // 90 градусов
            return 180;

        case '0-110':  // 90 градусов
            return 270;
        default:
            return "undefinedGrad";
      }
} 
//-------------------------------------------------------  
function degToMatrix(deg){
    switch(deg) {
        case 0:  // 0 градусов
            return [1,0,0,1];
      
        case -270:
        case 90:  // 90 градусов
            return [0,1,-1,0];
        
        case -180:
        case 180:  // 180 градусов
            return [-1,0,0,-1];

        case -90:
        case 270:  // 270 градусов
            return [0,-1,1,0];
        default:
            return "undefinedGrad";
      }
} 
//-------------------------------------------------------  
function getPosition(e) {
    var posx = 0;
    var posy = 0;
  
    if (!e) var e = window.event;
  
    if (e.pageX || e.pageY) {
      posx = e.pageX;
      posy = e.pageY;
    } else if (e.clientX || e.clientY) {
      posx = e.clientX + document.body.scrollLeft + 
                         document.documentElement.scrollLeft;
      posy = e.clientY + document.body.scrollTop + 
                         document.documentElement.scrollTop;
    }
  
    return {
      x: posx,
      y: posy
    }
}

  //-------------------------------------------------------
function addInfoToSideMenu(value){
    console.log("rightSideMenu1:",rightSideMenu1);
    while (rightSideMenu1.firstChild) {
        rightSideMenu1.removeChild(rightSideMenu1.firstChild);
    }
    let params = value.electricParameters;
    console.log("valueSideMenu:",value);

    let div = document.createElement("div");
    let h6 = document.createElement("h6");
    h6.setAttribute("class","left-align");
    h6.innerHTML = value.id;
    div.appendChild(h6);
    rightSideMenu1.appendChild(div); 
    // console.log("params:",typeof(params));
    // rightSideMenu1.setAttribute("size",edges.length);
    for (var elem in params){
        // console.log("params0:",elem);
        let div = document.createElement("div");
        div.setAttribute("class","input-field col");

        let input = document.createElement("input");
        input.setAttribute("value",params[elem]);
        input.setAttribute("id",elem);
        input.setAttribute("type","text");
        input.setAttribute("idElement",value.id);
        // tempOption.innerHTML = edges[i].typeRLC + ' ' + edges[i].edgeNum;

        let label = document.createElement("label");
        label.innerHTML = elem;
        label.setAttribute("for",elem);
        // console.log("tempOption:",tempOption);
        div.appendChild(input);
        div.appendChild(label);
        
        rightSideMenu1.appendChild(div);  
        input.onchange = function(evt) {
                evt.preventDefault();
                // Измените значение textContent на следующей строке
                // message.textContent = email.value;
                // document.getElementById("input-id").value;
                // console.log("input.onsubmit");
                // elem.tratata = "123";
                let obj = objectKeeper.objectMap.get(input.getAttribute("idElement"));
                let id = input.id;
                let val = input.value;
                console.log("inputObjДО", obj);
                obj.electricParameters[id] = val
                console.log("inputObjПОСЛЕ", obj);
                console.log("input.value",input.value);
                
                // console.log(evt);
              };
    };
    // rightSideMenu1.onsubmit = function(evt) {
    //     evt.preventDefault();
    //     // Измените значение textContent на следующей строке
    //     // message.textContent = email.value;
    //     console.log("rightSideMenu1.onsubmit");
    //   };
    // M.AutoInit();
    M.updateTextFields();
    // console.log("edgeSelector:",edgeSelector);

    console.log("addInfoToSideMenu",value);
}
