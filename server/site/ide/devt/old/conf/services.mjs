export default {
	package$: "youni.works/noted/service",
	use: {
		package$client: "youni.works/web/client"
	},	
	public: {
		fs: {
			type$: "use.client.FileService",
			url: "/file"
		}
	}
}