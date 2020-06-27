export default {
	package$: "youni.works/diagram/diagram",
	use: {
		package$graphic: "youni.works/web/graphic"
	},
	type$Graphic: "use.graphic.Graphic",
	Text: {
		super$: "Graphic",
		viewName: "foreignObject",
		create: function(gc, x, y) {
			
		}
	},
	Node: {
		super$: "Graphic",
		viewName: "rect",
		create: function(gc, x, y) {
			let node = this.view();
			gc.append(node);
			node.id = gc.controller.identify();
			node.toArcs = [];
			node.fromArcs = [];
		
			node.classList.add("node", "selectable", "selected");
			node.setAttribute("width", this.width);
			node.setAttribute("height", this.height);
			this.move(node, x, y);
			
			this.control(node);
			return node;										
		},
		move: function(node, x, y) {
			let cell = node.parentNode.controller.cellSize;
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
			arc.classList.add("connector");
			arc.setAttribute("data-from", from.id);
			arc.setAttribute("data-to", to.id);
			arc.fromNode = from;
			arc.toNode = to;
			from.toArcs.push(arc);
			to.fromArcs.push(arc);
			arc.setAttribute("x1", from.getAttribute("x") * 1 + from.getAttribute("width") / 2);
			arc.setAttribute("y1", from.getAttribute("y") * 1 + from.getAttribute("height") / 2);
			arc.setAttribute("x2", to.getAttribute("x") * 1 + to.getAttribute("width") / 2);
			arc.setAttribute("y2", to.getAttribute("y") * 1 + to.getAttribute("height") / 2);

			this.control(arc);
			gc.prepend(arc); //Prepend so that Nodes are drawn on top of Arcs.

			return arc;										
		}
	}
}
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
