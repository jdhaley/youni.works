export default {
	get$owner: function() {
		return this.ownerDocument.owner;
	},
	once$controller: function() {
		if (this.nodeType == Node.ELEMENT_NODE) return this.owner.controller[this.dataset.view];
	},
	sense: function(sensorType, action) {
		if (this.nodeType == Node.ELEMENT_NODE || this.nodeType == Node.DOCUMENT_NODE) {
			this.owner.sense[sensorType](this, action);
		}
	},
	get$path: function() {
		let path = "";
		let delim = "";
		for (let node = this; node.parentNode; node = node.parentNode) {
			path = node.index + delim + path;
			delim = "/";
		}
		return path;
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