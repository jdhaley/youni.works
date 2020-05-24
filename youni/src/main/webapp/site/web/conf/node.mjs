let LAST_NODE_ID = 0;

export default {
	once$nodeId: function() {
		return ++LAST_NODE_ID;
	},
	get$owner: function() {
		return this.ownerDocument.owner;
	},
	once$controller: function() {
		if (this.nodeType == Node.ELEMENT_NODE) return this.owner.viewer[this.dataset.view];
	},
	receive: function(message) {
		this.controller && this.controller.process(this, message);
	},
	sense: function(sensorType, action) {
		if (this.nodeType == Node.ELEMENT_NODE || this.nodeType == Node.DOCUMENT_NODE) {
			this.owner.controller.sense[sensorType](this, action);
		}
	},
	getPath: function(ancestor) {
		if (!arguments.length) ancestor = this.ownerDocument;
		let path = "";
		let delim = "";
		for (let node = this; node; node = node.parentNode) {
			if (node == ancestor) return path;
			path = node.index + delim + path;
			delim = "/";
		}
	},
	getChild: function(path) {
		path = path.split("/");
		let node = this;
		for (let i = 0 ; i < path.length; i++) {
			node = node.childNodes[1 * path[i]];
			if (!node) throw new Error("Invalid Path.");
		}
		return node;
	},
	get$index: function() {
		if (this.parentNode) {
			let nodes = this.parentNode.childNodes;
			for (let i = 0; i < nodes.length; i++) {
				if (this == nodes[i]) return i;
			}
		}
	}
}