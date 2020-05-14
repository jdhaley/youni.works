export default {
	package$: "youniworks.com/outline",
	package$ui: "youniworks.com/ui",
	package$editor: "youniworks.com/editor",
	Frame: {
		super$: "ui.Frame",
		activate: function() {
			let controller = this.part[article.type];
			if (!controller) {
				controller = this.part.Editor;
				//this.dataview(article.content);
			}
			let control = this.createView("div");
			this.content.append(control);
			controller.control(control);
			control.model = article.content;
			this.receive("draw");
		},
		replace: function(range, markup) {
			this.selection = range;
			try {
				this.window.document.execCommand("insertHTML", false, markup || "");   				
			} catch (error) {
				console.error("replace error", range.markup, markup);
				throw error;
			}
		},
		dataview: function(model) {
			switch (typeof model) {
				case "object":
					return this.part.object;
				default:
					return this.part.text || "<BR>";
			}			
		},
		execute: function(command, argument) {
			try {
				this.window.document.execCommand(command, false, argument || "");   				
			} catch (error) {
				console.error("Command error", command, argument);
				throw error;
			}
		},
		command: {
			Promote: function() {
				this.exec("outdent");
			},
			Demote: function() {
				this.exec("indent");
			},
			
		},
		activate: function(config) {
			this.sys.implement(window.Range.prototype, config.range);
			this.sys.implement(window.Element.prototype, config.element);
			this.device = this.sys.extend(null, config.devices);
			this.content = this.initContent(window.document);
			this.service.initialize({});
		},
		before$initializeContent: function(document) {
//			document.execCommand("styleWithCSS", true);
//			document.execCommand("defaultParagraphSeparator", "P");
			document.execCommand("defaultParagraphSeparator", "P");
			return document.body;
		},	
	},
	Outline: {
		super$: "editor.Editable",
		draw: function(view) {
			this.outline(view, view.model, -1);
		},
		outline: function(view, model, depth) {
			depth++;
			switch (typeof model) {
				case "object":
					if (model instanceof Array) {
						for (let value of model) {
							this.outline(view, value, depth);
						}					
					} else {
						for (let key in model) {
							let value = model[key];
							this.property(view, {key: key, value: value}, depth);
							if (typeof value == "object") this.outline(view, value, depth);
						}
					}
					break;
				case "string":
				case "number":
				case "boolean":
					this.para(view, model, depth);
					break;
				default:
					this.other(view, model, depth)
					break;
			}
		},
		para: function(view, model, depth) {
			let prop = this.part.para.createView(model);
			prop.dataset.level = depth;
			view.append(prop);
		},
		property: function(view, model, depth) {
			let prop = this.part.property.createView(model.value);
			prop.name = model.key;
			prop.dataset.level = depth;
			view.append(prop);
		},
		other: function(view, model, depth) {
			let prop = this.part.other.createView(model);
			prop.dataset.level = depth;
			view.append(prop);
		}
	},
	Properties: {
		super$: "Outline",
		controlName: "ul",
		editable: true,
		draw: function(view) {
			let model = view.model;
			for (let name in model) {
				let prop = this.part.property.createView(view.model[name]);
				prop.name = name;
				view.append(prop);
			}			
		},
		extend$action: {
			Promote: function(event) {
//				this.owner.edit("outdent");
			},
			Demote: function(event) {
//				this.owner.edit("insertOrderedList");				
			}
		}
	},
	Line: {
		super$: "editor.Editor",
		controlName: "li",
		maxLevel: 6,
		getLevel: function(view) {
			return view.dataset && view.dataset.level * 1 || 0;
		},
		replace: function(property, level) {
			let range = property.ownerDocument.createRange();
			range.selectNode(property);
			property = property.cloneNode(true);
			property.dataset.level = level;
			this.owner.replace(range, property.outerHTML);
		},
		extend$action: {
			Promote: function(event) {
				let property = event.on;
				let level = this.getLevel(property);
				if (!level) return;
				this.replace(property, level - 1);
				event.action = "";
			},
			Demote: function(event) {
				let property = event.on;
				let level = this.getLevel(property);
				if (level >= this.maxLevel) return;
				this.replace(property, level + 1);
				event.action = "";
			}
		}
	},
	Property: {
		super$: "Line",
		editable: false,
		draw: function(view) {
			view.append("\n");
			view.append(this.part.label.createView(view.name));
			view.append("\n");
			view.append(this.part.value.createView(view.model));
			view.append("\n");
//			view.append(this.owner.createView("BR"));
		},
//		ownerreplace: function(range, markup) {
//			let container = range.container;
//			try {
//				this[WINDOW].document.execCommand("styleWithCSS", true);   								
//				this[WINDOW].document.execCommand("insertHTML", false, markup || "");   				
//			} catch (error) {
//				console.error("replace error", range.markup, markup);
//				throw error;
//			}
//			range.selectNode(container);
//			range.forEach((node) => {
//				let viewer = this.controller[node.dataset && node.dataset.view];
//				viewer && viewer.control(node);
//			});
//		},
	},
	Cell: {
		super$: "editor.Editor",
		controlName: "span",
		editable: true,
		draw: function(view) {
			if (typeof view.model == "object") {
				view.innerHTML = "<button>hi</button>";
			} else {
				view.innerHTML = "" + view.model || "<BR>";
			}
		},
	},
	Label: {
		controlName: "span",
		super$: "Cell",
	}
}

/*
		name: value
		name:
			0 paragraph
				1.0 paragraph
				1.1 paragraph
			2 paragraph
			3 paragraph
			
 */
////////////////////////////////////////////

var commandRelation = {};

function supported(cmd) {
	var css = !!document.queryCommandSupported(cmd.cmd) ? "btn-succes" : "btn-error"
	return css
};

function icon(cmd) {
	return (typeof cmd.icon !== "undefined") ? "fa fa-" + cmd.icon : "";
};

function doCommand(cmdKey) {
	var cmd = commandRelation[cmdKey];
	if (supported(cmd) === "btn-error") {
		alert("execCommand(“" + cmd.cmd + "”)\nis not supported in your browser");
		return;
	}
	val = (typeof cmd.val !== "undefined") ? prompt("Value for " + cmd.cmd + "?", cmd.val) : "";
	document.execCommand(cmd.cmd, false, (val || "")); // Thanks to https://codepen.io/bluestreak for finding this bug
}

function init() {
	var html = '',
		template = '<span><code class="btn btn-xs %btnClass%" title="%desc%" onmousedown="event.preventDefault();" onclick="doCommand(\'%cmd%\')"><i class="%iconClass%"></i> %cmd%</code></span>';
	commands.map(function(command, i) {
		commandRelation[command.cmd] = command;
		var temp = template;
		temp = temp.replace(/%iconClass%/gi, icon(command));
		temp = temp.replace(/%desc%/gi, command.desc);
		temp = temp.replace(/%btnClass%/gi, supported(command));
		temp = temp.replace(/%cmd%/gi, command.cmd);
		html+=temp;
	});
	document.querySelector(".buttons").innerHTML = html;
}

//init();
//////////////////////////////////////
/*
export default {
	Line: {
		type$: "Editable",
		maxLevel: 6,
		getLevel: function getLevel(node) {
			return node.dataset && node.dataset.level * 1 || 0;
		},
		setLevel: function setLevel(node, level) {
			level = level && level * 1 || 0;
			let currentLevel = this.getLevel(node);
			if (level == currentLevel || level > this.maxLevel) return;
			
			let range = node.owner.range;
			range.selectNode(node);
			
			node = node.cloneNode(true);
			if (level) {
				node.dataset.level = level;
			} else {
				delete node.dataset.level;
			}
			range = range.replace(node.markup);
			//
			range.selectNodeContents(range.container);
			range.collapse(true);
		},
		getPriorLevel: function(node) {
			return node.previousSibling && node.previousSibling.className != "heading-part" ? this.getLevel(node.previousSibling) : 0;
		},
		getSectionLevel: function(node) {
			for (let prior = node.previousSibling; prior; prior = prior.previousSibling) {
				if (prior.className == "heading-part") return this.getLevel(prior)
			}
			return 0;
		},
		canJoin: function(first, second) {
			return first && second; // && first.className == second.className;
		},
		join: join,
		extend$signal: {
			Join: function(signal) {
				if (this.canJoin(signal.first, signal.second)) this.join(signal);
				this.turn.end(signal);
			},
			Split: function(signal) {
				signal.on.textContent ?  this.turn.end(signal, "Default") : this.turn.up(signal, "Section");
			},
			Backward: function(signal) {
				if (signal.on.dataset.level > 0) return this.turn.up(signal, "Promote");
				signal.first = signal.on.previousSibling;
				signal.second = signal.on;
				this.turn.up(signal, "Join");
			},
			Forward: function(signal) {
				this.turn.up(signal, "Demote");
			},
			Promote: function(signal) {
				let prior = this.getPriorLevel(signal.on);
				let level = this.getLevel(signal.on) - 1;
				if (level > prior) level = prior + 1;
				if (level) {
					this.setLevel(signal.on, level);
					this.turn.end(signal);
				} else if (signal.key == "Backspace") {
					signal.first = signal.on.previousSibling;
					signal.second = signal.on;
					this.turn.up(signal, "Join");	
				}
			},
			Demote: function(signal) {
				this.turn.end(signal);
				let level = this.getPriorLevel(signal.on);
				let current = this.getLevel(signal.on);
				if (current > level || level >= this.maxLevel) return;
				if (current == level) level++;
				this.setLevel(signal.on, level);
			},
			Section: function(signal) {
			},
		}
	},
	Paragraph: {
		type$: "Line",
		name: "text",
		getInsert: function(signal) {
			let range = signal.on.owner.range;
			switch (signal.key.toUpperCase()) {
				case "I": return ` <i class=EM> ${range.textContent} </i> `;
				case "B": return ` <i class=STRONG> ${range.textContent} </i> `;
			}
		},
		extend$shortcuts: {
			"Control+I": "Insert",
			"Control+B": "Insert",
			_: "InsertProperty",
			":": "InsertKey",
			"\"": "InsertString"
		},
		lookup: {
			"get": "fn",
			"virtual": "fn"
		},
		getPopup: function(view) {
			if (!view.popup) {
				view.popup = this.sys.ui.LookupItems.view(view.owner.content.popups, this.lookup);
			}
			view.popup.anchor = view;
			return view.popup;
		},
		propertyValue: function(view, facet, value) {
			switch (facet) {
				case "get":
				case "virtual":
				case "fn":
					return `<div class=fn-part data-facet=${facet}>${value || " "}</div>`;
				default:
					return `<div class=value-part>${value || " "}</div>`;
			}
		},
		extend$signal: {
			Section: function(signal) {
				this.turn.end(signal);
				let node = signal.on;
				let level = this.getSectionLevel(node);
				
				let range = node.owner.range;
				//Selecting the node contents and replacing with the entire node is a hack to get around CE warts.
				range.selectNode(node);
				range = range.replace(`<div class=heading-part data-level=${level}><br></div>`);
				//
				range.selectNodeContents(range.container);
				range.collapse(true);
			},
			InsertKey: function(signal) {
				let range = signal.on.owner.range;
				if (!range.collapsed && range.startOffset != 0) return;
				if (range.startContainer == range.container.firstChild && range.startContainer.isText)  {
					range.setStart(range.startContainer, 0);
					let key = range.textContent;
					if (key.indexOf(":") >= 0) return;
					if (key.indexOf("$") >= 0) signal.facet = key.substring(0, key.indexOf("$"));
					key = key.substring(key.indexOf("$") + 1);
					range.collapse();
					range.setEndAfter(signal.on.lastChild);
					let value = this.propertyValue(signal.on, signal.facet, range.textContent);
					let property = `<div class=label-part>${key}</div>${value}`;
					signal.on.className = "property-part";
					range.selectNodeContents(signal.on);
					range = range.replace(property);
//					range.selectNodeContents(signal.on.lastChild);
//					range.collapse(true);
//					range.select();
					this.turn.end(signal);

				//	range.replace(`<i class=KEY>${range.textContent}</i> `);
				//	this.getPopup(signal.on).send(this.turn.end(signal).begin(false, "Show"));
				}
			},
			InsertProperty: function(signal) {
				let range = signal.on.owner.range;
				if (!range.collapsed && range.startOffset != 0) return;
				if (range.startContainer == range.container.firstChild && range.startContainer.isText)  {
					range.setStart(range.startContainer, 0);
					let facet = range.textContent;
					let property = `<i class=KEY${facet && " facet='" + facet + "'" || ""}> </i>`;
					property += this.facetValue(facet, signal.on.dataset.level);
					range.selectNodeContents(signal.on);
					range = range.replace(property);
					range.selectNodeContents(signal.on.firstChild);
					range.select();
					this.turn.end(signal);
				}
			},
			InsertString: function(signal) {
				let range = signal.on.owner.range;
				if (range.collapsed && range.startContainer.isText && range.startContainer.textContent.charAt(range.startOffset - 1) == "\\") {
					range.setStart(range.startContainer, range.startOffset - 1);
					range.replace("\"");
					this.turn.end(signal);
					return;
				}
				if (range.container.nodeName == "Q") {
					if (range.collapsed) {
						let markup = range.before(range.container).textContent;
						if (markup) markup = "<q>" + markup + "</q>";
						markup += range.after(range.container).textContent || " ";
						range.selectNodeContents(range.container);
						range = range.replace(markup);
						range.setStart(range.startContainer, range.startContainer.textContent.charAt(0) == " " ? 1 : 0);
						range.collapse(true);
						range.select();
					} else {
						range.replace("\"");
					}
				} else {
					range = range.replace(`<q>${range.textContent || " "}</q>`);
					if (range.container.textContent == " ") range.selectNodeContents(range.container);
				}
				this.turn.end(signal);
			},
			Insert: function(signal) {
				if (signal.key == "Enter") {
					let range = signal.on.owner.range;
					//NOTE: some weird exception if this: range.setStart(first, idx + 1);
					signal.append ? range.setEndAfter(signal.on) : range.setEndBefore(signal.on);
					range.collapse();
					range = range.replace(`<div class="text-part" data-level=${signal.on.dataset.level}><br></div>`);
					range.collapse(true);
					range.select();
					this.turn.end(signal);
					return;
				}
				let range = signal.on.owner.range;
				if (!range.container.isa("text-part")) return;
				let markup = this.getInsert(signal);
				markup && range.replace(markup);
				this.turn.end(signal);
			}
		}
	},
	Heading: {
		type$: "Line",
		name: "heading",
		getPriorLevel: function(node) {
			return this.getSectionLevel(node);
		},
		extend$signal: {
			Split: function(signal) {
				this.turn.end(signal);
				let range = signal.on.owner.range;
				if (range.collapsed) {
					range.setEndAfter(signal.on);
					range = range.replace(`</div><div class=text-part>${range.textContent}</div>`);
					range.selectNodeContents(range.container);
					range.collapse(true);
					range.select();
				}
			}
		}
	}
}
*/
/*
 * Replace the default CE join to: always join the second node's markup content to the first.
 */
/*
function join(signal) {
	let first = signal.first;
	let second = signal.second;
	let idx = lastContentIndex(first);
	let node = idx >= 0 ? first.content[idx] : undefined;
	
	let range = signal.on.owner.range;
	//NOTE: some weird exception if this: range.setStart(first, idx + 1);
	range.selectNodeContents(first);
	range.collapse();
	range.setEnd(second, second.content.length);
	//range.setEndAfter(second);
	
	range = range.replace(second.markupContent || "");
	
	if (node && node.isText) {
		range.setEnd(first.content[idx], node.textContent.length);
	} else  {
		range.setEnd(first, idx + 1);
	}
	range.collapse();
	range.select();
}
function lastContentIndex(node) {
	for (let i = node.content.length - 1; i >= 0; i--) {
		let child = node.content[i];
		if (child.nodeName != "BR") return i;
	}
	return -1;
}
*/

//getSectionLevel: function getSectionLevel(node) {
//for (let prior = node.previousSibling; prior; prior = prior.previousSibling){
//	if (prior.isa("heading-part")) return this.getLevel(prior)
//}
//return 1;
//},
//getLineLevel: function getLineLevel(node) {
//let isa = node.className;
//for (let prior = node.previousSibling; prior; prior = prior.previousSibling) {
//	if (prior.isa("heading-part")) return 0;
//	if (prior.isa("text-part")) return this.getLevel(prior)
//}
//return 0;
//},
//setNode: function setNode(node, type, level) {
//if (level !== level * 1){
//	console.log("Waring: invalid level: " + level);
//	level = 1
//}
//if (level > this.maxLevel) return;
//let markup = `<p class='${type}-part' data-level='${level}'>${node.markupContent}</p>`;
//let range = node.owner.range;
//range.selectNodeContents(node);
//range = range.replace(markup);
//range.selectNodeContents(range.container);
//range.collapse(true);
//},
//promote: function promote(signal) {
//let level = this.getLevel(signal.on);
//if (level > 1) this.setLevel(signal.on, level - 1);
//
//},
//demote: function demote(signal) {
//let level = this.getPriorLevel(signal.on);
//if (level < this.maxLevel) this.setLevel(node, level + 1);
//},
//xxxxxxxxxxxxxxxxsplit: function(signal) {
//let range = signal.on.owner.range;
//if (!range.collapsed || !range.isText) return;
//if (range.startContainer == range.container.firstChild && range.startOffset == 0) {
//	this.turn.end(signal);
//	range.setStartBefore(signal.on);
//	range.collapse(true);
//	range = range.replace("<p class=text-part data-level=1><br></p>");
//	range.selectNodeContents(range.container);
//	return;
//}
//let end = range.container.lastChild;
//if (end.nodeName == "BR") end = end.previousSibling;
//if (end && range.endOffset == end.textContent.length) {
//	this.turn.end(signal);
//	range.setEndAfter(signal.on);
//	range.collapse();
//	range = range.replace("<p class=text-part data-level=1><br></p>");
//	return;
//}
//},
//extend$shortcuts: {
//"ArrowUp": "Input",
//"ArrowDown": "Input",
//},
//ref$lookup: "Parcel",
//getPopup: function(view) {
//if (!view.popup) {
//	view.popup = this.sys.ui.LookupItems.view(view.owner.content.popups, this.lookup);
//}
//view.popup.anchor = view;
//return view.popup;
//},
//extend$signal: {
//Input: function(signal) {
//	signal.filter = signal.on.textContent;
//	this.getPopup(signal.on).send(signal);
//},
//Split: function(signal) {
//	this.turn.up(signal, "Input");
//},
//Resize: function(signal) {
//	if (signal.on.popup && signal.on.popup.isa("open")) {
//		signal.on.popup.send(this.sys.Signal.begin(true, "Show"));
//	}
//}
//}

//Demote: function(signal) {
//this.turn.end(signal);
//let node = signal.on;
//let level = this.getLevel(node);
//let priorLevel = this.getSectionLevel(node);
//if (level > priorLevel || level > 5) {
//	this.setNode(node, "text", 1);
//	return;
//}
//this.setNode(node, "heading", level + 1);
//},
//Promote: function(signal) {
//this.turn.end(signal);
//let node = signal.on;
//let level = this.getLevel(node);
//if (level < 2) return;
//this.setNode(node, "heading", level - 1);
//},
