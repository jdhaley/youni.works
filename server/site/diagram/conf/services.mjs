export default {
	package$: "youni.works/diagram/service",
	use: {
		package$web: "youni.works/web/control"
	},
	public: {
		open: {
			type$: "use.web.Remote",
			url: "/file",
			method: "GET"
		},
		save: {
			type$: "use.web.Remote",
			url: "/file",
			method: "PUT"
		}
	}
}