export default {
	package$: "youni.works/compiler/service",
	use: {
		package$client: "youni.works/web/client"
	},
	public: {
		open: {
			type$: "use.client.Remote",
			url: "/file?compiler/package/",
			method: "GET"
		},
		save: {
			type$: "use.client.Remote",
			url: "/file?compiler/package/",
			method: "PUT"
		}
	}
}