const STEP = {
	forward: function(node) {
		if (node.firstChild) return node.firstChild;
		if (node.nextSibling) return node.nextSibling;
		for (node = node.parentNode; node; node = node.parentNode) {
			if (node.nextSibling) return node.nextSibling;
		}
	},
	backward: function(fn, node, end) {
		if (node.lastChild) return node.lastChild;
		if (node.previousSibling) return node.previousSibling;
		for (node = node.parentNode; node; node = node.parentNode) {
			if (node.previousSibling) return node.previousSibling;
		}
	}
}

export default {
	get$owner: function() {
		return this.commonAncestorContainer.ownerDocument.owner;
	},
	get$container: function() {
		let node = this.commonAncestorContainer;
		while (node && node.nodeType != Node.ELEMENT_NODE) node = node.parentNode;
		return node;
	},
	get$markupContent: function() {
		let markup = "";
		this.cloneContents().childNodes.forEach(node => {
			markup += (node.outerHTML || node.textContent);
		});
		return markup;
	},
	get$textContent: function() {
		let text = "";
		this.cloneContents().childNodes.forEach(node => {
			text += node.textContent;
		});
		return text;
	},
	get$before: function() {
		let container = this.commonAncestorContainer;
		let range = container.ownerDocument.createRange();
		range.selectNodeContents(container);
		range.setEnd(this.startContainer, this.startOffset);
		return range;
	},
	get$after: function() {
		let container = this.commonAncestorContainer;
		let range = container.ownerDocument.createRange();
		range.selectNodeContents(container);
		range.setStart(this.endContainer, this.endOffset);
		return range;
	},
	forEach: function(fn, direction) {
		let step = STEP[direction || "forward"];
		if (!step) throw new Error("forEach: Direction '" + direction + "' not defined.");
		
		let start = this.startContainer;
		if (start.nodeType == Node.ELEMENT_NODE) start = start.childNodes.item(this.startOffset);
		let end = this.endContainer;
		if (end.nodeType == Node.ELEMENT_NODE) end = end.childNodes.item(this.endOffset);
		
		for (let node = start; node; node = step(node)) {
			let result = fn(node);
			if (result) return result;
			if (end && end == node) return;			
		}
	},
	virtual$position: function() {
		let container = this.container;
		if (arguments.length) {
			let pos = arguments[0];
			container = container.ownerDocument.getElementById(pos.container);
			this.setStart(container.getChild(pos.startPath), pos.startOffset);
			this.setEnd(container.getChild(pos.endPath), pos.endOffset);
			return;
		}
		container.id = container.nodeId;
		return this.owner.sys.extend(null, {
			container: container.id,
			startPath: this.startContainer.getPath(container),
			startOffset: this.startOffset,
			endPath: this.endContainer.getPath(container),
			endOffset: this.endOffset
		});
	}
}