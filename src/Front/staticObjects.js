var resistorStaticObj;
var condesatorStaticObj;

//---------------------------------------------------------------------------------
    class StaticObj {
        svgStock = document.getElementById('svgStock');
        connectorsNum = 2;
        connectors = [{x:-300,y:0},{x:300,y:0}];
        constructor(model) {
            this.model = model;
            this.setParameters();
            this.getSvgIcon();
        }
        //-----------------------------
        setParameters(){
            
            this.electricParameters = {};
            let buff = null;
            buff = this.findModelObj();
            this.type = buff.type;
            switch(buff.type){
                case "line":

                    break;
                case "R":
                    this.electricParameters.R = buff.R; //4580
                    this.electricParameters.D = buff.D; //false
                    this.electricParameters.E = buff.E; //0
                    break;
                case "C":
                    this.electricParameters.C = buff.C; //20
                    this.electricParameters.D = buff.D; //false
                    this.electricParameters.E = buff.E; //0
                    break;
                case "LR":
                    this.electricParameters.R = buff.R; //4580
                    this.electricParameters.L = buff.L; //
                    this.electricParameters.D = buff.D; //false
                    this.electricParameters.E = buff.E; //0
                    break;
                case "D":
                    break;
                default:
                    break;
                    
            }
            
            
        }
        //-----------------------------
        updateParameters(electricParameters){
            this.electricParameters = {};
            this.electricParameters = electricParameters;
        }
        //-----------------------------
        getSvgIcon(){
            this.svgIcon = this.svgStock.getElementById(this.model);
            this.svgMenuIcon = this.svgStock.getElementById(this.model);
        }
        //-----------------------------
        findModelObj(){
            for(let i = 0 ; i < electricObjects.length; i++){
                if(electricObjects[i].model == this.model){
                    return electricObjects[i];
                }
            }
        }
    }
//---------------------------------------------------------------------------------
function initiateStaticObjects(svgStock) {
    resistorStaticObj = new StaticObj("resistor");
    condesatorStaticObj = new StaticObj("condensator");
    elSourceStaticObj = new StaticObj("elSource");
    diodeStaticObj = new StaticObj("diode");
    lineStaticObj       = new StaticObj("lineStatic");
}
