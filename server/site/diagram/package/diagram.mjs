export default {
	package$: "youni.works/diagram/diagram",
	use: {
		package$graphic: "youni.works/web/graphic"
	},
	Text: {
		super$: "use.graphic.Box",
		viewName: "foreignObject",
		create: function(gc, x, y) {
			let object = this.super("create", x, y);
			object.text = gc.ownerDocument.createElementNS("http://www.w3.org/1999/xhtml", "input");
			object.text.className = "text";
			object.text.disabled = true;
			object.append(object.text);
			object.text.title = "Click to add text";
			gc.append(object);
			return object;
		},
		extend$action: {
			Click: function(on, event) {
				on.text.disabled = undefined;
				on.text.focus();
			},
			FocusOut: function(on, event) {
				on.text.disabled = true;
			}
		}
	},
	Node: {
		super$: "use.graphic.Box",
		viewName: "rect",
		create: function(gc, x, y) {
			let node = this.super("create", x, y);
			gc.append(node);
			node.id = gc.controller.identify(gc);
			
			node.object = gc.controller.part.text.create(gc, x, y);
			node.object.node = node;
			node.object.controller.size(node.object, this.width * 1 - 20, this.height * 1 - 20);
			node.object.text.textContent = "Test";

			node.toArcs = [];
			node.fromArcs = [];
		
			node.classList.add("node", "selectable", "selected");
			node.setAttribute("width", this.width);
			node.setAttribute("height", this.height);
			this.move(node, x, y);
			return node;										
		},
		move: function(node, x, y) {
			this.super("move", node, x, y);
			if (node.object) node.object.controller.move(node.object, x, y);
			if (node.toArcs) for (let arc of node.toArcs) arc.controller.draw(arc);
			if (node.fromArcs) for (let arc of node.fromArcs) arc.controller.draw(arc);
		}
	},
	Arc: {
		super$: "use.graphic.Graphic",
		viewName: "path",
		create: function(gc, from, to) {
			let arc = this.view();
			arc.setAttribute("fill", "transparent");
			arc.classList.add("connector");
			arc.setAttribute("data-from", from.id);
			arc.setAttribute("data-to", to.id);
			arc.count = 0;
			arc.fromNode = from;
			arc.toNode = to;
			for (let existing of from.toArcs) if (existing.toNode == to) {
				arc.count++;
				console.log("additional arc", arc.count);
			}
			from.toArcs.push(arc);
			to.fromArcs.push(arc);
			gc.prepend(arc); //Prepend so that Nodes are drawn on top of Arcs.			
			this.draw(arc);
			return arc;										
		},
		draw: function(arc) {
			let from
			/* <path d="M 10 10 C 20 20, 40 20, 50 10" stroke="black" fill="transparent"/> */
			let fromX = arc.fromNode.getAttribute("x") * 1 + arc.fromNode.getAttribute("width") / 2;
			let fromY = arc.fromNode.getAttribute("y") * 1 + arc.fromNode.getAttribute("height") / 2;
			let toX = arc.toNode.getAttribute("x") * 1 + arc.toNode.getAttribute("width") / 2;
			let toY = arc.toNode.getAttribute("y") * 1 + arc.toNode.getAttribute("height") / 2;
			let path = `\
				M ${fromX} ${fromY}\
				C ${fromX + arc.count * 100} ${fromY + arc.count * 100}\
				, ${toX + arc.count * 100} ${toX + arc.count * 100}\
				, ${toX} ${toY}\
			`
			arc.setAttribute("d", path);
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
