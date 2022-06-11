export default {
	Line: {
		type$: "Editable",
		extend$shortcuts: {
			"Tab": "Demote",
			"Shift+Tab": "Promote",
			"Control+I": "Tag",
			"Control+B": "Tag"
		},
		maxLevel: 6,
		getLevel: function getLevel(node) {
			return node.dataset && node.dataset.level ? node.dataset.level * 1 || 1 : 1;
		},
		getSectionLevel: function getSectionLevel(node) {
			for (let prior = node.previousSibling; prior; prior = prior.previousSibling){
				if (prior.isa("heading")) return this.getLevel(prior)
			}
			return 1;
		},
		getParagraphLevel: function getParagraphLevel(node) {
			for (let prior = node.previousSibling; prior; prior = prior.previousSibling) {
				if (prior.isa("heading")) return 0;
				if (prior.isa("text")) return this.getLevel(prior)
			}
			return 0;
		},
		setNode: function setNode(node, type, level) {
			if (level !== level * 1){
				console.log("Waring: invalid level: " + level);
				level = 1
			}
			if (level > this.maxLevel) return;
			let markup = `<p class='${type}' data-level='${level}'>${node.markupContent}</p>`;
			let range = node.owner.selection;
			range.selectNodeContents(node);
			range = range.replace(markup);
		},
		join: join,
		extend$signal: {
			Character: function(signal) {
				signal.stop(true);
			},
			Erase: function(signal) {
				signal.stop(true);	
			},
			Enter: function(signal) {
				signal.stop();
			},
			Join: function(signal) {
				let first = signal.first;
				let second = signal.second;
				first && first.nodeName == "P" && second && second.nodeName == "P" 
					? this.join(signal) : signal.stop();
			},
			Promote: function(signal) {
				signal.stop();
			},
			Demote: function(signal) {
				signal.stop();
			},
			Tag: function(signal) {
				sigal.stop();
			},
			Paste: function() {
				//Outline to handle.
			}
		}
	},
	Paragraph: {
		type$: "Line",
		name: "text",
		extend$signal: {
			Demote: function demote(signal) {
				signal.stop();
				let node = signal.on;
				let level = this.getLevel(node);
				let priorLevel = this.getParagraphLevel(node);
				if (level > 1 && level > priorLevel) return;
				this.setNode(node, "text", level + 1);
			},
			Promote: function promote(signal) {
				signal.stop();
				let node = signal.on;
				let level = this.getLevel(node) - 1;
				let type = "text";
				if (level < 1) {
					type = "heading";
					level = this.getSectionLevel(node) + 1;
				}
				this.setNode(node, type, level);
			},
			Tag: function(signal) {
				signal.stop();
				let range = signal.selection;
				let context = range.container;
				//Not sure what this was meant to do:
				//if (context.nodeName != "P") context = range.textContainer && range.textContainer.parentNode;
				if (context.nodeName != "P") return;
				let tag = this.getTag(signal);
				tag && range.replace(` <I class="${tag}"> ${range.textContent} </I> `);
			},
			Enter: function(signal) {
				signal.stop(true);
			}
		},
		getTag: function(signal) {
			switch (signal.key.toUpperCase()) {
				case "I": return "EM";
				case "B": return "STRONG";
			}
		}
	},
	Heading: {
		type$: "Line",
		name: "heading",
		extend$signal: {
			Demote: function(signal) {
				signal.stop();
				let node = signal.on;
				let level = this.getLevel(node);
				let priorLevel = this.getSectionLevel(node);
				if (level > priorLevel){
					this.setNode(node, "text", 1);
					return
				}
				this.setNode(node, "heading", level + 1);
			},
			Promote: function(signal) {
				signal.stop();
				let node = signal.on;
				let level = this.getLevel(node);
				if (level < 2) return;
				this.setNode(node, "heading", level - 1);
			},
		    Enter: function(signal) {
		        let range = signal.on.owner.selection;
		        if (!range.collapsed || !range.textContainer) return;
		        if (range.startContainer == range.container.firstChild && range.startOffset == 0) {
		        	signal.stop();
		        	range.setStartBefore(signal.on);
		        	range.collapse(true);
		        	range = range.replace("<p class=text data-level=1><br></p>");
		        	range.selectNodeContents(range.container);
		        	return;
		        }
		        let end = range.container.lastChild;
		        if (end.nodeName == "BR") end = end.previousSibling;
		        if (end && range.endOffset == end.textContent.length) {
		        	signal.stop();
		        	range.setEndAfter(signal.on);
		        	range.collapse();
		        	range = range.replace("<p class=text data-level=1><br></p>");
		        	return;
		        }
		    }
		}
	},
	Outline: {
		type$: "Editor",
		extend$types: {
			ref$text: "Paragraph",
			ref$heading: "Heading"
		},
		display: function(view) {
			let model = view.model;
			let markup;
			if (typeof model == "object" && model !== null) {
				markup = viewOf(model)
			} else {
				markup = ("" + model).markup || "<br>";
				markup = `<p class=text data-level=1>${markup}</p>`
			}
			view.markupContent = markup;
			return view;
		},
		model: function model(view) {
			let section = this.sys.Section.instance();
			section.parse(view.childNodes);
			return section.model;
		},
		markupElement: function(signal) {
			return outlineContent(signal.data, 1);
		},
		markupText: function(signal) {
			return markupText(signal.data);
		},
		extend$signal: {
			Character: function(signal) {
				signal.stop();
				let range = signal.on.owner.selection;
				let node = range.container.content[range.startOffset - 1];
				if (node && node.previousSibling && node.previousSibling.nodeName == "BR") range.setStartBefore(node.previousSibling);
				if (node && node.nextSibling && node.nextSibling.nodeName == "BR") range.setEndAfter(node.nextSibling);
				signal.selection.replace(`<p class=text data-level=1>${signal.character}</p>`);
			},
			Paste: function(signal) {
				signal.stop();
				signal.contentType = signal.on.pasteSpecial ? "text" : "text/html";
				signal.markup = this.getClipboard(signal);
				this.replaceSelection(signal);
			}
		}
	}
}

function join(signal) {
	let first = signal.first;
	let second = signal.second;
	let idx = lastContentIdx(first);
	let node = idx >= 0 ? first.content[idx] : undefined;
	
	signal.stop();

	let range = signal.selection;
	//NOTE: some weird exception if this: range.setStart(first, idx + 1);
	range.selectNodeContents(first);
	range.collapse();
	range.setEnd(second, second.content.length);
	//range.setEndAfter(second);
	
	range = range.replace(second.markupContent || "");
	
	if (node && node.nodeType == Node.TEXT_NODE) {
		range.setEnd(first.content[idx], node.textContent.length);
	} else  {
		range.setEnd(first, idx + 1);
	}
	range.collapse();
	range.select();
	return;
}

function lastContentIdx(node) {
	for (let i = node.content.length - 1; i >= 0; i--) {
		let child = node.content[i];
		if (child.nodeName != "BR") return i;
	}
	return -1;
}









function viewOf(object, level) {
	level = level || 1;
	let markup = "";
	for (let heading in object){
		if (heading) markup += viewHeading(heading, level);
		let content = object[heading];
		switch (typeof content) {
			case "object":
				markup += content instanceof Array 
					? viewSection(content, 1)
					: viewOf(content, level + 1);
					break;
			default:
				markup += (content || "").toString().markup;
				break;
		}
	}
	return markup;
}

function viewHeading(heading, level) {
	let levelAttr = (level ? " data-level='" + level + "'" : "");
	let markup = `<p class='heading'${levelAttr}>${heading}</p>`;
	return markup;
}

function viewSection(section, level) {
	let markup = "";
	for (let i = 0; i < section.length; i++){
		let node = section[i];
		if (node instanceof Array){
			markup += viewSection(node, level + 1)
		} else if (node){
			let levelAttr = (level ? " data-level='" + level + "'" : "");
			markup += `<p class='text'${levelAttr}>${node.toString()}</p>`
		}
		else{
			//Higher-level paragraph was deleted.
		}
	}
	return markup;
}

function markupText(text) {
	let markup = "";
	let in_para = false;
	for (let i = 0, length = text.length; i < length; i++) {
		let ch = text.charAt(i);
		switch (ch) {
			case " ":
			case "\t":
				if (markup.charAt(markup.length - 1) != " ") markup += " ";
				break;
			case "\n":
			case "\r":
				while (i < length) {
					let next = text.charAt(i + 1);
					if (next == "\r" || next == "\n") i++; else break;
				}
				if (in_para) {
					markup += "</p><p class=text data-level=1>";
				} else {
					markup += "<p class=text data-level=1>";
					in_para = true;	
				}
				break;
			case ">": 
				markup += "&gt;";
				break;
			case "<": 
				markup += "&lt;";
				break;
			case "&":
				markup += "&amp";
				break;
			default:
				markup += ch;
				break;	
		}
	}
	if (in_para) markup += "</p>";
	return markup;
}

function outlineContent(source) {
	let level = source.dataset && source.dataset.level * 1 || 1;
	console.log("source: ", source.markup, "level: ", level);
	let markup = "";
	for (let node = source.firstChild; node; node = node.nextSibling) {
		switch (node.nodeName) {
			case "#text":
				markup += node.textContent.markup;
				break;
			case "P":
				if (!node.dataset.level) node.dataset.level = level;
				if (node.classList.contains("heading")) {
					node.className = "heading";
				} else {
					node.className = "text";
				}
				markup +=  outline(node);
				break;
			case "LI":
				node.dataset.level = level;
				node.className = "heading";
				//if (node.className.indexOf("MsoListParagraph") >= 0) node.dataset.level = 2;
				markup +=  outline(node);
				break;
			case "H1":
			case "H2":
			case "H3":
			case "H4":
			case "H5":
			case "H6":
				node.dataset.level = node.nodeName.substring(1);
				node.className = "heading";
				markup +=  outline(node);
				break;
			case "UL":
			case "OL":
				node.dataset.level = level + 1;
				markup += outlineContent(node);
				break;

			case "A":
				markup += anchor(node);
				break;
			case "IMG":
			case "VIDEO":
				markup += `<figure>${node.markup}<figcaption>${node.alt || node.title}</figcaption></figure>`;
				break;
			case "B":
				node.className = "STRONG";
				markup += inline(node);
				break;
			case "I":
				node.className = "EM";
				markup += inline(node);
				break;
			case "EM":
			case "STRONG":
			case "ABBR":	//Title.
			case "DFN":		//Title
			case "CODE":
			case "SAMP":
			case "KBD":
			case "VAR":
			case "U":
			case "Q":
			case "S":
				node.className = node.nodeName;
				markup += inline(node);
			case "BUTTON":
			case "INPUT":
			case "HR":
			case "BR":
			case "#comment":
			case "TEXTAREA":
				break;
			case "SPAN":
			case "DIV":
			case "SECTION":
			case "HEADER":
			case "FOOTER":
			case "FIGURE":
			default:
				markup += outlineContent(node);
				break;
		}
	}
	console.log("outline: ", markup);
	return markup;
}
function outline(node) {
	return `<p class="${node.className}" data-level=${node.dataset.level || "1"}>${outlineContent(node)}</p>`;
}
function inline(node) {
	let title = node.title ? ` title="${node.title}"` : ``;
	
	return `<i class="${node.className}" ${title}>${node.textContent.markup}</i>`;
}
function anchor(node) {
	let href = node.href ? ` href='${node.href}'` : ``;
	return `<a ${href}>${node.textContent.markup}</a>`;
}