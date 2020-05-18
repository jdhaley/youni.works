export default {
	package$: "youni.works/noted/service",
	package$client: "youni.works/client",
	public: {
		get: {
			type$: "client.Service",
			url: "/youni/file",
			method: "GET"
		},
		save: {
			type$: "client.Service",
			url: "/youni/file",
			method: "POST"			
		}
	}
}