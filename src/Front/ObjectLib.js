//сокращения и обозначения
//ЦКС - целочисленная координатная сетка. Размер деления задаётся в координатах SVG.
//ЛКМ - левая кнопка мыши
//Чистые координаты - rоординаты на SVG без учёта трансформации вида (масштаб, перенос)

//глобальные переменные
//(отладка) переменная для хранения начальных координат нажатия ЛКМ в чистых координатах SVG (без трансформации)
var objCoords;

//--------------------------
//флаги
//флаг происходит перетаскиввание объекта           
var mouseIsDraging = true;
//отпускание (нажатие) левой кнопки попало в объект
var mouseObjectHitUp = false;
var mouseObjectHitDown = false;
// флаг кликнутый объект был выбрат при нажатии
var mouseObjectWasSelected = true;  

//---------------------------------------------------------------------
// Класс хранения и обработки объектов. Обрабатывает добавление, удаление, выбор объектов.
// Работает с обращениями к множеству объектов 
class ObjectKeeper {
    isDeletePostponed = false;
    lineKeeper = null;
    isObjectMovementStarted = false;
    
    constructor (svgDrawGroup, svgFile){
        //ссылка на главный холст
        this.svgFile = svgFile;
        // ссылка на группу, к которой применяется трансформирование (масштабирование, паралл. перенос)
        //Далее в коментариях - холст
        this.svgDrawGroup = svgDrawGroup; 

        //инициализация коллекции ссылок на объекты и коллекции ссылок на выбранные объекты
        this.objectMap = new Map();
        this.selectedMap = new Map();
        this.toBeDeletedArray = [];
        this.forkedConnectors = new Map();
                        
        //счётчик объектов. Никогда не уменьшается и отражает общее_количество_объектов-1, созданных до выполнения
        //функции DeleteALL(), где он приравнивается -1;
        this.objectCounter = new Map(); 

        this.history = new OperationsHistory();
        // appendObjectsFromList(this.history.historyList[0]);
        
    }
//--------------------------
//нумерация
    getNewID(type) {                
        let count = this.objectCounter.get(type);
        if(count) {
            count++; 
        }
        else {
            count = 1;
        }
        this.objectCounter.set(type,count);
        return "ID_"+type+"_"+count; 
    }

//--------------------------
// добавление нового объекта в хранилище и его отрисовка
    appendObj(svgObject) {
       return this.appendObjNow(svgObject);
    }
//--------------------------
    appendObjNow(svgObject){
        if(!svgObject.isValid) return null;
        // генерациия нового ID
        let newID = this.getNewID(svgObject.type);
        //запись объекта в коллекцию объектов
        this.objectMap.set(newID,svgObject);

        svgObject.objectKeeper = this;
        svgObject.draw (svgDrawGroup, newID);
        svgObject.activateLogic();

        // this.history.addOperation(svgObject, "append");
        
        // увеличения счётчика
        
        //возврат строки с ID объекта
        return svgObject;
    }
//--------------------------
   

//--------------------------
//Выбор объекта по ID или ссылке
    selectObj(objID) {
        //объявление ссылки на удаляемый объект
        let svgObject;
        //проверка на входные данные. Если передана ссылка на объект, то определить его ID.
        //если передан ID, то найти ссылку на объект в хранилище
        if (typeof objID === "string") {
            svgObject = this.objectMap.get(objID);
        }
        else {
            svgObject = objID;
            objID = svgObject.id;
        }
        
        //Добавление объекта в колекцию выбранных объектов
        this.selectedMap.set(objID,svgObject);
        //запуск внутренней функции объекта, связанной с его выбором
        svgObject.select();
    }
//--------------------------
// Снятие выбора с объекта по ID или ссылке
    deselectObj(objID) {
        //объявление ссылки на удаляемый объект
        let svgObject;
        //проверка на входные данные. Если передана ссылка на объект, то определить его ID.
        //если передан ID, то найти ссылку на объект в хранилище
        if (typeof objID === "string") {
            svgObject = this.objectMap.get(objID);
        }
        else {
            svgObject = objID;
            objID = svgObject.id;
        }
        
        if(!svgObject.isSelected) return;
        //запуск внутренней функции объекта, связанной с со снятием выбора
        svgObject.deselect();
        //удаление объекта из коллекции выбранных 
        this.selectedMap.delete(objID);

    }
//--------------------------
//снять выбор со всех объектов
    deselectAll() {
        //для каждого объекта запускается внутрення функция объекта снятия выбора
        objectKeeper.selectedMap.forEach(svgObject => {
            if(svgObject.isSelectable) {
                svgObject.deselect(); 
            }               
        });
        //очищается коллекуия выбранных элементов
        this.selectedMap.clear();
    }
//--------------------------
//юзерские функции
//--------------------------
    userMoveObjects(dx,dy) {       

        if(!this.isObjectMovementStarted) {
            this.history.addHistory();
            this.isObjectMovementStarted = true;            
            this.forkedConnectors.clear();
            this.selectedMap.forEach(svgObject => {                
                svgObject.onMoveStart();                
            });
            let validForkedConnectorCoords = [];
            this.forkedConnectors.forEach(connector => {
                if(!connector.toBeDeleted) validForkedConnectorCoords.push(connector.pos);
            });
            let oldMouseCoords = {x : mouseDrawCoords.x - dx, y : mouseDrawCoords.y - dy}
            this.lineKeeper.userStartLineTask(oldMouseCoords,validForkedConnectorCoords,this.svgDrawGroup);            ///??!!
        }
        
        this.moveSelectedFree(dx,dy);    
    }

//--------------------------
//перемещение выбранных объектов без привязки к ЦКС
    moveSelectedFree(dx,dy) {
        //для каждого выбрвнного элемента запускается внутрення функция сдвига без учёта координатной сетки
        //в чистых координатах SVG (без трансформации)

        //console.log("obj",dx,dy);
        this.selectedMap.forEach(svgObject => {
            svgObject.moveIconFree(dx, dy);
           // this.history.addOperation(svgObject, "move",{dx,dy});
        });      
    }
//--------------------------
//поправка размещения выбранных объектов по ЦКС
    moveSelectedToGrid() {
        //для каждого выбрвнного элемента запускается внутрення функция поправки размещения по ЦКС
        this.isObjectMovementStarted = false;
        this.selectedMap.forEach(svgObject => {
           // this.history.addOperation(svgObject, "movetogrid",{x:svgObject.pos.x, y:svgObject.pos.y}); 
            svgObject.moveToGrid();        
        });
        this.checkIntersectionsAll(this.selectedMap);
        this.checkConnectorsValidityAll();      
    }
//--------------------------
//удаление выбранных элементов
    deleteSelected() {
        //для каждого выбрвнного элемента производится вызов delete() по ссылке
        this.selectedMap.forEach((svgObject) => {
            if(svgObject.isDeletable) {
                this.delete(svgObject);
            }            
        }); 
        this.checkConnectorsValidityAll();     
    }
//--------------------------
//удаление объекта по ID или ссылке
    deleteObj(objID) {
        //объявление ссылки на удаляемый объект
        let svgObject;
        //проверка на входные данные. Если передана ссылка на объект, то определить его ID.
        //если передан ID, то найти ссылку на объект в хранилище
        if (typeof objID === "string") {
            svgObject = this.objectMap.get(objID);
        }
        else {
            svgObject = objID;
            objID = svgObject.id;
        }

        // попытка удалить объект из хранилища
        
        if (this.objectMap.has(objID)) {
            svgObject.delete();
            this.objectMap.delete(objID);
            //если объект с заданным ID существует и удалился, то удаляем его из 
            // коллекции выбранных объектов
            this.selectedMap.delete(objID);
            //удаление обёртки и иконки с холста
            this.svgDrawGroup.removeChild(svgObject.svgDrawnIconGroup);
           
          //  this.history.addOperation(svgObject, "delete");
             //вернуть true после удаления
            return true;
        }
        //вернуть true, если не удалось удалить такой объект (не найден в хранилище)        
        return false;        
    }
//--------------------------
//удаление всех элементов
    deleteAll() {
        //для каждого элемента производится вызов deleteObj() по ссылке
        this.objectMap.forEach((svgObject) => {
                this.deleteObj(svgObject);
        }); 

        //очистка коллекций всех объектов и выбранных объектов
        this.objectMap.clear();
        this.selectedMap.clear();
        //установка счётчика объектов в начальное состояние
        this.objectCounter.clear();    
    }
//--------------------------
    //удаление объекта по ID или ссылке c с проверкой
    delete(objID) {
        //объявление ссылки на удаляемый объект
        let svgObject;
        //проверка на входные данные. Если передана ссылка на объект, то определить его ID.
        //если передан ID, то найти ссылку на объект в хранилище
        if (typeof objID === "string") {
            svgObject = this.objectMap.get(objID);
        }
        else {
            svgObject = objID;
            objID = svgObject.id;
        }

        // попытка удалить объект из хранилища
        svgObject.toBeDeleted = true;        
        if(this.isDeletePostponed) {            
            this.toBeDeletedArray.push(svgObject);
            return false;    
        }
        else {            
            return this.deleteObj(svgObject);
        }      
    }
//--------------------------
//удаление элементов отложенное
    deletePostponed() {
        //для каждого элемента производится вызов deleteObj() по ссылке
        while(this.toBeDeletedArray.length) {
            let svgObject = this.toBeDeletedArray.pop();
            this.deleteObj(svgObject);
        }

        this.isDeletePostponed = false;
    }

//--------------------------
//удалить связанный объект из узла
    removeRelatedConnector(object, connector) {
        if(object.isSelected) this.deselectObj(connector);
        if (connector.removeRelatedObject(object)) {
            this.delete(connector);
        }
    }
//--------------------------
//добавить связанный объект в узел
    addRelatedConnector(object, coords) {
        let newConnector = this.appendObj(new ConnectorObject(object,coords));
        if(newConnector) object.connectors.set(newConnector.id,newConnector);        
    }
//--------------------------
//
    checkConnectorsValidityAll() {
        this.isDeletePostponed = true;
        for (let object of this.objectMap.values()) {
            if(object.type === "line") {
                object.checkConnectorsValidity();
            }
        }
        this.deletePostponed();   
    }
//--------------------------
//проверка пересечений объектов
    checkIntersectionsAll(objectsToCheck) {
        this.isDeletePostponed = true;
        objectsToCheck.forEach(objectToCheck => {
            this.objectMap.forEach(object => {
                object.checkIntersection(objectToCheck); 
            });
        });
        this.deletePostponed();
        //this.mergeLinesObj(objectsToCheck);
        this.selectedMap.forEach(object => {
            if(object.isSelectable) {
                object.selectConnectors();
            }
        }); 
        this.checkConnectorsValidityAll();        
    }
//--------------------------
    forkConnectors(object) {
        let tempArr = [];
        object.connectors.forEach(connector => {
            tempArr.push(connector.pos);
            this.removeRelatedConnector(object, connector);
            this.forkedConnectors.set(connector.id, connector);            
        });

        tempArr.forEach(pos => {
            this.addRelatedConnector(object, pos);
        });
    }

//--------------------------    
    mergeTwoLines(line1, line2, direction){
		if (direction =="Horizontal"){
			let arrNumb = [];
			arrNumb[0]= line1.point1.x;
			arrNumb[1]= line1.point2.x;
			arrNumb[2]= line2.point1.x;
			arrNumb[3]= line2.point2.x;
			let Y = line2.point2.y;
			let minX = minNumber(...arrNumb);
			let maxX = maxNumber(...arrNumb);
			
			let point1 ={x:minX, y:Y};
			let point2 ={x:maxX, y:Y};
			let mergedLine = new ObjectLine(point1,point2);
			
			this.delete(line1);
            this.delete(line2);
            this.appendObj(mergedLine);
			return mergedLine;
		}
		else if (direction =="Vertical"){
			let arrNumb = [];
			arrNumb[0]= line1.point1.y;
			arrNumb[1]= line1.point2.y;
			arrNumb[2]= line2.point1.y;
			arrNumb[3]= line2.point2.y;
			let X = line1.point2.x;
			let minY = minNumber(...arrNumb);
			let maxY = maxNumber(...arrNumb);
			
			let point1 ={x:X, y:minY};
			let point2 ={x:X, y:maxY};
			let mergedLine = new ObjectLine(point1,point2);
			
			this.delete(line1);
            this.delete(line2);
            this.appendObj(mergedLine);
            //this.checkConnectorsValidityAll();
			return mergedLine;
		}
		else {
			console.log("something wrong");
			return false;
		}
	}
//--------------------------
    cutLineInTwo(line,point1,point2){
        let arr = [];
        arr.push(line.point1);
        arr.push(line.point2);
        arr.push(point1);
        arr.push(point2);
        arr = sortCoordsByDirection(line.direction,arr);

        let line1 = new ObjectLine(arr[0],arr[1]);
        let line2 = new ObjectLine(arr[2],arr[3]);
			
        this.delete(line);
        this.appendObj(line1);
        this.appendObj(line2);

    }
//--------------------------
    cutLineInOne(line,point1,point2){
        if(compareCoords(point1,line.point1) || compareCoords(point1,line.point2)){
            return false;
        }
        else {
            let arr = [];
            arr.push(line.point1);
            arr.push(line.point2);
            arr.push(point1);
            arr.push(point2);
            arr = sortCoordsByDirection(line.direction,arr);
            let line1
            if(compareCoords(point2,arr[0])){
                line1 = new ObjectLine(arr[2],arr[3]);
            }
            else {
                line1 = new ObjectLine(arr[0],arr[1]);
            }
            this.delete(line);
            this.appendObj(line1);
            return true;
        }
    }
//--------------------------
    rotateObjects(deg){
        this.history.addHistory();
        //нахождение центра между двумя крайними(из всех коннекторов) коннекторами
        let xArr = [];
        let yArr = [];
        let objArray = [];
        this.selectedMap.forEach(value =>{
            if (value.type=="connector"){
                xArr.push(value.pos.x);
                yArr.push(value.pos.y);
            }
            else {
                objArray.push(value);
            }
        });
        objArray.forEach(value =>{
            if(value.type == "line"){
                this.delete(value);
            }
        });
        let rotateCenter = {
            x:centerArray(...xArr),
            y:centerArray(...yArr)
        };
        // console.log("left:\t", minX," ", minY, "\nright:\t", maxX," ", maxY)
        rotateCenter = coordsToGridCoords(rotateCenter);
        // console.log(rotateCenter);
       
        objArray.forEach(value =>{
            // if (value.type!="connector"){
                value.rotateObj(rotateCenter,deg);
            // }
        });
       
    }
//--------------------------
    userRotateObjects(deg){
        this.history.addHistory();
        this.rotateObjects(deg);
    }
//--------------------------
} //end of ObjectKeeper

//----------------------------------------------------------
//Базовый класс  SVG объекта. Хранит ID, иконки, ссылки на нарисованные на холсте иконки
//Обеспечивает функционал для ОДНОГО объекта
class ObjectTemplate {
    //инициализация ID объекта    
    id = "undefiened";
    objectKeeper = null;
    isDeletable = true;
    isSelectable = true;
    //isMoving = false;
    isSelected = false;
    toBeDeleted = false;
    isValid = true;
    constructor (pos, type){
        this.pos = pos;
        //инициализации ссылки на нарисованную иконку и обёртку
        this.svgDrawnIcon = null;
        this.svgDrawnIconGroup = null;

        //имя объекта - не уиникально
        this.type = type;
        this.connectors = new Map();
        this.anchor = {x:0,y:0};
        this.connectorsLocalCoords = [];
        this.svgDrawGroup = null;
    }
    //--------------------------
    createIcon() {
        let errorIcon = document.createElementNS(xmlns,"g");
        let errorRect = document.createElementNS(xmlns,"rect"); 
        errorRect.setAttributeNS(null,"x","0");
        errorRect.setAttributeNS(null,"y","0");
        errorRect.setAttributeNS(null,"width","600"); 
        errorRect.setAttributeNS(null,"height","600");
        errorRect.setAttributeNS(null,"stroke-width","10");
        errorRect.setAttributeNS(null,"fill","none");
        errorRect.setAttributeNS(null,"pointer-events","visible");
        let errorText = document.createElementNS(xmlns,"text");        
        errorText.setAttributeNS(null,"x","300");
        errorText.setAttributeNS(null,"y","300");
        errorText.setAttributeNS(null,"font-size","150");  
        errorText.setAttributeNS(null,"text-anchor","middle"); 
        errorText.innerHTML = "No Icon";
        errorIcon.appendChild(errorRect);
        errorIcon.appendChild(errorText);
        return errorIcon;     
    }
    //--------------------------
    draw (svgDrawGroup = this.svgDrawGroup, id = this.id) {
        this.svgDrawGroup = svgDrawGroup;
        //передача ID
        this.id = id;
        // создание обертки для иконки объекта, которая будет отрисованна на холсте
        this.svgDrawnIconGroup = document.createElementNS(xmlns,"g")
        //создание копии иконки объекта
        this.svgDrawnIcon = this.createIcon();
        this.svgDrawnIcon.setAttributeNS(null,"id",id);
        //добавление иконки в обёртку
        this.svgDrawnIconGroup.append(this.svgDrawnIcon);
        //присваивание обёртке ID объекта. ID гарантируется уникальным и по нему происходит связывание иконки
        //на холсте с объектом
        this.svgDrawnIconGroup.setAttributeNS(null,"id",id);
        this.svgDrawnIconGroup.setAttributeNS(null,"stroke","black");
        //Добавление title = id
        let myTitle = document.createElementNS(xmlns,"title");
        myTitle.innerHTML = this.id+" Yoba";
        this.svgDrawnIcon.append(myTitle);
        //добавления обработчка нажатия и отжатия КМ на обёртку иконки
        this.svgDrawnIcon.setAttributeNS(null,"class","drawnObject");
        //отрисовка обёртки на холсте
        svgDrawGroup.append(this.svgDrawnIconGroup);
        //перенос иконки на её правильные кординаты с помощью функции объекта               
    }
    //--------------------------
    activateLogic() {
        this.moveToGrid();
    }
    //--------------------------
    delete() {
     
    }
    //--------------------------
    //--------------------------
    createConnectors() {

    }

    //--------------------------
    checkConnectorsIntersections() {        
   
    }
    //--------------------------
    setMouseEvents() {

    }
    //--------------------------
    //перемещение иконки объекта без привязки к ЦКС 
    moveIconFree(dx,dy) {
        //перемещение обёртки иконки объекта по её ссылке с помощью трансформации
        
        moveIcon(this.svgDrawnIconGroup,dx,dy);
        
            this.pos.x += dx;
            this.pos.y += dy;
       
        
        this.onMove(dx,dy); 
        
    }
    //--------------------------
    setIconFree(x,y){
        moveIcon(this.svgDrawnIconGroup,x,y,true);
        let dx = this.pos.x - x;
        let dy = this.pos.y - y;
        this.pos.x = x;
        this.pos.y = y;
        
        this.onMove(dx,dy); 
    }
    //--------------------------
    //привязка размещения иконки к ЦКС 
    moveToGrid() { 
        //нахождение координат ЦКС из чистых координат 
        //this.isMoving = false;  
        
        let bias = {};
        bias.x = this.pos.x + this.anchor.x;
        bias.y = this.pos.y + this.anchor.y;
        this.grid = coordsToGrid(bias);
        //нахождение чистых координат иконки из ЦКС  
        this.pos = gridToCoords(this.grid);
        this.pos.x = this.pos.x - this.anchor.x;
        this.pos.y = this.pos.y - this.anchor.y;  
        //перемещение обёртки иконки объекта по новым чистым координатам
        moveIcon(this.svgDrawnIconGroup,this.pos.x,this.pos.y,true);
        this.onGrid();
        
    }
    //--------------------------
    // выбор и снятие выбора с объекта
    select () {
        this.onSelect();
        this.isSelected = true;
        this.svgDrawnIconGroup.setAttributeNS(null,"stroke","red");
        this.svgDrawnIconGroup.setAttributeNS(null,"fill","red");
        this.svgDrawGroup.removeChild(this.svgDrawnIconGroup);
        this.svgDrawGroup.appendChild(this.svgDrawnIconGroup);
        
    }
    deselect () {
        this.onDeselect();
        this.isSelected = false;
        this.svgDrawnIconGroup.setAttributeNS(null,"stroke","black");
        this.svgDrawnIconGroup.setAttributeNS(null,"fill","black");
        
    }
    //--------------------------
    onSelect() {

    };

    onDeselect() {

    };
    //--------------------------
    checkIntersection() {
        
    };

    //--------------------------
    onMoveStart() {

    };
    //--------------------------
    onMove() {

    };
    //--------------------------
    onGrid() {

    };
    //--------------------------
    
    selectConnectors() {
    
    }
    //--------------------------
    deselectConnectors() {
        
    }
    //--------------------------
    rotateObj(){

    }
    //--------------------------

}
//----------------------------------------------------------
class ObjectConstant extends ObjectTemplate {
    constructor (pos, type){
        super(pos, type);
    }
   //--------------------------
    activateLogic() {
        this.setMouseEvents();
        this.moveToGrid(); 
        this.createConnectors();
        this.checkConnectorsIntersections();
        this.objectKeeper.checkConnectorsValidityAll();
    }
    //--------------------------
    delete() {
        this.connectors.forEach(connector => {            
            this.objectKeeper.removeRelatedConnector(this, connector);
        });        
    }
    
    //--------------------------
    onSelect() {
        this.selectConnectors();        
    };
    //--------------------------
    onDeselect() {
        this.deselectConnectors();        
    };
    //--------------------------
    selectConnectors() {
        this.connectors.forEach(connector => {
             this.objectKeeper.selectObj(connector);
        });
    }
    //--------------------------
    deselectConnectors() {
        this.connectors.forEach(connector => {
            this.objectKeeper.deselectObj(connector);
        });
    }
    //--------------------------
     
    onMoveStart() {
        this.connectors.forEach(connector => {
            this.objectKeeper.deselectObj(connector);                 
        });

        this.objectKeeper.forkConnectors(this);

        this.connectors.forEach(connector => {            
            this.objectKeeper.selectObj(connector);
        });
    }
    //--------------------------
    setMouseEvents() {
        this.svgDrawnIcon.addEventListener("mousedown", startDrag, false);
        this.svgDrawnIcon.addEventListener("mouseup", mouseClickObject, false);
    }
    //--------------------------
    checkConnectorsIntersections() {        
        let tempArr = [...this.connectors.values()];
        tempArr.push(this);
        this.objectKeeper.checkIntersectionsAll(tempArr);        
    }
    //--------------------------
    createConnectors() {        
        this.connectorsLocalCoords.forEach(localCoords => {
            let generalCoords = {};
            generalCoords.x = localCoords.x + this.pos.x;
            generalCoords.y = localCoords.y + this.pos.y;
            this.objectKeeper.addRelatedConnector(this, generalCoords);            
        });
    }
    //--------------------------
    rotateObj(rotateCenter, deg) {
        if (typeof deg === 'undefined') return 0;
        
        //вычисление новой координаты объекта после поворота и перенос объекта на новую координату
        let newPoint;
        let rotateMatrix = degToMatrix(deg);
        if(rotateCenter!=null){
            newPoint = rotateAroundPoint(this.pos, rotateCenter, rotateMatrix);
            this.setIconFree(newPoint.x, newPoint.y);
        }
        else {
            return 0;
        }
        
        this.rotateObjDeg(deg);
        
    }
    //--------------------------
    rotateObjDeg(deg){
        if(typeof deg === 'undefined') return 0;
        let rotateMatrix = degToMatrix(deg);
        let matrixCurrent = [1,0,0,1];
        //поворот координат коннекторов
        let buff = JSON.parse(JSON.stringify(this.connectorsLocalCoords));
        let connectorCenter = {
            x:centerArray(buff[0].x,buff[1].x),
            y:centerArray(buff[0].y,buff[1].y)
        };
        this.connectorsLocalCoords[0] = rotateAroundPoint(buff[0], connectorCenter, rotateMatrix);
        this.connectorsLocalCoords[1] = rotateAroundPoint(buff[1], connectorCenter, rotateMatrix);
        //удаление старых коннекторов
        this.deleteConnectors();
        //создание новых коннекторов и проверка
        
        this.createConnectors();
        this.checkConnectorsIntersections();

        //rotattte
        let newMatrix = "matrix(";
            rotateMatrix.forEach(value =>{
                newMatrix+=value+" ";
            });
            newMatrix +="0 0)"; 

        if (this.svgDrawnIcon.getAttributeNS(null,"transform")){
            let buff = this.svgDrawnIcon.getAttributeNS(null,"transform");
            matrixCurrent = matrixTransformIntoArray(buff, 4);
            matrixCurrent = multiplyMatrixAB(matrixCurrent,rotateMatrix);
            
            newMatrix = "matrix(";
            matrixCurrent.forEach(value =>{
                newMatrix+=value+" ";
            });
            newMatrix +="0 0)"; 
        }
        this.svgDrawnIcon.setAttributeNS(null, "transform", newMatrix);
        this.rotateGrad = matrixDirection(newMatrix);
        this.checkDirection();
    }
    //--------------------------
    checkDirection(){
        if(this.type == "R" || this.type == "C" || this.type == "LR"){ //костыль
            switch(this.rotateGrad){
                case 0: 
                    this.direction = "Horizontal Right";
                    break;
                case 90:
                    this.direction = "Vertical Up";
                    break;
                case 180:
                    this.direction = "Horizontal Left";
                    break;
                case 270:
                    this.direction = "Vertical Down";
                    break;
                default:
                    this.direction = "Horizontal Right";
                    break;
            }
            

        }
    }
    //--------------------------
    deleteConnectors() {
        this.connectors.forEach(connector => {
             if(connector.removeRelatedObject(this)){
                 this.objectKeeper.delete(connector);
             }
        });
    }
    //--------------------------
    
}

//----------------------------------------------------------
//Базовый класс  SVG объекта. Хранит ID, иконки, ссылки на нарисованные на холсте иконки
//Обеспечивает функционал для ОДНОГО объекта
class ObjectGeneric extends ObjectConstant {
    //инициализация ID объекта    
    constructor (pos,staticObj){
        super(pos,staticObj.type)
        //Иконка данного объекта в различных состояниях
        this.svgIcon = staticObj.svgIcon;
        // this.svgIcon = JSON.parse(JSON.stringify(staticObj.svgIcon));
        this.connectorsLocalCoords = JSON.parse(JSON.stringify(staticObj.connectors));

        this.electricParameters = JSON.parse(JSON.stringify(staticObj.electricParameters));
        this.model = JSON.parse(JSON.stringify(staticObj.model));
    }

    //--------------------------
    createIcon(){
        return this.svgIcon.cloneNode(true);     
    }

    //--------------------------
    checkIntersection(objectToCheck){
        if (objectToCheck.type === "line") {
            //--------------идет проверка направлений линии и объекта
            this.checkDirection();
            let objDirection = this.direction.split(" ",1)[0]
            if(objDirection!=this.direction){
                return false;
            }
            //--------------идет проверка точек линии и объекта
            let buff = [];
            if(this.connectors.size == 2){
                buff = this.connectors.values();
                let con1 = buff.next();
                let con2 = buff.next();
                let bool1 = objectToCheck.pointOnLineInteger(con1.value.grid, true);
                let bool2 = objectToCheck.pointOnLineInteger(con2.value.grid, true);

                
                if(bool1 && bool2){
                    this.objectKeeper.cutLineInTwo(objectToCheck, con1.value.pos, con2.value.pos);
                }
                else if (bool1){
                    this.objectKeeper.cutLineInOne(objectToCheck, con1.value.pos, con2.value.pos);
                }
                else if (bool2){
                    this.objectKeeper.cutLineInOne(objectToCheck, con2.value.pos, con1.value.pos);
                }
            }
        }
    }
   
    //--------------------------
    getSaveInfo(){
        let buff = {
            "model": this.model,
            "type": this.type,
            "pos": this.pos,
            "rotateGrad": this.rotateGrad,
            "electricParameters": this.electricParameters,
            "in": this.relatedGraphObj[0],
            "out": this.relatedGraphObj[1]
        };
        return buff;
    }

//----------------------------------------------------------    
}// end of ObjectGeneric

//----------------------------------------------------------
//Класс  линии. Хранит ID, иконки, ссылки на нарисованные на холсте иконки
//Обеспечивает функционал для ОДНОГО объекта
class ObjectLine extends ObjectConstant {
    //инициализация ID объекта    
    direction = "undefiened"
    constructor (point1,point2,direction = null){
        
        
        //Иконка данного объекта в различных состояниях
        let grid1 = coordsToGrid(point1);
        let grid2 = coordsToGrid(point2);
        
        point1 = gridToCoords(grid1);
        point2 = gridToCoords(grid2);
        
        super(point1,"line");
        this.isValid = !compareCoords(grid1,grid2);
        this.point1 = point1;
        this.point2 = point2;
        this.grid1 = grid1;
        this.grid2 = grid2;

        this.localPoint1 = {x:0,y:0};
        this.localPoint2 = {};
        this.localPoint2.x = point2.x - point1.x;
        this.localPoint2.y = point2.y - point1.y;

        this.connectorsLocalCoords = [this.localPoint1,this.localPoint2];
        
        if (!direction) {
            this.direction = this.checkDirection();
        }
        else this.direction = direction;
    }
    //--------------------------
    checkDirection() {
        if(this.grid1.nx === this.grid2.nx) return "Vertical";
        else if(this.grid1.ny === this.grid2.ny) return "Horizontal";
        else return "Diagonal";
    }

    //--------------------------
    createIcon(){
        let lineGroup = document.createElementNS(xmlns, "g");
        lineGroup.setAttributeNS(null,"pointer-events","visible");
        lineGroup.setAttributeNS(null,"id","line");
        let lineConnect = document.createElementNS(xmlns, "line");
	    lineConnect.setAttributeNS(null,"stroke-width","15"); 
	    lineConnect.setAttributeNS(null,"x1",this.localPoint1.x); 
	    lineConnect.setAttributeNS(null,"y1",this.localPoint1.y); 
	    lineConnect.setAttributeNS(null,"x2",this.localPoint2.x); 
	    lineConnect.setAttributeNS(null,"y2",this.localPoint2.y);
        let lineConnectNone = document.createElementNS(xmlns, "line");
        lineConnectNone.setAttributeNS(null,"stroke-width","50");
        lineConnectNone.setAttributeNS(null,"x1",this.localPoint1.x); 
        lineConnectNone.setAttributeNS(null,"y1",this.localPoint1.y); 
        lineConnectNone.setAttributeNS(null,"x2",this.localPoint2.x); 
        lineConnectNone.setAttributeNS(null,"y2",this.localPoint2.y);
        lineConnectNone.setAttributeNS(null,"stroke","none"); 
        lineConnectNone.setAttributeNS(null,"fill","none"); 
       
	    lineGroup.appendChild(lineConnect);
        lineGroup.appendChild(lineConnectNone);
        
	    return lineGroup;    
    }

        //--------------------------
        onMove(dx,dy) {
            this.point1.x += dx;
            this.point1.y += dy;
            this.point2.x += dx;
            this.point2.y += dy;
        };
        //--------------------------
        onGrid() {
            this.point1.x = this.pos.x + this.localPoint1.x;
            this.point1.y = this.pos.y + this.localPoint1.y;
            this.point2.x = this.pos.x + this.localPoint2.x;
            this.point2.y = this.pos.y + this.localPoint2.y;
            this.grid1 = coordsToGrid(this.point1);
            this.grid2 = coordsToGrid(this.point2);
        };
        
        //--------------------------
        checkConnectorsValidity() {
            let size = this.connectors.size;
            if (size <= 2) return;

            this.connectors.forEach(connector => {
                if(!this.isEndOfLine(connector)) {
                    if(connector.relatedObjects.size <= 1) {
                        this.objectKeeper.delete(connector);
                    }
                }
            });
        };
        
        isEndOfLine(connector) {
            if(compareCoords(this.grid1,connector.grid)) return true;
            if(compareCoords(this.grid2,connector.grid)) return true;
            return false;
        };

        //--------------------------
        checkIntersection(objectToCheck) {
            if(objectToCheck.toBeDeleted || this.toBeDeleted) return false;
            if (objectToCheck.type === "connector") {
                
                if (this.pointOnLineInteger(objectToCheck.grid)) {
                    objectToCheck.addRelatedObject(this);
                    return true;
                }
            }
            if (objectToCheck.type === "line") {
                if (this.id === objectToCheck.id) return false;
                let answer = this.checkLineAxis(objectToCheck);
				if (answer=="Horizontal" || answer=="Vertical"){
					this.objectKeeper.mergeTwoLines(this,objectToCheck,answer);
				}
            }
            if (objectToCheck.type != "line" && objectToCheck.type != "connector") {
                //--------------идет проверка направлений линии и объекта
                objectToCheck.checkDirection();
                let objDirection = objectToCheck.direction.split(" ",1)[0]
                if(objDirection!=this.direction){
                    return false;
                }
                
                //--------------идет проверка точек линии и объекта
                let buff = [];
                if(objectToCheck.connectors.size == 2){
                    buff = objectToCheck.connectors.values();
                    let con1 = buff.next();
                    let con2 = buff.next();
                    let bool1 = this.pointOnLineInteger(con1.value.grid, true);
                    let bool2 = this.pointOnLineInteger(con2.value.grid, true);
    
                    
                    if(bool1 && bool2){
                        this.objectKeeper.cutLineInTwo(this, con1.value.pos, con2.value.pos);
                    }
                    else if (bool1){
                        this.objectKeeper.cutLineInOne(this, con1.value.pos, con2.value.pos);
                    }
                    else if (bool2){
                        this.objectKeeper.cutLineInOne(this, con2.value.pos, con1.value.pos);
                    }
                }
            }
            return false;
        }
        //--------------------------
        pointOnLineInteger(point, inclusive = false) {
            let isIntersecting = false;
            let nx1;
            let nx2;
            let ny1;
            let ny2;
            if(this.grid1.nx > this.grid2.nx) {
                nx1 = this.grid2.nx;
                nx2 = this.grid1.nx;
            }
            else {
                nx1 = this.grid1.nx;
                nx2 = this.grid2.nx;    
            }
            if(this.grid1.ny > this.grid2.ny) {
                ny1 = this.grid2.ny;
                ny2 = this.grid1.ny;
            }
            else {
                ny1 = this.grid1.ny;
                ny2 = this.grid2.ny;    
            }
            if(inclusive == true){
                if (this.direction === "Vertical") {
                    if((nx1 === point.nx) && (point.ny >= ny1) && (point.ny <= ny2) ) isIntersecting = true;
                }
                if (this.direction === "Horizontal") {
                    if((ny1 === point.ny) && (point.nx >= nx1) && (point.nx <= nx2) ) isIntersecting = true;
                }
            }
            else {
                if (this.direction === "Vertical") {
                    if(nx1 === point.nx && point.ny > ny1 && point.ny < ny2 ) isIntersecting = true;
                }
                if (this.direction === "Horizontal") {
                    if(ny1 === point.ny && point.nx > nx1 && point.nx < nx2 ) isIntersecting = true;
                }
            }
            return isIntersecting;
        }
        //--------------------------
        checkLineAxis(line2){
            if (this.direction == line2.direction){
                if (this.direction == "Horizontal"){
                    if (this.grid1.ny == line2.grid1.ny) {
                        return this.canMergeLines(line2);
                    }
                    else return "false Horizontal";
                }
                else if (this.direction == "Vertical"){
                    if (this.grid1.nx == line2.grid1.nx) {
                        return this.canMergeLines(line2);
                    }
                    else return "false Vertical";
                }
            }
            else return "false direction";
        }
        //--------------------------
        canMergeLines(line2){
            
            if (this.direction =="Horizontal"){
                let minX2;
                let maxX2 = line2.grid1.nx;
                if (line2.grid2.nx < maxX2) minX2 = line2.grid2.nx;
                else {
                    maxX2 = line2.grid2.nx;
                    minX2 = line2.grid1.nx;
                }
                if (this.grid1.nx <= maxX2 && this.grid1.nx >= minX2){
                    return this.direction;
                }
                else if (this.grid2.nx <= maxX2 && this.grid2.nx >= minX2){
                    return this.direction;
                }
                else if (this.grid1.nx <= minX2 && this.grid2.nx >= minX2){
                    return this.direction;
                }
                else if (this.grid2.nx <= minX2 && this.grid1.nx >= minX2){
                    return this.direction;
                }
                else return "false hor cannt merge";
    
            }
    
            if (this.direction =="Vertical"){
                let minY2;
                let maxY2 = line2.grid1.ny;
                if (line2.grid2.ny < maxY2) minY2 = line2.grid2.ny;
                else {
                    maxY2 = line2.grid2.ny;
                    minY2 = line2.grid1.ny;
                }
                if (this.grid1.ny <= maxY2 && this.grid1.ny >= minY2){
                    return this.direction;
                }
                else if (this.grid2.ny <= maxY2 && this.grid2.ny >= minY2){
                    return this.direction;
                }
                else if (this.grid1.ny <= minY2 && this.grid2.ny >= minY2){
                    return this.direction;
                }
                else if (this.grid2.ny <= minY2 && this.grid1.ny >= minY2){
                    return this.direction;
                }
                else return "false vert cannt merge";
    
            }                
        }
        //--------------------------
        rotateObj(rotateCenter, deg){
            let rotateMatrix = degToMatrix(deg);
            let newPoint1 = rotateAroundPoint(this.point1, rotateCenter, rotateMatrix);
            let newPoint2 = rotateAroundPoint(this.point2, rotateCenter, rotateMatrix);
            this.objectKeeper.delete(this);

            let line = new ObjectLine(newPoint1,newPoint2);
            
            this.objectKeeper.appendObj(line);
            this.objectKeeper.selectObj(line);
    
        }
        //--------------------------
        getSaveInfo(){
            let buff ={
                "type":"line",
                "point1": this.point1,
                "point2": this.point2
            };
            return buff;
        }
        //--------------------------
}
//----------------------------------------------------------
class OperationsHistory{
    constructor(){
        this.iMax = 10;
        this.historyList = new Array(this.iMax);
        for (let i=0; i < this.historyList.length; i++){
            this.historyList[i]={flag : null};
        }
        this.currentIndex = 0;
        this.currentList = [];
        this.historyElement = [];
        this.historyList[0] = {list:[], flag: 1};
    }
    //добавление состояния после сравнения состояний(текущий с актуальным)
    addHistory(){
        let result = this.isSameHistory();
        
        if (result) {
            return 0;
        }
        else{
            this.currentIndex = this.fNextIndex(this.currentIndex);
            this.onlyAddHistory();
            this.historyList[this.fNextIndex(this.currentIndex)] = {list:[], flag: null};
        }
    }
    onlyAddHistory(flag = 1, index = this.currentIndex){
        this.getActualHistory();
        //перевод из массива в строку и обратно в массив, чтобы избежать ссылок
        let list = JSON.parse(JSON.stringify(this.currentList))
        this.historyList[index] = {list:list, flag: flag};
    }
    //возвращает актуальное состояние истории с экрана
    getActualHistory(){
        this.currentList = copyAllObjects(objectKeeper);
        return this.currentList;
    }
    //проверка текущей состоянии истории с актуальным состоянием на экране
    isSameHistory(){
        let a1;
        let index = this.currentIndex;
        if(this.historyList[index].flag == null) a1 = [];
        else a1 = this.historyList[index].list;
        this.getActualHistory();
        let string1 = JSON.stringify(this.currentList, null,2);
        let string2 = JSON.stringify(a1, null,2);
        if (string1 == string2) return true;
        else return false;
        
    }

    clearAllHistory(){
        for (let i=0; i < this.historyList.length; i++){
            this.historyList[i]={flag : null};
        }
        this.currentIndex = 0;
        this.currentList = [];
        this.historyElement = [];
        this.historyList[0] = {list:[], flag: 1};
    }

    undo(){
        //Добавить состояние историю с проверкой, был ли добавлен текущее состояние истории в массив, если нет, то добавляется
        this.addHistory();
        //Проверка, возможно ли перейти на предыдущее состояние в истории, проверяется флагами
        let index = this.fPreviousIndex(this.currentIndex);
        if(this.historyList[index].flag!=null && this.historyList[index].flag!="undo"){
            this.historyList[this.currentIndex].flag = "undo";
            this.currentIndex = this.fPreviousIndex(this.currentIndex);
            this.currentList = this.historyList[this.currentIndex].list;
        }
        else {
        }
    }

    redo(){
        //Добавить состояние историю с проверкой, был ли добавлен текущее состояние истории в массив, если нет, то добавляется
        this.addHistory();
        this.currentIndex = this.fNextIndex(this.currentIndex);
        
        if(this.historyList[this.currentIndex].flag!=null && this.historyList[this.currentIndex].flag=="undo"){
            this.currentList = this.historyList[this.currentIndex].list;
            this.historyList[this.currentIndex].flag="redo";
        }
        else {
            this.currentIndex = this.fPreviousIndex(this.currentIndex);
            this.currentList = this.historyList[this.currentIndex].list;
        }
    }
    console(){
        console.log(this.historyList);
    }
    fNextIndex(i){
        if( i+1 >= this.iMax){
            return 0;
        }
        else {
            return i+1;
        }
    }
    fPreviousIndex(i){
        if( i-1 < 0){
            return (this.iMax - 1);
        }
        else {
            return i-1;
        }
    }
    // addOperation(object, operation, params = null){
    //     let buff;
    //     if(object.name!="connector"){
    //         switch(operation){
    //         case "append":
    //             buff = {name:object.name, operation:operation};
    //             this.historyElement.push(buff);
    //             break;
    //         case "delete":
    //             buff = {name:object.name, operation:operation};
    //             this.historyElement.push(buff);
    //             break;
    //         case "move":
    //             buff = {name:object.name, operation:operation, date:{object, params}};
    //             this.historyElement.push(buff);
    //             break;
    //         case "movetogrid":
    //             buff = {name:object.name, operation:operation, date:{object, params}};
    //             this.historyElement.push(buff);
    //             break;
    //         }
    //     }
    // }
    // addAllOperations(){
    //     this.currentIndex++;
    //     if(this.currentIndex >= this.iMax){
    //         this.currentIndex = 0;
    //     }
    //     this.historyList[this.currentIndex] = this.historyElement;
    //     this.historyElement = [];
    // }
}
//----------------------------------------------------------
//Внешние функции
//----------------------------------------------------------
//Нажатие на объект (начало перетаскивания, выбор, и.т.д.) (срабатывает на объекте)
function startDrag (evt){
    if(eventListenerFlag) console.log("startDrag");
    //запрет нативного поведения
    evt.preventDefault();
    
    //если нажата ЛКМ
    if(evt.which == 1 ) {

        // objectKeeper.history.addHistory(); 
        //флаг нажата ЛКМ на объекте
        mouseObjectHitDown = true;
        //флаг пока нет перетаскивания
        mouseIsDraging = false;
        
        //запись чистых координат нажатия
        objCoords = mouseDrawCoords = getMouseDrawPosition(evt,svgFile);

        //ID нажатого объекта
        let objID = this.id;
        let obj = objectKeeper.objectMap.get(objID);

        //если не нажат ctrl и нажатый объект уже не был выбран, то снять выбор со всех объектов 
        if(!evt.ctrlKey && !objectKeeper.selectedMap.has(objID)) {
            objectKeeper.deselectAll();
        }

        //если нажатый объект ещё не выбран, то выбрать объект 
        if (!objectKeeper.selectedMap.has(objID) && obj.isSelectable){
            objectKeeper.selectObj(objID);
            //флаг для предотвращения повторного срабатывания - объект только что был выбран
            mouseObjectWasSelected = true;
        }
        
    }
}

//----------------------------------------------------------
//мышка была отпущена на объекте (обработка клика)
function mouseClickObject (evt) {
    if(eventListenerFlag) console.log("mouseClickObject");
    //если отжатие ЛКМ
    if(evt.which == 1) {
        //флаг отжатия ЛКМ на объекте
        mouseObjectHitUp = true;
        
        //если был перенос, то ничего не делать
        if(mouseIsDraging) {
            mouseIsDraging = false;             
        }
        //если переноса нет (клик)
        else {
            // если не идет выбор коробкой и объект не был только что выбран при нажатии
            if(!mouseSelection && !mouseObjectWasSelected && !lineKeeper.mouseLine) {
                //ID объекта
                let objID = this.id;
                let obj = objectKeeper.objectMap.get(objID);

                //если не нажат ctrl, то выбрать только этот объект
                if (!evt.ctrlKey && obj.isSelectable) {                
                    objectKeeper.deselectAll();
                    objectKeeper.selectObj(objID);  
                }
                //если нажат ctrl, то снять выбор с этого объекта, если он уже был выбран
                else {
                    if (objectKeeper.selectedMap.has(objID) && obj.isSelectable){
                        objectKeeper.deselectObj(objID);    
                    }
                }                 
            }
        }
        //флаг только что выбран в исходное состояние    
        mouseObjectWasSelected = false;
    }    
}

//---------------------------------------------------------------------------------------
//перевод из сеточных координат в координаты
function gridToCoords(grid) {
    
    return {
      x: grid.nx * gridDistance,
      y: grid.ny * gridDistance
    };
}

function coordsToGridCoords(coords) {

    return gridToCoords(coordsToGrid(coords));
}




