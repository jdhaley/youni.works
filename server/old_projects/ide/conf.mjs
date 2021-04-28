import base from "./base/conf.mjs";

export default {
	package$: "configuration",
	use: {
		base: base,
		type$Frame: "use.base.ui.Frame",
		type$Application: "use.base.app.Application",
	}
}