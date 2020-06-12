export default {
	package$: "youni.works/diagram/service",
	use: {
		package$client: "youni.works/web/client"
	},
	public: {
		open: {
			type$: "use.client.Remote",
			url: "/file",
			method: "GET"
		},
		save: {
			type$: "use.client.Remote",
			url: "/file",
			method: "PUT"
		}
	}
}