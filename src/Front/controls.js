
//controllers
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
var downPressed = false;
var mouseLeftPressed = false;
var mouseMidPressed = false;
var mouseBlocked = false; //блокировка мыши
var homePressed = false;
var endPressed = false;
var deletePressed = false;

//SVG objects
var svgDoc; //don't used
var svgFile; //svg 'mainSVG'
var svgStock; //dont used
var svgBack; //svg background


var YOBA;
var YOBA2;
var YOBAReady = false;
var eventListenerFlag = false;
var eventListenerFlagMove = false;
//_________________________
//Selection
var selectionStartCoords;
var mouseSelection = false;
var selectionIni = false;
var selectionRect = selectionMakeRect();
//_________________________
var chkCreateObject = false;
var objectKeeper;
//_________________________

var transformMatrix = [1,0,0,1,0,0];
var mySVGsToInject = document.querySelectorAll('img.inject-me');
var initMousePosition;

//rulez
var rulezVer, rulezHor;
//grid
var gridDistance = 150;
var gridDistanceSquare = gridDistance*gridDistance;
//line
var lineKeeper = null;
var svgLineConnect1 = 'undefined';
var svgLineConnect = 'undefined';
//var lineConnectStartCoords = {x:0, y:0};
var chkDoLine = false;

var mouseDocumentCoords = null;
var mouseFileCoords = null;
var mouseDrawCoords = null;


var objectPickMenu, objectPickMenu2; //svg menu with adding elements
// чтение и добавление SVG, EventListeners
SVGInjector(mySVGsToInject, null, function(){
    
    

    // svgFile = makeMainSvg();
    svgFile = document.getElementById('mainSVG');
    svgDrawGroup = svgFile.getElementById('drawGroup');
    svgStock = document.getElementById('svgStock');         //????????????????????
    svgBack = svgStock.getElementById('backgroundInsert');
    

    // initiateStaticObjects(svgStock);

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);

    svgFile.addEventListener("mousedown", mouseDownHandler, false);
    svgFile.addEventListener("mouseup", mouseUpHandler, false);
    svgFile.addEventListener("mousemove", mouseMoveHandler, false);
    svgFile.addEventListener("mouseleave", mouseLeaveHandler, false);
    svgFile.addEventListener("wheel", wheelHandler, false);

    document.addEventListener("mouseup", endDrag, false);
    document.addEventListener("mousemove", moveDrag, false);
    
    objectPickMenu = document.getElementById('objectPickMenu');
    objectPickMenu2 = document.getElementById('objectPickMenu2');
   
    //инициализация главного контейнера всех менюшек и добавление в них меню,    
    menuKeep = new MenuKeeper();
    let pickMenu1 = menuKeep.addMenu(objectPickMenu);
    let pickMenu2 = menuKeep.addMenu(objectPickMenu2);
    
    //adding menu elements
    pickMenu1.addElement('line',"lineStatic", menuLineClickCallback);
    pickMenu1.addElement('object',"resistor", menuDefaultClickCallback);
    pickMenu1.addElement('object',"capacitor", menuDefaultClickCallback);
    pickMenu1.addElement('object',"elSource", menuDefaultClickCallback);
    pickMenu1.addElement('object',"diode", menuDefaultClickCallback);
    // pickMenu1.addElement('object',"transformer", menuDefaultClickCallback);
    

    // pickMenu2.addElement('object',"resistor", menuDefaultClickCallback);
    // pickMenu2.addElement('object',"capacitor", menuDefaultClickCallback);
       
    svgDrawGroup.prepend(svgBack);
    //lineConnect = new LineObject;

    objectKeeper = new ObjectKeeper(svgDrawGroup, svgFile);
    
    lineKeeper = new LineObjectKeeper(objectKeeper);
    // propertyMenu = new PropertyKeeper(svgFile);  
    createRightClickMenu();
    
});
//загрузка последнего состояния рисовальщика, при загрузке страницы сайта
// document.addEventListener('DOMContentLoaded', operationHistoryStart)
window.onload = function () {
    console.log('documentState:', document.readyState);
    let json = JSON.parse(localStorage.getItem('operationHistory'));
    appendObjectsFromList(json);
    console.log(json);
    console.log("Загрузка сейва успешно прошла!");
  };
//сохранение состояния рисовальщика, при закрытии страницы сайта
window.onunload = function(){
    let listObjects = [];
    let buff;
    listObjects = copyAllObjects(objectKeeper);
    
    const blabla = JSON.stringify(listObjects, null,2);
    localStorage.setItem('operationHistory', blabla);
}
//---------------------------------------------------------------------------------------
//---------------------------------------Need update---------------------------------------------------------------
function keyDownHandler(evt) {
    if(evt.key == "Right" || evt.key == "ArrowRight") {
        rightPressed = true;
        panView();
    }
    else if(evt.key == "Left" || evt.key == "ArrowLeft") {
        leftPressed = true;
        panView();
    }
    if(evt.key == "Up" || evt.key == "ArrowUp") {
        upPressed = true;
        panView();
    }
    else if(evt.key == "Down" || evt.key == "ArrowDown") {
        downPressed = true;
        panView();
    }
    if(evt.key == "Home") {
        homePressed = true;
        changeDotDistance(dotDistanceNominal);
    }
    if(evt.key == "End") {
        endPressed = true;
    }
    if(evt.key == "Delete") {
        deletePressed = true;
        objectKeeper.deleteSelected();
    }
    if (evt.code == 'KeyZ' && (evt.ctrlKey || evt.metaKey)) {
        objectKeeper.history.undo();
        const blabla =  objectKeeper.history.currentList;
        objectKeeper.deleteAll();
        appendObjectsFromList(blabla);
      }
      if (evt.code == 'KeyY' && (evt.ctrlKey || evt.metaKey)) {
        objectKeeper.history.redo();
        const blabla =  objectKeeper.history.currentList;
        objectKeeper.deleteAll();
        appendObjectsFromList(blabla);
      }
    /*
    if(evt.key == "U" || evt.key == "u"){
        //console.log(`${evt.key} pressed`);
        lineKeeper.mergeLinesObj(objectKeeper.selectedMap);
    }*/
}
//---------------------------------------
//---------------------------------------Need update---------------------------------------------------------------
function keyUpHandler(evt) {
    if(evt.key == "Right" || evt.key == "ArrowRight") {
        rightPressed = false;
    }
    else if(evt.key == "Left" || evt.key == "ArrowLeft") {
        leftPressed = false;
    }
    if(evt.key == "Up" || evt.key == "ArrowUp") {
        upPressed = false;
    }
    else if(evt.key == "Down" || evt.key == "ArrowDown") {
        downPressed = false;
    }
    if(evt.key == "Home") {
        homePressed = false;
    }
    if(evt.key == "End") {
        endPressed = false;
    }
    if(evt.key == "Delete") {
        deletePressed = false;
    }
}
//---------------------------------------
//mouse down event function
function mouseDownHandler(evt) {
    if(eventListenerFlag) console.log("mouseDownHandler");
    evt.preventDefault();
    if (mouseBlocked) return;

    //при нажатии колесика мыши вызывается функция getMousePosition
    if(evt.which == 2 ) {
        mouseMidPressed = true;
        mouseBlocked = true;
        initMousePosition = mouseFileCoords = getMousePosition(evt,svgFile);        
    }

    //нажатие левой кнопки мыши
    if(evt.which == 1 ) {
        //добавление svg объекта с менюКонтейнера
        //if(chkCreateObject){
      //      addSelectedObj(evt);
      //  }
        //переход в режим выделения прямоугольником
        if(!mouseObjectHitDown && !chkDoLine) {
            mouseSelection = true;
            mouseBlocked = true; 
            selectionStartCoords = mouseFileCoords = getMousePosition(evt,svgFile);                      
        }
        if(!mouseObjectHitDown && chkDoLine) {            
            mouseDrawCoords = getMouseDrawPosition(evt,svgFile);
            lineKeeper.userAddLineSingle(mouseDrawCoords,svgDrawGroup);
        }
        
         mouseLeftPressed = true;
        //  objectKeeper.history.addHistory();
        // mouseBlocked = true;
    }
}
//---------------------------------------
//mouse up event function
function mouseUpHandler(evt) {
    if(eventListenerFlag) console.log("mouseUpHandler");
    evt.preventDefault();
    if(evt.which == 2 ) {
        mouseMidPressed = false;
        mouseBlocked = false;
    }
    if(evt.which == 1 ) {
        mouseLeftPressed = false;
        mouseBlocked = false;

        if(chkCreateObject){
            userAddSelectedObj(evt);
            deleteAddingSelectedObj();            
        }
        // if(chkDoLine) {
        //     objectKeeper.history.addHistory();
        // }
    }

}
//---------------------------------------
//mouse leave event function
function mouseLeaveHandler(evt) {
    if(eventListenerFlag) console.log("mouseLeaveHandler");
    if(evt.which == 2 ) {
        mouseMidPressed = false;
        mouseBlocked = false;
    }
}
//---------------------------------------
//mouse move event function
function mouseMoveHandler(evt) {
    if(eventListenerFlag && eventListenerFlagMove) console.log("mouseMoveHandler");
    evt.preventDefault();
    //передвижение экрана SVG при зажатом колесике мыши
    if(mouseMidPressed) {
        mouseFileCoords = getMousePosition(evt,svgFile);
        moveScreen(mouseFileCoords);
        initMousePosition = mouseFileCoords;
    }
    
    
}
//---------------------------------------
//mouse wheel event function
//вызов функций масштабирование экрана SVG
function wheelHandler(evt) {
    if(eventListenerFlag) console.log("mouseWheelHandler");
    evt.preventDefault();
    mouseFileCoords = getMousePosition(evt,svgFile);
    if(evt.deltaY > 0) {
        scaleScreen( stretchFactor,mouseFileCoords);
    }
    else {
        scaleScreen( 1/stretchFactor,mouseFileCoords);
    }    
}
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//изменение масштаба svgDrawGroup, путем изменения матрицы преобразования
//k - множитель масштаба, coords - координаты (см. getMousePosition) мыши в момент вызова функции
function scaleScreen (k,coords) {
    for (let i = 0; i < 4; i++ ) {
        transformMatrix[i] *= k;
    }
    transformMatrix[4] = k*transformMatrix[4]+(1-k)*coords.x; 
    transformMatrix[5] = k*transformMatrix[5]+(1-k)*coords.y;
    var newMatrix = "matrix(" +  transformMatrix.join(' ') + ")";
    svgDrawGroup.setAttributeNS(null, "transform", newMatrix);
}
//---------------------------------------------------------------------------------------
//перемещение экрана svgDrawGroup, путем изменения матрицы преобразования
//coords - координаты (см. getMousePosition) мыши в момент вызова функции
function moveScreen (coords) {
    transformMatrix[4] += coords.x - initMousePosition.x; 
    transformMatrix[5] += coords.y - initMousePosition.y;
    var newMatrix = "matrix(" +  transformMatrix.join(' ') + ")";
    svgDrawGroup.setAttributeNS(null, "transform", newMatrix);
}
//---------------------------------------------------------------------------------------
//перемещение svg на dx, dy в своем же системе координат. override==true используется при перезаписи матрицы преобразования
function moveIcon(svgIcon, dx, dy, override) {

    let elementTransform = svgIcon.getAttribute("transform");
    let elementTransformMatrix;
    if (elementTransform==null || override) 
        {   
        
        svgIcon.setAttributeNS(null, "transform", "matrix(1 0 0 1 "+dx+" "+dy+")");
        }
    else {
        elementTransformMatrix = elementTransform.split(")");
        elementTransform = elementTransformMatrix[0].split("(");
        elementTransformMatrix = elementTransform[1].split(" ");
        let e = parseFloat(elementTransformMatrix[4])+dx;
        let f = parseFloat(elementTransformMatrix[5])+dy;
        svgIcon.setAttributeNS(null, "transform", "matrix(1 0 0 1 "+e+" "+f+")");

    }
}
//---------------------------------------------------------------------------------------
//возвращает координаты в системе координат svgFile
function getMouseDrawPosition(evt,svgFile) {
    var CTM = svgFile.getScreenCTM();
    var x = (evt.clientX - CTM.e) / CTM.a;
    var y = (evt.clientY - CTM.f) / CTM.d;

    x = (x - transformMatrix[4]) / transformMatrix[0];
    y = (y - transformMatrix[5]) / transformMatrix[3];

    return {
      x: x,
      y: y
    };    
}
//---------------------------------------------------------------------------------------
//возвращает координаты в сеточной системе координат svgFile
function getMouseGridPosition(evt,svgFile) {
    var CTM = svgFile.getScreenCTM();
    var x = (evt.clientX - CTM.e) / CTM.a;
    var y = (evt.clientY - CTM.f) / CTM.d;

    x = (x - transformMatrix[4]) / transformMatrix[0];
    y = (y - transformMatrix[5]) / transformMatrix[3];

    x = Math.floor(x / gridDistance);
    y = Math.floor(y / gridDistance);

    return {
      x: x,
      y: y
    };    
}
//---------------------------------------------------------------------------------------
//возвращает координаты в системе координат svgFile без учета матрицы svgFile
function getMousePosition(evt,svgFile) {
    var CTM = svgFile.getScreenCTM();
    return {
      x: (evt.clientX - CTM.e) / CTM.a,
      y: (evt.clientY - CTM.f) / CTM.d
    };
  }
//---------------------------------------------------------------------------------------
//перевод из координат в сеточные координаты
function coordsToGrid(coords) {
    
    return {
      nx: Math.floor(coords.x/gridDistance + 0.5),
      ny: Math.floor(coords.y/gridDistance + 0.5)
    };
  }

//---------------------------------------------------------------------------------------
//---------------------------------------Need update???---------------------------------------------------------------
function getDistance(start,end) {
    return Math.sqrt((end.x-start.x)*(end.x-start.x) + (end.y-start.y)*(end.y-start.y));
}
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//svg настройки прямоугольника выделения
function selectionMakeRect() {
    let selectionRect = document.createElementNS(xmlns, "rect");
    selectionRect.setAttributeNS(null,"id","selectionRect"); 
    selectionRect.setAttributeNS(null,"fill","#00aaff"); 
    selectionRect.setAttributeNS(null,"opacity","0.2");
    selectionRect.setAttributeNS(null,"stroke","#0000ff"); 
    selectionRect.setAttributeNS(null,"stroke-opacity","1"); 
    selectionRect.setAttributeNS(null,"stroke-width","3"); 
    selectionRect.setAttributeNS(null,"rx","3"); 
    selectionRect.setAttributeNS(null,"ry","3"); 
        
    return selectionRect;
}
//---------------------------------------------------------------------------------------
//svg настройки прямоугольника выделения
function makeMainSvg() {
    let svgContainer = document.createElement("div");
    
    svgContainer.setAttribute("id","mainSVGContainer"); 
    svgContainer.setAttribute("class",""); //mainSVGContainer
    let svgTempFile = document.createElementNS(xmlns, "svg");
    svgTempFile.setAttributeNS(null,"class","col s8 push-s2"); //mainSVG
    svgTempFile.setAttributeNS(null,"viewBox","0 0 18000 9000"); //-9000 -4500 18000 9000
    // svgTempFile.setAttributeNS(null,"preserveAspectRatio","xMidYMid slice");
    svgTempFile.setAttributeNS(null,"id","mainSVG");

    let svgTempGroup = document.createElementNS(xmlns, "g");
    svgTempGroup.setAttributeNS(null,"id","drawGroup");

    svgTempFile.appendChild(svgTempGroup);
    svgContainer.appendChild(svgTempFile);   
    let drawPlot = document.getElementById('drawPlot');
    drawPlot.appendChild(svgContainer);
 
    return svgTempFile;
}

//---------------------------------------------------------------------------------------
//помощник для нахождения верхнего левого угла при рисовании прямоугольника выделения
function svgChangeRectDimentions(selectionRect,start,end) {
    
    if (start.x < end.x) {
        var x = start.x;
        var width = end.x - start.x;
    }
    else {
        var x = end.x;
        var width = start.x - end.x;
    }

    if (start.y < end.y) {
        var y = start.y;
        var height = end.y - start.y;
    }
    else {
        var y = end.y;
        var height = start.y - end.y;
    }
    
    selectionRect.setAttributeNS(null,"x",x); 
    selectionRect.setAttributeNS(null,"y",y);  
    selectionRect.setAttributeNS(null,"width",width); 
    selectionRect.setAttributeNS(null,"height",height);     
}

//---------------------------------------------------------------------------------------
//нахождение  svg-элементов входящих в прямоугольнике выделения
function selectObjectsMouse() {
    objectKeeper.objectMap.forEach(element => {
        if(element.isSelectable) {
            if (selectionCheckObject(selectionRect,element.svgDrawnIconGroup)) {
                objectKeeper.selectObj(element);
            }
        }
    });
}
//---------------------------------------------------------------------------------------
//проверка на вхождение inObj в outobj
function selectionCheckObject(outObj,inObj) {
    let outO = outObj.getBBox();
    let inO = inObj.getBBox();
    let mOutO = outObj.getCTM();
    let mInO = inObj.getCTM();

 
    let outO1 = {};
    outO1.x = outO.x;
    outO1.y = outO.y;
    let outO2 = {};
    outO2.x = outO.x + outO.width;
    outO2.y = outO.y + outO.height;
    let inO1 = {};
    inO1.x = inO.x + svgObjectPadding;
    inO1.y = inO.y + svgObjectPadding;
    let inO2 = {};
    inO2.x = inO.x + inO.width - svgObjectPadding;
    inO2.y = inO.y + inO.height - svgObjectPadding;

    outO1 = xyMatrix(outO1,mOutO);
    outO2 = xyMatrix(outO2,mOutO);
    inO1 = xyMatrix(inO1,mInO);
    inO2 = xyMatrix(inO2,mInO);

    if ((outO1.x <= inO1.x) && (outO1.y <= inO1.y) && (outO2.x >= inO2.x) && (outO2.y >= inO2.y)) {
        return true;
    }
    return false;
}

//---------------------------------------------------------------------------------------
//вычисление умножения xy на матрицу m
function xyMatrix(xy,m){
    return {
        x: xy.x*m.a + m.e,
        y: xy.y*m.d + m.f,
    }
}

//---------------------------------------------------------------------------------------
//вычисление умножения xy на обратную матрицу m
function xyMatrixInverse(xy,m){
    return {
        x: (xy.x - m.e)/m.a,
        y: (xy.y - m.f)/m.d,
    }
}

//---------------------------------------------------------------------------------------



//----------------------------------------------------------
//перенос объекта и выбор коробкой(срабатывает на всём документе при сдвиге мышки)
function moveDrag (evt) {
    if(eventListenerFlag && eventListenerFlagMove) console.log("moveDrag");
    // Если объект был нажат
    if(mouseObjectHitDown)
    {   
        // флаг объект переносится
        mouseIsDraging = true;
        
        //новые чистые координаты мышки
        mouseDrawCoords = getMouseDrawPosition(evt,svgFile);
        //запрос на перенос выбранных объектов на разницу в старых и новых чистых координатах
        objectKeeper.userMoveObjects(mouseDrawCoords.x - objCoords.x, mouseDrawCoords.y - objCoords.y);
        
        //перезапись старых координат
        objCoords.x = mouseDrawCoords.x;
        objCoords.y = mouseDrawCoords.y;
    }

    //если идёт выбор коробкой
    if (mouseSelection) {
        //новые чистые координаты мышки
        mouseFileCoords = getMousePosition(evt,svgFile);
        
        //если ещё не отрисованна коробка выбора
        if(!selectionIni) {
            //флаг коробка отрисованна
            selectionIni = true;
            //отрисовать коробку выбора
            svgFile.appendChild(selectionRect);     
        }
        //поменять её размеры в соответсвии с новыми координатами (см. control.js)
        svgChangeRectDimentions(selectionRect,selectionStartCoords,mouseFileCoords);
    }
    if (lineKeeper.mouseLine) {
        mouseDrawCoords = getMouseDrawPosition(evt,svgFile);
        lineKeeper.changeLineTask(mouseDrawCoords);
        
    }

    if(chkCreateObject){
        drawAddingSelectedObj(evt);
    }
}
//----------------------------------------------------------
//Конец переноса и выбора коробкой (срабатывает на всём документе при отпускании мышки)
function endDrag (evt) {
    if(eventListenerFlag) console.log("endDrag");
    //если отпущена ЛКМ
    if(evt.which == 1) {
        //Если не попали в объект, не было выбора коробкой и не было перетаскивания,
        //снять у всех объектов выделение
        if(!mouseObjectHitUp && !mouseSelection &&! mouseObjectHitDown) {
            objectKeeper.deselectAll();     
        }
        //иначе просто флаг попал в объект при отжатии в исходное состояние
        else {
            mouseObjectHitUp = false;   
        }       

        //если шёл выбор коробкой
        if(mouseSelection){
            //флаг выбор коробкой в исходное состояние
            mouseSelection = false;
            
            //если не нажат ctrl, то снять выделение со всех объектов
            if (!evt.ctrlKey) objectKeeper.deselectAll();
            //выбрать все объекты попавшие в коробку выбора (см. control.js)
            selectObjectsMouse();

            // если коробка выбора была отрисована, то убрать её и флаг в исходное положение 
            if (selectionIni){
                selectionRect.remove();
                selectionIni = false;
                }
        }

        //если было перетаскивание, то флаг в исходное положение и привязать положение обёртки иконки объекта к ЦКС
        if(mouseObjectHitDown) {
            // if (!lineKeeper.mouseLine) {
            //     objectKeeper.history.addHistory(); 
            // }
            mouseObjectHitDown = false;
            objectKeeper.moveSelectedToGrid();
        }

        if (lineKeeper.mouseLine) {
            //svgLineConnect.removeAttribute("stroke");
            // let xy = {x:0, y:0};
            // xy.x = svgLineConnect.x2.value;
            // //function coordsToGrid(coords);
            //console.log(xy.x);
            //objectKeeper.history.addHistory();   
            mouseDrawCoords = getMouseDrawPosition(evt,svgFile);
            lineKeeper.userAddLineObjects(mouseDrawCoords);
            menuKeep.allElementDeselected(); 
                
        }
        //updateLines();
        //chkDoLine = false;
    }
}
//----------------------------------------------------------

function addSelectedObj(evt) {
    let selectedObj = menuKeep.getSelectedObjMenu();
    menuKeep.allElementDeselected();

    mouseDrawCoords = getMouseDrawPosition(evt,svgFile);
    objectKeeper.appendObj(new ObjectGeneric(mouseDrawCoords,selectedObj));
    deactivateAllModesMenu();
    return 1;    
}
function userAddSelectedObj(evt) {
    objectKeeper.history.addHistory();
    addSelectedObj(evt);
}
function drawAddingSelectedObj(evt){
    if(YOBAReady){
        deleteAddingSelectedObj();
        addAddingSelectedObj();
    }
    mouseDrawCoords = getMouseDrawPosition(evt,svgFile);
    moveIcon(YOBA, mouseDrawCoords.x, mouseDrawCoords.y, true);
    
}
function addAddingSelectedObj(){
    let svgshka = menuKeep.getSelectedObjMenu();
    YOBA = svgshka.svgIcon.cloneNode(true);
    YOBA.setAttributeNS(null,"fill","black");
    YOBA.setAttributeNS(null,"stroke","black");
    YOBA.setAttributeNS(null,"opacity","0.61");
    svgDrawGroup.appendChild(YOBA); 
    YOBAReady = false;
}
function deleteAddingSelectedObj(){
    try {
        svgDrawGroup.removeChild(YOBA);
    }
    catch(e){
        //console.log(e);
    }
}

// function updateLines(){
//     lineKeeper.mergeLinesObj(objectKeeper.objectMap);
// }


function deleteAllTest() {
    objectKeeper.deleteAll();
}