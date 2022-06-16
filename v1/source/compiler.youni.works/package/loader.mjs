const pkg = {
	type$: "/system/core",
	Loader: {
		type$: "Instance",
		fs: null,
		status(pathname) {
			return this.fs.statSync(pathname);
		},
		entries(pathname) {
			return this.fs.readdirSync(pathname)
		},
		async load(path, name) {
			path += "/" + name;
			try {
				let stats = this.status(path);
				let node;
				if (stats.isDirectory()) {
					node = await this.loadFolder(path, name, stats);
				} else if (stats.isFile()) {
					node = await this.loadFile(path, name, stats);
				}
				return node;	
			} catch (e) {
				return this.newNode("error", name, e);
			}
		},
		async loadFolder(pathname, name, stats) {
			let folder = this.newNode("folder", name, stats);
			folder.mediaType = "folder";
			folder.content = Object.create(null);
			for (let name of this.entries(pathname)) {
				if (!name.startsWith(".")) {
					folder.content[name] = await this.load(pathname, name);
				}
			}
			return folder;
		},
		async loadFile(pathname, name, stats) {
			let mediaType = this.getMediaType(pathname) || "file";

			let file = this.newNode("file", name, stats);
			if (mediaType) {
				file.mediaType = mediaType;
				let loader = this.contentLoaders[mediaType](pathname);
				file.content = await loader();
			}
			return file;
		},
		getMediaType(pathname) {
			let name = pathname.substring(pathname.lastIndexOf("/") + 1);
			let index = name.lastIndexOf(".") + 1;
			if (index) {
				let ext = name.substring(index);
				return this.fileTypes[ext];
			}
		},
		newNode(type, name, data) {
			let node = {
				type: type,
				name: name,
			}
			if (type == "error") {
				node.error = {
					message: data.message,
					code: data.code
				}
			} else {
				node.stats = {
					created: data.birthtimeMs,
					modified: data.mtimeMs,
					size: data.size	
				}
			}
			return node;
		},
		fileTypes: {
			"mjs": "text/javascript"
		},
		contentLoaders: {
			"text/javascript": function(pathname) {
				return async function importJs() {
					let content = await import(pathname);
					return content.default;
				}
			}
		}
	}
}
export default pkg;