const ITERATE = {
	forward: next,
	backward: prior
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
		return this.commonAncestorContainer.isText;
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
	get$textContent: function() {
		let text = "";
		this.content.forEach(node => {
			text += node.textContent;
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
	isWithin: function(node) {
		for (let container = this.commonAncestorContainer; container; container = container.parentNode) {
			if (node == container) return true;
		}
		return false;
	},
	before: function(node) {
		let range = node.ownerDocument.createRange();
		range.selectNodeContents(node);
		if (range.isWithin(node)) {
			range.setEnd(this.startContainer, this.startOffset);				
		} else {
			range.collapse(true);
		}
		return range;
	},
	after: function(node) {
		let range = node.ownerDocument.createRange();
		range.selectNodeContents(node);
		if (range.isWithin(node)) {
			range.setStart(this.endContainer, this.endOffset);
		} else {
			range.collapse();
		}
		return range;
	},
	select: function() {
		let control = this.control;
		if (control) control.controller.owner.selection = this;
	},
	get$beforeText: function() {
		let range = this.before(this.control);
		return range ? range.textContent : "";
	},
	get$afterText: function() {
		let range = this.after(this.control);
		return range ? range.textContent : "";
	},
	get$model: function() {
		let container = this.container;
		let view = container.owner.create(container.controller.nodeName);
		container.controller.control(view);
		view.markupContent = this.markup;
		return view.textContent && view.controller.model(view);
	},
	get$view: function() {
		let container = this.container;
		let view = container.owner.create(container.controller.nodeName);
		container.controller.control(view);
		view.markupContent = this.markup;
		if (view.textContent) {
			let model = view.controller.model(view);
			view.controller.render(view, model);			
		} else {
			view.markupContent = "";
		}
		return view;
	},
	forEach: function(fn, direction) {
		let step = ITERATE[direction || "forward"];
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
		if (arguments.length) {
			let pos = arguments[0];
			this.setStart(this.owner.getNode(pos.startPath), pos.startOffset);
			this.setEnd(this.owner.getNode(pos.endPath), pos.endOffset);
			return;
		}
		return this.owner.sys.extend(null, {
			startPath: this.startContainer.path,
			startOffset: this.startOffset,
			endPath: this.endContainer.path,
			endOffset: this.endOffset
		});
	}
}
function next(node) {
	if (node.firstChild) return node.firstChild;
	if (node.nextSibling) return node.nextSibling;
	for (node = node.parentNode; node; node = node.parentNode) {
		if (node.nextSibling) return node.nextSibling;
	}
}
function prior(fn, node, end) {
	let result = fn(node);
	if (result) return result;
	if (end && end == node) return;
	if (node.lastChild) return backward(fn, node.lastChild, end);
	if (node.previousSibling) return backward.call(fn, node.previousSibling, end);
	for (node = node.parentNode; node; node = node.parentNode) {
		if (node.previousSibling) return backward.call(fn, node.previousSibling, end);
	}
}