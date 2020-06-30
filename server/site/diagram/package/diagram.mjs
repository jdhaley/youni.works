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
		createModel: function(id) {
			return this.sys.extend(this.graph.Node, {
				id: id,
				arc: [],
				width: this.width,
				height: this.height,
				x: 0,
				y: 0
			});
		},
		create: function(gc, x, y) {
			let id = gc.controller.identify(gc);
			let view = this.view(this.createModel(id));		
			view.model.view = view;
			view.id = id;
			view.classList.add("node", "selectable", "selected");
			gc.append(view);
			
			view.object = gc.controller.part.text.create(gc, view.model);

			this.move(view, x, y);
			return view;										
		},
		move: function(view, x, y) {
			view.model.x = x;
			view.model.y = y;
			this.draw(view);
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
		}
	}
}