export default {
	package$: "youni.works/diagram/diagram",
	use: {
		package$graphic: "youni.works/web/graphic"
	},
	/*
  <foreignObject x="20" y="20" width="160" height="160">
    <!--
      In the context of SVG embedded in an HTML document, the XHTML 
      namespace could be omitted, but it is mandatory in the 
      context of an SVG document
    -->
    <div xmlns="http://www.w3.org/1999/xhtml">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      Sed mollis mollis mi ut ultricies. Nullam magna ipsum,
      porta vel dui convallis, rutrum imperdiet eros. Aliquam
      erat volutpat.
    </div>
  </foreignObject>

	 */
	Text: {
		super$: "use.graphic.Box",
		viewName: "foreignObject",
		create: function(gc, x, y) {
			let object = this.super("create", x, y);
			object.text = gc.ownerDocument.createElementNS("http://www.w3.org/1999/xhtml", "input");
			object.text.className = "text";
			object.text.disabled = true;
			object.append(object.text);
			object.text.value = "Test";
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
			if (node.toArcs) for (let arc of node.toArcs) moveArc(arc);
			if (node.fromArcs) for (let arc of node.fromArcs) moveArc(arc);
		}
	},
	Arc: {
		super$: "use.graphic.Graphic",
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
