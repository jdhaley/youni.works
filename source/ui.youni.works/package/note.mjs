export default {
	type$: "/agent",
	Commandable: {
		shortcuts: {
		},
		extend$actions: {
			command(event) {
				let cmd = this.shortcuts[event.shortcut];
				if (cmd) {
					event.subject = cmd;
					event.target.$peer.sense(event);
				}
			}
		}
	},
	Note: {
		type$: ["Display", "Commandable"],
		shortcuts: {
			"Enter": "split",
			"Backspace": "erase",
			"Delete": "erase",
			"Tab": "demote",
			"Shift+Tab": "promote",
			"Control+s": "save"
		},
		view(value) {
			this.super(view, value);
			//"<div class='line'><br></div>";
			let markup = this.toView({
				"": "Cherry", 
				"Chapter 1": ["Apple"],
				"Chapter 2": {
					"": "The following sections blah blah...",
					"Billy": ["Orange", ["alpha", "beta", "gamma"], "Banana"],
					"Sally": "Grape"
				}
			});
			console.log(markup);
			this.peer.innerHTML = markup;
			this.peer.contentEditable = this.conf.readOnly ? false : true;
		},
		toHtml(view) {
			let sections = [];
			for (let node of view.to) {
			
			}
		},
		toObject(view) {
			let section = {
				key: "",
				level: 0,
				content: []
			};
			let sections = [section];
			for (let node of view.childNodes) {
				if (node.className == "section") {
					section = {
						key: node.textContent,
						level: node.dataset.level * 1,
						content: []
					};
					sections.push(section);
				} else {
					section.content.push({
						level: node.dataset.level * 1,
						content: node.innerHTML
					});
				}
			}
			for (let section of sections) {
				let content = [];
				let current;
				for (let line of section.content) {
					if (!current || current.level != line.level) {
						current = {
							level: line.level,
							content: []
						};
						content.push(current);
					}
					current.content.push(line.content);
				}
				section.content = content;
			}
			return sections;
		},
		toView(value, level) {
			let type = this.valueType(value);
			switch (type) {
				case "object": {
					if (!level) level = 1;
					let view = "";
					for (let name in value) {
						if (name) view += `<div class="section" data-level="${level}">${name}</div>`;
						view += this.toView(value[name], this.valueType(value[name]) == "object" ? level + 1 : 0);
					}
					return view;
				}
				case "array": {
					let view = "";
					for (let ele of value) {
						let type = this.valueType(ele);
						view += this.toView(ele, level + (type == "array" ? 1 : 0));
					}
					return view;
				}
				default:
					return `<div class="line" data-level="${level || 0}">${value}</div>`
			}
		},
		valueType(value) {
			if (value && typeof value == "object") {
				return value[Symbol.iterator] ? "array" : "object";
			} else {
				return "string";
			}
		},
		get$target() {
			return this.getItem(this.owner.selectionRange.commonAncestorContainer);
		},
		getLevel(view) {
			if (view.nodeType == Node.TEXT_NODE) view = view.parentNode;
			return view.dataset.level * 1 || 0;
		},
		getSection(node) {
			node = this.getItem(node)
			while (node) {
				if (node.classList && node.classList.contains("section")) return node;
				node = node.previousSibling;
			}
		},
		getItem(node) {
			while (node) {
				if (node.dataset) return node;
				node = node.parentNode;
			}
		},
		setLevel(view, level) {
			if (view.nodeType == Node.TEXT_NODE) view = view.parentNode;
			view.dataset.level = level;
		},
		// forEach(item, method) {
		// 	for (let node = item.nextSibling; node; node = node.nextSibling) {
		// 		if (node.role == "heading" ) {
		// 			// if (item.role == "heading" && item.dataset.level > node.
		// 			//  method.call(this, node);
		// 		}
		// 	}
		// },
		extend$actions: {
			command(event) {
				let cmd = this.shortcuts[event.shortcut];
				if (cmd) {
					console.log(cmd);
					event.subject = cmd;
					event.target.$peer.sense(event);
				}
			},
			copy(event) {
				console.log("copy", event);
			},
			save(event) {
				event.subject = "";
				console.log(this.toObject(this.peer));
			},
			split(event) {
			},
			charpress(event) {
				if (event.key == "{") {
					console.log("insert block");
				}
			},
			demote(event) {
				event.subject = "";
				let target = this.target;
				let level = target.dataset.level * 1 + 1 || 1;
				if (target.classList.contains("section")) {
					let section = this.getSection(target.previousSibling);
					let sectionLevel = section && section.dataset.level * 1 || 1;
					if (level > 3 || level > sectionLevel + 1) {
						target.classList.remove("section");
						target.classList.add("line");
						level = 0;
					}
				} else if (target.classList.contains("line")) {
					if (level > 3) level = 3;
				}
				target.dataset.level = level;
			},
			promote(event) {
				event.subject = "";
				let target = this.target;
				let level = target.dataset.level * 1 - 1;
				if (target.classList.contains("section")) {
					if (level < 1) level = 1;
				} else if (target.classList.contains("line")) {
					if (level < 0) {
						let section = this.getSection(target);
						level = section && section.dataset.level * 1 + 1 || 1;
						target.classList.remove("line");
						target.classList.add("section");	
					}
				}
				target.dataset.level = level;
			}
		}
	},
	Clipboard: {
		setClipboard: function (signal) {
			let cb = signal.clipboardData;
			let range = signal.selection;
			let data = range.markup;
			data && cb.setData("text/html", data);	
			data = range.textContent;
			data && cb.setData("text", data);	
			data = signal.on.owner.create();
			data.markupContent = range.markup;
			data = this.model(data);
			data = JSON.stringify(data)
			cb.setData("application/json", data);
		},
		getClipboard: function(signal) {
			let cb = signal.clipboardData;
			let type = signal.contentType || "application/json";	
			signal.data = cb.getData(type);
			
			switch (type) {
				case "application/json":
					if (signal.data) return this.markupJSON(signal);
					signal.contentType = "text/html";
					signal.data = cb.getData("text/html");
					//FALL through
				case "text/html":
					if (signal.data) return this.markupHTML(signal);
					signal.contentType = "text";
					signal.data = cb.getData("text");
					//FALL through
				case "text":
					return this.markupText(signal);
				default:
					return this.markupOther(signal);
			}
		},
		markupJSON: function(signal) {
			let view = this.createView(signal.on);
			let model = JSON.parse(signal.data);
			this.view(view, model);
			return view.markupContent;
		},
		markupHTML: function(signal) {
			let data = signal.data;
			let start = data.indexOf(START_FRAGMENT) + START_FRAGMENT.length;
			let end = data.indexOf(END_FRAGMENT);
			data = data.substring(start, end);
			signal.data = signal.on.owner.create("div", "hidden", data);
			return this.markupElement(signal);
		},
		markupElement: function(signal) {
			return signal.data.textContent.markup;
		},
		markupText: function(signal) {
			return signal.data.markup;
		},
		markupOther: function(signal) {
			return "";
		}
	}
}

	// Line: {
	// 	type$: "Editable",
	// 	extend$shortcuts: {
	// 		"Tab": "Demote",
	// 		"Shift+Tab": "Promote",
	// 		"Control+I": "Tag",
	// 		"Control+B": "Tag"
	// 	},
	// 	maxLevel: 6,
	// 	getLevel: function getLevel(node) {
	// 		return node.dataset && node.dataset.level ? node.dataset.level * 1 || 1 : 1;
	// 	},
	// 	getSectionLevel: function getSectionLevel(node) {
	// 		for (let prior = node.previousSibling; prior; prior = prior.previousSibling){
	// 			if (prior.isa("heading")) return this.getLevel(prior)
	// 		}
	// 		return 1;
	// 	},
	// 	getParagraphLevel: function getParagraphLevel(node) {
	// 		for (let prior = node.previousSibling; prior; prior = prior.previousSibling) {
	// 			if (prior.isa("heading")) return 0;
	// 			if (prior.isa("text")) return this.getLevel(prior)
	// 		}
	// 		return 0;
	// 	},
	// 	setNode: function setNode(node, type, level) {
	// 		if (level !== level * 1){
	// 			console.log("Waring: invalid level: " + level);
	// 			level = 1
	// 		}
	// 		if (level > this.maxLevel) return;
	// 		let markup = `<p class='${type}' data-level='${level}'>${node.markupContent}</p>`;
	// 		let range = node.owner.selection;
	// 		range.selectNodeContents(node);
	// 		range = range.replace(markup);
	// 	},
	// 	join: join,
	// 	extend$signal: {
	// 		Character: function(signal) {
	// 			signal.stop(true);
	// 		},
	// 		Erase: function(signal) {
	// 			signal.stop(true);	
	// 		},
	// 		Enter: function(signal) {
	// 			signal.stop();
	// 		},
	// 		Join: function(signal) {
	// 			let first = signal.first;
	// 			let second = signal.second;
	// 			first && first.nodeName == "P" && second && second.nodeName == "P" 
	// 				? this.join(signal) : signal.stop();
	// 		},
	// 		Promote: function(signal) {
	// 			signal.stop();
	// 		},
	// 		Demote: function(signal) {
	// 			signal.stop();
	// 		},
	// 		Tag: function(signal) {
	// 			sigal.stop();
	// 		},
	// 		Paste: function() {
	// 			//Outline to handle.
	// 		}
	// 	}
	// },
	// SectionHeader: {
    //     type$: "Structure",
	// 	members: {
    //         type$handle: "Display",
    //         type$body: "Display"
    //     },
    //     states: {
    //         "collapsed": "/res/icons/chevron-right.svg",
    //         "expanded": "/res/icons/chevron-bottom.svg",
    //         "empty": "/res/icons/empty.svg",
    //         "hidden": ""
    //     },
    //     virtual$state(value) {
    //         if (!arguments.length) return this.peer.$state;
    //         this.peer.$state = value;
    //         this.peer.firstChild.src = this.states[value];
    //     },
    //     view(model) {
    //         this.peer.innerHTML = `<img><div>${model}</div>`;
    //     },
    //     extend$actions: {
    //         click(event) {
    //             event.value = this.model.expr;
    //             if (this.state === "collapsed") {
    //                 this.state = "expanded";
    //             } else if (this.state == "expanded") {
    //                 this.state = "collapsed";
    //             }
    //             event.subject = this.state;
    //         }
    //     }
    // },
    // ItemBody: {
    //     type$: "Collection",
    //     type$contentType: "Item",
    //     view(model) {
    //         if (this.peer.$show) {
    //             // let content = model;
    //             // if (content.expr && typeof content.expr == "object") content = model.expr;
    //             this.super(view, model.expr);
    //             this.owner.send(this, "view");
    //         } else {
    //             this.peer.$show = true;
    //         }
    //     }
    // },
    // Section: {
	// 	type$: "Structure",
    //     members: {
    //         type$handle: "Display",
    //         type$body: "Display"
    //     },
	// 	extend$actions: {
    //         empty(event) {
    //             event.subject = "showValue";
    //         },
	// 		collapsed(event) {
    //             this.parts.body.style.display = "none";
    //             event.subject = "";
	// 		},
	// 		expanded(event) {
    //             if (!this.parts.body.peer.childNodes.length) {
    //                 this.parts.body.view(this.model);
    //             }
    //             this.parts.body.style.removeProperty("display");
    //             event.subject = "";
	// 		}
	// 	}
    // },