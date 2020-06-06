export default {
	once$control: function() {
		return this.ownerDocument.owner.control(this);
	}		
}