class Graph {
    constructor(jsonArr){
        this.graphEdges = [];
        this.graphNodes = []; 
        //[название в считываемом файле] : [название класса элемента]
        this.edgeTypeClass = {
            RLC : RLC, 
            Diode : Diode, 
            VoltageSourceSin : VoltageSourceSin,
            Transformer : Transformer,
            Generator: Generator
        };
        this.edgeCounter = 0;
        let classItem;
        for(let i = 0; i < jsonArr.length; i++) {
            classItem = new this.edgeTypeClass[jsonArr[i].type](jsonArr[i],this.edgeCounter,this.graphNodes);
            classItem.pushEdgesTo(this.graphEdges);
            this.edgeCounter= this.edgeCounter + classItem.numEdges;
                  
        }
        // for(let i = 0; i < jsonArr.length; i++) {
        //     this.graphEdges.push(new this.edgeTypeClass[jsonArr[i].type](jsonArr[i],i,this.graphNodes));        
        // }

        this.graphNodes.forEach(GraphNode => {
            GraphNode.calculateVectorAB(this.graphEdges);
        });
        this.nodesCount = this.graphNodes.length;
        this.edgesCount = this.graphEdges.length;
        //-----------------------------------------------------------------
        //создание массива узлов начала в несвязаных цепях
        //т.е. по одному узлу из каждой такой цепи, который бы входил в независимый
        //замкнутый контур
        this.nodeDiscard = new Array(this.nodesCount);
        //создание массива узлов, где сказанно к какой несвязаной цепи они принадлежат
        this.nodeDisjointGraph = new Array(this.nodesCount);
        this.disjointStartNodes = new Array(this.nodesCount).fill(false);

        this.disjointCount = this.findDisjointGraphs();
        this.usedNodesCount = this.nodesCount - this.disjointCount; //всего нужно
        //ур-й баланса токов
        
        //максимальное количество независимых замкнутых контуров по теории графов
        this.circuitsMaxCount = this.edgesCount - this.nodesCount + this.disjointCount;

        this.pr_edgesUsed = new Array(this.edgesCount);
        this.circuitRanks = new Array(this.circuitsMaxCount);
        this.circuits = new Array(this.circuitsMaxCount); 
        //-----------------------------------------------------------------
        //utility var
        this.enoughCircuitsFound = false;
        this.circuitCurrentCount = 0;
        this.findCircuts();
    }

    //_________________________________________________________________________________
    //запуск поиска замкнутых независимых контуров - инициализирует переменные и
    //массивы, вызывает Start_from.
    findCircuts()
    {
        this.enoughCircuitsFound = false;     //инициализация достаточности кол-ва найденных контуров (недостаточно)
        //-----------------------------------------
        //инициализация признака независимости контуров - встречались ли рёбра
        //(пока - все не встречались)
        this.pr_edgesUsed.fill(false);
        //-----------------------------------------
        //если по теории графов нет независимых замкнутых контуров - тогда выход
        if (this.circuitsMaxCount===0) return;
        //-----------------------------------------
        //поиск контуров из всех возможных узлов, пока не найдем максимально
        //возможное число независимых замкнутых контуров
        for (let i = 0; (i < this.nodesCount) && (!this.enoughCircuitsFound) ; i++)
        {
            this.findCircuitsStartFromNode(i); //запуск из узла i
        }
    }   //конец функции запуска

    //_________________________________________________________________________________
    //Первый вызов рекурсии findCircuitsRecursion - кроме входных параметров, размерности потомков
    //и записи результатов соответствует findCircuitsRecursion. Data in: номер первого узла
    findCircuitsStartFromNode(startNum){
        let nodeNeighborNum;  //номер соседнего узла
        let nodeRank;  //ранг узла - кол-во соседей
    
        nodeRank = this.graphNodes[startNum].nodeRank;
        let pr_nodesVisited = new Array(this.nodesCount).fill(false);    
        let currentPath = new Array(1);
        let edgeDirection = new Array(1);
        let circuitRank = 1;
    
            //______________________________________________
        for (let i = 0; i < nodeRank; i++) {     //перебор по соседним рёбрам
            nodeNeighborNum = this.graphNodes[startNum].neighborNodesNums[i]; 
            currentPath[0] = this.graphNodes[startNum].neighborEdgesNums[i];
            edgeDirection[0] = this.graphNodes[startNum].neighborEdgeIsEntrance[i];
            this.findCircuitsRecursion(nodeNeighborNum, startNum, pr_nodesVisited, currentPath, 
                circuitRank, edgeDirection);
        }     //конец перебор по соседним рёбрам

    }   //конец findCircuitsStartFromNode

    //_________________________________________________________________________________
    //Рекурсивный метод поиска пути. Вызывает сам себя для узлов-соседей где ещё не был.
    //Умирает, если в узле уже был и вызывает запись всего пути (writeCircuitData),
    //если пришёл в узел начала. In data: номер данного узла, В каких узлах был данный метод 
    //вплоть до этого (в списке 0 - не был, 1 - был, 2 - начало), По каким рёбрам шёл данный
    //метод до этого узла, сколько рёбер данный метод уже прошёл, напрвление обхода 
    //пройденых рёбер
    findCircuitsRecursion(nodeNum, startNum, pr_nodesVisitedIn, currentPathIn, circuitRankIn,
        edgeDirectionIn) {
    
        let nodeNeighborNum;  //номер соседнего узла
        let edgeConnectorNum;  //номер соеденяющего ребра
        let nodeRank;  //ранг узла - кол-во соседей
    
        nodeRank = this.graphNodes[nodeNum].nodeRank; //ранг узла берётся из массива классов узлов
    
        //------------------------------------------
        //создаются новые массивы для передачи дальше в рекурсию, чтобы у всех путей
        //из данного узла были общие предки, но разные потомки
        //------------------------------------------
        //В каких узлах был данный метод вплоть до этого (в списке 0 - не был, 1 - был, 2 - начало)
        let pr_nodesVisited = pr_nodesVisitedIn.slice();    
        pr_nodesVisited[nodeNum] = true;  //отмечаем, что были в данном узле    
        //------------------------------------------
        let currentPath = new Array(circuitRankIn+1);     //По каким рёбрам шёл данный метод до этого узла
        let edgeDirection = new Array(circuitRankIn+1);   //напрвление обхода пройденых рёбер
        let circuitRank = circuitRankIn+1;               //увеличиваем длину пути на 1
    
        for (let i = 0; i < circuitRankIn; i++)              //копирование из предка в потомка
        {
            currentPath[i] = currentPathIn[i];
            edgeDirection[i] = edgeDirectionIn[i];
        }
    
        //------------------------------------------
        //Поиск доступных соседей - тех где метод ещё не был
        for (let i = 0; i < nodeRank; i++)     //перебор по соседним узлам
            {
            //проверяем по какому ребру мы идём к соседу - если по тому, по которуму
            //пришли, то пропускаем, чтобы выйдя из начальной точки сразу не вернуться
            //назад
            edgeConnectorNum = this.graphNodes[nodeNum].neighborEdgesNums[i];
            if (edgeConnectorNum === currentPath[circuitRankIn-1]) continue;
    
            //номер соседа берём из массива классов узлов
            nodeNeighborNum = this.graphNodes[nodeNum].neighborNodesNums[i];
    
            if(pr_nodesVisited[nodeNeighborNum]) continue;   //уже там были - пропускаем
            if(nodeNeighborNum == startNum)  //это узел откуда начали - переходим к записи
            {
                //записываем последний участок пути в массивы
                currentPath[circuitRankIn] = edgeConnectorNum;
                edgeDirection[circuitRankIn] = this.graphNodes[nodeNum].neighborEdgeIsEntrance[i];
                //вызываем функцию записи пути в файл
                this.writeCircuitData(currentPath, circuitRank, edgeDirection);        
                continue;  //следующий сосед
            }
    
            //В узле-соседе где метод не был - записываем последние рёбра и направления
            currentPath[circuitRankIn] = edgeConnectorNum;
            edgeDirection[circuitRankIn] = this.graphNodes[nodeNum].neighborEdgeIsEntrance[i];
            //Вызываем эту же функцию для соседа
            this.findCircuitsRecursion(nodeNeighborNum, startNum, pr_nodesVisited, currentPath, 
                circuitRank, edgeDirection);    
        }     //конец перебор по соседним узлам
    }   //конец рекурсивного метода поиска пути

    //_________________________________________________________________________________
    //запись всего пройденного пути (замкнутого контура), пройденного с помощью
    //findCircuitsRecursion, если он независимый, т.е. в него входит хотя бы одно ребро,
    //которого не было в других контурах
    //data in: По каким рёбрам шёл данный метод, сколько рёбер данный метод прошёл, напрвление 
    //обхода пройденых рёбер
    writeCircuitData(currentPath, circuitRank, edgeDirection){
        if (this.enoughCircuitsFound) return;  //выход если достигнуто максимально возможное кол-во независ. замкнутых контуров
        
            let repeat = true;   //параметр зависимости контуров (точнее - наличия повторений рёбер)
            //------------------------------------------
            //проверка повторений
            for(let i = 0; i < circuitRank; i++)
            {
                //если есть в контуре новое ребро, то заходим и контура независимы.
                //помечаем все пройденные рёбра в этом контуре для определения независимости
                //дальнейших найденных контуров
                if(this.pr_edgesUsed[currentPath[i]]) continue;
                this.pr_edgesUsed[currentPath[i]] = true;
                repeat = false;
            }
        
        //------------------------------------------
        if (repeat) return;  //если зависимы то убиваем функцию ничего не делая        
        //------------------------------------------
        //записываем найденные контура в основной массив Circuits
        let circuitPath = new Array(circuitRank);
        for(let i = 0; i < circuitRank; i++)
        {
            circuitPath[i] = {edgeNum:currentPath[i] , direction:edgeDirection[i]};
        }
        this.circuits[this.circuitCurrentCount] = circuitPath;
        this.circuitRanks[this.circuitCurrentCount] = circuitRank;  //количество рёбер в данном контурк
    
        this.circuitCurrentCount++; //инкримент кол-ва найденных контуров
    
        //устанавливаем флаг, если достигнуто максимальное возможное кол-во контуров
        if (this.circuitCurrentCount === this.circuitsMaxCount) this.enoughCircuitsFound = true;
    }   //конец функции записи

    //_________________________________________________________________________________
    //Определяет из скольки несвязаных цепей состоит граф при помощи findJointNodes
    findDisjointGraphs(){
        
        let pr_nodesVisited = new Array(this.nodesCount).fill(false);   //массив флагов посещения узлов
        this.nodeDiscard.fill(0);
        this.nodeDisjointGraph.fill(-1);
        
        let disjointCount = 0;    //инициализация счётчика кол-ва несвязанных цепей нулём

        //-----------------------------------------
        //поиск несвязанных цепей
        for (let i = 0; i < this.nodesCount; i++)    //перебор узлов
        {
            if(pr_nodesVisited[i]) continue; //этот узел уже входит в другую цепь - пропуск
            
            //поиск всех узлов до которых можно дойти из данного
            this.findJointNodes(i, pr_nodesVisited, -1);

            //переписываем все найденые узлы с общим номером цепи
            for (let j = 0; j < this.nodesCount; j++)
            {
                //если узел принадлежит последней найденной цепи - заходим (а именно
                //nodeDisjointGraph[j]==-1 - у него ещё нет номера цепи, т.е. другой цепи он
                // не принадлежит и nodeVisited[j] = false - в нем мы уже успели побывать)
                if (this.nodeDisjointGraph[j]==-1 && pr_nodesVisited)
                {
                    this.nodeDisjointGraph[j] = disjointCount;   //во все узлы записываем номер их цепи
                }
            }
            this.disjointStartNodes[i] = true;
            disjointCount++; 	//инкримент количества несвязанных цепей
        }

    return disjointCount;   //количество несвязанных цепей - на выход
    }   //конец findDisjointGraphs

    //_________________________________________________________________________________
    //Рекурсивно ищет узлы в которые можно попасть из начального по принципу findCircuitsRecursion
    //Входные данные: номер данного узла, массив флагов посещения узлов, номер ребра, по которому  
    //вошли в данный узел
    findJointNodes(nodeNum, pr_nodesVisited, edgeInNum) {
   
        let nodeNeighborNum;  //номер соседнего узла
        let edgeConnectorNum;  //номер соеденяющего ребра
        let nodeRank;  //ранг узла - кол-во соседей
    
        //ранг узла получаем из массива классов узлов
        nodeRank = this.graphNodes[nodeNum].nodeRank;    
        pr_nodesVisited[nodeNum] = true;  //отмечаем, что посетили данный узел
    
        //---------------------------------------------
        for (let i = 0; i < nodeRank; i++) {    //перебор по соседним рёбрам
            //не даём методу идти назад по тому же ребру
            //(может здесь это и не обязательно)
            edgeConnectorNum = this.graphNodes[nodeNum].neighborEdgesNums[i];
            if (edgeConnectorNum === edgeInNum ) continue;
    
            //номер соседа берётся из массива классов узлов
            nodeNeighborNum = this.graphNodes[nodeNum].neighborNodesNums[i];
    
            if(pr_nodesVisited[nodeNeighborNum]) continue; //если в узле-соседе уже были - пропуск
    
            //вызов этой же функции для узла соседа - рекурсия
            this.findJointNodes(nodeNeighborNum, pr_nodesVisited, edgeConnectorNum);
            }     //конец перебор по соседним рёбрам
    }  //конец findJointNodes

    //_________________________________________________________________________________
}

