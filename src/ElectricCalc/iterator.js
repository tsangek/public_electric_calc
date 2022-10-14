//---------------------------------------------------------------------------
var flagDebug = false;
var flagIni = true;
var writeCounter;
var iterCounter;
var calcDataByTimesteps = [];
var writeCounterAllTest;
var DEBUG_EIGEN_NORM = 0;
function main()
{
	flagDebug = false;
	flagIni = true;
	writeCounter = 0;
	iterCounter = 0;
	writeCounterAllTest=0;
	let t = 0;
	writeCalcResaults();
	var timeStart = Date.now();
	var timeEnd;
	//dt = 1e-25;
	//——————————————————————————————————————————————————————————————————————————————
	//Основной цикл по времени
	//——————————————————————————————————————————————————————————————————————————————
	try{
		while(writeCounter < numberOfTimesteps)       //цикл по времени (ограничение по кол-ву шагов)
		{
			
			flagDebug = false;
			if(writeCounter === 416) {
				flagDebug = true;
			}

			//——————————————————————————————————————————————————————————————————————————————
			//Поиск замкнутых контуров и составление матрицы СЛАУ Кирхгофа и её решение
			//——————————————————————————————————————————————————————————————————————————————
			//Создание и решение матрицы СЛАУ Кирхгофа
			SolverObj.newIteration(dt,0);
			
			//writeCalcResaults();
			//——————————————————————————————————————————————————————————————————————————————
			t = t + dt;  //время нового времянного слоя
			writeCounter++;     //инкримент количества временных шагов
			if(writeCounter%1 === 0) console.log(writeCounter,iterCounter,writeCounterAllTest);
			
		}
	} 
	catch(errorID){
		console.log(errorID);
	}
	var timeEnd = Date.now();
	console.log('end',writeCounter,writeCounterAllTest,(timeEnd-timeStart)+"ms");
}//Конец програмы main

	

function writeCalcResaults(){
	const dataVector = new Array(GraphObj.edgesCount);
	for (let i = 0; i < GraphObj.edgesCount; i++) {
		dataVector[i] = GraphObj.graphEdges[i].printData();				
	}	
	calcDataByTimesteps.push(dataVector);
}


function writeDebugCalcResaults(count){
	const dataVector = new Array(GraphObj.edgesCount+1);
	dataVector[0] = count;
	for (let i = 1; i < GraphObj.edgesCount+1; i++) {
		dataVector[i] = GraphObj.graphEdges[i-1].printData();				
	}
	
	calcDataByTimesteps.push(dataVector);
}






