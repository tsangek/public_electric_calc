
//——————————————————————————————————————————————————————————————————————————————
//Программа решения системы линенйных уравнений A*f = b
//Data in: вектор правой части СЛАУ - b, матрица СЛАУ - A,
//вектор переменных СЛАУ - f
//——————————————————————————————————————————————————————————————————————————————
class Solver{
    
    constructor(graph){
        this.graph = graph;
        this.halfDimensionUravnenia = this.graph.edgesCount;
        this.dimensionUravnenia = this.graph.edgesCount*2;
        //--------------------------
        //создание массивов для записи обработанных данных - т.е. без отключенных
        //рёбер и узлов
        
        this.A = new Array(this.dimensionUravnenia);
        this.B = new Array(this.dimensionUravnenia).fill(0);
        this.X = new Array(this.dimensionUravnenia).fill(0);

        for (let i = 0; i < this.dimensionUravnenia; i++){
            this.A[i] = new Array(this.dimensionUravnenia).fill(0);
        }
        
        let usedNodesIterator = 0; //один узел в каждой цепи пропускается - счётчик
        for (let i = 0; i < graph.nodesCount; i++) //перебор узлов
        {
            if(graph.graphNodes[i].nodeRank===0) continue; //если ранг узла равен 0 - пропуск
            if(graph.disjointStartNodes[i]) continue; //пропуск одного узла для каждой 
            //несвязной цепи

            //запись уравнений баланса токов в узлах: a0*I0 + a1*I1 + ... + ai*Ii = 0
            // ai равно 0, если ребро не соеденино с данным узлом,
            // ai равно 1 - если данный узел - вход ребра,
            // ai равно -1 - если данный узел - выход ребра.

            //надо убрать ненужные узлы

            //для нужных узлов записать сумму токов
            for (let j = 0; j < this.graph.graphNodes[i].nodeRank; j++){
                // edgeNumber-номер грани,
                let edgeNum = this.graph.graphNodes[i].neighborEdgesNums[j];
                //signCurrent - направление тока относительно узла (1, -1, 0)  
                this.A[usedNodesIterator][edgeNum]                                                              = graph.graphNodes[i].neighborEdgeIsEntrance[j];
                this.A[usedNodesIterator + this.halfDimensionUravnenia][edgeNum + this.halfDimensionUravnenia]  = graph.graphNodes[i].neighborEdgeIsEntrance[j]; 
            }
            
            this.B[usedNodesIterator]                               = 0;
            this.B[usedNodesIterator + this.halfDimensionUravnenia] = 0;
            usedNodesIterator++;
        }
    }
    //——————————————————————————————————————————————————————————————————————————————
    //change the matrix parts that may change during runtime;
    solveForCurrentData(dtCurrent){
    //--------------------------
        //расчёт коефициентов A и B. Считается, что каждое ребро при dt->0 обладает
		//линейной зависимостью напряжения и тока: U = A*I + B
        for (let i = 0; i < this.graph.graphEdges.length; i++) {
            // if (i===4) {
            //     i=4;
            // }
            
            this.graph.graphEdges[i].calcLinearCoef(dtCurrent);
        }
    
        //Напряжение при обходе контура
        //--------------------------
        //Всего ранг матрицы равен кол-ву активных рёбер. Уравнения с номера
        //кол-ва активных узлов и вплоть до кол-ва активных рёбер - это уравнения
        //падения напряжения при обходе контура.
        for (let i = this.graph.usedNodesCount; i < this.graph.edgesCount; i++)
        {
            let currentCircuitNum = i - this.graph.usedNodesCount;
            //Перебор по всем рёбрам в данном замкнутом контуре. Их кол-во смотрится
            //в классе Graph.
            this.A[i].fill(0);
            this.A[i + this.halfDimensionUravnenia].fill(0);
            this.B[i] = 0;
            this.B[i + this.halfDimensionUravnenia] = 0;
            for (let j = 0; j < this.graph.circuitRanks[currentCircuitNum]; j++)
            {                
                let edgeNum = this.graph.circuits[currentCircuitNum][j].edgeNum; 
                let signU = this.graph.circuits[currentCircuitNum][j].direction; 
                let circuitEdge = this.graph.graphEdges[edgeNum];    
                //запись в матрицу СЛАУ на соответственную позицию для данного ребра его
                //коэф. А и B (U = A*I + B). Из коэф. A состовляется матрица СЛАУ,
                //а из коэф. B - вектор правых частей.
                //Ua = K[0][0]*Ia + K[0][1]*In1 + K[0][2] 
	            //Un1 = K[1][0]*Ia + K[1][1]*In1 + K[1][2]

                let buff = circuitEdge.getCoefMatrices(this.halfDimensionUravnenia, signU); //this.A, this.B, i, this.halfDimensionUravnenia,

                this.updateMatrices(i,buff);
            
            }
        }
      
        this.X = this.solveLinSystem(this.A, this.B);
        
        for (let i = 0; i < this.graph.graphEdges.length; i++) {            
            this.graph.graphEdges[i].findNewState(this.X[i],this.X[i+this.halfDimensionUravnenia]);
        }
        for (let i = 0; i < this.graph.graphEdges.length; i++) {            
            this.graph.graphEdges[i].findVolatageFromCurrent();
        }
    }
    

    //——————————————————————————————————————————————————————————————————————————————
    //change the matrix parts that may change during runtime;
    newIteration(dt){
        this.solveForCurrentData(dt);
        let counter1 = 0;
        iterCounter = 1;
        if(flagDebug) {
            flagDebug = true;
        }
        
        while(this.processLogicAll()) {
            if(counter1++ > 10000) throw "too many itterations";             
            this.solveForCurrentData(dt);
            iterCounter++;
        }
        
        for (let i = 0; i < this.graph.graphEdges.length; i++) {
            this.graph.graphEdges[i].finalizeIteration();            
        }
        writeCalcResaults();
        writeCounterAllTest+=iterCounter;
    }

    //——————————————————————————————————————————————————————————————————————————————
    //check for different logic elements or non-linear elements. Each objects checks new
    //state, does internal changes and returns if a new intermediate iteration is 
    //required
    //——————————————————————————————————————————————————————————————————————————————
    processLogicAll() {
        let shouldReiterate = false; 
        for (let i = 0; i < this.graph.graphEdges.length; i++) {
            if(this.graph.graphEdges[i].processLogic()) {
                shouldReiterate = true;
            }            
        }
        return shouldReiterate;
    }

    //——————————————————————————————————————————————————————————————————————————————
    //mathematicly solve system of linear equations represented as A*x = B
    //——————————————————————————————————————————————————————————————————————————————
    solveLinSystem(A,B){
        let X = math.lusolve(A, B);
        let OUT = new Array(X.length);
        for (let i = 0; i < X.length; i++) {
            OUT[i] = X[i][0];            
        }
        return OUT;
    }    

    updateMatrices(i, buff){
        let hdu = this.halfDimensionUravnenia;
        for (let j = 0; j<hdu*2; j++){
            this.A[i][j] += buff[0][j]; 
            this.A[i + hdu][j] += buff[1][j];
        }
        
        this.B[i] -= buff[2];
        this.B[i + hdu] -= buff[3];
		
    }


}  //конец solver
