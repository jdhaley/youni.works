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
	get$control: function() {
		for (let node = this.commonAncestorContainer; node; node = node.parentNode) {
			if (node.controller) return node;
		}
		console.debug("Range outside of Control scope.");
	},
	get$isText: function() {
		return this.commonAncestorContainer.nodeType == Node.TEXT_NODE;
	},
	get$content: function() {
		return this.cloneContents().childNodes;
	},
	get$text: function() {
		let text = "";
		this.content.forEach(node => {
			let textContent = node.textContent;
			let space = text && !text.endsWith(" ") && !textContent.startsWith(" ") ;
			if (space) text += space;
			text += textContent;
		});
		return text;
	},
	get$markup: function() {
		let markup = "";
		this.content.forEach(node => {
			markup += (node.outerHTML || node.textContent);
		});
		return markup;
	},
	get$textContent: function() {
		let text = "";
		this.content.forEach(node => {
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
	get$textCount: function() {
		let count = 0;
		this.forEach(node => count += (node.nodeType == Node.TEXT_NODE ? node.textContent.length : 0));
		if (this.startContainer.nodeType == Node.TEXT_NODE) count -= this.startOffset;
		if (this.endContainer.nodeType == Node.TEXT) count -= this.endContainer.textContent.length - this.endOffset;
		return count;
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
	replace: replace,
	insert: function(markup) {
		let frag = this.owner.createView();
		let nodes = this.owner.createView("div");
		nodes.innerHTML = markup;
		nodes = nodes.childNodes;
		for (let i = 0; i < nodes.length; i++) frag.append(nodes[i]);
		this.insertNode(frag);
	}
}
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
function replace(markup) {
	let startText = 0;
	if (this.startContainer.nodeType == Node.TEXT_NODE) {
		startText = this.startOffset
		markup = this.startContainer.textContent.substring(0, startText) + markup;
		this.setStartBefore(this.startContainer);
		if (this.startContainer.nodeType != Node.ELEMENT_NODE) throw new Error("Replace Error");
	}
	let endText = 0;
	if (this.endContainer.nodeType == Node.TEXT_NODE) {
		endText = this.endContainer.textContent.length - this.endOffset;
		markup += this.endContainer.textContent.substring(this.endOffset);
		this.setEndAfter(this.endContainer);
		if (this.endContainer.nodeType != Node.ELEMENT_NODE) throw new Error("Replace Error");
	}
	let save = this.cloneRange();
	this.deleteContents();
	this.insert(markup);
	if (startText) {
		let start = save.startContainer.childNodes[save.startOffset];
		if (start.nodeType != Node.TEXT_NODE) throw new Error("Replace Error")
		this.setStart(start, startText);
	} else {
		this.setStart(save.startContainer, save.startOffset);
	}
	if (endText) {
		let end = save.endContainer.childNodes[save.endOffset];
		if (end.nodeType != Node.TEXT_NODE) throw new Error("Replace Error")
		this.setEnd(end, end.textContent.length - endText);
	} else {
		this.setEnd(save.endContainer, save.endOffset);
	}
}

//get$model: function() {
//	let container = this.container;
//	let view = container.owner.create(container.controller.nodeName);
//	container.controller.control(view);
//	view.markupContent = this.markup;
//	return view.textContent && view.controller.model(view);
//},
//get$view: function() {
//	let container = this.container;
//	let view = container.owner.create(container.controller.nodeName);
//	container.controller.control(view);
//	view.markupContent = this.markup;
//	if (view.textContent) {
//		let model = view.controller.model(view);
//		view.controller.render(view, model);			
//	} else {
//		view.markupContent = "";
//	}
//	return view;
//},

//isWithin: function(node) {
//	for (let container = this.commonAncestorContainer; container; container = container.parentNode) {
//		if (node == container) return true;
//	}
//	return false;
//},
//_before: function(node) {
//	let range = node.ownerDocument.createRange();
//	range.selectNodeContents(node);
//	if (range.isWithin(node)) {
//		range.setEnd(this.startContainer, this.startOffset);				
//	} else {
//		range.collapse(true);
//	}
//	return range;
//},
//_after: function(node) {
//	let range = node.ownerDocument.createRange();
//	range.selectNodeContents(node);
//	if (range.isWithin(node)) {
//		range.setStart(this.endContainer, this.endOffset);
//	} else {
//		range.collapse();
//	}
//	return range;
//},
//get$beforeText: function() {
//	let range = this._before(this.control);
//	return range ? range.textContent : "";
//},
//get$afterText: function() {
//	let range = this._after(this.control);
//	return range ? range.textContent : "";
//},
