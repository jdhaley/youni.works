export default {
	package$: "youni.works/noted/service",
	package$platform: "youni.works/platform",
	public: {
		get: {
			type$: "platform.Remote",
			url: "/youni/file?nexus/package/",
			method: "GET"
		},
		save: {
			type$: "platform.Remote",
			url: "/youni/file?nexus/package/",
			method: "POST"			
		}
	}
}