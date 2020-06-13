export default {
	package$: "youni.works/noted/service",
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