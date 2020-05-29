export default {
	package$: "youni.works/noted/service",
	use: {
		package$platform: "youni.works/web/platform"
	},
	public: {
		get: {
			type$: "use.platform.Remote",
			url: "/file",
			method: "GET"
		},
		save: {
			type$: "use.platform.Remote",
			url: "/file",
			method: "POST"			
		}
	}
}