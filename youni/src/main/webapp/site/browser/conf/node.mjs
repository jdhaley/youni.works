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
		for (let node = this; node.parentNode; node = node.parentNode) {
			let nodes = node.parentNode.childNodes;
			for (let i = 0; i < nodes.length; i++) {
				if (node == nodes[i]) {
					path = i + (path ? "/" : "") + path;
					break;
				}
			}
		}
		return path;
	}
}