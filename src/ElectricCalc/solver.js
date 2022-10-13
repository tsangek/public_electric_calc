
//——————————————————————————————————————————————————————————————————————————————
//Программа решения системы линенйных уравнений A*f = b
//Data in: вектор правой части СЛАУ - b, матрица СЛАУ - A,
//вектор переменных СЛАУ - f
//——————————————————————————————————————————————————————————————————————————————
class Solver{
    constructor(graph){
        this.graph = graph;
        
        //--------------------------
        //создание массивов для записи обработанных данных - т.е. без отключенных
        //рёбер и узлов
        
        this.A = new Array(graph.edgesCount);
        this.B = new Array(graph.edgesCount);
        this.X = new Array(graph.edgesCount);

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
            this.A[usedNodesIterator] = graph.graphNodes[i].vectorA;
            this.B[usedNodesIterator] = 0;
            usedNodesIterator++;
        }
        for (let i = usedNodesIterator; i < this.graph.edgesCount; i++)
        {
            this.A[i] = new Array(this.graph.edgesCount).fill(0);
            this.B[i] = 0;
        }
    }
    //——————————————————————————————————————————————————————————————————————————————
    //change the matrix parts that may change during runtime;
    newIteration(){
        //--------------------------
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
            this.B[i] = 0;
            for (let j = 0; j < this.graph.circuitRanks[currentCircuitNum]; j++)
            {
                //номер расматриемого ребра
                let edgeNum = this.graph.circuits[currentCircuitNum][j].edgeNum; 
                let signU = this.graph.circuits[currentCircuitNum][j].direction;    
    
                //запись в матрицу СЛАУ на соответственную позицию для данного ребра его
                //коэф. А и B (U = A*I + B). Из коэф. A состовляется матрица СЛАУ,
                //а из коэф. B - вектор правых частей.
                this.A[i][edgeNum] = this.A[i][edgeNum] + 
                    signU*this.graph.graphEdges[edgeNum].A;
                this.B[i] = this.B[i] - signU*this.graph.graphEdges[edgeNum].B;
            }
        }

        //--------------------------
        //вызов решателя СЛАУ
        this.X = this.solveLinSystem(this.A, this.B);
    }

    solveLinSystem(A,B){
        // let matrixA = math.matrix(A,'sparse');
        // let vectorB = math.matrix(B);
        let invA = math.inv(A);
        return math.multiply(invA, B);
    }    
}  //конец solver

