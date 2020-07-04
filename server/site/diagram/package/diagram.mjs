const EMPTY_ARRAY = Object.freeze([]);

export default {
	package$: "youni.works/diagram/diagram",
	use: {
		package$graphic: "youni.works/web/graphic"
	},
	Text: {
		super$: "use.graphic.Graphic",
		viewName: "http://www.w3.org/2000/svg/foreignObject",
		create: function(gc, model) {
			let object = this.view();
			object.model = model;
			object.text = this.owner.create("http://www.w3.org/1999/xhtml/div");
			object.text.className = "text";
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
				on.text.contentEditable = true;
				on.text.focus();
			},
			FocusOut: function(on, event) {
				delete on.text.contentEditable;
			}
		}
	},
	Node: {
		super$: "use.graphic.Graphic",
		viewName: "http://www.w3.org/2000/svg/rect",
		createModel: function(id, x, y) {
			return this.sys.extend(this.graph.Node, {
				id: id,
				arc: [],
				x: x,
				y: y
			}).size(this.width, this.height);
		},
		create: function(gc, x, y) {
			let id = gc.controller.identify(gc);
			let view = this.view(this.createModel(id, x, y));		
			view.model.view = view;
			view.id = id;
			view.classList.add("node", "selectable", "selected");
			gc.append(view);
			
			view.object = gc.controller.part.text.create(gc, view.model);
			return this.draw(view);									
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
			return view;
		}
	},
	Arc: {
		super$: "use.graphic.Graphic",
		viewName: "http://www.w3.org/2000/svg/path",
		createModel: function(from, to) {
			let index = 0;
			for (let arc of from.arc) if (arc.from == to || arc.to == to) index++;

			let model = this.sys.extend(this.graph.Arc, {
				from: from,
				to: to,
				index: index
			});
			from.arc.push(model);
			to.arc.push(model);
			return model;
		},
		create: function(gc, from, to) {
			let model = this.createModel(from.model, to.model);
			let view = this.view(model);
			view.model.view = view;
			view.setAttribute("fill", "transparent");
			view.classList.add("connector");
			view.setAttribute("data-from", from.id);
			view.setAttribute("data-to", to.id);
			view.setAttribute("marker-end", "url(#marker.arrow)");
			
			gc.append(view);	
			this.draw(view);
			return view;										
		},
		draw: function(view) {
			let m = view.model;
			view.setAttribute("d", `M ${m.fromX} ${m.fromY} L ${m.toX} ${m.toY}`);
		},
		arc_draw: function(view) {
			let m = view.model;
			view.setAttribute("d", 
				`M ${m.from.x} ${m.from.y} `
			+	`C ${m.x} ${m.y}, ${m.x} ${m.y}, ${m.to.x} ${m.to.y}`
			);
		}
	}
}