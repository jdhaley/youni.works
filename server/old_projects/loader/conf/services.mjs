export default {
	package$: "youni.works/compiler/service",
	use: {
		package$client: "youni.works/web/client"
	},
	public: {
		fs: {
			type$: "use.client.FileService",
			url: "/file?compiler/package/"
		}
	}
}