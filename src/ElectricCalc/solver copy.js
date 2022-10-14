
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
        this.B = new Array(this.dimensionUravnenia);
        this.X = new Array(this.dimensionUravnenia);

        for (let i = 0; i < this.dimensionUravnenia; i++){
            this.A[i] = new Array(this.dimensionUravnenia);
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
                edgeNum = this.graph.graphNodes[i].neighborEdgesNums[j];
                //signCurrent - направление тока относительно узла (1, -1, 0)  
                this.A[usedNodesIterator][edgeNum]                                                              = graph.graphNodes[i].neighborEdgeIsEntrance[j];
                this.A[usedNodesIterator + this.halfDimensionUravnenia][edgeNum + this.halfDimensionUravnenia]  = graph.graphNodes[i].neighborEdgeIsEntrance[j]; 
            }
            
            this.B[usedNodesIterator]                               = 0;
            this.B[usedNodesIterator + this.halfDimensionUravnenia] = 0;
            usedNodesIterator++;
        }
        
        //цикл по контурам, перебираем все контура

        for (let i = 0; i < this.graph.circutsCount; i++){      //названия уточнить
            //перебор по элементам контура
            for (let j = 0; j < this.graph.circuits[i].number; j++){ //названия уточнить
                // circuitElement-грань контура,
                circuitElement = this.graph.circuits[i].elements[j];

                this.A[usedNodesIterator][circuitElement.edgeNumber]                                                               = circuitElement.RK1; //запись коэффициента Рунге_Кутта
                this.A[usedNodesIterator][circuitElement.edgeNumber + this.halfDimensionUravnenia]                                 = circuitElement.RK2; //запись коэффициента Рунге_Кутта
                this.A[usedNodesIterator + this.halfDimensionUravnenia][circuitElement.edgeNumber]                                 = circuitElement.RK3; //запись коэффициента Рунге_Кутта
                this.A[usedNodesIterator + this.halfDimensionUravnenia][circuitElement.edgeNumber + this.halfDimensionUravnenia]   = circuitElement.RK4; //запись коэффициента Рунге_Кутта
                this.B[usedNodesIterator]                               = circuitElement.b1;
                this.B[usedNodesIterator + this.halfDimensionUravnenia] = circuitElement.b2;
            }
            usedNodesIterator++;
        }
    }
    //——————————————————————————————————————————————————————————————————————————————
    //change the matrix parts that may change during runtime;
  
    //——————————————————————————————————————————————————————————————————————————————
    solveGraph(){
        
    }

}  //конец solver

