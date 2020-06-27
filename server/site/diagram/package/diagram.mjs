export default {
	package$: "youni.works/diagram/diagram",
	use: {
		package$graphic: "youni.works/web/graphic"
	},
	type$Graphic: "use.graphic.Graphic",
	Node: {
		super$: "Graphic",
		viewName: "rect",
		create: function(gc, x, y) {
			let cell = gc.controller.cellSize;
			let node = this.view();
			node.id = gc.controller.identify();
			node.toArcs = [];
			node.fromArcs = [];
			node.classList.add("node", "selectable", "selected");
			x -= x % cell;
			y -= y % cell;
			node.setAttribute("x", x - this.width / 2);
			node.setAttribute("y", y - this.height / 2);
			node.setAttribute("width", this.width);
			node.setAttribute("height", this.height);
			///
			node.setAttribute("fill", this.fill);
			node.setAttribute("stroke", this.stroke);
			node.setAttribute("stroke-dasharray", this.strokeDasharray);
			this.control(node);
			gc.append(node);
			return node;										
		},
		move: function(node, x, y) {
			let cell = node.parentNode.controller.cellSize;
			x = x - x % cell;
			y = y - y % cell;
			moveNode(node, x, y);
			for (let arc of node.toArcs) moveArc(arc);
			for (let arc of node.fromArcs) moveArc(arc);
		}
	},
	Arc: {
		super$: "Graphic",
		viewName: "line",
		create: function(gc, from, to) {
			let arc = this.view();
			arc.setAttribute("data-from", from.id);
			arc.setAttribute("data-to", to.id);
			arc.fromNode = from;
			arc.toNode = to;
			from.toArcs.push(arc);
			to.fromArcs.push(arc);
			arc.classList.add("connector");
			arc.setAttribute("x1", from.getAttribute("x") * 1 + from.getAttribute("width") / 2);
			arc.setAttribute("y1", from.getAttribute("y") * 1 + from.getAttribute("height") / 2);
			arc.setAttribute("x2", to.getAttribute("x") * 1 + to.getAttribute("width") / 2);
			arc.setAttribute("y2", to.getAttribute("y") * 1 + to.getAttribute("height") / 2);
			arc.setAttribute("stroke", this.stroke);
			arc.setAttribute("stroke-dasharray", this.strokeDasharray);

			this.control(arc);
			gc.prepend(arc); //Prepend so that Nodes are drawn over them.

			return arc;										
		}
	}
}

//View: {
//super$: null,
//once$control: function(){
//	return this.documentOwner.owner.control(this);
//}
//},
//Control: {
//super$: "use.control.Control",
//get$of: function() {
//	return this.view.parentNode && this.view.parentNode.control;
//},
//get$owner: function() {
//	return this.view.ownerDocument.owner;
//},
//type$view: "View",
//"@iterator": function* iterate() {
//	let length = this.view.children.length;
//	for (let i = 0; i < length; i++) yield this.view.children[i].control;
//}
//},
//Part: {
//type: "",
//value: undefined,
///*
//Value Views: HTML (RAW, DOC-NOTE, DOC-GRID), IMG (SVG & PNG), PLAYABLE (VIDEO, AUDIO, GIF, Animated)
//*/
//view: null,
//receive: function(message) {
//},
//createView: function(gc) {
//	this.view = gc.documentOwner.createElementNS("http://www.w3.org/2000/svg", this.viewName);
//	this.view.control = this;
//}
//},
//Node: {
//super$: "Part",
//x: 0,
//y: 0,
////z: 0,
//w: 0,
//h: 0,
////d: 0,
//to: null, //Iterable of Arcs.
//from: null, //Iterable Arcs.
function moveNode(node, x, y) {
	x = x - node.getAttribute("width") / 2;
	y = y - node.getAttribute("height") / 2;
	node.setAttribute("x", x);
	node.setAttribute("y", y);		
}

function moveArc(arc) {
	let node = arc.fromNode;
	let x = node.getAttribute("x") / 1 + node.getAttribute("width") / 2;
	let y = node.getAttribute("y") / 1 + node.getAttribute("height") / 2;
	arc.setAttribute("x1", x);
	arc.setAttribute("y1", y);
	
	node = arc.toNode;
	x = node.getAttribute("x") / 1 + node.getAttribute("width") / 2;
	y = node.getAttribute("y") / 1 + node.getAttribute("height") / 2;
	arc.setAttribute("x2", x);
	arc.setAttribute("y2", y);
}
function move(x, y) {
	this.x = x;
	this.y = y;
	this.view.setAttribute("x", x - this.width / 2);
	this.view.setAttribute("y", y - this.height / 2);
	if (this.to) for (let arc of this.to) {
		//Move either the connector line or the shape itself.
		if (arc.type == "part") {
			this.to.view.setAttribute("x", x + this.to.x);
			this.to.view.setAttribute("y", y + this.to.y);
		} else {
			arc.view.setAttribute("x1", this.x);
			arc.view.setAttribute("y1", this.y);
		}
	}
	if (this.from) for (let arc of this.from) {
		if (arc.type != "part") {
			arc.view.setAttribute("x2", this.x);
			arc.view.setAttribute("y2", this.y);
		}
	}
}