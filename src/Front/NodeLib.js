class ConnectorObject extends ObjectTemplate {
	constructor (relatedObj, pos){
		super(pos,"connector");
		this.relatedObjects = new Map();
		this.relatedObjects.set(relatedObj.id,relatedObj);
		this.nodeGroup = null;
		this.isDeletable = false;
		this.isSelectable = false;
		//this.selectCount = 0;		
	}
	//--------------------------
	//создание элемента в nodeGroup
	createIcon() {
		this.nodeGroup = document.createElementNS(xmlns, "g");
		this.nodeGroup.setAttributeNS(null, "id", "node");

		let r = 30;

		let nodeControl = document.createElementNS(xmlns, "circle");
		nodeControl.setAttributeNS(null, "cx", 0);
		nodeControl.setAttributeNS(null, "cy", 0);
		nodeControl.setAttributeNS(null, "r", r+svgObjectPadding);
		nodeControl.setAttributeNS(null, "pointer-events", 'visible');
		nodeControl.setAttributeNS(null, "stroke-width", "0");
		nodeControl.setAttributeNS(null, "stroke", "none");
		nodeControl.setAttributeNS(null, "fill", "none");
		this.nodeGroup.appendChild(nodeControl); 

		let nodeTemp = document.createElementNS(xmlns, "circle");
		nodeTemp.setAttributeNS(null, "cx", 0);
		nodeTemp.setAttributeNS(null, "cy", 0);
		nodeTemp.setAttributeNS(null, "stroke-width", "0");
		nodeTemp.setAttributeNS(null, "r", r);
		this.nodeGroup.appendChild(nodeTemp); 
		this.node = nodeTemp;
		
		this.nodeGroup.setAttributeNS(null,"class","drawnNode");
		return this.nodeGroup;
	}
	//--------------------------
	activateLogic() {
		this.setMouseEvents();
		this.moveToGrid(); 
	}

	//--------------------------
	//вызов для всех связанных объектов с текущим коннектором удаление связей
	delete() {
		this.relatedObjects.forEach(object => {
			this.removeRelatedObject(object);
		});
	}

	//--------------------------
	setMouseEvents() {
		this.nodeGroup.addEventListener("mousedown",nodeMouseDown,false);
	}
	//--------------------------
	//удаление из списка объекта коннектор, а из списка коннектора - объект
	//если количество связей у коннектора меньше 1, то возвращает значение true
	removeRelatedObject(object) {
		object.connectors.delete(this.id);
		this.relatedObjects.delete(object.id);
		if (this.relatedObjects.size > 0) return false;
		else return true;
	}
	//--------------------------
	//добавление в список объекта коннектора, а в список коннектора - объект
	addRelatedObject(object) {
		object.connectors.set(this.id, this);
		this.relatedObjects.set(object.id, object);
	}
    //--------------------------
    checkConnectorsIntersections() {
    }

	//--------------------------
	checkIntersection(objectToCheck) {
		if(objectToCheck.toBeDeleted || this.toBeDeleted) return false;
		
		if (objectToCheck.type === "connector") {
			if(objectToCheck.id === this.id) return false;
			
			if (this.grid.nx === objectToCheck.grid.nx && this.grid.ny === objectToCheck.grid.ny) {
				objectToCheck.relatedObjects.forEach(object => {
					this.addRelatedObject(object);
				});

				this.objectKeeper.delete(objectToCheck);
				return true;
			}
		}

		if (objectToCheck.type === "line") {
			
			for (let connectorMap of objectToCheck.connectors) {
				if (connectorMap[0] == this.id) return false;
			}
					
			if (objectToCheck.pointOnLineInteger(this.grid)) {
				this.addRelatedObject(objectToCheck);
				return true;
			}
		}
		return false;
    }
}// end of node

function nodeMouseDown() {
	chkDoLine = true;
}