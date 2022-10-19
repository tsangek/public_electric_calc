var xmlns = "http://www.w3.org/2000/svg";

var stretchFactor = 1.1; 
var svgObjectPadding = 20;

//--------------------------
//debug

//----------------------------------------------------------------
const giveInfoToComputationBtn = document.getElementById('giveInfoToComputationBtn');
giveInfoToComputationBtn.addEventListener('click', (event) => {
    tabsInit.select('computationPlot');
    giveInfoToComputation();
});
//----------------------------------------------------------------

function listAllObjects() {
    objectKeeper.objectMap.forEach(obj => {
        console.log(obj);
    });    
}
//--------------------------
function listAllGrafs() {
    // инициализация всех элементов
    var tempList = [];
    var buff = null;
    for (var [key, value] of objectKeeper.objectMap) {
        if(value.type != "connector" && value.type != "line"){
            value.relatedGraphObj = [];
        }   
        buff = {value, relatedGraphObj: [], flag: false};
        if(buff.value.connectorNumber) buff.value.connectorNumber = null;
        tempList.push(buff);
    }

    var connectorCounter = 0;
    for (let i = 0; i < tempList.length; i++) {
        
        if(tempList[i].value.type != "connector" && tempList[i].value.type != "line"){
            tempList[i].value.connectors.forEach(obj => {
                let l = null;
                //находим номер obj из листа tempList
                l = findObjFromList(obj, tempList, 0);
                if( l == null) return 0;
                if (tempList[l].flag == false){
                    startRoute(obj, tempList, i, connectorCounter);
                    connectorCounter++;
                }
            });        
        }
    }
    //записываем найденные номера графа
    objectKeeper.objectMap.forEach(obj1 =>{
        
        if(obj1.type != "connector" && obj1.type != "line"){
            obj1.connectors.forEach(obj => {
                let l = null;
                l = findObjFromList(obj, tempList, 0);
                if( l == null) return 0;
                obj1.relatedGraphObj.push(tempList[l].value.connectorNumber);
            });
        }
    });

    // for (let i = 0; i < tempList.length; i++){
    //     if(tempList[i].value.name != "connector" && tempList[i].value.name != "line"){
    //         console.log (tempList[i].value.id);
    //         console.log (tempList[i].relatedGraphObj);

    //     }
    // }
    // for (let i = 0; i < tempList.length; i++){
    //     if(tempList[i].value.name == "connector"){
    //         console.log (tempList[i].value.id, tempList[i].value.connectorNumber);

    //     }
    // }
    //меняет названия подсказки объектов (параметр "title")
    renameIDObjects();
}
//--------------------------------------------------------------------
function startRoute(obj, tempList, k, connectorCounter){
    let l = null;
    l = findObjFromList(obj, tempList, k);
    if( l == null || l == k) return 0;
    if (tempList[l].flag == true){
        return 0;
    }
    else tempList[l].flag = true;

    if(tempList[l].value.type != "connector" && tempList[l].value.type != "line" && l!=k){
        return 1;
    }
    
    if (tempList[l].value.type =="connector"){
        if(!tempList[l].value.connectorNumber || tempList[l].value.connectorNumber == null) tempList[l].value.connectorNumber = connectorCounter;
        tempList[l].value.relatedObjects.forEach(obj1 => {
            startRoute(obj1, tempList, k, connectorCounter);
        });
        return 0;   
    }
    else {
        tempList[l].value.connectors.forEach(obj2 => {
            startRoute(obj2, tempList, k, connectorCounter);
        });
        return 0;   
    }
    //listObj.push(value);

}
//-----------------------------------------------------------------------
function findObjFromList(obj, list, fromIndex = 0){
    for(let i = fromIndex ; i < list.length; i++){
        if(list[i].value.id == obj.id){
            return i;
        }
    }
    return null;
}
//-----------------------------------------------------------------------
function renameIDObjects(list){
    let newID;
    let buff;
    objectKeeper.objectMap.forEach(obj =>{
        
            buff = obj.svgDrawnIcon.getElementsByTagName("title");
            if (obj.type =="connector"){
                newID = obj.id+"\nnode: "+ obj.connectorNumber;
                buff[0].innerHTML = newID;
            }
            else{
                if(obj.type != "connector" && obj.type != "line"){
                    newID = obj.id;
                    newID += "\nnodes:"
                    for( let j = 0; j < obj.relatedGraphObj.length; j++){
                        newID +=" "+ obj.relatedGraphObj[j];
                    }
                    buff[0].innerHTML = newID;
                }
            }
        
    });
   

}
//---------------------------------------------------------------------------------------------------------------

function showDate(){
    let listObjects = [];
    let buff;
    listObjects = copyAllObjects(objectKeeper);
    
    const blabla = JSON.stringify(listObjects, null,2);
    localStorage.setItem('operationHistory', blabla);
    console.log(blabla);
    const blob = new Blob([blabla], {type : 'application/json'});
    console.log(blob);

    const url = URL.createObjectURL(blob);
  
    var link = document.createElement("a");
    link.download = "myDate";
    link.href = url;
    link.click();
}
//функция передачи схемы с окна рисовальщика к окну рещальщика 
function giveInfoToComputation(){
    listObjects = copyAllObjects(objectKeeper);
    // console.log('giveInfoToComputation->listObjects',listObjects);
    const json = jsonForComputation(listObjects);
    // const blabla = JSON.stringify(json, null,2);
    // console.log(blabla);
    // console.log('giveInfoToComputation->jsonForComputation',json);
    startCalc(json);
}
//приведение данных для решения решальщика
function jsonForComputation(obj){
    // console.log("jsonForComputation->obj:", obj);
    for(var val in obj){
        if (obj[val]["type"] === "line"){
            delete obj[val];
        }
        else if(obj[val].electricParameters){
            delete obj[val].pos;
            delete obj[val].model;
            delete obj[val].rotateGrad;
            temp = obj[val]["electricParameters"];
            for(var val2 in temp){
                let temp2 = {[val2] : temp[val2]};
                obj[val][val2]=temp2[val2];
            }
            
            delete obj[val].electricParameters
        }
        
    }
    //костыльище
    for(let i = 0; i < obj.length; i++){
        if(!obj[i]){
            obj.length = i;
        }
    }
    console.log("modified obj", obj);
    return obj;
}

function loadDateJSON(input){
    // console.log("loadDateJSON.input",input);
    var file = input.files[0];
    let reader = new FileReader();
    objectKeeper.deleteAll();
    // for (var [key, value] of objectKeeper.objectMap) {
    //     objectKeeper.deleteObj(value);
    // }
    reader.readAsText(file);

    reader.onload = function() {
        let json = JSON.parse(reader.result);

       // const obj = JSON.parse(json);
       console.log(json);
       appendObjectsFromList(json)
    }
  
    reader.onerror = function() {
        console.log(reader.error);
    };
}
  

function copyAllObjects(objectKeeper){
    listAllGrafs();
    let listObjects = [];
    objectKeeper.objectMap.forEach(obj => {
        if (obj.type=="connector") return 0;
        else {
            let buff = obj.getSaveInfo()
            listObjects.push(buff);
            return 1;
        }
    });
    console.log("listObjects",listObjects);
    return listObjects;
}

function appendObjectsFromList(json){
    for(let i = 0; i < json.length; i++) {
        let obj = json[i];
        if (obj.type == "line"){
            let svgLineConnect = new ObjectLine(obj.point1,obj.point2);
			objectKeeper.appendObj(svgLineConnect);
        }
        else {
            let tempStaticObj = new StaticObj(obj.model);
            tempStaticObj.updateParameters(obj.electricParameters);
            let tempObjGeneric = new ObjectGeneric(obj.pos,tempStaticObj);
            objectKeeper.appendObj(tempObjGeneric);
            tempObjGeneric.rotateObjDeg(obj.rotateGrad)
            
        }

    }
} 

function loadDateFile(file){
    objectKeeper.deleteAll();
    fetch('./Data/' + file)
    .then(res => res.text())
    .then(data => {
        let json = JSON.parse(data);
       // const obj = JSON.parse(json);
       console.log(json);
       appendObjectsFromList(json)
    })
    .catch(err => {
        throw err;
    });

}

