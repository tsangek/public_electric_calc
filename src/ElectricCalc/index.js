console.log("start index.js");
var reader = new FileReader();

var table = document.getElementById('output_table');
var lineCount = 0;

var GraphObj;
var SolverObj;
var numberOfTimesteps;
var dt;

var selectedValueNum;
var selectedDataTypeOption;

var selectedEdges = [];
//----------------------------------------------------------------
var fileUploaded;
const fileSelector = document.getElementById('file_selector');
fileSelector.addEventListener('change', (event) => {
fileUploaded = event.target.files[0];
});
//----------------------------------------------------------------
const parseBtn = document.getElementById('parse_file_btn');
parseBtn.addEventListener('click', (event) => {
    loadDate(fileUploaded);
});
//----------------------------------------------------------------
const dataTypeSelector = document.getElementById('dataTypeSelector');
selectedValueNum = dataTypeSelector.options.selectedIndex;
selectedDataTypeOption = dataTypeSelector.options[selectedValueNum];
dataTypeSelector.addEventListener('change', (event) => {
    selectedValueNum = dataTypeSelector.options.selectedIndex;
    selectedDataTypeOption = dataTypeSelector.options[selectedValueNum];
});

//----------------------------------------------------------------
const edgeSelector = document.getElementById('edgeSelector');
const rightSideMenu1 = document.getElementById('rightSideMenu1');
// console.log("rightSideMenu1",rightSideMenu1);

// var elems = document.querySelectorAll('select');
// var instances = M.FormSelect.init(elems, options);
// console.log("elems",elems);
// console.log("instances",instances);

// console.log("edgeSelector",edgeSelector);
edgeSelector.addEventListener('change', (event) => {
    selectedEdges = getSelectValues(edgeSelector);
    console.log("selectedEdges",selectedEdges);
});
//----------------------------------------------------------------
const showBtn = document.getElementById('calcData_btn');

showBtn.addEventListener('click', (event) => {
    makeTable(selectedDataTypeOption.value);
});

//----------------------------------------------------------------
const showBtn2 = document.getElementById('calcUI_btn');

showBtn2.addEventListener('click', (event) => {
    makeUITable();
});
//----------------------------------------------------------------
const showBtn1 = document.getElementById('calcData_btn1');

showBtn1.addEventListener('click', (event) => {
    make2DPlot(selectedDataTypeOption.value,selectedEdges);
});

// //----------------------------------------------------------------
// const showBtn3 = document.getElementById('showDebug1');

// showBtn3.addEventListener('click', (event) => {
//     makeDebugTable(selectedDataTypeOption.value);
// });


//----------------------------------------------------------------
const inputField1 = document.getElementById('input1');
dt = parseFloat(inputField1.value);
inputField1.addEventListener('change', (event) => {
    dt = parseFloat(inputField1.value);
});

//----------------------------------------------------------------
const inputField2 = document.getElementById('input2');
console.log("input2",inputField2.value);
numberOfTimesteps = parseFloat(inputField2.value);
console.log("input2Number",numberOfTimesteps);
inputField2.addEventListener('change', (event) => {
    console.log("input2",inputField2);
    numberOfTimesteps = parseFloat(inputField2.value);
});

// var el = document.querySelector('.tabs');
// var tabsInit = M.Tabs.init(el, {});

//----------------------------------------------------------------
function loadDate(fileUploaded){
    var file = fileUploaded;
    

    reader.readAsText(file);

    reader.onload = function() {
        let json = JSON.parse(reader.result);
        console.log(json);
        startCalc(json);
    }
  
    reader.onerror = function() {
        console.log(reader.error);
    };
}
// //----------------------------------------------------------------
// function appendEdgesFromList(json){
//     GraphObj = new Graph(json);
//     SolverObj = new Solver(GraphObj);
//     console.log(GraphObj);
//     console.log(SolverObj);
// }
//----------------------------------------------------------------
function startCalc(json){
    calcDataByTimesteps = [];
    GraphObj = new Graph(json);
    SolverObj = new Solver(GraphObj);
    makeSelectEdges(GraphObj.graphEdges);
    main();
}
//----------------------------------------------------------------
function newTableLine(stringDataArr,isHeader){
    let line = document.createElement("tr");
    if(!isHeader){
        let cell = document.createElement("td");
        cell.innerHTML = lineCount;
        line.appendChild(cell);
    }
    else {
        let cell = document.createElement("td");
        line.appendChild(cell);
    }
    stringDataArr.forEach(stringData => {
        let cell = document.createElement("td");
        if(isHeader){
            cell.setAttribute("class","tableHeader");
        }
        cell.innerHTML = stringData;
        line.appendChild(cell);
    });
    table.appendChild(line);
    lineCount++;
}
//----------------------------------------------------------------
function clearTable(){
    lineCount = 0;
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }
}
//----------------------------------------------------------------
function makeTable(dataType){
    clearTable();
    let headerStringArr = [];
    for (let i = 0; i < GraphObj.edgesCount; i++) {
        headerStringArr.push(GraphObj.graphEdges[i].type + ' ' + GraphObj.graphEdges[i].edgeNum);
    }
    newTableLine(headerStringArr,true);
    
    let tempVector = new Array(GraphObj.edgesCount);
    for (let i = 0; i < calcDataByTimesteps.length; i++) {
        for (let j = 0; j < GraphObj.edgesCount; j++) {
            tempVector[j] = calcDataByTimesteps[i][j][dataType];            
        }
        newTableLine(tempVector,false);        
    }
}
//----------------------------------------------------------------
function getSelectValues(select) {
    var result = [];
    var options = select && select.options;
    var opt;
  
    for (var i=0, iLen=options.length; i<iLen; i++) {
      opt = options[i];
  
      if (opt.selected) {
        result.push(Number.parseInt(opt.value));
      }
    }
    return result;
  }
//----------------------------------------------------------------
function makeSelectEdges(edges){
    while (edgeSelector.firstChild) {
        edgeSelector.removeChild(edgeSelector.firstChild);
    }
    console.log("edges:",edges);
    edgeSelector.setAttribute("size",edges.length);
    for (let i = 0; i < edges.length; i++) {
        let tempOption = document.createElement("option");
        tempOption.setAttribute("value",i);
        tempOption.innerHTML = edges[i].typeRLC + ' ' + edges[i].edgeNum;
        console.log("tempOption:",tempOption);
        edgeSelector.appendChild(tempOption);  
    }
    // M.AutoInit();
    M.FormSelect.init(edgeSelector);
    console.log("edgeSelector:",edgeSelector);
}
//----------------------------------------------------------------
function make2DPlot(dataType,edgesNums){
    let tempEdgeData = new Array(edgesNums.length);
    
    for (let i = 0; i < edgesNums.length; i++) {
        let tempVectorX = new Array(GraphObj.edgesCount);
        let tempVectorY = new Array(GraphObj.edgesCount);
        for (let j = 0; j < calcDataByTimesteps.length; j++) {
            tempVectorY[j] = calcDataByTimesteps[j][edgesNums[i]][dataType];
            
            if(j===0) {
                tempVectorX[j] = 0;    
            }
            else {
                tempVectorX[j] = tempVectorX[j-1] + calcDataByTimesteps[j][0]['dt']; 
            }         
        }
    tempEdgeData[i] = ({
        x: tempVectorX,
        y: tempVectorY,
        mode: "lines",
        name: GraphObj.graphEdges[edgesNums[i]].typeRLC + ' ' + GraphObj.graphEdges[edgesNums[i]].edgeNum
        });
    }
    Plotly.newPlot("output_plot", tempEdgeData);
}
//----------------------------------------------------------------
function makeUITable() {
    clearTable();
    let headerStringArr = [];
    for (let i = 0; i < GraphObj.edgesCount; i++) {
        headerStringArr.push(GraphObj.graphEdges[i].typeRLC + ' ' + GraphObj.graphEdges[i].edgeNum);
    }
    newTableLine(headerStringArr,true);
    
    let tempVector1 = new Array(GraphObj.edgesCount);
    let tempVector2 = new Array(GraphObj.edgesCount);
    for (let i = 0; i < calcDataByTimesteps.length; i++) {
        for (let j = 0; j < GraphObj.edgesCount; j++) {
            tempVector1[j] = calcDataByTimesteps[i][j]["I"];
            tempVector2[j] = calcDataByTimesteps[i][j]["U"];             
        }
        newTableLine(tempVector1,false); 
        newTableLine(tempVector2,false); 
        newTableLine([],false);          
    }    
}

//----------------------------------------------------------------
function makeDebugTable(dataType){
    clearTable();
    let headerStringArr = [];
    headerStringArr.push("step #");
    for (let i = 1; i < GraphObj.edgesCount+1; i++) {
        headerStringArr.push(GraphObj.graphEdges[i-1].typeRLC + ' ' + GraphObj.graphEdges[i-1].edgeNum);
    }
    newTableLine(headerStringArr,true);
    
    let tempVector = new Array(GraphObj.edgesCount+1);
    for (let i = 0; i < calcDataByTimesteps.length; i++) {
        tempVector[0] = calcDataByTimesteps[i][0];
        for (let j = 1; j < GraphObj.edgesCount+1; j++) {
            tempVector[j] = calcDataByTimesteps[i][j][dataType];            
        }
        newTableLine(tempVector,false);        
    }   
}



