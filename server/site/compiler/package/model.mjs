export default {
	package$: "youni.works/compiler/model",
	/*
		Content is an index-based collection of values. Both JS Strings and Arrays
		are Content values.  This interface is non-mutable however an object of this interface may be.
	 */
	Content: {
		super$: "Object",
		"@iterator": function* iterate() {
			for (let i = 0, len = this.length; i < len; i++) yield this[i];
		},
		length: 0,
		indexOf: function() {
			return Array.prototype.indexOf.apply(this, arguments);
		},
		slice: function() {
			return Array.prototype.slice.apply(this, arguments);
		},
		concat: function() {
			return Array.prototype.concat.apply(this, arguments);
		}		
	},
	Node: {
		super$: "Object",
		type$content: "Content",
		get$textContent: function() {
			if (typeof this.content == "string") return this.content;
			let textContent = "";
			for (let value of this.content) {
				let text = value && value.textContent;
				if (text) textContent += text;
			}
			return textContent;
		},
		accept: function() {
			if (!arguments.length) return 0;
			if (typeof this.content == "string") {
				this.content = [this.content];
			}
			Array.prototype.push.apply(this.content, arguments);
			return arguments.length;
		}
	}
}

//Content: {
//"@iterator": function* iterate() {
//	for (let i = 0, len = this.length; i < len; i++) yield this.at(i);
//},
//get$length: function() {
//	return this._content.length;
//},
//at: function(index) {
//	return this._content[index];
//},
//slice: function() {
//	let content = this._content.slice.apply(this._content, arguments);
//	return this._rule.createNode(content);
//},
//concat: function() {
//	let content = this._content.concat.apply(this._content, arguments);
//	return this._rule.createNode(content);			
//}		
//},
