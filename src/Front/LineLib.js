var debugCoords = null;
class LineObjectKeeper {
	//lineList = new Map();
	lineDrawArray = [];
	mouseStartCoords = {};
	mouseLine = false;
	constructor(objectKeeper){
		this.objectKeeper = objectKeeper;
		this.objectKeeper.lineKeeper = this;
	}
	//инициализация несколько линий
	startLineTask(mouseCoords, coordsArr, svgGroup){
		if(!coordsArr.length) return;
		debugCoords = this.mouseStartCoords = mouseCoords;
		
		coordsArr.forEach(coords => {
			this.addLineSingle(coords,svgGroup);
		});
	} 
	//юзерская функция
	userStartLineTask(mouseCoords, coordsArr, svgGroup){
		this.mouseLine = true;
		this.startLineTask(mouseCoords, coordsArr, svgGroup);
	}

	//инициализация одной линии
	addLineSingle(coords,svgGroup){
		let allObjects = this.objectKeeper.objectMap;
		let lineDraw = new LineDraw(allObjects);
		lineDraw.startLine(coords,svgGroup);
		this.lineDrawArray.push(lineDraw);
	}
	userAddLineSingle(coords,svgGroup){
		this.mouseLine = true;
		objectKeeper.history.addHistory();
		
		this.mouseStartCoords = coords;
		this.addLineSingle(coords,svgGroup);
	}

	
	changeLineTask(mouseCoords){
		let coordsDelta = subCoords(mouseCoords,this.mouseStartCoords);
		//let debugDelta = subCoords(mouseCoords,debugCoords);
		//console.log("line",debugDelta.x,debugDelta.y);
		debugCoords = mouseCoords;
		for (let i = 0; i < this.lineDrawArray.length; i++){
			let lineDraw = this.lineDrawArray[i];
			lineDraw.svgLineChange(coordsDelta);
		}
	}

	addLineObjects (mouseCoords){
		
		let coordsDelta = subCoords(mouseCoords,this.mouseStartCoords);
		
		for (let i = 0; i < this.lineDrawArray.length; i++){
			let lineDraw = this.lineDrawArray[i];
			let lineCoords = lineDraw.lineCoords(coordsDelta);

			// if (4*coordsDelta.x*coordsDelta.x > gridDistanceSquare || 4*coordsDelta.y*coordsDelta.y > gridDistanceSquare)
			if(true){
				let svgLineConnect =new ObjectLine(lineCoords[0],lineCoords[1]);
				this.objectKeeper.appendObj(svgLineConnect);
				let svgLineConnect2 =new ObjectLine(lineCoords[1],lineCoords[2]);
				this.objectKeeper.appendObj(svgLineConnect2);
		    }
		    lineDraw.lineGroup.remove();
		}
		this.lineDrawArray = [];
	}
	userAddLineObjects (mouseCoords){
		this.mouseLine = false;
		this.addLineObjects (mouseCoords);
	}
}
//класс рисования промежуточной svg линии
class LineDraw {
	direction = null;
	delta = 10000;
	beginLoop = false;
	deltaCoords = {x:0,y:0};
	fixingCoords = {x:0,y:0}; //координаты для корректировки начальной точки
	constructor(allObjects){
		this.allObjects = allObjects;
		this.lineGroup = this.createLine();
		this.lineStartCoords = {x:0,y:0};
		this.lineEndCoords = {x:0,y:0};
		this.lines = [];
	}
	//инициализация линии
	startLine(deltaCoords,svgDrawGroup){
	    this.lineStartCoords.x=deltaCoords.x;
		this.lineStartCoords.y=deltaCoords.y;

	    //нахождение координат ЦКС из чистых координат
		//нахождение чистых координат иконки из ЦКС
		this.lineStartCoords = coordsToGridCoords(this.lineStartCoords);
		//переменная для удобства
		let pos = this.lineStartCoords;
		//поиск связанных линий с координатой pos
		this.allObjects.forEach(obj =>{
			if(obj.type == "connector"){
				if(obj.pos.x == pos.x && obj.pos.y == pos.y){
					obj.relatedObjects.forEach(relObj =>{
						if(relObj.type == "line"){
							this.lines.push(relObj);
						}
					});
				}
			}
		});
        //перемещение обёртки иконки объекта по новым чистым координатам
        moveIcon(this.lineGroup,pos.x,pos.y,true);

	    svgDrawGroup.appendChild(this.lineGroup);
	}
	//изменение координат линии
	svgLineChange(coords){
		let x2 = coords.x;
		let y2 = coords.y;
		if (this.direction==null){
				if ((x2*x2 > this.delta) && (x2*x2 >= y2*y2)) {
					//console.log("Hor");
					this.direction = "Horizontal";
				}
				else if ((y2*y2 > this.delta) && (x2*x2 < y2*y2)) {
					//console.log("Vert");
					this.direction = "Vertical";
				}
		}
		else {
			if (this.beginLoop == false){	
				this.beginLoop = true;
				let flagSoloLine = false;
				//рассматриваем случай, если точка связана только двумя последовательными линиями
				if(this.lines.length == 1){
					let line1 = this.lines[0];
					let line2 = null;
					let firstPoint = null;
					let secondPoint = null;
					let thirdPoint;
					//находим 1,2 точки линии
					if(line1.direction == this.direction){
						if(compareCoords(line1.point1, this.lineStartCoords)) {
							firstPoint = line1.point1;
							secondPoint = line1.point2;
						}
						else if(compareCoords(line1.point2, this.lineStartCoords)) {
							firstPoint = line1.point2;
							secondPoint = line1.point1;
						}
						//если мы начали с одного конца линии
						if(firstPoint!=null){
							line1.connectors.forEach(val =>{
								if(compareCoords(val.pos, secondPoint)){
									if(val.relatedObjects.size == 2){
										val.relatedObjects.forEach(relLine =>{
											if(relLine.id != line1.id && relLine.type == "line"){
												line2 = relLine;
											}
										});
									}
								}
						
							});
							if(line2!=null){
								if(line2.connectors.size==2){
									line2.connectors.forEach(val =>{
										if(!compareCoords(val.pos, secondPoint)){
											thirdPoint = val.pos;
											this.direction = line2.direction;
										}
									});
									this.lineStartCoords = thirdPoint;
									this.fixingCoords = subCoords(thirdPoint, firstPoint);
									moveIcon(this.lineGroup,this.lineStartCoords.x,this.lineStartCoords.y,true);
									objectKeeper.deleteObj(line1);
									objectKeeper.deleteObj(line2);
									flagSoloLine = true;
								}
							}
						}
					}
				}
				if(!flagSoloLine){
					this.lines.forEach(line =>{
						//ищем, есть ли линии с направлением, которую мы задали
						if(line.direction == this.direction){
							if(compareCoords(line.point1,this.lineStartCoords)) {
								this.lineStartCoords = line.point2;
								this.fixingCoords = subCoords(line.point2, line.point1);
								moveIcon(this.lineGroup,this.lineStartCoords.x,this.lineStartCoords.y,true);
								objectKeeper.deleteObj(line);
							}
							else if(compareCoords(line.point2,this.lineStartCoords)) {
								this.lineStartCoords = line.point1;
								this.fixingCoords = subCoords(line.point1, line.point2);
								moveIcon(this.lineGroup,this.lineStartCoords.x,this.lineStartCoords.y,true);
								objectKeeper.deleteObj(line);
							}
							else {

							}
						}
					});
				}
			}
			this.getDeltaCoords(coords);
			if(this.direction == "Vertical"){
				this.svgLineChangeVertical(this.deltaCoords.x,this.deltaCoords.y);
			}
			else{
				this.svgLineChangeHorizontal(this.deltaCoords.x,this.deltaCoords.y);
			}
				
			}
	}
	//вспомогательные функции рисования линии
	svgLineChangeVertical(x,y){
		//console.log("svgVert");
		let d = "M0 0 V "+ y + " H " + x;
		this.line.setAttributeNS(null,"d",d);
	}
	svgLineChangeHorizontal(x,y){
		//console.log("svgHor");
		let d = "M0 0 H "+ x + " V " + y;
		this.line.setAttributeNS(null,"d",d);
	}
	getDeltaCoords(coords){
		this.deltaCoords = subCoords(coords, this.fixingCoords);
		return (this.deltaCoords);
	}
	//возвращает координаты линий для svg-элемента
	lineCoords(mouseCoords) {
		this.getDeltaCoords(mouseCoords);
		this.lineEndCoords = addCoords(this.lineStartCoords,this.deltaCoords);
		let midCoords;
		if (this.direction == "Horizontal"){
			midCoords = {x: this.lineEndCoords.x,						y: this.lineStartCoords.y};
		}
		else {
			midCoords = {x: this.lineStartCoords.x,			y: this.lineEndCoords.y};
		}
		return [this.lineStartCoords, midCoords, this.lineEndCoords];
	}
	//шаблон svg-линии
	createLine() {
		let lineGroup = document.createElementNS(xmlns, "g");
		let lineConnect = document.createElementNS(xmlns, "path");
	    lineConnect.setAttributeNS(null,"id","line"); 
	    lineConnect.setAttributeNS(null,"stroke-width","15"); 
	    lineConnect.setAttributeNS(null,"stroke","black");
	    lineConnect.setAttributeNS(null,"d","M0 0");
	    lineConnect.setAttributeNS(null,"fill","transparent");

	    lineGroup.appendChild(lineConnect);
	    this.line = lineConnect;
	    return lineGroup;
	}
}


