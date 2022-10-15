class ElementTwoPort{
    constructor(jsonObj, edgeNum, graphNodes, edgeName){
        this.numEdges = 1;
        this.edge = new edgeName(jsonObj,edgeNum,graphNodes);
    }
    pushEdgesTo(graphEdges){
        graphEdges.push(this.edge); 
    }
}
class ElementThreePort{

}
class ElementFourPort{
    constructor(jsonObj, edgeNum, graphNodes, edgeName){
        this.numEdges = 2;
        
        this.edge1 = new edgeName(jsonObj,edgeNum,graphNodes, 1);
        this.edge2 = new edgeName(jsonObj,edgeNum + 1,graphNodes, 2);
        this.edge3 = new edgeName(jsonObj,edgeNum + 2,graphNodes, 3);
        
        this.edge1.relatedTransformer = this.edge2.edgeNum;
        this.edge1.relatedTransformer = this.edge3.edgeNum;
        this.edge1.transNum = 1;

        this.edge2.relatedTransformer = this.edge1.edgeNum;
        this.edge2.relatedTransformer = this.edge3.edgeNum;
        this.edge2.transNum = 2;

        this.edge3.relatedTransformer = this.edge1.edgeNum;
        this.edge3.relatedTransformer = this.edge2.edgeNum;
        this.edge3.transNum = 3;
        
        this.edge1.relatedTransformerEdge = this.edge2;
        this.edge2.relatedTransformerEdge = this.edge1;
    }
    pushEdgesTo(graphEdges){
        graphEdges.push(this.edge1);
        graphEdges.push(this.edge2); 
        if(this.numEdges == 3){
            graphEdges.push(this.edge3);
        }
    }
   
}
class RLC extends ElementTwoPort{
    constructor(jsonObj, edgeNum, graphNodes){
        super(jsonObj, edgeNum, graphNodes, edgeRLC);
    }
}

class VoltageSourceSin extends ElementTwoPort{
    constructor(jsonObj, edgeNum, graphNodes){
        super(jsonObj, edgeNum, graphNodes, edgeVoltageSourceSin);
    }
}
class Diode extends ElementTwoPort{
    constructor(jsonObj, edgeNum, graphNodes){
        super(jsonObj, edgeNum, graphNodes, edgeDiode);
    }
}

class Transformer extends ElementFourPort{
	constructor(jsonObj, edgeNum, graphNodes){
        super(jsonObj, edgeNum, graphNodes, edgeTransformer);
    }
}

class Generator extends ElementFourPort{
	constructor(jsonObj, edgeNum, graphNodes){
        super(jsonObj, edgeNum, graphNodes, edgeGenerator);
    }
}
