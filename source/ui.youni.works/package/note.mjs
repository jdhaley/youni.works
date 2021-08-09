export default {
	type$: "/display",
	Note: {
		type$: "Display",
		shortcuts: {
			"Enter": "split",
			"Backspace": "erase",
			"Delete": "erase",
			"Tab": "demote",
			"Shift+Tab": "promote"
		},
		view(value) {
			this.super(view, value);

			this.peer.innerHTML = "<div class='line'><br></div>";
			this.peer.contentEditable = this.conf.readOnly ? false : true;
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
		forEach(item, method) {
			for (let node = item.nextSibling; node; node = node.nextSibling) {
				if (node.role == "heading" ) {
					// if (item.role == "heading" && item.dataset.level > node.
					//  method.call(this, node);
				}
			}
		},
		extend$actions: {
			command(event) {
				let cmd = this.shortcuts[event.shortcut];
				if (cmd) {
					console.log(cmd);
					event.subject = cmd;
					this.owner.sense(event.target.$peer, event);
				}
			},
			split(event) {
			},
			demote(event) {
				event.subject = "";
				let target = this.target;
				let level = target.dataset.level * 1 + 1 || 1;
				if (target.classList.contains("section")) {
					if (level > 3) {
						target.classList.remove("section");
						target.classList.add("line");
						level = 0;
					} else {
						let section = this.getSection(target.previousSibling);
						let sectionLevel = section && section.dataset.level * 1 + 1 || 1;
						if (level > sectionLevel) {
							level = sectionLevel;
						}
					}
				} else if (target.classList.contains("line")) {
					level = target.dataset.level * 1 + 1;
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
					let section = this.getSection(target);
					level = section && section.dataset.level * 1 + 1 || 1;
					target.classList.remove("line");
					target.classList.add("section");
				}
				target.dataset.level = level;
			}
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