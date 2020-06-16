export default {
	package$: "youni.works/web/graphic",
	use: {
		package$view: "youni.works/web/view"
	},
	Shaper: {
		super$: "use.view.Viewer",
		view: function(model) {
			let view = this.owner.window.document.createElementNS("http://www.w3.org/2000/svg", this.viewName);
			this.control(view, model);
			return view;
		}
	},
	Graphic: {
		super$: "Shaper",
		viewName: "svg"
	}
}