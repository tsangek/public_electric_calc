class GraphNode {
    constructor(graphNodes,nodeNum){
        // this.graphNodes = graphNodes;
        
        this.neighborNodesNums = [];
        this.neighborEdgesNums = [];
        this.neighborEdgeIsEntrance = [];

        this.nodeNum = nodeNum;
        this.nodeRank = 0;
        this.vectorA;
        this.B;
    }

    // addNeighborEdgeAndNodes(graphEdge, currentNodes) { //is_entrance - ?надо решить, как обойтись без этого
    //     for (let i = 0; i < currentNodes.length; i++){
    //         if(this.nodeNum != currentNodes[i].nodeNum){
    //             if (!this.neighborNodesNums.includes(currentNodes[i].nodeNum)){
    //                 this.neighborNodesNums.push(currentNodes[i].nodeNum);
    //                 if (i==0) this.neighborEdgeIsEntrance.push(1);
    //                 else this.neighborEdgeIsEntrance.push(-1)
    //             }
    //         }
    //     }
    //     if (!this.neighborEdgesNums.includes(graphEdge.edgeNum)){
    //         this.neighborEdgesNums.push(graphEdge.edgeNum);
    //     }
        
    //     this.nodeRank++; 
    // }
    //-----------------------------------------------------------------------------
    addEdge(graphEdge, is_entrance) {
        if (is_entrance) {
            this.neighborNodesNums.push(graphEdge.nodeOutNum);
            this.neighborEdgeIsEntrance.push(1);
            this.neighborEdgesNums.push(graphEdge.edgeNum);
                        
            this.nodeRank++;                                                		
        }
        else {
            this.neighborNodesNums.push(graphEdge.nodeInNum);
            this.neighborEdgeIsEntrance.push(-1);
            this.neighborEdgesNums.push(graphEdge.edgeNum);
                        
            this.nodeRank++;     
        }
    }
    //-----------------------------------------------------------------------------
    calculateVectorAB(graphEdges){
        this.graphEdges = graphEdges;
        this.vectorA = new Array(graphEdges.length).fill(0);
        for (let i = 0; i < this.nodeRank; i++) { 
            this.vectorA[this.neighborEdgesNums[i]] = this.neighborEdgeIsEntrance[i];
        }
        this.B = 0.0;     
    }
}