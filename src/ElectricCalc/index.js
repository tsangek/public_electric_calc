
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
edgeSelector.addEventListener('change', (event) => {
    // selectedEdges = getSelectValues(edgeSelector);
    // console.log("selectedEdges",selectedEdges);
    var instance1 = M.FormSelect.getInstance(edgeSelector);
    selectedEdges = instance1.getSelectedValues();
    // selectedEdges = M.FormSelect.getInstance(edgeSelector);
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
    // var instance1 = M.FormSelect.getInstance(edgeSelector);
    // selectedEdges = instance1.getSelectedValues();
    var instance2 = M.FormSelect.getInstance(dataTypeSelector);
    selectedDataTypeOption = instance2.getSelectedValues()
    

    make2DPlot(selectedDataTypeOption,selectedEdges);
});

//----------------------------------------------------------------
const inputField1 = document.getElementById('input1');
dt = parseFloat(inputField1.value);
inputField1.addEventListener('change', (event) => {
    dt = parseFloat(inputField1.value);
});

//----------------------------------------------------------------
const inputField2 = document.getElementById('input2');
numberOfTimesteps = parseFloat(inputField2.value);
inputField2.addEventListener('change', (event) => {
    numberOfTimesteps = parseFloat(inputField2.value);
});

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
    // console.log("startCalc",json);
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
    edgeSelector.append("size", edges.length);
    for (let i = 0; i < edges.length; i++) {
        let tempOption = document.createElement("option");
        tempOption.setAttribute("value",i);
        tempOption.innerHTML = edges[i].type + ' ' + edges[i].edgeNum;
        edgeSelector.appendChild(tempOption);  
    }
    updateSelectSelectors();
}
//----------------------------------------------------------------
function updateSelectSelectors(){
    var elems = document.querySelectorAll('select');
    M.FormSelect.init(elems, {});
}
//----------------------------------------------------------------
function make2DPlot(dataType,edgesNums){
    let tempEdgeData = new Array(edgesNums.length);
    for (let i = 0; i < edgesNums.length; i++) {
        let tempVectorX = new Array(GraphObj.edgesCount);
        let tempVectorY = new Array(GraphObj.edgesCount);
        for (let j = 0; j < calcDataByTimesteps.length; j++) {
        tempVectorY[j] = calcDataByTimesteps[j][Number(edgesNums[i])][dataType];
        tempVectorX[j] = j*dt;             
        }
    tempEdgeData[i] = ({
        x: tempVectorX,
        y: tempVectorY,
        mode: "lines",
        name: GraphObj.graphEdges[Number(edgesNums[i])].type + ' ' + GraphObj.graphEdges[Number(edgesNums[i])].edgeNum
        });
    }
    Plotly.newPlot("output_plot", tempEdgeData);
}
//----------------------------------------------------------------
function makeUITable() {
    clearTable();
    let headerStringArr = [];
    for (let i = 0; i < GraphObj.edgesCount; i++) {
        headerStringArr.push(GraphObj.graphEdges[i].type + ' ' + GraphObj.graphEdges[i].edgeNum);
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



