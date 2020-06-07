export default {
	once$control: function() {
		this.control = null;
		this.ownerDocument.owner.control(this);
		return this.control;
	}
}