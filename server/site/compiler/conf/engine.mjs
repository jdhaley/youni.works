export default function engine(window) {
	function at(index) {
		return this[index];
	}
	
	if (!window.Array.prototype.at) window.Array.prototype.at = at;
	if (!window.String.prototype.at) window.String.prototype.at = at;
}