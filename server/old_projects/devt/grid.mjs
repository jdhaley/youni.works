export default {
	package$: "youni.works/web/grid",
	use: {
		package$control: "youni.works/base/control",
		package$view: "youni.works/web/view"
	},
	Model: {
		super$: "Object",
		type$views: "use.control.List",
		modify: function(index, value) {
			let prior = this.value[name];
			this.value[index] = value;
			let message = this.sys.extend({
				action: "modelChange",
				index: index,
				from: value
			});
			for (let view of this.views) view.receive(message);
			this.value
		},
		action: {
		}
	}
	Cell: {
		super$: "use.view.Viewer",
	},
	Property: {
		super$: "Cell",
		viewName: "div",
		viewType: "composite",
		part: {
			type$caption: "Cell",
			type$value: "Cell"
		},
//		markupCaption: function(view) {
//			return `<div class=caption>${this.caption}</div>`;
//		},
//		markupValue: function(view) {
//			return `<div data-name=${this.name} class=value>${view.model}</div>`;
//		}
	},
	Caption: {
		super$: "Cell",
		title: "",
		draw: function(view) {
			view.innerHTML = this.title;			
		}
	},
	Properties: {
		super$: "Property",
		viewName: "section",
	},
	Node: {
		super$: "use.graphic.Graphic",
		viewName: "rect",
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
		viewName: "path",
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