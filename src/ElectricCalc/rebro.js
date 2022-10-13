class GraphEdge {
	func_findAB;
	func_findState;
		
	constructor(jsonObj, edgeNum, graphNodes)
	{
		//main values
		this.edgeNum = edgeNum;
		this.nodeInNum = jsonObj.in;
		this.nodeOutNum = jsonObj.out;
		this.addToGraphNodes(graphNodes, this.nodeInNum, this.nodeOutNum);

		this.r_ini = this.r = jsonObj.R;
		this.l_ini = this.l = jsonObj.L;
		this.c_ini = this.c = jsonObj.C;
		this.pr_d = jsonObj.D;
		this.eds_ini = this.eds = jsonObj.E;
		this.type = jsonObj.type;
		//initializing different edge types
		this.beta = 0.0;
		this.omega = 0.0;
		this.pr_oscillations = false;
		this.pr_edgeVisible = 1;
		
		switch (this.type) {
			case "R":
				this.func_findAB 	= this.findAB_R;
				this.func_findState	= this.findState_R;
			break;
			case "C":
				this.func_findAB = this.findAB_C;
				this.func_findState	= this.findState_C;
			break;
			case "CR":
				this.func_findAB = this.findAB_CR;
				this.func_findState	= this.findState_CR;
			break;
			case "L":
				this.func_findAB = this.findAB_L;
				this.func_findState	= this.findState_L;
			break;
			case "LR":
				this.func_findAB = this.findAB_LR;
				this.func_findState	= this.findState_LR;
			break;
			case "LC":
				this.func_findAB = this.findAB_LCR;
				this.func_findState	= this.findState_LCR;

				this.pr_oscillations = true; //колебательный контур
				this.omega = Math.pow(Math.abs(- 1.0/(l*c)),0.5);   
			break;
			case "LCR":
				this.func_findAB = this.findAB_LCR;
				this.func_findState	= this.findState_LCR;

				this.beta = r/2.0/l; //дикримент затухания
				if( ( pow(this.beta,2) - 1.0/(l*c) ) < 0.0) {
					this.pr_oscillations = true;  //колебательный контур
				}   
				else {
					this.pr_oscillations = false; //нет колебаний - быстрое затухание
				}   
				this.omega = Math.pow(Math.abs(Math.pow(this.beta,2) - 1.0/(l*c)),0.5); 
				 
			break;
			default:
			  	console.log("wrong type");
		}
		//initializing edge physical parameters
		this.u;
		this.uc;		
		this.ul;
		this.ur;
		this.I;
		//initializing previous time step parameters
		this.eds_o = 0;
		this.u_o = 0;
		this.ul_o = 0;
		this.uc_o = 0;
		this.I_o = 0;
		//misc edge parameters
		this.A;
		this.B;
		this.dt;
		this.derU;

		
	}
	//——————————————————————————————————————————————————————————————————————————————
	addToGraphNodes(graphNodes, inNum, outNum){
		this.nodeIn = graphNodes[inNum];
		this.nodeOut = graphNodes[outNum];
		if(!this.nodeIn){
			this.nodeIn = new GraphNode(graphNodes, graphNodes.size);
			graphNodes.push(this.nodeIn);
		}
		if(!this.nodeOut){
			this.nodeOut = new GraphNode(graphNodes, graphNodes.size);
			graphNodes.push(this.nodeOut);
		}
		this.nodeIn.addEdge(this,true);
		this.nodeOut.addEdge(this,false);
	}

	//——————————————————————————————————————————————————————————————————————————————
	calculateAB(dt){
		this.dt = dt;
		this.func_findAB();
	}
	//——————————————————————————————————————————————————————————————————————————————
	//поиск коэфициентов A и B (U = A*I + B) для случая с активным сопротивлением
	findAB_R()
	{
		this.B = this.eds;
		this.A = this.r;
	}

	//——————————————————————————————————————————————————————————————————————————————
	//поиск коэфициентов A и B (U = A*I + B) для случая с ёмкостью
	findAB_C()
	{
		this.B = this.u_o + this.eds - this.eds_o;
		this.A = this.dt/this.c;
	}

	//——————————————————————————————————————————————————————————————————————————————
	//поиск коэфициентов A и B (U = A*I + B) для случая с активным сопротивлением и ёмкостью
	findAB_CR()
	{
		let bad_data = false;
		let func_Local;

		if (this.dt/this.c/this.r > 100.0) {func_Local = this.findAB_C; bad_data = true;}
		if (this.dt/this.c/this.r < 1.0e-12) {func_Local = this.findAB_R; bad_data = true;}

		if (bad_data)
		{
		func_Local();
		return;
		}

		this.B = -this.I_o/this.c*this.dt/( Math.exp(this.dt/this.c/this.r) - 1.0) +  this.u_o + 
			this.eds - this.eds_o;
		this.A = this.dt/this.c/(1.0 - Math.exp(-this.dt/this.c/this.r));
	}

	//——————————————————————————————————————————————————————————————————————————————
	//поиск коэфициентов A и B (U = A*I + B) для случая с индуктивностью
	findAB_L()
	{
		this.B = -this.I_o*this.l/this.dt + this.eds;
		this.A = this.l/this.dt;
	}

	//——————————————————————————————————————————————————————————————————————————————
	//поиск коэфициентов A и B (U = A*I + B) для случая с активным сопротивлением и индуктивностью
	findAB_LR()
	{
		let bad_data = false;
		let func_Local;

		if (dt*this.r/this.l > 100.0) {func_Local = this.findAB_R; bad_data = true;}
		if (dt*this.r/this.l < 1.0e-9) {func_Local = this.findAB_L; bad_data = true;}

		if (bad_data)
		{
		func_Local();
		return;
		}

		this.B = -this.dt*(this.I_o*this.r*Math.exp(-this.dt*this.r/this.l) - 
			(this.u_o - this.eds_o)*(Math.exp(-this.dt*this.r/this.l) - 1.0)) /
			(this.l/this.r*(Math.exp(-this.dt*this.r/this.l) - 1.0) + this.dt) + 
			this.u_o + this.eds - this.eds_o;
		this.A = this.r*this.dt/(this.l/this.r*(Math.exp(-this.dt*this.r/this.l) - 1.0) + 
			this.dt);
	}


	//——————————————————————————————————————————————————————————————————————————————
	//поиск коэфициентов A и B (U = A*I + B) для случая с активным сопротивлением,
	//ёмкостью и индуктивностью (решение уравнения колебаний в комплексных числах)
	findAB_LCR()
	{
		let beta_c = Math.complex(this.beta,0.0);
		let omega_c;
		if (this.pr_oscillations)
		{
			omega_c = Math.complex(0.0,this.omega);
		}
		else
		{
			omega_c = Math.complex(this.omega,0.0);
		}

		let B_local =  ((this.uc_o - this.u_o + this.eds_o + 
			this.l*this.I_o*(beta_c - omega_c))*Math.exp(-this.dt*(beta_c - 
			omega_c)) -	(this.uc_o - this.u_o + this.eds_o + this.l*this.I_o*(beta_c + 
			omega_c))*Math.exp(-this.dt*(beta_c + omega_c)))/(this.l*this.c/this.dt) /
			(2*omega_c + (beta_c - omega_c)*Math.exp(-this.dt*(beta_c + omega_c)) - 
			(beta_c + omega_c)*Math.exp(-this.dt*(beta_c - omega_c))) + this.eds + 
			this.u_o - this.eds_o;
		let A_local = (this.dt/this.c)*(2*omega_c)/(2*omega_c + 
			(beta_c - omega_c)*Math.exp(-this.dt*(beta_c + omega_c)) - 
			(beta_c + omega_c)*Math.exp(-this.dt*(beta_c - omega_c)));

		if (Math.abs(A_local.im) > 1.0e-12 || Math.abs(B_local.im) > 1.0e-12) {
			console.log("error in LCR");
			return;
		};
		this.A = A_local.re;
		this.B = B_local.re;
	}

	//——————————————————————————————————————————————————————————————————————————————
	//Определение U по найденному I, расчёт сопутсвующих величин - заряд конденсатора,
	//напряжения на активном сопротивлении, ёмкости и индуктивности, производная
	//разности напряжения и ЭДС (derU).
	//Переход к следующему временному слою - присваивание переменным предыдущего шага
	//значений этого шага.
	//——————————————————————————————————————————————————————————————————————————————
	newState(I)
	{
		this.I = I;		
		this.u = this.find_U_from_I(I);    //нахождение U
		//-------------------------------
		this.derU = (this.u  - this.eds  - ( this.u_o - this.eds_o))/this.dt;  //расчёт производной напряжения
        this.func_findState();   //переход к функции расчёта сопутсвующих параметров
		//-------------------------------
		//переход к следующему временному шагу - присваивание переменным предыдущего
		//шага значений этого шага. 
		this.eds_o = this.eds;
		this.uc_o = this.uc;
		this.I_o = this.I;
		this.u_o = this.u;
	}
	//——————————————————————————————————————————————————————————————————————————————
	//расчёт сопутсвующих параметров для случая с активным сопротивлением
	findState_R()
	{
		this.uc = 0.0;
		this.ul = 0.0;
		this.ur = (this.u - this.eds);
	}

	//——————————————————————————————————————————————————————————————————————————————
	//расчёт сопутсвующих параметров для случая с ёмкостью
	findState_C()
	{
		this.uc = (this.u - this.eds);
		this.ul = 0.0;
		this.ur = 0.0;
	}

	//——————————————————————————————————————————————————————————————————————————————
	//расчёт сопутсвующих параметров для случая с активным сопротивлением и ёмкостью
	findState_CR()
	{
		this.uc = (this.u - this.eds) - this.r*this.I;
		this.ul = 0.0;
		this.ur = this.r*this.I;
	}

	//——————————————————————————————————————————————————————————————————————————————
	//расчёт сопутсвующих параметров для случая с аиндуктивностью
	findState_L()
	{
		this.uc = 0.0;
		this.ul = (this.u - this.eds);
		this.ur = 0.0;
	}

	//——————————————————————————————————————————————————————————————————————————————
	//расчёт сопутсвующих параметров для случая с активным сопротивлением и индуктивностью
	findState_LR()
	{
		this.uc = 0.0;
		this.ul = (this.u - this.eds) - this.r*this.I;;
		this.ur = this.r*this.I;
	}


	//——————————————————————————————————————————————————————————————————————————————
	//расчёт сопутсвующих параметров для случая с активным сопротивлением, ёмкостью и индуктивностью
	findState_LCR()
	{
		let beta_c = Math.complex(this.beta,0.0);
		let omega_c;
		if (this.pr_oscillations)
		{
			omega_c = Math.complex(0.0,this.omega);
		}
		else
		{
			omega_c = Math.complex(this.omega,0.0);
		}


		let a1 = -( (this.uc_o - this.u_o)/this.l + this.I_o*(beta_c + omega_c) + 
			this.c*this.derU*(beta_c - omega_c))/(2*omega_c*(beta_c + omega_c));
		let a2 = +( (this.uc_o - this.u_o)/this.l + this.I_o*(beta_c - omega_c) + 
			this.c*this.derU*(beta_c + omega_c))/(2*omega_c*(beta_c - omega_c));

		let a1I = +( (this.uc_o - this.u_o)/this.l + this.I_o*(beta_c + omega_c) + 
			this.c*this.derU*(beta_c - omega_c))/(2*omega_c);
		let a2I = -( (this.uc_o - this.u_o)/this.l + this.I_o*(beta_c - omega_c) + 
			this.c*this.derU*(beta_c + omega_c))/(2*omega_c);

		let q_ans =  this.c*(this.u_o - this.c*this.r*this.derU) + 
			this.c*this.derU*this.dt + a1*Math.exp(-this.dt*(beta_c + omega_c)) + 
			a2*Math.exp(-this.dt*(beta_c - omega_c));

		let dI_ans = -a1I*(beta_c + omega_c)*Math.exp(-this.dt*(beta_c + omega_c)) - 
			a2I*(beta_c - omega_c)*Math.exp(-this.dt*(beta_c - omega_c));

		this.uc = q_ans.re/this.c;
		this.ul = dI_ans.re*this.l;
		this.ur = this.r*this.I;
	}
	
	//——————————————————————————————————————————————————————————————————————————————
	find_U_from_I(I) {
		return this.A*I + this.B;
	}

	printData() {
		return {R:this.r, L:this.l, C:this.c, D:this.pr_d, I:this.I, U:this.u, 
			UC:this.uc, UR:this.ur, Ul:this.ul, EDS:this.eds, UC_o:this.uc_o, I_o:this.I_o,
			U_o:this.u_o, EDS_o:this.eds_o, dUKsdt:this.derU, A:this.A, B:this.B};
	}
}