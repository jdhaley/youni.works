const observers = Symbol("observers");

export default {
	package$: "youni.works/base/item",
	use: {
		package$control: "youni.works/base/control"
	},
	Window: {
		super$: "use.control.Item",
		viewName: ".window",
		
	}
}
