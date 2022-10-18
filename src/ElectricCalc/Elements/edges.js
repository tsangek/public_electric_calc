class graphEdge{
	constructor(jsonObj, edgeNum, graphNodes){
		this.edgeNum = edgeNum;
		this.nodeInNum = jsonObj.in;
		this.nodeOutNum = jsonObj.out;
		this.addToGraphNodes(graphNodes, this.nodeInNum, this.nodeOutNum);	
	}
	//——————————————————————————————————————————————————————————————————————————————
	addToGraphNodes(graphNodes, inNum, outNum){
		this.nodeIn = graphNodes[inNum];
		this.nodeOut = graphNodes[outNum];
		if(!this.nodeIn){
			this.nodeIn = new GraphNode(graphNodes, inNum);
			graphNodes[inNum] = this.nodeIn;
		}
		if(!this.nodeOut){
			this.nodeOut = new GraphNode(graphNodes, outNum);
			graphNodes[outNum] = this.nodeOut;
		}
		this.nodeIn.addEdge(this,true);
		this.nodeOut.addEdge(this,false);
	}
}


class edgeRK3LinearModel extends graphEdge{
		
	constructor(jsonObj, edgeNum, graphNodes, shemeRK = 'Radau-IIA-2s')
	{
		//main values
		super(jsonObj, edgeNum, graphNodes);

		this.m = new Array(2);
		for (let i = 0; i < this.m.length; i++) {
			this.m[i] = new Array(4).fill(0);
			
		}
		this.M = new Array(2);
		for (let i = 0; i < this.M.length; i++) {
			this.M[i] = new Array(4).fill(0);			
		}
		this.K = new Array(2);
		this.k = new Array(2);
		for (let i = 0; i < this.K.length; i++) {
			this.K[i] = new Array(3).fill(0);
			this.k[i] = new Array(3).fill(0);			
		}
		this.c1 = 0;
		this.shemeRK = shemeRK;
		this.setRKSheme(shemeRK);
		this.calcRKinverse();
	}

	setRKSheme(shemeRK){
		switch(shemeRK) {
			case 'Radau-IIA-2s':  
			this.m[0][0] = 0;
			this.m[0][1] = 5/12;
			this.m[0][2] = -1/12;
			this.m[0][3] = 1;
			this.m[1][0] = 0;
			this.m[1][1] = 3/4;
			this.m[1][2] = 1/4;
			this.m[1][3] = 1;

			this.c1  = 1/3;
			break;
		  
			case 'Lobatto-IIIA-3s': 
			this.m[0][0] = 5/24;
			this.m[0][1] = 1/3;
			this.m[0][2] = -1/24;
			this.m[0][3] = 1;
			this.m[1][0] = 1/6;
			this.m[1][1] = 2/3;
			this.m[1][2] = 1/6;
			this.m[1][3] = 1;

			this.c1  = 1/2;
			break;
		  
			default:
		}
	}
	//вставь this.m[1][3] в уравнение!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	calcRKinverse(){
		let div1 = (this.m[0][2]*this.m[1][1] - this.m[1][2]*this.m[0][1]);
		this.M[0][0] = (this.m[1][2] - this.m[0][2])/div1;
		this.M[0][1] = -this.m[1][2]/div1;
		this.M[0][2] = this.m[0][2]/div1;
		this.M[0][3] = (this.m[1][2]*this.m[0][0] - this.m[0][2]*this.m[1][0])/div1;

		let div2 = (this.m[0][1]*this.m[1][2] - this.m[1][1]*this.m[0][2]);
		this.M[1][0] = (this.m[1][1] - this.m[0][1])/div2;
		this.M[1][1] = -this.m[1][1]/div2;
		this.M[1][2] = this.m[0][1]/div2;
		this.M[1][3] = (this.m[1][1]*this.m[0][0] - this.m[0][1]*this.m[1][0])/div2;	
	}

	calcKinverse(K,Kout){
		let divider = K[0][0]*K[1][1]-K[0][1]*K[1][0];
		Kout[0][0] = K[1][1]/divider;
		Kout[0][1] = -K[0][1]/divider;
		Kout[0][2] = (K[0][1]*K[1][2] - K[0][2]*K[1][1])/divider;
		Kout[1][0] = -K[1][0]/divider;
		Kout[1][1] = K[0][0]/divider;
		Kout[1][2] = (K[0][2]*K[1][0] - K[0][0]*K[1][2])/divider;		
	}
	getCoefMatrices(hdu,signU){
		//Ua = K[0][0]*Ia + K[0][1]*In1 + K[0][2]
		//Un1 = K[1][0]*Ia + K[1][1]*In1 + K[1][2]
		
		let matrix = new Array(4);
		matrix[0] = new Array(hdu*2).fill(0);
		matrix[1] = new Array(hdu*2).fill(0);
		matrix[2] = 0;
		matrix[3] = 0;
		
		//запись коэффициентов Рунге_Кутта
	
		matrix[0][this.edgeNum] = signU*this.K[0][0]; 
		matrix[0][this.edgeNum + hdu] = signU*this.K[0][1];
		matrix[1][this.edgeNum] = signU*this.K[1][0]; 
		matrix[1][this.edgeNum + hdu] = signU*this.K[1][1];

		matrix[2] = signU*this.K[0][2];
		matrix[3] = signU*this.K[1][2];

		return matrix;
	}
}

class edgeRLC extends edgeRK3LinearModel{
	constructor(jsonObj, edgeNum, graphNodes){
		super(jsonObj, edgeNum, graphNodes);
		this.r = jsonObj.R;
		this.l = jsonObj.L;
		this.c = jsonObj.C;
		if (!this.r) this.r = 1e-12;

		this.Kc = new Array(2);
		this.Kr = new Array(2);
		this.Kl = new Array(2);
		this.kc = new Array(2);
		this.kr = new Array(2);
		this.kl = new Array(2);
		for (let i = 0; i < 2; i++) {
			this.Kc[i] = new Array(3).fill(0);
			this.Kr[i] = new Array(3).fill(0);
			this.Kl[i] = new Array(3).fill(0);
			this.kc[i] = new Array(3).fill(0);
			this.kr[i] = new Array(3).fill(0);
			this.kl[i] = new Array(3).fill(0);				
		}
		
		this.In = 0;
		this.Un = 0;
		this.Ia = 0;
		this.Ua = 0;
		this.In1 = 0;
		this.Un1 = 0;

		this.tn = 0;
		this.ta = 0;
		this.tn1 = 0;

		this.Ura = 0;
		this.Ula = 0;
		this.Uca = 0;

		this.Urn1 = 0;
		this.Uln1 = 0;
		this.Ucn1 = 0;
		
		this.Urn = 0;
		this.Uln = 0;
		this.Ucn = 0;
	}

	calcLinearCoef(dt){
		this.dt = dt;
		this.ta = this.tn + this.c1*dt;
		this.tn1 = this.tn + dt;
		this.findCurrentToVoltageCoef();
	}

	//Ua = K[0][0]*Ia + K[0][1]*In1 + K[0][2] 
	//Un1 = K[1][0]*Ia + K[1][1]*In1 + K[1][2]

	//Ia = k[0][0]*Ua + k[0][1]*Un1 + k[0][2] 
	//In1 = k[1][0]*Ua + k[1][1]*Un1 + k[1][2]
	findCurrentToVoltageCoef(){		
		if(this.c) {
			coefRK3Capacity(this.m,this.M,this.Kc,this.kc,this.dt,this.Ucn,this.In,this.c);
		}

		coefRK3Resistance(this.Kr,this.kr,this.r);

		if(this.l) {
			coefRK3Induction(this.m,this.M,this.Kl,this.kl,this.dt,this.Uln,this.In,this.l);
		}

		for (let i = 0; i < this.K.length; i++) {
			for (let j = 0; j < this.K[i].length; j++) {
				this.K[i][j] = this.Kc[i][j] + this.Kr[i][j] + this.Kl[i][j];				
			}			
		}
	}

	findNewState(Ia,In1){
		this.Ia = Ia;
		this.In1= In1;		
	}	
	
	findVolatageFromCurrent(){
		this.Ua = this.K[0][0]*this.Ia + this.K[0][1]*this.In1 + this.K[0][2];
		this.Un1 = this.K[1][0]*this.Ia + this.K[1][1]*this.In1 + this.K[1][2];

		this.Ura = this.Kr[0][0]*this.Ia + this.Kr[0][1]*this.In1 + this.Kr[0][2];
		this.Ula = this.Kl[0][0]*this.Ia + this.Kl[0][1]*this.In1 + this.Kl[0][2];
		this.Uca = this.Kc[0][0]*this.Ia + this.Kc[0][1]*this.In1 + this.Kc[0][2];

		this.Urn1 = this.Kr[1][0]*this.Ia + this.Kr[1][1]*this.In1 + this.Kr[1][2];
		this.Uln1 = this.Kl[1][0]*this.Ia + this.Kl[1][1]*this.In1 + this.Kl[1][2];
		this.Ucn1 = this.Kc[1][0]*this.Ia + this.Kc[1][1]*this.In1 + this.Kc[1][2];
	}

	//——————————————————————————————————————————————————————————————————————————————
	//переход к следующему временному шагу - присваивание переменным предыдущего
	//шага значений этого шага. 
	finalizeIteration(){
		this.In = this.In1;
		this.Un = this.Un1;		
		this.tn = this.tn1;

		this.Urn = this.Urn1;
		this.Uln = this.Uln1;
		this.Ucn = this.Ucn1;
	}

	printData() {
		return {dt:this.dt, R:this.r, L:this.l, C:this.c, D:this.pr_d, I:this.In1, U:this.Un1, 
			UC:this.Ucn1, UR:this.Urn1, UL:this.Uln1, EDS:this.eds, UC_o:this.uc_o, I_o:this.I_o,
			U_o:this.u_o, EDS_o:this.eds_o, dUdt:this.derU, A:this.A, B:this.B, test:this.test};
	}

	//——————————————————————————————————————————————————————————————————————————————
	//checks for convergence if the element is non-linear
	processLogic(){
		
		return false;		
	} 
}
//——————————————————————————————————————————————————————————————————————————————
//Basic capacity RK 1 extra step coeff calculation
//Ua = K[0][0]*Ia + K[0][1]*In1 + K[0][2] 
//Un1 = K[1][0]*Ia + K[1][1]*In1 + K[1][2]
//Xn - previous step parameter
//Xa - intermediate step parameter
//Xn1 - new step parameter
function coefRK3Capacity(m,M,Kc,kc,dt,Un,In,c){
	let scaleCoef = dt/c;
	Kc[0][0] = scaleCoef*m[0][1];
	Kc[0][1] = scaleCoef*m[0][2];
	Kc[0][2] = scaleCoef*In*m[0][0] + m[0][3]*Un;
	Kc[1][0] = scaleCoef*m[1][1];
	Kc[1][1] = scaleCoef*m[1][2];
	Kc[1][2] = scaleCoef*In*m[1][0] + m[1][3]*Un;

	kc[0][0] = M[0][1]/scaleCoef;
	kc[0][1] = M[0][2]/scaleCoef;
	kc[0][2] = Un*M[0][0]/scaleCoef + M[0][3]*In;
	kc[1][0] = M[1][1]/scaleCoef;
	kc[1][1] = M[1][2]/scaleCoef;
	kc[1][2] = Un*M[1][0]/scaleCoef + M[1][3]*In;
}

//——————————————————————————————————————————————————————————————————————————————
//Basic resistance RK 1 extra step coeff calculation
//Ua = K[0][0]*Ia + K[0][1]*In1 + K[0][2] 
//Un1 = K[1][0]*Ia + K[1][1]*In1 + K[1][2]
//Xn - previous step parameter
//Xa - intermediate step parameter
//Xn1 - new step parameter
function coefRK3Resistance(Kr,kr,r){
	Kr[0][0] = r;
	Kr[1][1] = r;

	kr[0][0] = 1/r;
	kr[1][1] = 1/r;
}

//——————————————————————————————————————————————————————————————————————————————
//Basic induction RK 1 extra step coeff calculation
//Ua = K[0][0]*Ia + K[0][1]*In1 + K[0][2] 
//Un1 = K[1][0]*Ia + K[1][1]*In1 + K[1][2]
//Xn - previous step parameter
//Xa - intermediate step parameter
//Xn1 - new step parameter
function coefRK3Induction(m,M,Kl,kl,dt,Un,In,l){
	let scaleCoef = l/dt;
	Kl[0][0] = scaleCoef*M[0][1];
	Kl[0][1] = scaleCoef*M[0][2];
	Kl[0][2] = scaleCoef*In*M[0][0] + M[0][3]*Un;
	Kl[1][0] = scaleCoef*M[1][1];
	Kl[1][1] = scaleCoef*M[1][2];
	Kl[1][2] = scaleCoef*In*M[1][0] + M[1][3]*Un;

	kl[0][0] = m[0][1]/scaleCoef;
	kl[0][1] = m[0][2]/scaleCoef;
	kl[0][2] = Un*m[0][0]/scaleCoef + m[0][3]*In;
	kl[1][0] = m[1][1]/scaleCoef;
	kl[1][1] = m[1][2]/scaleCoef;
	kl[1][2] = Un*m[1][0]/scaleCoef + m[1][3]*In;
}

class edgeDiode extends edgeRK3LinearModel{
	constructor(jsonObj, edgeNum, graphNodes){
		super(jsonObj, edgeNum, graphNodes);
			this.r = jsonObj.R;
			this.n = jsonObj.n;
			this.Vt = jsonObj.Vt;
			this.Is = jsonObj.Is;
			
			this.tt = 5e-9;
			this.Cjo = 4e-12;
			this.phiB = 1.2;
			this.mPow = 0.285;
			this.ropen = 1e-12;
			this.rclosed = 1e12;


			if(!this.Is) this.Is = 1E-14;
			this.Tempr = 293;
			this.n = 1;	
			this.Vt = this.Tempr*PhysConst.BOLTZMAN/PhysConst.ELEMCHARGE;
			this.Vcrit = this.Vt*this.n*Math.log(this.Vt*this.n/this.Is/Math.sqrt(2));

			if (!this.r) this.r = this.ropen;

			this.Kr = new Array(2);
			this.kr = new Array(2);			
			this.Kc = new Array(2);
			this.kc = new Array(2);
			this.Kd = new Array(2);
			this.kd = new Array(2);
			for (let i = 0; i < 2; i++) {
				this.Kr[i] = new Array(3).fill(0);
				this.kr[i] = new Array(3).fill(0);
				this.Kc[i] = new Array(3).fill(0);
				this.kc[i] = new Array(3).fill(0);
				this.Kd[i] = new Array(3).fill(0);
				this.kd[i] = new Array(3).fill(0);
			}
	
			this.In = 0;
			this.Un = 0;
			this.Ia = 0;
			this.Ua = 0;
			this.In1 = 0;
			this.Un1 = 0;

			this.Idn = 0;
			this.Ida = 0;
			this.Idn1 = 0;
			this.Icn = 0;
			this.Ica = 0;
			this.Icn1 = 0;

			this.Ijn1 = 0;
			this.Ujn1 = 0;
			this.Ija = 0;
			this.Uja = 0;
	
			this.tn = 0;
			this.ta = 0;
			this.tn1 = 0;

			this.isAPointBaseI = false;
			this.isN1PointBaseI = false;

			this.Vstep = this.Vt;

			this.Ura = 0;
			this.Uda = 0;
	
			this.Urn1 = 0;
			this.Udn1 = 0;
			
			this.Urn = 0;
			this.Udn = 0;


		}
		
		calcLinearCoef(dt){
			this.dt = dt;
			this.ta = this.tn + this.c1*dt;
			this.tn1 = this.tn + dt;
			this.findCurrentToVoltageCoef();
		}
	
		//Ua = K[0][0]*Ia + K[0][1]*In1 + K[0][2] 
		//Un1 = K[1][0]*Ia + K[1][1]*In1 + K[1][2]
		findCurrentToVoltageCoef(){	
			coefRK3Resistance(this.Kr,this.kr,this.r);
			this.coefRK3DiodeUofI();
			this.coefRK3DiodeCapacitance();
			// this.calcKinverse(this.Kc,this.kc);

			for (let i = 0; i < this.k.length; i++) {
				for (let j = 0; j < this.k[i].length; j++) {				
					this.k[i][j] = this.kd[i][j];
					// this.k[i][j] = this.kd[i][j] + this.kc[i][j];							
				}			
			}
			this.calcKinverse(this.k,this.K);
						
			for (let i = 0; i < this.K.length; i++) {
				for (let j = 0; j < this.K[i].length; j++) {					
					this.K[i][j] += this.Kr[i][j];
					if(isNaN(this.K[i][j])) {
						throw ("NaN in K. edge " + this.edgeNum);
					}				
				}			
			}			
		}

		diodeDeltaCharge(U,Uold){
			let junctionVoltCoef = Math.pow((1-U/this.phiB),-this.mPow+1);
			let junctionVoltCoefOld = Math.pow((1-Uold/this.phiB),-this.mPow+1);
			if(U > this.phiB) junctionVoltCoef = 10^12;
			if(Uold > this.phiB) junctionVoltCoefOld = 10^12;


			return this.tt*this.Is*(Math.exp(U/this.n/this.Vt) - Math.exp(Uold/this.n/this.Vt)) + 
				this.Cjo*this.phiB/(-this.mPow + 1)*
				(junctionVoltCoef-junctionVoltCoefOld);
			}

		diodeDeltaChargeDeriative(U){
			let junctionVoltCoef = this.Cjo*Math.pow((1-U/this.phiB),-this.mPow);
			if(U > this.phiB) junctionVoltCoef = 10^12;

			return this.tt*this.Is/this.n/this.Vt*Math.exp((U)/this.n/this.Vt) + junctionVoltCoef;
			}
		
		diodeCapacitance(U){
			return this.tt*this.Is/this.n/this.Vt*Math.exp(U/this.n/this.Vt) + 
				this.Cjo*Math.pow((1-U/this.phiB),-this.mPow);

		}
		diodeEquasionI(U){
			return this.Is*Math.expm1(U/this.n/this.Vt) + U/this.rclosed;
		}
		diodeEquasionU(I){
			return this.n*this.Vt*Math.log(I/this.Is + 1);
		}
		
		diodeEquasion_dIdU(U){
			return this.Is*Math.exp(U/this.n/this.Vt)/this.n/this.Vt + 1/this.rclosed;
		}
		diodeEquasion_dUdI(I){
			return this.n*this.Vt/this.Is/(I/this.Is + 1);
		}
		//Ua = K[0][0]*Ia + K[0][1]*In1 + K[0][2] 
		//Un1 = K[1][0]*Ia + K[1][1]*In1 + K[1][2]
		coefRK3DiodeCapacitance(){
			let scaleCoefa = this.dt/this.diodeDeltaChargeDeriative(this.Uja);
			let scaleCoefn1 = this.dt/this.diodeDeltaChargeDeriative(this.Ujn1);
			this.Kc[0][0] = this.m[0][1]*scaleCoefa;
			this.Kc[0][1] = this.m[0][2]*scaleCoefa;
			this.Kc[0][2] = this.Uja + scaleCoefa*(this.m[0][0]*this.Icn-this.diodeDeltaCharge(this.Uja,this.Udn));
			this.Kc[1][0] = this.m[1][1]*scaleCoefn1;
			this.Kc[1][1] = this.m[1][2]*scaleCoefn1;
			this.Kc[1][2] = this.Ujn1 + scaleCoefn1*(this.m[1][0]*this.Icn-this.diodeDeltaCharge(this.Ujn1,this.Udn));		
		}

		//Ua = K[0][0]*Ia + K[0][1]*In1 + K[0][2] 
		//Un1 = K[1][0]*Ia + K[1][1]*In1 + K[1][2]
		coefRK3DiodeUofI(){
			if(this.isAPointBaseI){
				this.coefRK3Diode_IbaseAPoint();				
			}
			else{
				this.coefRK3Diode_UbaseAPoint();		
			}

			if(this.isN1PointBaseI){
				this.coefRK3Diode_IbaseN1Point();	
			}
			else{
				this.coefRK3Diode_UbaseN1Point();		
			}
		}
		coefRK3Diode_UbaseAPoint(){
			let Aa = this.diodeEquasion_dIdU(this.Uja);
			let Ba = this.Ija - Aa*this.Uja;
			this.Kd[0][0] = 1/Aa;
			this.Kd[0][1] = 0;
			this.Kd[0][2] = -Ba/Aa;
			this.kd[0][0] = Aa;
			this.kd[0][1] = 0;
			this.kd[0][2] = Ba;
		}
		coefRK3Diode_UbaseN1Point(){
			let An1 = this.diodeEquasion_dIdU(this.Ujn1);
			let Bn1 = this.Ijn1 - An1*this.Ujn1;  
			this.Kd[1][0] = 0;
			this.Kd[1][1] = 1/An1;
			this.Kd[1][2] = -Bn1/An1;
			this.kd[1][0] = 0;
			this.kd[1][1] = An1;
			this.kd[1][2] = Bn1;
		}
		//——————————————————————————————————————————————————————————————————————————————
		coefRK3Diode_IbaseAPoint(){
			let Aa = this.diodeEquasion_dUdI(this.Ija);
			let Ba =  this.Uja - Aa*this.Ija;
			this.Kd[0][0] = Aa;
			this.Kd[0][1] = 0;
			this.Kd[0][2] = Ba;
			this.kd[0][0] = 1/Aa;
			this.kd[0][1] = 0;
			this.kd[0][2] = -Ba/Aa;
		}
		coefRK3Diode_IbaseN1Point(){
			let An1 = this.diodeEquasion_dUdI(this.Ijn1);
			let Bn1 = this.Ujn1 - An1*this.Ijn1;  
			this.Kd[1][0] = 0;
			this.Kd[1][1] = An1;
			this.Kd[1][2] = Bn1;
			this.kd[1][0] = 0;
			this.kd[1][1] = 1/An1;
			this.kd[1][2] = -Bn1/An1;

		}
		//——————————————————————————————————————————————————————————————————————————————

		findNewState(Ia,In1){
			this.Ia = Ia;
			this.In1= In1;		
		}

		findVolatageFromCurrent(){
			this.Ua = this.K[0][0]*this.Ia + this.K[0][1]*this.In1 + this.K[0][2];
			this.Un1 = this.K[1][0]*this.Ia + this.K[1][1]*this.In1 + this.K[1][2];	
			this.Ura = this.Kr[0][0]*this.Ia + this.Kr[0][1]*this.In1 + this.Kr[0][2];	
			this.Urn1 = this.Kr[1][0]*this.Ia + this.Kr[1][1]*this.In1 + this.Kr[1][2];

			this.Uda = this.Ua-this.Ura;
			this.Udn1 = this.Un1-this.Urn1;
			this.Ida = this.kd[0][0]*this.Uda + this.kd[0][1]*this.Udn1 + this.kd[0][2];
			this.Idn1 = this.kd[1][0]*this.Uda + this.kd[1][1]*this.Udn1 + this.kd[1][2];
			this.Ica = this.kc[0][0]*this.Uda + this.kc[0][1]*this.Udn1 + this.kc[0][2];
			this.Icn1 = this.kc[1][0]*this.Uda + this.kc[1][1]*this.Udn1 + this.kc[1][2];	
		}

	
		//——————————————————————————————————————————————————————————————————————————————
		//переход к следующему временному шагу - присваивание переменным предыдущего
		//шага значений этого шага. 
		finalizeIteration(){
			this.In = this.In1;
			this.Un = this.Un1;		
			this.tn = this.tn1;

			this.Idn = this.Idn1;
			this.Icn = this.Icn1;			

			this.Uja = this.Udn1;
			this.Ija = this.Idn1;
			this.Ujn1 = this.Udn1;
			this.Ijn1 = this.Idn1;

			this.Urn = this.Urn1;
			this.Udn = this.Udn1;
		}
	
		printData() {
			return {dt:this.dt, R:this.r, L:this.l, C:this.c, D:this.pr_d, I:this.In1, U:this.Un1, 
				UC:this.Udn1, UR:this.Urn1, UL:this.ul, EDS:this.eds, UC_o:this.uc_o, I_o:this.I_o,
				U_o:this.u_o, EDS_o:this.eds_o, dUdt:this.derU, A:this.A, B:this.B, test:this.test};
		}

		//——————————————————————————————————————————————————————————————————————————————
		//checks for convergence if the element is non-linear
		processLogic(){
			let Iatheor = this.diodeEquasionI(this.Uda);
			let In1theor = this.diodeEquasionI(this.Udn1);
			let Uatheor = this.diodeEquasionU(this.Ida);
			let Un1theor = this.diodeEquasionU(this.Idn1);

			let debugDeltaChargeA = this.diodeDeltaCharge(this.Uda,this.Udn);
			let debugDeltaChargeAj = this.diodeDeltaCharge(this.Uja,this.Udn);
			let debugDeltaChargeN1 = this.diodeDeltaCharge(this.Udn1,this.Udn);
			let debugDeltaChargeN1j = this.diodeDeltaCharge(this.Ujn1,this.Udn);

			let errorQa = relativeError(this.Uda,this.Uja);
			let errorQn1 = relativeError(this.Udn1,this.Ujn1);

			let error = 0;
			let errorA = 0;
			let errorN1 = 0;
			if(this.isAPointBaseI){
				errorA = relativeError(this.Uda,Uatheor); 	
			}
			else{
				errorA = relativeError(this.Ida,Iatheor); 	
			}
			if(this.isN1PointBaseI){
				errorN1 = relativeError(this.Udn1,Un1theor);  	
			}
			else{
				errorN1 = relativeError(this.Idn1,In1theor);
	
			}
			error = errorA + errorN1 + errorQa + errorQn1;
			
			if(error > 1e-6 || isNaN(error)) {
				
				if(this.Uda > this.Vcrit && this.Ida > 0){
					this.isAPointBaseI = true; 
					this.Uja = this.diodeEquasionU(this.Ida);
					this.Ija = this.Ida;	
				}
				else{
					if(this.Uda > this.Vcrit){
						this.Uja = this.Vcrit;
						this.Ija = this.diodeEquasionI(this.Vcrit);
						this.isAPointBaseI = false; 
					}
					else{
						this.Uja = this.Uda;
						this.Ija = this.diodeEquasionI(this.Uda);
						this.isAPointBaseI = false; 
					}
				}
			
				if(this.Udn1 > this.Vcrit && this.Idn1 > 0){
					this.isN1PointBaseI = true;
					this.Ujn1 = this.diodeEquasionU(this.Idn1);
					this.Ijn1 = this.Idn1; 	
				}
				else{
					if(this.Udn1 > this.Vcrit){
						this.Ujn1 = this.Vcrit;
						this.Ijn1 = this.diodeEquasionI(this.Vcrit);
						this.isN1PointBaseI = false; 
					}
					else{
						this.Ujn1 = this.Udn1;
						this.Ijn1 = this.diodeEquasionI(this.Udn1);
						this.isN1PointBaseI = false; 
					}
				}
				return true;				
			}
			return false;				
		}

}
//__________________________________________________________________________________

//RLC sin voltage source
//__________________________________________________________________________________
class edgeVoltageSourceSin extends edgeRLC{
		
	constructor(jsonObj, edgeNum, graphNodes)
	{
		super(jsonObj, edgeNum, graphNodes);

		this.edsEff = jsonObj.edsEff;
		this.phase = jsonObj.phase;
		this.freq = jsonObj.freq;
	}
	
	//——————————————————————————————————————————————————————————————————————————————
	calcLinearCoef(dt){
		this.dt = dt;
		this.ta = this.tn + this.c1*dt;
		this.tn1 = this.tn + dt;

		this.edsa = Math.sin(Math.PI*(2*this.freq*this.ta + this.phase/180))*this.edsEff*Math.sqrt(2);
		this.edsn1 = Math.sin(Math.PI*(2*this.freq*this.tn1 + this.phase/180))*this.edsEff*Math.sqrt(2);
		this.findCurrentToVoltageCoef();
		this.K[0][2] += this.edsa;
		this.K[1][2] += this.edsn1;
	}
}

//__________________________________________________________________________________

//Transformer
//__________________________________________________________________________________

class edgeTransformer extends edgeRK3LinearModel{
		
	constructor(jsonObj, edgeNum, graphNodes, param = null)
	{
		if (param == 1){
			super(jsonObj.trans1, edgeNum, graphNodes);
		}
		else if(param ==2){
			super(jsonObj.trans2, edgeNum, graphNodes);
		}

		this.L1 = jsonObj.L1;
		this.L2 = jsonObj.L2;
		// this.transM = jsonObj.m;
		this.transM = 0.9*Math.sqrt(this.L1 * this.L2);

		this.In = 0;
		this.Un = 0;
		this.Ia = 0;
		this.Ua = 0;
		this.In1 = 0;
		this.Un1 = 0;

		this.tn = 0;
		this.ta = 0;
		this.tn1 = 0;

		this.Ura = 0;
		this.Ula = 0;
		this.Uca = 0;

		this.Urn1 = 0;
		this.Uln1 = 0;
		this.Ucn1 = 0;
		
		this.Urn = 0;
		this.Uln = 0;
		this.Ucn = 0;
			
	}
	
	//——————————————————————————————————————————————————————————————————————————————
	calcLinearCoef(dt){
		this.dt = dt;
		this.ta = this.tn + this.c1*dt;
		this.tn1 = this.tn + dt;

		this.calcConstCoef();

		this.findCurrentToVoltageCoef();
		
	}

	calcConstCoef(){
		this.K = new Array(2);
		for (let i = 0; i < 2; i++) {
			this.K[i] = new Array(7).fill(0);				
		}
		//Ua = K[0][0]*Ia + K[0][1]*In1 + K[0][2] 
		//Un1 = K[1][0]*Ia + K[1][1]*In1 + K[1][2]

		//Ia = k[0][0]*Ua + k[0][1]*Un1 + k[0][2] 
		//In1 = k[1][0]*Ua + k[1][1]*Un1 + k[1][2]
		let delitel = this.m[0][1]*this.m[1][2] - this.m[0][2]*this.m[1][1];
		if (this.transNum == 1){
			//U1a = K[0][0]*I1a + K[0][1]*I1n1 + K[0][2]*I2a + K[0][3]*I2n1 + (K[0][4]*I1n + K[0][5]*I2n + K[0][6]*U1n)  
			this.K[0][0] = this.L1*this.m[1][2]/this.dt/delitel; //I1a
			this.K[0][1] = -this.L1*this.m[0][2]/this.dt/delitel; //I1n1
			this.K[0][2] = this.transM*this.m[1][2]/this.dt/delitel; //I2a
			this.K[0][3] = -this.transM*this.m[0][2]/this.dt/delitel; //I2n1
			this.K[0][4] = this.L1*(-this.m[1][2] + this.m[0][2])/this.dt/delitel; //I1n
			this.K[0][5] = this.transM*(-this.m[1][2] + this.m[0][2])/this.dt/delitel; //I2n
			this.K[0][6] = (this.m[0][2]*this.m[1][0] - this.m[0][0]*this.m[1][2])/delitel; //U1n

			//U1n1 = K[2][0]*I1a + K[2][1]*I1n1 + K[2][2]*I2a + K[2][3]*I2n1 + (K[2][4]*I1n + K[2][5]*I2n + K[2][6]*U1n)
			this.K[1][0] = -this.L1*this.m[1][1]/this.dt/delitel; //I1a
			this.K[1][1] = this.L1*this.m[0][1]/this.dt/delitel; //I1n1
			this.K[1][2] = -this.transM*this.m[1][1]/this.dt/delitel; //I2a
			this.K[1][3] = this.transM*this.m[0][1]/this.dt/delitel; //I2n1
			this.K[1][4] = this.L1*(this.m[1][1] - this.m[0][1])/this.dt/delitel; //I1n
			this.K[1][5] = this.transM*(this.m[1][1] - this.m[0][1])/this.dt/delitel; //I2n
			this.K[1][6] = (this.m[0][0]*this.m[1][1] - this.m[0][1]*this.m[1][0])/delitel; //U1n
		}
		else {
			//U2a = K[1][0]*I1a + K[1][1]*I1n1 + K[1][2]*I2a + K[1][3]*I2n1 + (K[1][4]*I1n + K[1][5]*I2n + K[1][6]*U2n)
			this.K[0][0] = this.transM*this.m[1][2]/this.dt/delitel; //I1a
			this.K[0][1] = -this.transM*this.m[0][2]/this.dt/delitel; //I1n1
			this.K[0][2] = this.L2*this.m[1][2]/this.dt/delitel; //I2a
			this.K[0][3] = -this.L2*this.m[0][2]/this.dt/delitel; //I2n1
			this.K[0][4] = this.transM*(-this.m[1][2] + this.m[0][2])/this.dt/delitel; //I1n
			this.K[0][5] = this.L2*(-this.m[1][2] + this.m[0][2])/this.dt/delitel; //I2n
			this.K[0][6] = (this.m[0][2]*this.m[1][0] - this.m[0][0]*this.m[1][2])/delitel; //U2n

			//U2n1 = K[3][0]*I1a + K[3][1]*I1n1 + K[3][2]*I2a + K[3][3]*I2n1 + (K[3][4]*I1n + K[3][5]*I2n + K[3][6]*U2n)
			this.K[1][0] = -this.transM*this.m[1][1]/this.dt/delitel; //I1a
			this.K[1][1] = this.transM*this.m[0][1]/this.dt/delitel; //I1n1
			this.K[1][2] = -this.L2*this.m[1][1]/this.dt/delitel; //I2a
			this.K[1][3] = this.L2*this.m[0][1]/this.dt/delitel; //I2n1
			this.K[1][4] = this.transM*(this.m[1][1] - this.m[0][1])/this.dt/delitel; //I1n
			this.K[1][5] = this.L2*(this.m[1][1] - this.m[0][1])/this.dt/delitel; //I2n
			this.K[1][6] = (this.m[0][0]*this.m[1][1] - this.m[0][1]*this.m[1][0])/delitel; //U2n
		}
		
		// let delitel = m[0][1]*m[1][2]-m[0][2]*m[1][1];
		// k11 = L1*m22/h/delitel; //I1a
		// k12 = -L1*m12/h/delitel; //I1n1
		// k13 = m*m22/h/delitel; //I2a
		// k14 = -m*m12/h/delitel; //I2n1
		// k15 = L1*(-m22 + m12)/h/delitel; //I1n
		// k16 = m*(-m22 + m12)/h/delitel; //I2n
		// k17 = (m12*m20 - m10*m22)/delitel; //U1n

		// k21 = m*m22/h/delitel; //I1a
		// k22 = -m*m12/h/delitel; //I1n1
		// k23 = L2*m22/h/delitel; //I2a
		// k24 = -L2*m12/h/delitel; //I2n1
		// k25 = m*(-m22 + m12)/h/delitel; //I1n
		// k26 = L2*(-m22 + m12)/h/delitel; //I2n
		// k27 = (m12*m20 - m10*m22)/delitel; //U2n

		// k31 = -L1*m21/h/delitel; //I1a
		// k32 = L1*m11/h/delitel; //I1n1
		// k33 = -m*m21/h/delitel; //I2a
		// k34 = m*m11/h/delitel; //I2n1
		// k35 = L1*(m21 - m11)/h/delitel; //I1n
		// k36 = m*(m21 - m11)/h/delitel; //I2n
		// k37 = (m10*m21 - m11*m20)/delitel; //U1n

		// k41 = -m*m21/h/delitel; //I1a
		// k42 = m*m11/h/delitel; //I1n1
		// k43 = -L2*m21/h/delitel; //I2a
		// k44 = L2*m11/h/delitel; //I2n1
		// k45 = m*(m21 - m11)/h/delitel; //I1n
		// k46 = L2*(m21 - m11)/h/delitel; //I2n
		// k47 = (m10*m21 - m11*m20)/delitel; //U2n
	}
	
	findCurrentToVoltageCoef(){
		
	}

	printData() {
		return {dt:this.dt, R:this.r, L:this.l, C:this.c, D:this.pr_d, I:this.In1, U:this.Un1, 
			UC:this.Udn1, UR:this.Urn1, UL:this.ul, EDS:this.eds, UC_o:this.uc_o, I_o:this.I_o,
			U_o:this.u_o, EDS_o:this.eds_o, dUdt:this.derU, A:this.A, B:this.B, test:this.test};
	}
	findNewState(Ia,In1){
		this.Ia = Ia;
		this.In1= In1;		
	}
	
	findVolatageFromCurrent(){
		let relTr = this.relatedTransformer;
		let edgeRelTr = this.relatedTransformerEdge;
				
		if (this.transNum == 1) {
			//U1a = K[0][0]*I1a + K[0][1]*I1n1 + K[0][2]*I2a + K[0][3]*I2n1 + (K[0][4]*I1n + K[0][5]*I2n + K[0][6]*U1n)
			//U1n1 = K[2][0]*I1a + K[2][1]*I1n1 + K[2][2]*I2a + K[2][3]*I2n1 + (K[2][4]*I1n + K[2][5]*I2n + K[2][6]*U1n)
		
			this.Ua  = this.K[0][0]*this.Ia + this.K[0][1]*this.In1 + this.K[0][2]*edgeRelTr.Ia + this.K[0][3]*edgeRelTr.In1 + this.K[0][4]*this.In + this.K[0][5]*edgeRelTr.In + this.K[0][6]*this.Un;
			this.Un1 = this.K[1][0]*this.Ia + this.K[1][1]*this.In1 + this.K[1][2]*edgeRelTr.Ia + this.K[1][3]*edgeRelTr.In1 + this.K[1][4]*this.In + this.K[1][5]*edgeRelTr.In + this.K[1][6]*this.Un;
		}
		else {
			//U2a = K[1][0]*I1a + K[1][1]*I1n1 + K[1][2]*I2a + K[1][3]*I2n1 + (K[1][4]*I1n + K[1][5]*I2n + K[1][6]*U2n)
        	//U2n1 = K[3][0]*I1a + K[3][1]*I1n1 + K[3][2]*I2a + K[3][3]*I2n1 + (K[3][4]*I1n + K[3][5]*I2n + K[3][6]*U2n)

			this.Ua  = this.K[0][0]*edgeRelTr.Ia + this.K[0][1]*edgeRelTr.In1 + this.K[0][2]*this.Ia + this.K[0][3]*this.In1 + this.K[0][4]*edgeRelTr.In + this.K[0][5]*this.In + this.K[0][6]*this.Un;
			this.Un1 = this.K[1][0]*edgeRelTr.Ia + this.K[1][1]*edgeRelTr.In1 + this.K[1][2]*this.Ia + this.K[1][3]*this.In1 + this.K[1][4]*edgeRelTr.In + this.K[1][5]*this.In + this.K[1][6]*this.Un;
		}


		

		

		// this.Ura = this.Kr[0][0]*Ia + this.Kr[0][1]*In1 + this.Kr[0][2];
		// this.Ula = this.Kl[0][0]*Ia + this.Kl[0][1]*In1 + this.Kl[0][2];
		// this.Uca = this.Kc[0][0]*Ia + this.Kc[0][1]*In1 + this.Kc[0][2];

		// this.Urn1 = this.Kr[1][0]*Ia + this.Kr[1][1]*In1 + this.Kr[1][2];
		// this.Uln1 = this.Kl[1][0]*Ia + this.Kl[1][1]*In1 + this.Kl[1][2];
		// this.Ucn1 = this.Kc[1][0]*Ia + this.Kc[1][1]*In1 + this.Kc[1][2];
	}

	getCoefMatrices(hdu, signU){
		//трансформатор
		let relTr = this.relatedTransformer;
		let edgeRelTr = this.relatedTransformerEdge;
		let matrix = new Array(4);
		matrix[0] = new Array(hdu*2).fill(0);
		matrix[1] = new Array(hdu*2).fill(0);	
		matrix[2] = 0;
		matrix[3] = 0;
		
		//U1a = K[0][0]*I1a + K[0][1]*I1n1 + K[0][2]*I2a + K[0][3]*I2n1 + (K[0][4]*I1n + K[0][5]*I2n + K[0][6]*U1n)
		//U1n1 = K[2][0]*I1a + K[2][1]*I1n1 + K[2][2]*I2a + K[2][3]*I2n1 + (K[2][4]*I1n + K[2][5]*I2n + K[2][6]*U1n)
		//U2a = K[1][0]*I1a + K[1][1]*I1n1 + K[1][2]*I2a + K[1][3]*I2n1 + (K[1][4]*I1n + K[1][5]*I2n + K[1][6]*U2n)
		//U2n1 = K[3][0]*I1a + K[3][1]*I1n1 + K[3][2]*I2a + K[3][3]*I2n1 + (K[3][4]*I1n + K[3][5]*I2n + K[3][6]*U2n)
			//запись коэффициентов Рунге_Кутта
		if (this.transNum == 1) {
			matrix[0][this.edgeNum] = signU*this.K[0][0]; 
			matrix[0][this.edgeNum + hdu] = signU*this.K[0][1];
			matrix[0][relTr] = signU*this.K[0][2]; 
			matrix[0][relTr + hdu] = signU*this.K[0][3];

			matrix[1][this.edgeNum] = signU*this.K[1][0]; 
			matrix[1][this.edgeNum + hdu] = signU*this.K[1][1];
			matrix[1][relTr] = signU*this.K[1][2]; 
			matrix[1][relTr + hdu] = signU*this.K[1][3];
			matrix[2] = signU*(this.K[0][4]*this.In + this.K[0][5]*edgeRelTr.In + this.K[0][6]*this.Un);
			matrix[3] = signU*(this.K[1][4]*this.In + this.K[1][5]*edgeRelTr.In + this.K[1][6]*this.Un);

			return matrix;

		// 	A[i][this.edgeNum] += signU*this.K[0][0]; 
		// 	A[i][this.edgeNum + hd] += signU*this.K[0][1];
		// 	A[i][relTr] += signU*this.K[0][2]; 
		// 	A[i][relTr + hd] += signU*this.K[0][3];

		// 	A[i + hd][this.edgeNum] += signU*this.K[1][0]; 
		// 	A[i + hd][this.edgeNum + hd] += signU*this.K[1][1];
		// 	A[i + hd][relTr] += signU*this.K[1][2]; 
		// 	A[i + hd][relTr + hd] += signU*this.K[1][3];
		// 	B[i]	-= signU*(this.K[0][4]*this.In + this.K[0][5]*edgeRelTr.In + this.K[0][6]*this.Un);
		// 	B[i + hd] -= signU*(this.K[1][4]*this.In + this.K[1][5]*edgeRelTr.In + this.K[1][6]*this.Un);
		}
		else {
			matrix[0][this.edgeNum] = signU*this.K[0][2]; 
			matrix[0][this.edgeNum + hdu] = signU*this.K[0][3];
			matrix[0][relTr] = signU*this.K[0][0]; 
			matrix[0][relTr + hdu] = signU*this.K[0][1];

			matrix[1][this.edgeNum] = signU*this.K[1][2]; 
			matrix[1][this.edgeNum + hdu] = signU*this.K[1][3];
			matrix[1][relTr] = signU*this.K[1][0]; 
			matrix[1][relTr + hdu] = signU*this.K[1][1];
			matrix[2] = -signU*(this.K[0][4]*edgeRelTr.In + this.K[0][5]*this.In + this.K[0][6]*this.Un);
			matrix[3] = -signU*(this.K[1][4]*edgeRelTr.In + this.K[1][5]*this.In + this.K[1][6]*this.Un);

			return matrix;

			// A[i][relTr] += signU*this.K[0][0]; 
			// A[i][relTr + hd] += signU*this.K[0][1];
			// A[i][this.edgeNum] += signU*this.K[0][2]; 
			// A[i][this.edgeNum + hd] += signU*this.K[0][3];

			// A[i + hd][relTr] += signU*this.K[1][0]; 
			// A[i + hd][relTr + hd] += signU*this.K[1][1];
			// A[i + hd][this.edgeNum] += signU*this.K[1][2]; 
			// A[i + hd][this.edgeNum + hd] += signU*this.K[1][3];
			// B[i]	-= signU*(this.K[0][4]*edgeRelTr.In + this.K[0][5]*this.In + this.K[0][6]*this.Un);
			// B[i + hd] -= signU*(this.K[1][4]*edgeRelTr.In + this.K[1][5]*this.In + this.K[1][6]*this.Un);
		}
    }

	//——————————————————————————————————————————————————————————————————————————————
	//переход к следующему временному шагу - присваивание переменным предыдущего
	//шага значений этого шага. 
	finalizeIteration(){
		this.In = this.In1;
		this.Un = this.Un1;		
		this.tn = this.tn1;

		// this.Urn = this.Urn1;
		// this.Uln = this.Uln1;
		// this.Ucn = this.Ucn1;
	}

	processLogic(){
		
		return false;		
	} 
}
//——————————————————————————————————————————————————————————————————————————————
//Generator
//——————————————————————————————————————————————————————————————————————————————
class edgeGenerator extends edgeRK3LinearModel{
		
	constructor(jsonObj, edgeNum, graphNodes, param = null)
	{
		
		super(jsonObj, edgeNum, graphNodes);
		
		this.M = jsonObj.M;
		// this.transM = jsonObj.m;
		//this.transM = 0.9*Math.sqrt(this.L1 * this.L2);
		this.createMatricesGenerator(this.M);
		let buff = Array(4).fill(1);
		// let multi = math.multiply(this.MMatrix,buff);
		
		this.In = 0;
		this.Un = 0;
		this.Ia = 0;
		this.Ua = 0;
		this.In1 = 0;
		this.Un1 = 0;

		this.tn = 0;
		this.ta = 0;
		this.tn1 = 0;

		this.Ura = 0;
		this.Ula = 0;
		this.Uca = 0;

		this.Urn1 = 0;
		this.Uln1 = 0;
		this.Ucn1 = 0;
		
		this.Urn = 0;
		this.Uln = 0;
		this.Ucn = 0;
			
	}
	//——————————————————————————————————————————————————————————————————————————————
	createMatricesGenerator(M){
		this.MMatrix = new Array(4);
		for (let i = 0; i < 4; i++) {
			this.MMatrix[i] = new Array(4).fill(0);
		}
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				if (i == j){
					this.MMatrix[i][j] = 2*M;
				}
				else {
					this.MMatrix[i][j] = M;
				}
			}
		}
	}
	//——————————————————————————————————————————————————————————————————————————————
	GetUaCoef(M,dt){
		let delitel = this.m[0][1] * this.m[1][2] - this.m[1][1] * this.m[0][2];
		this.K[0][0] = math.multiply(M,this.m[1][2]/this.dt/delitel);
		this.K[0][1] = math.multiply(M ,-this.m[0][2]/this.dt/delitel);
		this.K[0][2] = math.multiply(math.add(this.K[0][0], this.K[0][2]),-1);
		this.K[0][3] = (this.m[1][0]*this.m[0][2] - this.m[0][0]*this.m[1][2])/delitel;
	}
	//——————————————————————————————————————————————————————————————————————————————
	GetUn1Coef(M,dt){
		let delitel = this.m[0][2] * this.m[1][1] - this.m[1][2] * this.m[0][1];
		this.K[1][0] = math.multiply(M,this.m[1][1]/this.dt/delitel);
		this.K[1][1] = math.multiply(M ,-this.m[0][1]/this.dt/delitel);
		this.K[1][2] = math.multiply(math.add(this.K[1][0], this.K[1][2]),-1);
		this.K[1][3] = (this.m[1][0]*this.m[0][1] - this.m[0][0]*this.m[1][1])/delitel;
	}
	//——————————————————————————————————————————————————————————————————————————————
	
	//——————————————————————————————————————————————————————————————————————————————
	calcLinearCoef(dt){
		this.dt = dt;
		this.ta = this.tn + this.c1*dt;
		this.tn1 = this.tn + dt;

		this.calcConstCoef();

		this.findCurrentToVoltageCoef();
		
	}

	calcConstCoef(){
		this.K = new Array(2);
		for (let i = 0; i < 2; i++) {
			this.K[i] = new Array(4).fill(0);				
		}
		//Ua = K[0][0]*Ia + K[0][1]*In1 + K[0][2] 			это для трансформатора
		//Un1 = K[1][0]*Ia + K[1][1]*In1 + K[1][2]

		//Ia = k[0][0]*Ua + k[0][1]*Un1 + k[0][2] 
		//In1 = k[1][0]*Ua + k[1][1]*Un1 + k[1][2]
		this.GetUaCoef(this.MMatrix);
		this.GetUn1Coef(this.MMatrix);

		let column = Array(4);
		column[0] = 1;
		column[1] = 2;
		column[2] = 3;
		column[3] = 4;
	
		let res = math.multiply(this.K[0][0],column);
		
	}
	
	findCurrentToVoltageCoef(){
		
	}

	printData() {
		return {dt:this.dt, R:this.r, L:this.l, C:this.c, D:this.pr_d, I:this.In1, U:this.Un1, 
			UC:this.Udn1, UR:this.Urn1, UL:this.ul, EDS:this.eds, UC_o:this.uc_o, I_o:this.I_o,
			U_o:this.u_o, EDS_o:this.eds_o, dUdt:this.derU, A:this.A, B:this.B, test:this.test};
	}
	findNewState(Ia,In1){
		this.Ia = Ia;
		this.In1= In1;		
	}
	
	findVolatageFromCurrent(){
		let relTr = this.relatedTransformer;
		let edgeRelTr = this.relatedTransformerEdge;
				
		if (this.transNum == 1) {
			//U1a = K[0][0]*I1a + K[0][1]*I1n1 + K[0][2]*I2a + K[0][3]*I2n1 + (K[0][4]*I1n + K[0][5]*I2n + K[0][6]*U1n)
			//U1n1 = K[2][0]*I1a + K[2][1]*I1n1 + K[2][2]*I2a + K[2][3]*I2n1 + (K[2][4]*I1n + K[2][5]*I2n + K[2][6]*U1n)
		
			this.Ua  = this.K[0][0]*this.Ia + this.K[0][1]*this.In1 + this.K[0][2]*edgeRelTr.Ia + this.K[0][3]*edgeRelTr.In1 + this.K[0][4]*this.In + this.K[0][5]*edgeRelTr.In + this.K[0][6]*this.Un;
			this.Un1 = this.K[1][0]*this.Ia + this.K[1][1]*this.In1 + this.K[1][2]*edgeRelTr.Ia + this.K[1][3]*edgeRelTr.In1 + this.K[1][4]*this.In + this.K[1][5]*edgeRelTr.In + this.K[1][6]*this.Un;
		}
		else {
			//U2a = K[1][0]*I1a + K[1][1]*I1n1 + K[1][2]*I2a + K[1][3]*I2n1 + (K[1][4]*I1n + K[1][5]*I2n + K[1][6]*U2n)
        	//U2n1 = K[3][0]*I1a + K[3][1]*I1n1 + K[3][2]*I2a + K[3][3]*I2n1 + (K[3][4]*I1n + K[3][5]*I2n + K[3][6]*U2n)

			this.Ua  = this.K[0][0]*edgeRelTr.Ia + this.K[0][1]*edgeRelTr.In1 + this.K[0][2]*this.Ia + this.K[0][3]*this.In1 + this.K[0][4]*edgeRelTr.In + this.K[0][5]*this.In + this.K[0][6]*this.Un;
			this.Un1 = this.K[1][0]*edgeRelTr.Ia + this.K[1][1]*edgeRelTr.In1 + this.K[1][2]*this.Ia + this.K[1][3]*this.In1 + this.K[1][4]*edgeRelTr.In + this.K[1][5]*this.In + this.K[1][6]*this.Un;
		}


		

		

		// this.Ura = this.Kr[0][0]*Ia + this.Kr[0][1]*In1 + this.Kr[0][2];
		// this.Ula = this.Kl[0][0]*Ia + this.Kl[0][1]*In1 + this.Kl[0][2];
		// this.Uca = this.Kc[0][0]*Ia + this.Kc[0][1]*In1 + this.Kc[0][2];

		// this.Urn1 = this.Kr[1][0]*Ia + this.Kr[1][1]*In1 + this.Kr[1][2];
		// this.Uln1 = this.Kl[1][0]*Ia + this.Kl[1][1]*In1 + this.Kl[1][2];
		// this.Ucn1 = this.Kc[1][0]*Ia + this.Kc[1][1]*In1 + this.Kc[1][2];
	}

	getCoefMatrices(hdu, signU){
		//трансформатор
		let relTr = this.relatedTransformer;
		let edgeRelTr = this.relatedTransformerEdge;
		let matrix = new Array(4);
		matrix[0] = new Array(hdu*2).fill(0);
		matrix[1] = new Array(hdu*2).fill(0);	
		matrix[2] = 0;
		matrix[3] = 0;
		
		//U1a = K[0][0]*I1a + K[0][1]*I1n1 + K[0][2]*I2a + K[0][3]*I2n1 + (K[0][4]*I1n + K[0][5]*I2n + K[0][6]*U1n)
		//U1n1 = K[2][0]*I1a + K[2][1]*I1n1 + K[2][2]*I2a + K[2][3]*I2n1 + (K[2][4]*I1n + K[2][5]*I2n + K[2][6]*U1n)
		//U2a = K[1][0]*I1a + K[1][1]*I1n1 + K[1][2]*I2a + K[1][3]*I2n1 + (K[1][4]*I1n + K[1][5]*I2n + K[1][6]*U2n)
		//U2n1 = K[3][0]*I1a + K[3][1]*I1n1 + K[3][2]*I2a + K[3][3]*I2n1 + (K[3][4]*I1n + K[3][5]*I2n + K[3][6]*U2n)
			//запись коэффициентов Рунге_Кутта
		if (this.transNum == 1) {
			matrix[0][this.edgeNum] = signU*this.K[0][0]; 
			matrix[0][this.edgeNum + hdu] = signU*this.K[0][1];
			matrix[0][relTr] = signU*this.K[0][2]; 
			matrix[0][relTr + hdu] = signU*this.K[0][3];

			matrix[1][this.edgeNum] = signU*this.K[1][0]; 
			matrix[1][this.edgeNum + hdu] = signU*this.K[1][1];
			matrix[1][relTr] = signU*this.K[1][2]; 
			matrix[1][relTr + hdu] = signU*this.K[1][3];
			matrix[2] = signU*(this.K[0][4]*this.In + this.K[0][5]*edgeRelTr.In + this.K[0][6]*this.Un);
			matrix[3] = signU*(this.K[1][4]*this.In + this.K[1][5]*edgeRelTr.In + this.K[1][6]*this.Un);

			return matrix;

		// 	A[i][this.edgeNum] += signU*this.K[0][0]; 
		// 	A[i][this.edgeNum + hd] += signU*this.K[0][1];
		// 	A[i][relTr] += signU*this.K[0][2]; 
		// 	A[i][relTr + hd] += signU*this.K[0][3];

		// 	A[i + hd][this.edgeNum] += signU*this.K[1][0]; 
		// 	A[i + hd][this.edgeNum + hd] += signU*this.K[1][1];
		// 	A[i + hd][relTr] += signU*this.K[1][2]; 
		// 	A[i + hd][relTr + hd] += signU*this.K[1][3];
		// 	B[i]	-= signU*(this.K[0][4]*this.In + this.K[0][5]*edgeRelTr.In + this.K[0][6]*this.Un);
		// 	B[i + hd] -= signU*(this.K[1][4]*this.In + this.K[1][5]*edgeRelTr.In + this.K[1][6]*this.Un);
		}
		else {
			matrix[0][this.edgeNum] = signU*this.K[0][2]; 
			matrix[0][this.edgeNum + hdu] = signU*this.K[0][3];
			matrix[0][relTr] = signU*this.K[0][0]; 
			matrix[0][relTr + hdu] = signU*this.K[0][1];

			matrix[1][this.edgeNum] = signU*this.K[1][2]; 
			matrix[1][this.edgeNum + hdu] = signU*this.K[1][3];
			matrix[1][relTr] = signU*this.K[1][0]; 
			matrix[1][relTr + hdu] = signU*this.K[1][1];
			matrix[2] = -signU*(this.K[0][4]*edgeRelTr.In + this.K[0][5]*this.In + this.K[0][6]*this.Un);
			matrix[3] = -signU*(this.K[1][4]*edgeRelTr.In + this.K[1][5]*this.In + this.K[1][6]*this.Un);

			return matrix;

			// A[i][relTr] += signU*this.K[0][0]; 
			// A[i][relTr + hd] += signU*this.K[0][1];
			// A[i][this.edgeNum] += signU*this.K[0][2]; 
			// A[i][this.edgeNum + hd] += signU*this.K[0][3];

			// A[i + hd][relTr] += signU*this.K[1][0]; 
			// A[i + hd][relTr + hd] += signU*this.K[1][1];
			// A[i + hd][this.edgeNum] += signU*this.K[1][2]; 
			// A[i + hd][this.edgeNum + hd] += signU*this.K[1][3];
			// B[i]	-= signU*(this.K[0][4]*edgeRelTr.In + this.K[0][5]*this.In + this.K[0][6]*this.Un);
			// B[i + hd] -= signU*(this.K[1][4]*edgeRelTr.In + this.K[1][5]*this.In + this.K[1][6]*this.Un);
		}
    }

	//——————————————————————————————————————————————————————————————————————————————
	//переход к следующему временному шагу - присваивание переменным предыдущего
	//шага значений этого шага. 
	finalizeIteration(){
		this.In = this.In1;
		this.Un = this.Un1;		
		this.tn = this.tn1;

		// this.Urn = this.Urn1;
		// this.Uln = this.Uln1;
		// this.Ucn = this.Ucn1;
	}

	processLogic(){
		
		return false;		
	} 
}
//——————————————————————————————————————————————————————————————————————————————
//——————————————————————————————————————————————————————————————————————————————
function relativeError(oldVal,newVal){
	let error = oldVal-newVal;
	if(Math.abs(oldVal) < Number.EPSILON) {
		return Math.abs(error/newVal);
	}
	if(Math.abs(newVal) < Number.EPSILON) {
		return Math.abs(error/oldVal);
	}
	
	let denominator = Math.min(Math.abs(oldVal),Math.abs(newVal));
	return Math.abs(error)/denominator;	
}

//——————————————————————————————————————————————————————————————————————————————
function relativeNorm(oldVal,newVal){
	if(Math.abs(oldVal) < Number.EPSILON && Math.abs(newVal) < Number.EPSILON) {
		return 0;
	}	
	return Math.abs(oldVal - newVal)/(Math.abs(newVal) + Math.abs(oldVal));	
}


