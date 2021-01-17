//import base from "./grid-copy/conf.mjs";
//import stamp from "./package/stamp.mjs";
import view from "./package/view.mjs";

export default {
	package$: "configuration",
	use: {
		//base: base,
	//	stamp: stamp,
		view: view,
		//type$Frame: "use.base.ui.Frame",
		//type$Application: "use.base.app.Application",
		//type$Album: "use.stamp.Album"
	},
	context: {
		type$: "use.view.Context",
		type$conf: "",
		controllers: {
			type$album: "use.view.Viewer"
		}
	},
	set: {
		type$: "use.view.Viewer"
	}
}