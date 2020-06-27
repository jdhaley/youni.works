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
		move: function(group, x, y) {
			let gc = group.parentNode.controller;
			let cell = gc.cellSize;
			x = x - x % cell;
			y = y - y % cell;
			x = x - group.getAttribute("width") / 2;
			y = y - group.getAttribute("height") / 2;
			console.log(x, y);
			group.setAttribute("x", x);
			group.setAttribute("y", y);		
		}
	},
	Arc: {
		super$: "Graphic",
		viewName: "line",
		create: function(gc, from, to) {
			let arc = this.view();
			arc.classList.add("arc");

			arc.connector = true;
			arc.setAttribute("x1", from.getAttribute("x") * 1 + from.getAttribute("width") / 2);
			arc.setAttribute("y1", from.getAttribute("y") * 1 + from.getAttribute("height") / 2);
			arc.setAttribute("x2", to.getAttribute("x") * 1 + to.getAttribute("width") / 2);
			arc.setAttribute("y2", to.getAttribute("y") * 1 + to.getAttribute("height") / 2);
			arc.setAttribute("stroke", this.stroke);
			arc.setAttribute("stroke-dasharray", this.strokeDasharray);

			this.control(arc);
			gc.prepend(arc); //Prepend so that Nodes are drawn over them.

			return arc;										
		},
		arc: function(arc, x, y) {
			arc.setAttribute("x2", x);
			arc.setAttribute("y2", y);
			return arc;										
		}			
	}
}