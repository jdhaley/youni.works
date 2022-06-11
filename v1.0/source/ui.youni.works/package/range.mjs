export default {
	Range: {
		get$container() {
			let target = this.commonAncestorContainer;
			while (target && target.nodeType != Node.ELEMENT_NODE) target = target.parentNode;
			return target;         
		},
		get$textContainer: function() {
			let node = this.commonAncestorContainer;
			return node.nodeType == Node.TEXT_NODE ? node : null;
		},
		get$content: function() {
			return this.cloneContents().childNodes;
		},
		get$textContent: function() {
			return pkg.text(this.content);
		},
		get$markup: function() {
			return pkg.markup(this.content);
		},
		select() {
			//Note: 'window' is the argument in the enclosing fill function:
			let selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(this);
		},
		replace: function(markup) {
			this.select();
			//Note: 'window' is the argument in the enclosing fill function:
			try {
				markup = arguments.length ? markup : "<BR>";
				markup =  markup && markup.toString() || "";
				window.document.execCommand("insertHTML", false, markup);   				
			} catch (error) {
				console.error("replace error", this.markup, markup);
				throw error;
			}
			return this.container.owner.selection;
		}
	},
	markup(nodes) {
		let markup = "";
		for (let i = 0; i < nodes.length; i++) {
			let node = nodes[i];
			markup += node.markup;
		}
		return markup;
	},
	text(nodes) {
		let txt = "";
		for (let i = 0, length = nodes.length; i < length; i++) {
			let node = nodes[i];
			let content = node.nodeType == Node.ELEMENT_NODE && text(node.content) || node.textContent;
			if (txt && !txt.endsWith(" ") && content && !(content.startsWith(" "))) txt += " ";
			txt += content;
		}
		return txt;	
	},
	outerMarkup() {
		let range = this.cloneRange();
		range.setEnd(range.startContainer, range.startOffset);
		range.setStartBefore(this.container.firstChild);
		let markup = range.textContent ? range.markup : "";
		range = this.cloneRange();
		range.setStart(range.endContainer, range.endOffset);
		range.setEndAfter(this.container.lastChild);
		markup += range.textContent ? range.markup : "";
		return markup;
	}
}

		///////////
	// 	get$markup() {
	// 		//We can't just get innerHTML because cloneContents returns a fragment.
	// 		let nodes = this.cloneContents().childNodes;
	// 		let markup = "";
	// 		for (let i = 0; i < nodes.length; i++) markup += nodes[i].markup;
	// 		return markup;
	// 	},
	// 	isEnd(node, offset) {
	// 		return node.nodeType == Node.TEXT_NODE && offset == node.data.length
	// 			|| node.nodeType == Node.ELEMENT_NODE && node.childNodes.length == offset;
	// 	},
	// 	get$outerMarkup: outerMarkup,
	// 	get$atStart: function() {
	// 		if (this.startOffset > 0) return false;
	// 		for (let node = this.startContainer; node != this.container; node = node.parentNode) {
	// 			if (node != node.parentNode.firstChild) return false;
	// 		}
	// 		return true;
	// 	},
	// 	get$atEnd: function() {
	// 		if (this.endOffset < this.endContainer.count) return false;
	// 		for (let node = this.endContainer; node != this.container; node = node.parentNode) {
	// 			if (node != node.parentNode.lastChild) return false;
	// 		}
	// 		return true;
	// 	},

	// 	toMarkup: function() {
	// 		let nodes = this.cloneContents().childNodes;
	// 		let markup = "";
	// 		for (let i = 0; i < nodes.length; i++) {
	// 			let node = nodes[i];
	// 			markup += (node.nodeType === Node.TEXT_NODE ? node.textContent : node.outerHTML);
	// 		}
	// 		return markup;
	// 	},
	// 	textStart: function() {
	// 		let start = 0;
	// 		for (let node = this.container.firstChild; node; node = node.nextSibling) {
	// 			if (node === this.startContainer) return start + this.startOffset;
	// 			start += node.textContent.length;
	// 		}
	// 		return undefined; //ERROR
	// 	},
	// 	unmark: function() {
	// 		if (!this.collapsed) return;
	// 		let start = this.textStart();
	// 		if (start === undefined) return;
	// 		let target = this.container;
	// 		this.selectNode(target);
	// 		let container = this.startContainer;
	// 		let index = this.startOffset;
	// 		let markup = target.textContent;
	// 		if (start) {
	// 			markup = "<" + target.nodeName + ">" + markup.substring(0, start) 
	// 			+ "</" + target.nodeName + ">" + markup.substring(start);
	// 			index++;
	// 		}
	// 		let range = this.replace(markup);
	// 		range.setStart(container, index);
	// 		range.collapse(true);
	// 		range.select();
	// 		return;
	// 	},
	// 	mark: function(nodeName) {
	// 		this.replace(" <" + nodeName + ">" + this.toString() + "</" + nodeName + ">");
	// 	},
	// 	split: function(container, markup) {
	// 	  if (!this.collapsed) {
	// 		 console.log("Range is not collapsed.");
	// 		 return;
	// 	  }
	// 	  if (!container) {
	// 		 console.log("Container is not splittable.");
	// 		 return;
	// 	  }
	// 	  let classAttr = container.className ? " class='" + container.className + "'" : "";
	// 	  let startTag = "<" + container.nodeName + classAttr + ">";
	// 	  let endTag = "</" + container.nodeName + ">";
	// 	  this.setStartBefore(container.firstChild);
 
	// 	  let startSection = this.toMarkup();
	// 	  this.collapse();
	// 	  this.setEndAfter(container.lastChild);
	// 	  let endSection = this.toMarkup();
	// 	  if (!startSection) {
	// 		 if (!markup) markup = startTag + "<br>" + endTag;
	// 		 this.setStartBefore(container);
	// 		 this.collapse(true);
	// 	  } else if (!endSection) {
	// 		 if (!markup) markup = startTag + "<br>" + endTag;
	// 		 this.setEndAfter(container);
	// 		 this.collapse();
	// 	  } else {
	// 		 if (!markup) markup = "";
	// 		 this.selectNode(container);
	// 		 markup = startTag + startSection + endTag + markup + startTag + endSection + endTag;
	// 	  }
	// 	  this.replace(markup);     
	//    }

	//    get$isFullSelection() {
	// 	return this.startOffset == 0 && this.isEnd(this.endContainer, this.endOffset);
	// },


