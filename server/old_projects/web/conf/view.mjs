export default {
	get$owner: function() {
		return this.ownerDocument.owner;
	},
	once$controller: function() {
		this.controller = null;
		this.owner.control(this);
		return this.controller;
	},
	get$partOf: function() {
		return this.parentNode;
	},
	get$part: function() {
		return this.childNodes;
	},
	receive: function(message) {
		this.controller && this.controller.process(this, message);
	},
	sense: function(sensorType, action) {
		if (this.nodeType == Node.ELEMENT_NODE || this.nodeType == Node.DOCUMENT_NODE) {
			this.owner.sensor[sensorType](this, action);
		}
	}
}