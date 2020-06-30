const EMPTY_ARRAY = Object.freeze([]);

export default {
	package$: "youni.works/diagram/diagram",
	use: {
		package$graphic: "youni.works/web/graphic"
	},
	Text: {
		super$: "use.graphic.Graphic",
		viewName: "foreignObject",
		create: function(gc, model) {
			let object = this.view();
			object.model = model;
			object.text = gc.ownerDocument.createElementNS("http://www.w3.org/1999/xhtml", "input");
			object.text.className = "text";
			object.text.disabled = true;
			object.append(object.text);
			object.text.title = "Click to edit text";
			gc.append(object);
			return object;
		},
		draw: function(view) {
			let m = view.model;
			view.setAttribute("width", m.width);
			view.setAttribute("height", m.height - 20);
			view.setAttribute("x", m.x - m.width / 2);
			view.setAttribute("y", m.y - m.height / 2);
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
		super$: "use.graphic.Graphic",
		viewName: "rect",
		move: function(node, x, y) {
			node.model.x = x;
			node.model.y = y;
			this.draw(node);
		},
		draw: function(view) {
			let m = view.model;
			view.setAttribute("width", m.width);
			view.setAttribute("height", m.height);
			view.setAttribute("x", m.x - m.width / 2);
			view.setAttribute("y", m.y - m.height / 2);
			if (view.object) {
				view.object.controller.draw(view.object);
			}
			for (let arc of m.arc) arc.view.controller.draw(arc.view);
		},
		create: function(gc, x, y) {
			let node = this.sys.extend(this.graph.Node, {
				id: gc.controller.identify(gc),
				x: x,
				y: y,
				width: this.width,
				height: this.height,
				arc: []
			});
			
			let view = this.view();			
			view.model = node;
			view.id = node.id;
			view.classList.add("node", "selectable", "selected");
			gc.append(view);
			view.object = gc.controller.part.text.create(gc, node);

			node.view = view;
			this.draw(view);
			return view;										
		}
	},
	Arc: {
		super$: "use.graphic.Graphic",
		viewName: "path",
		create: function(gc, from, to) {
			let arc = this.view();
			arc.model = this.sys.extend(this.graph.Arc, {
				from: from.model,
				to: to.model,
				view: arc
			});

			arc.setAttribute("fill", "transparent");
			arc.classList.add("connector");
			arc.setAttribute("data-from", from.id);
			arc.setAttribute("data-to", to.id);
			from.model.arc.push(arc.model);
			to.model.arc.push(arc.model);
			gc.prepend(arc); //Prepend so that Nodes are drawn on top of Arcs.			
			this.draw(arc);
			return arc;										
		},
		draw: function(arc) {
			let cX = arc.model.x; // + arc.count * 10 * (arc.count % 2 ? 1 : -1);
			let cY = arc.model.y; // + arc.count * 10;
			// M ${toX} ${fromY} L ${fromX} ${toY}
			let path = `M ${arc.model.from.x} ${arc.model.from.y} C ${cX} ${cY}, ${cX} ${cY}, ${arc.model.to.x} ${arc.model.to.y}`;

			arc.setAttribute("d", path);
		},
		xxxxxxxxxxxxdraw: function(arc) {
			let from
			/* <path d="M 10 10 C 20 20, 40 20, 50 10" stroke="black" fill="transparent"/> */
			let fromX = arc.fromNode.getAttribute("x") * 1 + arc.fromNode.getAttribute("width") / 2;
			let fromY = arc.fromNode.getAttribute("y") * 1 + arc.fromNode.getAttribute("height") / 2;
			let toX = arc.toNode.getAttribute("x") * 1 + arc.toNode.getAttribute("width") / 2;
			let toY = arc.toNode.getAttribute("y") * 1 + arc.toNode.getAttribute("height") / 2;
			let cx;
			let cX = fromX < toX 
				? (toX - fromX) / 2 + fromX 
				: (fromX - toX) / 2 + toX /*+ arc.count * 10 */;
			let cY = fromY < toY 
				? (toY - fromY) / 2 + fromY
				: (fromY - toY) / 2 + toY /*+  arc.count * 10 */;
			
			cX += arc.count * 10 * (arc.count % 2 ? 1 : -1);
			cY += arc.count * 10;
			console.log(`(${fromX}, ${fromY}) - (${toX}, ${toY}): (${cX}, ${cY})`);
			let path = `M ${fromX} ${fromY} C ${cX} ${cY}, ${cX} ${cY}, ${toX} ${toY} M ${toX} ${fromY} L ${fromX} ${toY}`;

			arc.setAttribute("d", path);
		},
		topbottomdraw: function(arc) {
			let fromY = arc.fromNode.getAttribute("y");
			let toY = arc.toNode.getAttribute("y");
			
			if (fromY < toY) fromY += arc.fromNode.getAttribute("height") * 1;
			if (toY < fromY) toY += arc.fromNode.getAttribute("height") * 1;
			let fromX = arc.fromNode.getAttribute("x") * 1 + arc.fromNode.getAttribute("width") / 2;
			let toX = arc.toNode.getAttribute("x") * 1 + arc.toNode.getAttribute("width") / 2;
		
			let count = 0;
			for (let existing of arc.fromNode.arc) {
				if (existing.toNode == arc.toNode || existing.fromNode == arc.toNode) count++;
			}

			let length = arc.fromNode.getAttribute("width") * 1;
			if (length > arc.toNode.getAttribute("width") * 1) length = arc.toNode.getAttribute("width") * 1;

			let seg = length / ++count * arc.count * (arc.count % 2 ? -1 : 1);
			fromX += seg;
			toX += seg;
			let path = `M ${fromX} ${fromY} L ${toX} ${toY} M ${toX} ${fromY} L ${fromX} ${toY}`;
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
