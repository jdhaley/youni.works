import base from "./grid-copy/conf.mjs";
import stamp from "./package/stamp.mjs";

export default {
	package$: "configuration",
	use: {
		base: base,
		stamp: stamp,
		type$Frame: "use.base.ui.Frame",
		type$Application: "use.base.app.Application",
		type$Album: "use.stamp.Album"
	}
}