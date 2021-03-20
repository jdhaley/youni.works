export default {
	Viewer: {
		conf: null,
		construct: function(container) {
			return (container, value, conf) => this.owner.append(container, this.viewName);
		},
		createView: function(container, conf, data, index) {
			let constr = this.forType(data, conf);
			let view = constr.call(this, container, data, conf);
			view.conf = conf;
			this.owner.control(view, this);
			this.draw(view, data, index);
			this.control(view);
			return view;
		},
		createView: function(container, data) {
			const view = this.construct(container, data);
			this.draw(view, data);
			return view;
		},
		draw: function(view, data) {
		}
	},
	Container: {
		super$: "Viewer"
	}
}