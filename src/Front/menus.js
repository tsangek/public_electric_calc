class MenuKeeper {

    menuList = new Map();

    constructor(){

    }

    addMenu (parentDiv){
        let menuObj = new ObjectMenuContainer(parentDiv);
        let idMenu = parentDiv.id; 
        this.menuList.set(idMenu,menuObj);
        return menuObj;
    }
    elementPressedMenu(element){
        let idMenu = element.parentElement.id;
        let menu = this.menuList.get(idMenu);

        this.menuList.forEach(function (value, key, map){
                if (value!=menu){
                    value.elementDeselected();
                }
            });
        if(menu.selectedHTMLMenuElement==element){
            menu.elementDeselected();
        }
        else {
            if (menu.selectedHTMLMenuElement) {
                menu.elementDeselected();
            }
            menu.elementSelected(element);
        }
    }
    allElementDeselected(){
        this.menuList.forEach(function (value, key, map){
                value.elementDeselected();
            });
        deactivateAllModesMenu();
    }
    getSelectedObjMenu(){
        let obj = null;
        this.menuList.forEach(function (value, key, map){
                if (value.selectedObj!=null){
                    obj = value.selectedObj;
                }
            });
        return obj;
    }
}

//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------

class ObjectMenuContainer {
    selectedMenuElement = null;
    selectedHTMLMenuElement = null;
    selectedObj = null;

    constructor (parentDiv){
        this.parentDiv = parentDiv; 
        this.elementCounter = 1; 
        this.elementMap = new Map();

    }

    addElement(typeObj, nameObj, callBackFunction){
        let staticObj = new StaticObj(nameObj);
        let menuElement = this.menuMakeElement(typeObj, callBackFunction);
        let svg = staticObj.svgMenuIcon.cloneNode(true);
        menuElement.append(svg);
        this.parentDiv.append(menuElement);
        let newID = staticObj.type+'_'+ this.elementCounter;
        menuElement.id = newID;
        this.elementMap.set(newID, {menuElement, obj : staticObj});
        //console.log(menuContainer);
        this.elementCounter++;
    }
    elementSelected(element) {
        this.selectedHTMLMenuElement = element;
        this.selectedMenuElement=this.elementMap.get(element.id);
        this.selectedHTMLMenuElement.classList.add('menuElementSelected');
        this.selectedObj=this.selectedMenuElement.obj;
    }
    elementDeselected(){
        if (this.selectedHTMLMenuElement!=null){
            this.selectedHTMLMenuElement.classList.remove ('menuElementSelected');
        }
        this.selectedHTMLMenuElement= null;
        this.selectedMenuElement = null;
        this.selectedObj = null;
    }
   
    //svg настройки меню svg-объектов
    menuMakeElement(typeObj='object', callBackFunction) {
        let menuElement = document.createElementNS(xmlns, "svg");
        menuElement.setAttributeNS(null,"class","menuContainer"); 
        menuElement.setAttributeNS(null,"viewBox","-330 -330 660 660"); 
        menuElement.setAttributeNS(null,"preserveAspectRatio","xMidYMid slice");
        menuElement.setAttributeNS(null,"stroke","black");

        menuElement.addEventListener("mousedown", callBackFunction, false);
        
        return menuElement;
    }
}

//---------------------------------------------------------------------------------------
// функция добавления объекта в SVG, путем изменения флага chkCreateObject
function menuDefaultClickCallback(evt) {
    if(eventListenerFlag) console.log("menuDefaultClickCallback");
    evt.preventDefault();
    menuKeep.elementPressedMenu(this);
    if(menuKeep.getSelectedObjMenu()) {
        activateCreateObjectMenu();
    }
    else {
        deactivateAllModesMenu();
    }
}

function menuLineClickCallback(evt) {
    if(eventListenerFlag) console.log("menuLineClickCallback");
    evt.preventDefault();
    menuKeep.elementPressedMenu(this);
    if(menuKeep.getSelectedObjMenu()) {
        activateDrawLineMenu();
    }
    else {
        deactivateAllModesMenu();
    }
}

//флаги
// chkDoLine
// chkCreateObject
// YOBAReady
function activateDrawLineMenu() {
    chkDoLine = true;
    chkCreateObject = false;

    YOBAReady = false;
}
function activateCreateObjectMenu() {
    chkDoLine = false;
    chkCreateObject = true;

    YOBAReady = true;
}
function deactivateAllModesMenu() {
    chkDoLine = false;
    chkCreateObject = false;

    YOBAReady = false;
}

class PropertyKeeper{
    constructor (svgFile){
        this.svgFile = svgFile; 
        this.element = this.makeElement();
        this.svgFile.appendChild(this.element);
        this.okno = document.getElementById("okno");
        this.subDiv = this.okno.querySelector("div");
    }
    targetOkno(e){
        
        this.updateOkno(objectKeeper.selectedMap);
        this.positionOkno(e);
        this.okno.classList.add("target");
        
        
    }
    updateOkno(map){
        let buff;
        map.forEach(obj => {
            if(obj.type!="line" && obj.type!="connector"){
                buff = obj;
            }
        });
        if(buff){
            let listTemps = [];
            listTemps.push({key:"type", value:buff.type});
            listTemps.push({key:"id", value:buff.id});
            listTemps.push({key:"pos", value:buff.pos});
            //this.createInputField(temp);
            this.subDiv.innerHTML = '';
            listTemps.forEach(element =>{
                this.subDiv.append(this.createInputField(element));
            })
        }
    }
    createInputField({key, value}){
        let tempDiv = document.createElement("div");
        //tempDiv.style.height = '100px';
        
        let type = document.createElement("label");
        type.innerHTML = key+":";
        tempDiv.append(type);
        let input = document.createElement("input");
        input.setAttribute("type", "text");
        if(!value.x){
            input.setAttribute("value", value);
        }
        else {
            input.setAttribute("value", value.x + ' ' + value.y);
        }
        tempDiv.append(input);
        return tempDiv;

    }
    positionOkno(e){
        mouseDocumentCoords = getPosition(e);
        let okno = document.getElementById("okno");
        let clickCoordsX = mouseDocumentCoords.x;
        let clickCoordsY = mouseDocumentCoords.y;
        okno.style.left = clickCoordsX + "px";
        okno.style.top = clickCoordsY + "px";
        
    }
    closeOkno(){
        this.okno.classList.remove("target");
    }
    makeElement() {
        let href = document.createElementNS(xmlns, "a");
        href.setAttributeNS(null,"href","#");
        href.setAttributeNS(null,"class","close");
        href.innerHTML = "Close window";
        let divOkno = document.createElementNS(xmlns, "div");
        divOkno.setAttributeNS(null,"id","okno");
        divOkno.innerHTML = "OKNO";
        let divZatemnenie = document.createElementNS(xmlns, "div");
        divZatemnenie.setAttributeNS(null,"id","zatemnenie");
        divOkno.appendChild(href);
        divZatemnenie.appendChild(divOkno);
        
        return divZatemnenie;
    }
}