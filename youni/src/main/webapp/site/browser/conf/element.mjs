export default {
	get$owner: function() {
		return this.ownerDocument.owner;
	},
	once$controller: function() {
		return this.owner.controller[this.dataset.view];
	},
	sense: function(sensorType, action) {
		this.owner.sense[sensorType](this, action);
	}
}