const START_FRAGMENT = "<!--StartFragment-->";
const END_FRAGMENT = "<!--EndFragment-->";

export default {
	Editable: {
		type$: "Widget",
		extend$signal: {
			KeyDown: keyDown,
			Enter: stop,
			Character: stop,
			Erase: stop,
			Join: stop,
			Insert: stop,
			Cut: stop,
			Copy: stop,
			Paste: stop,
			Cut: function(signal) {
				this.setClipboard(signal);
				signal.markup = "";
				this.replaceSelection(signal);			
				signal.stop();
			},
			Copy: function(signal) {
				this.setClipboard(signal);
				signal.stop();
			},
			Paste: function(signal) {
				if (signal.on.pasteSpecial) signal.contentType = "text";
				signal.markup = this.getClipboard(signal);
				this.replaceSelection(signal);
				signal.stop();
			},
			Delete: function(signal) {
				signal.markup = "";
				this.replaceSelection(signal);			
				signal.stop();
			},
		},
		replaceSelection: function(signal) {
			let range = signal.selection;
			if (range.atStart && range.atEnd) {
				range.selectNodeContents(range.container);
				if (!signal.markup) signal.markup = "<BR>";
			}
			range.replace(signal.markup);
		},
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
	},
	Value: {
		type$: "Editable",
		spellCheck: true,
		focusable: true,
		ref$partOf: "Member.partOf",
		ref$display: "Member.display",
		ref$model: "Member.model",
		setClipboard: function (signal) {
			let cb = signal.clipboardData;
			let range = signal.selection;
			let data = range.textContent;
			data && cb.setData("text/plain", data);	
		},
		extend$signal: {
			Character: function(signal) {
				signal.stop(true);
			},
			Erase: function(signal) {
				signal.stop(true);	
			},
			Paste: function(signal) {
				//Propagate the Event to the container when a structure is in the clipboard.
				if (!signal.on.pasteSpecial && signal.clipboardData.getData("application/json")) return;
		
				signal.contentType = "text";
				signal.markup = this.getClipboard(signal);
				this.replaceSelection(signal);
				signal.stop();
			},
			SelectionChange: function(signal) {
				signal.on.focus();
			}
		}
	},
	Lookup: {
		type$: "Value",
		spellCheck: false,
		extend$shortcuts: {
			"ArrowUp": "NavItems",
			"ArrowDown": "NavItems",
		},
		ref$lookup: "Parcel",
		getPopup: function(view) {
			if (!view.popup) {
				view.popup = this.sys.LookupItems.render(view.owner.content.popups, this.lookup);
			}
			view.popup.anchor = view;
			return view.popup;
		},
		extend$signal: {
			Input: function(signal) {
				signal.event("Filter").send(this.getPopup(signal.on));
			},
			NavItems: function(signal) {
				signal.isUp = signal.key == "ArrowUp" ? true : false;
				signal.event("Navigate").send(this.getPopup(signal.on));
				signal.stop();
			},
			Enter: function(signal) {
				signal.stop();
				let popup = this.getPopup(signal.on);
				let item = popup.querySelector(".selected");
				if (item) {
					signal.on.xref = item.model;
					let range = signal.on.range.replace(item.markupContent);
					range.collapse();
					range.select();
					signal.on.focus();
				}
			},
			FocusOut: function(signal) {
				if (signal.explicitOriginalTarget.parentNode.isa("item")) {
					let range = signal.on.range;
					range = range.replace(signal.explicitOriginalTarget.textContent.markup);
				}
				this.sys.Signal.event("Hide").send(signal.on.popup);
			},
			Resize: function(signal) {
				if (signal.on.popup && !signal.on.popup.isa("hidden")) {
					this.sys.Signal.message("Show").send(signal.on.popup);
				}
			}
		}
	},
	Editor: {
		type$: "Editable",
		spellCheck: true,
		extend$sensors: {
			Input: "selectionEvent",
			Cut: "selectionEvent",
			Copy: "selectionEvent",
			Paste: "selectionEvent",
			KeyDown: "selectionEvent",
			KeyUp: "selectionEvent",
		}
	}
};

function keyDown(signal) {
	if (signal.character) return signal.event("Character");

	let range = signal.selection || signal.on.owner.selection;
	let selector = "";
	switch (signal.key) {
		case "Enter":
			selector = (signal.shiftKey ? "Insert" : "Enter");
			break;
		case "Insert": {
			if (signal.shiftKey) {
				/* Shift+Insert is an alternate binding to Paste, on Windows at least.
				 * We use this fact to signal an alternate *trusted* paste via whenPaste.
				 */
				signal.on.pasteSpecial = true;
				signal.stop(true);
				return;
			}
			selector = signal.edit;
			break;
		}
		case "Delete":
			selector = range.collapsed ? "Erase" : "Delete";
			if (range.collapsed
					//TODO review and tighten rule for <BR> checking.
					&& (range.endContainer.nodeType != Node.TEXT_NODE 
					|| range.endOffset >= range.endContainer.count)) {
				selector = "Join";
				signal.first = signal.on;
				signal.second = signal.on.nextSibling;
			}
			break;
		case "Backspace":
			selector = range.collapsed ? "Erase" : "Delete";
			if (range.collapsed && range.atStart) {
				selector = "Join";
				signal.first = signal.on.previousSibling;
				signal.second = signal.on;
			}
			break;
		default:
			selector = this.shortcuts[signal.shortcut];
			if (!selector) return;
			break;
	}
	return signal.event(selector);
}

function stop(signal) {
	signal.stop();
}

function deleteRow(signal) {
	let range = signal.selection;
	if (!range.collapsed) return;
	signal.stop();
	let row = range.container.getContainerOf("record");
	if (!row) return;
	range.setStartBefore(row.previousSibling);
	range.setEndAfter(row);
	range = range.replace("");
	positionForEdit.call(range, true);
}
