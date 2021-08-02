export default {
	Member: {
        // declaredBy: object,
        facet: "",
        name: "",
        type: "",
        expr: null,
        configurable: true,
        enumerable: true
    },
	FileNode: {
		name: "",
		created: 0,
		modified: 0,
		size: 0,
		contentType: "",
		var$content: undefined,
		once$to() {
			if (typeof this.content == "object") {
				return this[Symbol.for("owner")].create({
					symbol$iterator: function*() {
						for (let name in this.content) {
							return this.content[name];
						}
					}
				});
			}
		},
		loadContent() {
		},
		extend$actions: {
			contentLoaded(event) {
				this.content = event.content;
			}
		}
	}
}