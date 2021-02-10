export default {
	package$: "youni.works/shape",
	use: {
		package$base: "youni.works/base",
		package$view: "youni.works/view"
	},
	Connector: {
	},
	Shape: {
		super$: "use.view.Viewer",
		extend$actions: {
			display: function(on, event) {
				on.draggable = true;
			}
		}
	}
}

//Shaper: {
//super$: "Viewer",
//draw: function(view) {
//	view.style.width = view.model.width + view.model.uom;
//	view.style.height = view.model.height + view.model.uom;
//}
//},
