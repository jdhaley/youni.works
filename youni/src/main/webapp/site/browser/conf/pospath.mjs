virtual$position: function() {
	let pos;
	if (arguments.length) {
		pos = arguments[0];
		let doc = this.commonAncestorContainer.ownerDocument;
		let range = advance(doc.getElementById(pos.start), pos.startCount);
		this.setStart(range.endContainer, range.endOffset);
		range = advance(doc.getElementById(pos.end), pos.endCount);
		this.setEnd(range.endContainer, range.endOffset);
		return;
	}

	pos = this.owner.sys.extend();
	let range = this.cloneRange();
	
	let node = getElement(this.startContainer);
	node.id = node.nodeId;
	range.selectNodeContents(node);
	range.setEnd(this.startContainer, this.startOffset);
	pos.start = node.id;
	pos.prefix = range.markup;

	node = getElement(this.endContainer);
	node.id = node.nodeId;
	range.selectNodeContents(node);
	range.setStart(this.endContainer, this.endOffset);
	pos.end = node.id;
	pos.suffix = range.markup;
	return pos;
	
},

function getElement(container) {
	while (container.nodeType != Node.ELEMENT_NODE) container = container.parentNode;
	return container;
}
function advance(node, count) {
	let range = node.ownerDocument.createRange();
	range.selectNodeContents(node);
	range.forEach(node => {
		if (node.nodeType == Node.TEXT_NODE) {
			if (node.textContent.length >= count) {
				range.setStart(node, count);
				range.collapse(true);
				return true;
			} else {
				count -= node.textContent.length;
			}
		}
	});
	if (!range.collapsed) range.collapse(true);
	return range;
}

////////////////////////////////
	
	pos = this.owner.sys.extend();
	let range = this.cloneRange();
	
	let node = getElement(this.startContainer);
	node.id = node.nodeId;
	range.selectNodeContents(node);
	range.setEnd(this.startContainer, this.startOffset);
	pos.start = node.id;
	pos.prefix = range.markup;

	node = getElement(this.endContainer);
	node.id = node.nodeId;
	range.selectNodeContents(node);
	range.setStart(this.endContainer, this.endOffset);
	pos.end = node.id;
	pos.suffix = range.markup;
	return pos;
	
},

function getElement(container) {
	while (container.nodeType != Node.ELEMENT_NODE) container = container.parentNode;
	return container;
}
function advance(node, count) {
	let range = node.ownerDocument.createRange();
	range.selectNodeContents(node);
	range.forEach(node => {
		if (node.nodeType == Node.TEXT_NODE) {
			if (node.textContent.length >= count) {
				range.setStart(node, count);
				range.collapse(true);
				return true;
			} else {
				count -= node.textContent.length;
			}
		}
	});
	if (!range.collapsed) range.collapse(true);
	return range;
}
