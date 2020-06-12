export default {
	package$: "youni.works/noted/service",
	use: {
		package$platform: "youni.works/web/view"
	},
	public: {
		open: {
			type$: "use.platform.Remote",
			url: "/file",
			method: "GET"
		},
		save: {
			type$: "use.platform.Remote",
			url: "/file",
			method: "PUT"
		}
	}
}