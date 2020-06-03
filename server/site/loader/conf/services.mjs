export default {
	package$: "youni.works/compiler/service",
	use: {
		package$platform: "youni.works/web/platform"
	},
	public: {
		open: {
			type$: "use.platform.Remote",
			url: "/file?compiler/package/",
			method: "GET"
		},
		save: {
			type$: "use.platform.Remote",
			url: "/file?compiler/package/",
			method: "PUT"
		}
	}
}