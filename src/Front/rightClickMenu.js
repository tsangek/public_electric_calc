// var openRightClickMenus = [];

// function openMenu(parent, localCoords){

//     let tempMenu = document.createElement("form");
//     tempMenu.setAttribute("class","rightClickMenu");

//     tempMenu.style.left = localCoords.x+"px";
//     tempMenu.style.top = localCoords.y+"px";
//     parent.appendChild(tempMenu);


//     openRightClickMenus.push(tempMenu);
//     return tempMenu;
// }


var rightClickMenu;
var rightClickMenuButtons;
var rightClickMenuButtonFuncs = new Map;
var rightClickMenuButtonSelected;
var rightClickMenuButtonsFuncArr = [];
var rightClickMenuElement;
var rightClickMenuItemNum = 0;
var rightClickMenuState;

function createRightClickMenu() {
    rightClickMenu = document.getElementsByClassName("context-menu")[0];
    rightClickMenuState = 0;
    
    rightClickMenuButtonFuncs.set("context-menu_edit", rightClickMenuFuncEdit);
    rightClickMenuButtonFuncs.set("context-menu_a1", rightClickMenuFuncA1);  
    rightClickMenuButtonFuncs.set("context-menu_a2", rightClickMenuFuncA2); 
    
    rightClickMenuButtons= rightClickMenu.getElementsByClassName("context-menu__link")
    for (let i = 0; i < rightClickMenuButtons.length; i++){
        rightClickMenuButtons[i].addEventListener("mousemove",function (e) {
            rightClickMenuButtonSelect(rightClickMenuButtons[i]);
            rightClickMenuItemNum = i;
        });
        rightClickMenuButtons[i].addEventListener("mouseleave",function (e) {
            rightClickMenuButtonDeselect(rightClickMenuButtons[i]);
            rightClickMenuItemNum = 0;
        });    
    }

    
    rightClickMenuButtonsFuncArr = Array.from(rightClickMenuButtonFuncs.values());

    contextListner(svgFile);
    
    document.addEventListener("mousedown", function (e) {
        if(!rightClickMenuState) return;
        var clickedElement = clickInsideElement(e,"context-menu__link");
        if(clickedElement) {
            e.preventDefault();
            let callbacfnc = rightClickMenuButtonFuncs.get(clickedElement.id);
            if(callbacfnc) {
                callbacfnc(); 
            }
        }
        toggleMenuOff();    
        }, false);

    document.addEventListener("keydown", function (e) {
        if(!rightClickMenuState) return;
        e.stopImmediatePropagation();
        e.preventDefault();
        if(e.keyCode === 27) { //escape
            toggleMenuOff();
        }

        if(e.keyCode === 38) { //up arrow
            if(!rightClickMenuButtonSelected) {
                rightClickMenuItemNum = rightClickMenuButtonsFuncArr.length-1;    
            }
            else if (rightClickMenuItemNum <= 0) {
                rightClickMenuItemNum = rightClickMenuButtonsFuncArr.length-1;
            } 
            else {
                rightClickMenuItemNum--;    
            }
            rightClickMenuButtonSelect(rightClickMenuButtons[rightClickMenuItemNum]);
        }

        if(e.keyCode === 40) { //down arrow
            if(!rightClickMenuButtonSelected) {
                rightClickMenuItemNum = 0;    
            }
            else if (rightClickMenuItemNum >= rightClickMenuButtonsFuncArr.length-1) {
                rightClickMenuItemNum = 0;
            } 
            else {
                rightClickMenuItemNum++;    
            }
            rightClickMenuButtonSelect(rightClickMenuButtons[rightClickMenuItemNum]);
        }

        if(e.keyCode === 13) { //enter
            if(rightClickMenuButtonSelected) {
                let callbacfnc = rightClickMenuButtonFuncs.get(rightClickMenuButtonSelected.id);
                if(callbacfnc) {
                    callbacfnc(); 
                } 
                toggleMenuOff();
                return; 
            }
        }
        }, false);

    window.onresize = function(e) {
        toggleMenuOff();
        };
}

function contextListner(element){

    element.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    rightClickMenuElement = element;
    rightClickMenuItemNum = 0;
    toggleMenuOn(e);    
    }, false);

    
}

function toggleMenuOn(e) {
    if ( rightClickMenuState !== 1 ) {
        rightClickMenuState = 1;
        rightClickMenu.classList.add("active");
        rightClickMenu.focus();
    }
    rightClickMenuItemNum = 0;
    rightClickMenuButtonDeselect(rightClickMenuButtonSelected);
    positionMenu(e);
}

function toggleMenuOff() {
    if ( rightClickMenuState == 1 ) {
        rightClickMenuState = 0;
        rightClickMenu.classList.remove("active");
        rightClickMenu.blur();
    }
}

// updated positionMenu function
function positionMenu(e) {
    mouseDocumentCoords = getPosition(e);
    let clickCoordsX = mouseDocumentCoords.x;
    let clickCoordsY = mouseDocumentCoords.y;

    let menuWidth = rightClickMenu.offsetWidth + 4;
    let menuHeight = rightClickMenu.offsetHeight + 4;

    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    if ( (windowWidth - clickCoordsX) < menuWidth ) {
        rightClickMenu.style.left = windowWidth - menuWidth + "px";
    } else {
        rightClickMenu.style.left = clickCoordsX + "px";
    }

    if ( (windowHeight - clickCoordsY) < menuHeight ) {
        rightClickMenu.style.top = windowHeight - menuHeight + "px";
    } else {
        rightClickMenu.style.top = clickCoordsY + "px";
    }
}

function clickInsideElement( e, className ) {
    let el = e.srcElement || e.target;
    
    if ( el.classList.contains(className) ) {
      return el;
    } else {
      while ( el = el.parentNode ) {
        if ( el.classList && el.classList.contains(className) ) {
          return el;
        }
      }
    }

    return false;
}
function rightClickMenuButtonSelect(button){
    rightClickMenuButtonDeselect(rightClickMenuButtonSelected);
    button.classList.add("selected");
    rightClickMenuButtonSelected = button;
}

function rightClickMenuButtonDeselect(button){
    if(!button || rightClickMenuButtonSelected !== button) return;
    button.classList.remove("selected");
    rightClickMenuButtonSelected = null;
}

function rightClickMenuFuncEdit(e){
    // propertyMenu.targetOkno(e);
    objectKeeper.userEditObjects();
    console.log("edit");
}

function rightClickMenuFuncA1(){
    objectKeeper.userRotateObjects(90);
    console.log("rotate 90");      
}

function rightClickMenuFuncA2(){
    objectKeeper.userRotateObjects(-90);
    console.log("rotate -90");      
}


  