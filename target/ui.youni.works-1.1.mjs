import system from "./system.youni.works-2.1.mjs";
import base from "./base.youni.works-1.2.mjs";
import compiler from "./compiler.youni.works-1.0.mjs";
const module = {
	"name": "ui.youni.works",
	"version": "1.1",
	"moduleType": "library"
};
module.use = {
	system: system,
	base: base,
	compiler: compiler
}
module.package = {
	display: display(),
	editors: editors(),
	gdr: gdr(),
	note: note(),
	panel: panel(),
	pen: pen(),
	range: range(),
	record: record(),
	shape: shape(),
	table: table(),
	tabs: tabs(),
	tree: tree()
}
const conf = undefined;
const main = function main_loadModule(module) {
			return module.use.system.load(module);
		};
export default main(module, conf);
function display() {
	const pkg = {
	"type$": "/base/dom",
	"Display": {
		"type$": "/display/Element",
		"type$owner": "/display/Frame",
		"nodeName": "div",
		"display": "",
		"get$style": function get$style() {
			return this.peer.style;
		},
		"get$styles": function get$styles() {
			return this.peer.classList;
		},
		"get$box": function get$box() {
			return this.peer.getBoundingClientRect();;
		},
		"size": function size(width, height) {
			this.style.width = Math.max(width, 16) + "px";
			this.style.minWidth = this.style.width;
			this.style.height = Math.max(height, 16) + "px";
			this.style.minHeight = this.style.height;
		},
		"moveTo": function moveTo(x, y) {
			this.style.position = "absolute";			
			this.style.left = x + "px";
			this.style.top = y + "px";
		},
		"createPart": function createPart(key, type) {
			let part = this.super(createPart, key, type);
			if (this.members) part.styles.add(key);
			return part;
		},
		"start": function start(conf) {
			this.super(start, conf);
			if (this.display) this.styles.add(this.display);
			this.styles.add(this.className);
		}
	},
	"Caption": {
		"type$": "/display/Display",
		"view": function view(model) {
			this.markup = this.conf.caption;
		}
	},
	"Pane": {
		"type$": "/display/Display",
		"members": {
			"type$header": "/display/Caption",
			"type$body": "/display/Display"
		}
	},
	"App": {
		"type$": ["/display/Component", "/display/Receiver", "/base/origin/Origin"],
		"start": function start() {
            console.log("Starting application", this[Symbol.for("owner")]);
            let conf = this.conf;
            this.define(this.frame, "app", this);
            this.frame.start(this.conf);
        }
	},
	"Frame": {
		"type$": ["/display/Display", "/display/Document"],
		"type$app": "/display/App",
		"$window": null,
		"get$owner": function get$owner() {
			return this;
		},
		"get$document": function get$document() {
			return this.$window.document;
		},
		"get$activeElement": function get$activeElement() {
			return this.document.activeElement;
		},
		"get$selectionRange": function get$selectionRange() {
			let selection = this.$window.getSelection();
			if (selection && selection.rangeCount) {
				return selection.getRangeAt(0);
			}
			return this.document.createRange();
		},
		"create": function create(type, conf) {
			let display = this.app.create(type);
			this.app.define(display, "owner", this, "const");
			display.start(conf);
			display.styles.add(display.className);
			return display;
		},
		"createView": function createView(conf) {
			let view = this.create(conf.type, conf);
			view.model = {};
			this.append(view);
			this.send("view");
		},
		"createStyle": function createStyle(selector, object) {
			let out = selector + " {";
			if (object) for (let name in object) {
				out += name + ":" + object[name] + ";"
			}
			out += "}";
			let index = this.document.$styles.insertRule(out);
			return this.document.$styles.cssRules[index];
		},
		"toPixels": function toPixels(measure) {
			let node = this.createNode("div");
			node.style.height = measure;
			this.peer.appendChild(node);
			let px = node.getBoundingClientRect().height;
			node.parentNode.removeChild(node);
			return px;
			//console.log(this.toPixels("1mm"), this.toPixels("1pt"), this.toPixels("1in"));

		},
		"start": function start(conf) {
			this.let("$window", conf.window);
			this.document.body.$peer = this;
			let ele = this.document.createElement("style");
			ele.type = "text/css";
			this.document.head.appendChild(ele);
			this.document.$styles = ele.sheet;

			for (let name in conf.events) {
				let listener = conf.events[name];
				this.$window.addEventListener(name, listener);
			}
			this.let("main", this.createView(this.main));
		},
		"viewOf": function viewOf(node) {
			while(node) {
				if (node.$peer) return node.$peer;
				node = node.parentNode;
			}
		},
		"viewAt": function viewAt(x, y) {
			let target = this.$window.document.elementFromPoint(x, y);
			return this.viewOf(target);
		},
		"link": function link(attrs) {
			let node = this.createElement("link");
			for (let attr in attrs) {
				node.setAttribute(attr, attrs[attr]);
			}
			this.document.head.append(node);
			return node;
		}
	}
}
return pkg;
}

function editors() {
	const pkg = {
	"type$": "/display",
	"Editor": {
		"type$": "/editors/Display",
		"dataType": ""
	},
	"Input": {
		"type$": "/editors/Editor",
		"nodeName": "input",
		"get$inputType": function get$inputType() {
			return this.dataType;
		},
		"view": function view(data) {
			this.super(view, data);
			this.peer.type = this.inputType;
			this.peer.value = data;
			if (this.conf.readOnly) this.peer.setAttribute("disabled", true);
		}
	},
	"Number": {
		"type$": "/editors/Input",
		"dataType": "number"
	},
	"Boolean": {
		"type$": "/editors/Input",
		"dataType": "checkbox"
	},
	"Date": {
		"type$": "/editors/Input",
		"dataType": "date"
	},
	"Datetime": {
		"type$": "/editors/Date",
		"inputType": "datetime"
	},
	"Color": {
		"type$": "/editors/Input",
		"dataType": "string",
		"inputType": "color"
	},
	"Password": {
		"type$": "/editors/Input",
		"dataType": "string",
		"inputType": "password"
	},
	"String": {
		"type$": "/editors/Editor",
		"dataType": "string",
		"view": function view(value) {
			this.super(view, value);
			this.markup = value;
			this.peer.contentEditable = this.conf.readOnly ? false : true;
		}
	},
	"Collection": {
		"type$": "/editors/Editor",
		"dataType": "object",
		"view": function view(value) {
			this.model = data;
			this.textContent = "...";
		}
	},
	"Object": {
		"type$": "/editors/Editor",
		"dataType": "object",
		"view": function view(value) {
			this.model = data;
			this.textContent = "...";
		}
	},
	"LinkNav": {
		"type$": "/editors/Display",
		"nodeName": "img",
		"view": function view(data) {
			this.model = data;
			this.peer.src = "/res/link.svg";
			this.peer.tabIndex = 1;
		},
		"extend$actions": {
			"click": function click(event) {
				event.subject = "navigate";
			},
			"keydown": function keydown(event) {
				if (event.key == "Enter" || event.key == " ") event.subject = "navigate";
			}
		}
	},
	"Link": {
		"type$": "/editors/Editor",
		"members": {
			"type$editor": "/editors/String",
			"type$button": "/editors/LinkNav"
		},
		"extend$conf": {
			"linkControl": {
				"type$": ["/editors/Pane", "/shape/Shape"]
			}
		},
		"get$link": function get$link() {
			return this.conf.dataSource.data[this.conf.dataset][this.model];
		},
		"extend$actions": {
			"navigate": function navigate(event) {
				if (!this.pane) {
					let members = this.conf.dataSource.views[this.conf.objectType];
					let model = this.link;

					this.pane = this.owner.create(this.conf.linkControl, {
						members: members
					});	
					this.pane.view(model);
					this.owner.send(this.pane, "view");
				}
				if (!this.pane.peer.parentNode) {
					this.owner.append(this.pane);
				}
				let b = this.box;
				this.pane.bounds = {
					left: b.left,
					top: b.bottom,
					width: 100,
					height: 150
				};
			}
		}
	}
}
return pkg;
}

function gdr() {
	const pkg = {
	"$public": {
		"click": function click(event) {
            pkg.sense(event);
        },
		"dblclick": function dblclick(event) {
            pkg.sense(event);
        },
		"keydown": function keydown(event) {
            let shortcut = pkg.getShortcut(event);
            if (shortcut) {
                console.log(shortcut);
                event.subject = "command";
                event.shortcut = shortcut;
            } else {
                console.log(event.key);
                event.subject = "charpress";
                event.character = event.key;
            }
            pkg.sense(event);
        },
		"mousedown": function mousedown(event) {
            event.subject = "grab";
            pkg.sense(event);
            if (event.track) {
//                event.preventDefault();
                pkg.TRACK = event;
            } else {
                pkg.TRACK = null;
            }
        },
		"mousemove": function mousemove(event) {
            let priorEvent = pkg.TRACK;
            if (priorEvent) {
                event.preventDefault();
                event.subject = "drag";
                event.track = priorEvent.track;
                event.moveX = event.x - priorEvent.x;
                event.moveY = event.y - priorEvent.y;
                event.track.send(event);
                pkg.TRACK = event;
                return;
            } else {
                event.subject = "moveover";
                pkg.sense(event);
            }
        },
		"mouseout": function mouseout(event) {
            event.subject = "moveout";
            pkg.sense(event);
        },
		"mouseup": function mouseup(event) {
            let priorEvent = pkg.TRACK;
            if (priorEvent) {
                event.preventDefault();
                event.subject = "release"
                event.track = priorEvent.track;
                event.moveX = 0;
                event.moveY = 0;
                event.track.send(event);
                pkg.TRACK = null;
                return;
            }
        }
	},
	"TRACK": null,
	"getShortcut": function getShortcut(event) {
        let mod = "";
        let key = event.key;
        if (key == " ") key = "Space";
        if (key == "Meta") key = "Control"; // Apple
        if (event.ctrlKey || event.metaKey) mod += "Control+";
        if (event.altKey) mod += "Alt+";
        if (event.shiftKey && (mod || key.length > 1)) mod += "Shift+";
        if (key == "Control" || key == "Alt" || key == "Shift") return mod.substring(0, mod.length - 1);
        if (!mod && key.length == 1) return;
        return mod + key;
    },
	"getControl": function getControl(node) {
		while(node) {
			if (node.$peer) return node.$peer;
			node = node.parentNode;
		}
	},
	"sense": function sense(event) {
		let ctl = pkg.getControl(event.target);
        if (ctl) {
            event.stopPropagation();
            if (!event.subject) event.subject = event.type;
            ctl.sense(event);
            if (!event.subject) event.preventDefault();    
        }
	}
}
return pkg;
}

function note() {
	const pkg = {
	"type$": "/display",
	"Commandable": {
		"shortcuts": {
		},
		"extend$actions": {
			"command": function command(event) {
				let cmd = this.shortcuts[event.shortcut];
				if (cmd) {
					event.subject = cmd;
					event.target.$peer.sense(event);
				}
			}
		}
	},
	"Note": {
		"type$": ["/note/Display", "/note/Commandable"],
		"shortcuts": {
			"Enter": "split",
			"Backspace": "erase",
			"Delete": "erase",
			"Tab": "demote",
			"Shift+Tab": "promote",
			"Control+s": "save"
		},
		"view": function view(value) {
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
		"toHtml": function toHtml(view) {
			let sections = [];
			for (let node of view.to) {
			
			}
		},
		"toObject": function toObject(view) {
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
		"toView": function toView(value, level) {
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
		"valueType": function valueType(value) {
			if (value && typeof value == "object") {
				return value[Symbol.iterator] ? "array" : "object";
			} else {
				return "string";
			}
		},
		"get$target": function get$target() {
			return this.getItem(this.owner.selectionRange.commonAncestorContainer);
		},
		"getLevel": function getLevel(view) {
			if (view.nodeType == Node.TEXT_NODE) view = view.parentNode;
			return view.dataset.level * 1 || 0;
		},
		"getSection": function getSection(node) {
			node = this.getItem(node)
			while (node) {
				if (node.classList && node.classList.contains("section")) return node;
				node = node.previousSibling;
			}
		},
		"getItem": function getItem(node) {
			while (node) {
				if (node.dataset) return node;
				node = node.parentNode;
			}
		},
		"setLevel": function setLevel(view, level) {
			if (view.nodeType == Node.TEXT_NODE) view = view.parentNode;
			view.dataset.level = level;
		},
		"extend$actions": {
			"command": function command(event) {
				let cmd = this.shortcuts[event.shortcut];
				if (cmd) {
					console.log(cmd);
					event.subject = cmd;
					event.target.$peer.sense(event);
				}
			},
			"copy": function copy(event) {
				console.log("copy", event);
			},
			"save": function save(event) {
				event.subject = "";
				console.log(this.toObject(this.peer));
			},
			"split": function split(event) {
			},
			"charpress": function charpress(event) {
				if (event.key == "{") {
					console.log("insert block");
				}
			},
			"demote": function demote(event) {
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
			"promote": function promote(event) {
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
	"Clipboard": {
		"setClipboard": function (signal) {
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
		"getClipboard": function(signal) {
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
		"markupJSON": function(signal) {
			let view = this.createView(signal.on);
			let model = JSON.parse(signal.data);
			this.view(view, model);
			return view.markupContent;
		},
		"markupHTML": function(signal) {
			let data = signal.data;
			let start = data.indexOf(START_FRAGMENT) + START_FRAGMENT.length;
			let end = data.indexOf(END_FRAGMENT);
			data = data.substring(start, end);
			signal.data = signal.on.owner.create("div", "hidden", data);
			return this.markupElement(signal);
		},
		"markupElement": function(signal) {
			return signal.data.textContent.markup;
		},
		"markupText": function(signal) {
			return signal.data.markup;
		},
		"markupOther": function(signal) {
			return "";
		}
	}
}
return pkg;
}

function panel() {
	const pkg = {
	"type$": "/display",
	"Section": {
		"type$": "/panel/Display",
		"var$collapsed": "false",
		"members": {
			"type$header": "/panel/Display",
			"type$body": "/panel/Display",
			"type$footer": "/panel/Display"
		},
		"size": function size(x, y) {
			const body = this.at("body");
			for (let node of this.to) {
				if (node != body) y -= node.bounds.height;
			}
			this.style.minWidth = x + "px";
			body.style.minHeight = y + "px";
			this.style.maxWidth = x + "px";
			body.style.maxHeight = y + "px";
		},
		"extend$actions": {
			"collapse": function collapse(event) {
				if (this.collapsed === "false") {
					this.at("body").style.display = "none";
					this.collapsed = "true";
				}
			},
			"expand": function expand(event) {
				if (this.collapsed === "true") {
					this.at("body").style.removeProperty("display");
					this.collapsed = "false";
				}
			},
			"click": function click(event) {
				if (event.target == this.at("header").peer) {
					this.receive(this.collapsed === "true" ? "expand" : "collapse");
				}
			}
		}
	},
	"Panel": {
		"type$": "/panel/Section",
		"view": function view(data) {
			this.at("header").peer.textContent = "Header";
			this.at("body").peer.textContent = "Body";
		}
	}
}
return pkg;
}

function pen() {
	const pkg = {
	"Box": {
		"top": 0,
		"right": 0,
		"bottom": 0,
		"left": 0
	},
	"C": {
		"rx": 0
	},
	"XXX": {
		"var$markup": "",
		"draw": function draw() {
			this.markup = "";
		},
		"get$top": function get$top() {
			return this.y;
		},
		"get$right": function get$right() {
			return this.x + this.width;
		},
		"get$bottom": function get$bottom() {
			return this.y + this.height;
		},
		"get$left": function get$left() {
			return this.x;
		}
	},
	"Circle": {
		"var$x": 0,
		"var$y": 0,
		"var$r": 0,
		"get$markup": function get$markup() {
			return `<circle cx="${this.x}" cy="${this.y}" r="${this.r}"/>`
		}
	},
	"Rect": {
		"var$x": 0,
		"var$y": 0,
		"var$width": 0,
		"var$height": 0,
		"get$markup": function get$markup() {
			return `<rect x="${this.x}" y="${this.y}" width="${this.width}" height="${this.height}"/>`
		}
	},
	"Ellipse": {
		"type$": "/pen/Rect",
		"var$x": 0,
		"var$y": 0,
		"var$width": 0,
		"var$height": 0,
		"get$markup": function get$markup() {
			let rx = this.width / 2;
			let ry = this.height / 2;
			let x = this.x + rx;
			let y = this.y + ry;
			return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`
		}
	},
	"Path": {
		"var$path": "",
		"get$markup": function get$markup() {
			this.draw();
			return `<path d="${this.path}"/>`
		},
		"mv": function mv(x, y) {
			this.path += `M${x},${y} `;
		},
		"ln": function ln(x, y) {
			this.path += `L${x},${y} `;
		},
		"v": function v(x, y) {
			this.path += `l${x},${y} `;
		},
		"c": function c(cx, cy, x, y) {
			this.path += `Q${cx},${cy} ${x},${y} `;
		}
	},
	"Shape": {
		"type$": ["/display/Display", "/shape/Shape"],
		"namespace": "http://www.w3.org/2000/svg",
		"get$image": function get$image() {
			for (let node = this.peer; node; node = node.parentNode) {
				if (node.nodeName == "svg") return node.$peer;
			}
		}
	},
	"Point": {
		"type$": ["/pen/Shape", "/pen/Circle"],
		"nodeName": "circle",
		"get$next": function get$next() {
			let p;
			for (let point of this.vector.points) {
				if (p == this) return point;
				p = point;
			}
		},
		"get$index": function get$index() {
			let i = 0;
			for (let point of this.vector.points) {
				if (point == this) return i;
				i++;
			}
		},
		"toString": function toString() {
			return this.cmd + " " + this.get("cx") + " " + this.get("cy") + " ";
		},
		"var$vector": null,
		"virtual$cmd": function virtual$cmd() {
			if (arguments.length == 0) return this.peer.dataset.cmd;
			this.peer.dataset.cmd = arguments[0];
		},
		"at": {
			"r": 3
		},
		"virtual$x": function virtual$x() {
			if (!arguments.length) return this.get("cx");
			this.set("cx", arguments[0]);
		},
		"virtual$y": function virtual$y() {
			if (!arguments.length) return this.get("cy");
			this.set("cy", arguments[0]);
		},
		"extend$actions": {
			"grab": function grab(event) {
				event.track = this;
				event.preventDefault();
			},
			"drag": function drag(event) {
				let b = this.image.bounds;
				this.x = (event.x - b.left) / b.width * 320;
				this.y = (event.y - b.top) / b.height * 320;
				this.vector.view();
			},
			"release": function release(event) {
				if (event.ctrlKey) return;
				let b = this.image.bounds;
				this.x = Math.round((event.x - b.left) / b.width * 32) * 10;
				this.y = Math.round((event.y - b.top) / b.height * 32) * 10;
				this.vector.view();
			},
			"dblclick": function dblclick(event) {
				event.subject = "";
				let next = this.next;
				if (!next) return;

				if (!this.cmd) this.cmd = "";
				console.log("cmd:", this.cmd, "next:", next.cmd);

				if (this.cmd == "L" && next.cmd == "L") {
					this.cmd = "Q";
					next.cmd = "";
				} else if (this.cmd == "Q") {
					this.cmd = "S";
				} else if (this.cmd == "S") {
					this.cmd = "L";
					next.cmd = "L";
				}
				this.vector.view();
			}
		}
	},
	"Vector": {
		"type$": "/pen/Shape",
		"nodeName": "path",
		"var$points": null,
		"view": function view() {
			this.super(view);
			let path = "";
			if (this.points) for (let point of this.points) {
				path += point.toString();
			}
			this.set("d", path + "z");
		},
		"add": function add(x, y, type) {
			let point = this.owner.create("/ui/pen/Point");
			this.image.append(point);
			point.vector = this;
			if (!this.points) {
				this.points = [point];
				point.cmd = "M";
			} else {
				point.cmd = type || "L";
				
				this.points.push(point);
			}
			point.x = x;
			point.y = y;
			point.view();
			this.view();
			return point;
		},
		"extend$actions": {
			"moveover": function moveover(event) {
			}
		}
	},
	"Image": {
		"type$": "/pen/Shape",
		"nodeName": "svg",
		"at": {
			"class": "icon",
			"viewBox": "0 0 320 320"
		},
		"type$grid": "/pen/Grid",
		"view": function view() {
			let grid = this[Symbol.for("owner")].create(this.grid);
			this.peer.innerHTML = grid.markup;
			this.vector = this.owner.create("/ui/pen/Vector");
			this.append(this.vector);
			this.set("tabindex", 1);
			this.peer.focus();
		},
		"var$points": null,
		"var$vector": "",
		"extend$actions": {
			"dblclick": function dblclick(event) {
				this.peer.focus();
				let b = this.bounds;
				let x = Math.round((event.x - b.left) / b.width * 32) * 10;
				let y = Math.round((event.y - b.top) / b.height * 32) * 10;
				this.vector.add(x, y, event.shiftKey ? "Q" : undefined);
			},
			"click": function click(event) {
				this.peer.focus();
			},
			"command": function command(event) {
				console.log("image: ", event.shortcut);
			}
		}
	},
	"Grid": {
		"type$": "/pen/Path",
		"draw": function draw() {
			for (let y = 0; y <= 320; y += 10) {
				this.mv(0, y);
				this.ln(320, y);
			}
			for (let x = 0; x <= 320; x += 10) {
				this.mv(x, 0);
				this.ln(x, 320);
			}
		}
	},
	"Canvas": {
		"type$": "/display/Display",
		"var$shape": null,
		"view": function view(model) {
			this.super(view, model);
			this.shape = this.owner.create("/ui/pen/Image");
			this.append(this.shape);
		}
	}
}
return pkg;
}

function range() {
	const pkg = {
	"Range": {
		"get$container": function get$container() {
			let target = this.commonAncestorContainer;
			while (target && target.nodeType != Node.ELEMENT_NODE) target = target.parentNode;
			return target;         
		},
		"get$textContainer": function() {
			let node = this.commonAncestorContainer;
			return node.nodeType == Node.TEXT_NODE ? node : null;
		},
		"get$content": function() {
			return this.cloneContents().childNodes;
		},
		"get$textContent": function() {
			return pkg.text(this.content);
		},
		"get$markup": function() {
			return pkg.markup(this.content);
		},
		"select": function select() {
			//Note: 'window' is the argument in the enclosing fill function:
			let selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(this);
		},
		"replace": function(markup) {
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
	"markup": function markup(nodes) {
		let markup = "";
		for (let i = 0; i < nodes.length; i++) {
			let node = nodes[i];
			markup += node.markup;
		}
		return markup;
	},
	"text": function text(nodes) {
		let txt = "";
		for (let i = 0, length = nodes.length; i < length; i++) {
			let node = nodes[i];
			let content = node.nodeType == Node.ELEMENT_NODE && text(node.content) || node.textContent;
			if (txt && !txt.endsWith(" ") && content && !(content.startsWith(" "))) txt += " ";
			txt += content;
		}
		return txt;	
	},
	"outerMarkup": function outerMarkup() {
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
return pkg;
}

function record() {
	const pkg = {
	"type$": "/display",
	"Record": {
		"type$": "/record/Display",
		"type$typing": "/util/Typing",
		"isDynamic": false,
		"view": function view(model) {
			this.super(view, model);
			if (this.isDynamic) this.bindDynamic();
		},
		"bindDynamic": function bindDynamic() {
			let props = Object.create(null);
			for (let name in this.model) {
				if (!this.members[name]) {
					props[name] = this.typing.propertyOf(name, this.model[name]);
				}
			}
			this.properties = props;
			this.forEach(props, this.createContent);
		},
		"start": function start(conf) {
			if (!this.members && conf.members) {
				this.let("members", conf.members);
			}
			this.super(start, conf);
		}
	},
	"Member": {
		"type$": "/record/Display",
		"type$textUtil": "/base/util/Text",
		"get$name": function get$name() {
			return this.conf.name;
		},
		"getCaption": function getCaption() {
			return this.conf.caption || this.textUtil.captionize(this.conf.name || "");
		}
	},
	"Property": {
		"type$": "/record/Member",
		"type$textUtil": "/base/util/Text",
		"getCaption": function getCaption() {
			return this.conf.caption || this.textUtil.captionize(this.conf.name || "");
		},
		"get$contentType": function get$contentType() {
			return this.owner.editors[this.conf.inputType || this.conf.dataType] || this.owner.editors.string;
		},
		"view": function view(model) {
			this.super(view, model);
			let editor = this.owner.create(this.contentType, this.conf);
			this.append(editor);
		},
		"modelFor": function modelFor(key) {
			return this.model && this.model[this.conf.name] || "";
		}
	}
}
return pkg;
}

function shape() {
	const pkg = {
	"Zoned": {
		"zones": {
			"border": {
				"top": 0,
				"right": 0,
				"bottom": 0,
				"left": 0
			},
			"cursor": {
				"TL": "",
				"TC": "",
				"TR": "",
				"CL": "",
				"CC": "",
				"CR": "",
				"BL": "",
				"BC": "",
				"BR": ""
			},
			"subject": {
				"TL": "",
				"TC": "",
				"TR": "",
				"CL": "",
				"CC": "",
				"CR": "",
				"BL": "",
				"BC": "",
				"BR": ""
			}
		},
		"getZone": function getZone(x, y) {
			let rect = this.peer.getBoundingClientRect();
			x -= rect.x;
			y -= rect.y;

			let border = this.zones.border;
			let zone;

			if (y <= border.top) {
				zone = "T";
			} else if (y >= rect.height - border.bottom) {
				zone = "B";
			} else {
				zone = "C";
			}
			if (x <= border.left) {
				zone += "L";
			} else if (x >= rect.width - border.right) {
				zone += "R";
			} else {
				zone += "C";
			}
			return zone;
		}
	},
	"Shape": {
		"type$": "/shape/Zoned",
		"extend$conf": {
			"minWidth": 16,
			"minHeight": 16
		},
		"virtual$bounds": function virtual$bounds() {
			if (arguments.length) {
				let rect = arguments[0];
				if (rect.width !== undefined) {
					this.style.width = Math.max(rect.width, this.conf.minWidth) + "px";
					this.style.minWidth = this.style.width;
				}
				if (rect.height !== undefined) {
					this.style.height = Math.max(rect.height, this.conf.minHeight) + "px";
					this.style.minHeight = this.style.height;
				} 	
				if (rect.left !== undefined || rect.top !== undefined) this.style.position = "absolute";
				if (rect.left !== undefined) this.style.left = rect.left + "px";
				if (rect.top !== undefined) this.style.top = rect.top + "px";
			} else {
				return this.peer.getBoundingClientRect();
			}
		},
		"size": function size(w, y) {
		},
		"get$shape": function get$shape(){
			return this;
		},
		"extend$actions": {
			"grab": function grab(event) {
				if (event.track && event.track != this) return;
				let zone = this.getZone(event.clientX, event.clientY);
				let subject = this.zones.subject[zone] || "";
				if (!subject) return;
				this.style.cursor = this.zones.cursor[zone];
				let b = this.bounds;
				this.peer.$tracking = {
					subject: subject,
					cursor: this.style.cursor,
					insideX: event.x - b.left,
					insideY: event.y - b.top
				}
				event.track = this;
			//	event.subject = "";
			},
			"drag": function drag(event) {
				event.subject = this.peer.$tracking.subject;
				this.receive(event)
			},
			"release": function release(event) {
				delete this.peer.$tracking;
                this.owner.style.removeProperty("cursor");
			},
			"position": function position(event) {
				if (event.track == this) {
					this.bounds = {
						left: event.x - this.peer.$tracking.insideX,
						top: event.y - this.peer.$tracking.insideY
					}
				}
			},
			"size": function size(event) {
				if (event.track == this) {
					let r = this.shape.peer.getBoundingClientRect();
					this.shape.size(event.clientX - r.left, event.clientY - r.top);
				}
			},
			"moveover": function moveover(event) {
				event.zone = this.getZone(event.clientX, event.clientY);
				let cursor = this.zones.cursor[event.zone];
				if (cursor) {
					this.style.cursor = cursor;
				} else {
					this.style.removeProperty("cursor");
				}
			}
		}
	},
	"type$Display": "/display/Display",
	"Pane": {
		"type$": ["/shape/Display", "/shape/Shape"],
		"var$shape": null,
		"extend$conf": {
			"zone": {
				"border": {
					"top": 0,
					"right": 8,
					"bottom": 12,
					"left": 0
				},
				"cursor": {
					"BC": "move",
					"BR": "nwse-resize"
				},
				"subject": {
					"BC": "position",
					"BR": "size"
				}
			}
		},
		"get$contentType": function get$contentType() {
			return this.conf.contentType;
		},
		"get$elementConf": function get$elementConf() {
			return this.conf;
		},
		"view": function view(data) {
			this.super(view, data);
			let type = this.contentType;
			let conf = this.elementConf;
			this.shape = this.owner.create(type, conf);
			this.append(this.shape);
		}
	}
}
return pkg;
}

function table() {
	const pkg = {
	"type$": "/display",
	"Key": {
		"type$": "/table/Display",
		"view": function view() {
			this.peer.title = this.of.key || "";
		}
	},
	"Value": {
		"type$": "/table/Display",
		"view": function view(model) {
			this.markup = model;
		}
	},
	"Cell": {
		"type$": "/table/Pane",
		"members": {
			"type$header": "/table/Caption",
			"type$body": "/table/Value"
		},
		"extend$conf": {
			"cellHeader": true,
			"cellBody": true
		},
		"modelFor": function modelFor(key) {
			return this.model && this.model[this.key] || "";
		},
		"start": function start(conf) {
			this.super(start, conf);
			conf = this.conf;
			let members = this.members;
			this.let("members", Object.create(null));
			if (conf.cellHeader) {
				this.members.header = members.header;
			}
			if (conf.cellBody) {
				let editors = this.owner.editors;
				let editor = editors[conf.inputType || conf.dataType] || editors.string
				this.members.body = editor;
			}
		}
	},
	"Record": {
		"type$": "/table/Display",
		"display": "h",
		"start": function start(conf) {
			this.super(start, conf);
			if (!this.members && conf.record) {
				this.let("members", conf.record);
			}
		}
	},
	"Row": {
		"type$": "/table/Pane",
		"display": "h",
		"members": {
			"type$header": "/table/Display",
			"type$body": "/table/Record"
		}
	},
	"Collection": {
		"type$": "/table/Display",
		"display": "v",
		"contentType": {
			"type$": "/table/Row",
			"members": {
				"type$header": "/table/Key",
				"type$body": "/table/Record"
			},
			"extend$conf": {
				"cellHeader": false
			}
		}
	},
	"Table": {
		"type$": "/table/Pane",
		"display": "v",
		"members": {
			"header": {
				"type$": "/table/Row",
				"extend$conf": {
					"cellBody": false
				}
			},
			"body": {
				"type$": "/table/Collection"
			},
			"footer": {
				"type$": "/table/Row",
				"extend$conf": {
					"cellHeader": false,
					"cellBody": false
				}
			}
		},
		"view": function view(model) {
			if (model === undefined && this.conf.dataSource) {
				model = this.conf.dataSource.data[this.conf.data.set];
			}
			this.super(view, model);
		},
		"start": function start(conf) {
			this.super(start, conf);
			if (!this.conf.dataSource && this.conf.data) {
				this.conf.dataSource = this.owner.app.data[this.conf.data.source];
				this.createRecord(this.conf.dataSource.views[this.conf.data.view]);
			}
		},
		"createRecord": function createRecord(record) {
			let owner = this.owner;
			let tableId = "I" + owner.createId();
			for (let name in record) {
				let member = record[name];
				member.rule = createRule(name, member.conf);
			}
			this.peer.id = tableId;
			this.conf.record = record;

			function createRule(name, conf) {
				let width = conf.columnSize * 1 || 4;
				return owner.createStyle(`#${tableId} .${name}`, {
					"flex": (conf.flex === false ? "0 0 " : "1 1 ") + width + "cm",
					"min-width": width / 4 + "cm"
				});
			}	
		}
	}
}
return pkg;
}

function tabs() {
	const pkg = {
	"type$": "/panel",
	"Tabs": {
		"type$": "/tabs/Section",
		"extend$conf": {
			"tabType": "/ui/tabs/Tab",
			"viewType": "/ui/display/Display",
			"icon": "/res/icons/bag.svg"
		},
		"var$activeTab": null,
		"members": {
			"header": {
				"type$": "/tabs/Display"
			},
			"body": {
				"type$": "/tabs/Display"
			}
		},
		"add": function add(conf, body) {
            if (!body) {
                body = conf.body || this.conf.viewType;
                body = this.owner.create(body);
                //body.peer.textContent = conf.title;
            }
            body.peer.$display = body.style.display;
            body.style.display = "none";
            let tab = this.owner.create(this.conf.tabType);
            let icon = conf.icon || this.conf.icon;
            let title = conf.title;
            tab.peer.innerHTML = `<img src=${icon}><span>${title}</span>`;
            tab.body = body;
            this.at("header").append(tab);
            this.at("body").append(body);
            return tab;
        },
		"activate": function activate(tab) {
            if (tab === undefined) {
                for (let first of this.at("header").to) {
                    tab = first;
                    break;
                }
            }
            if (!tab || tab == this.activeTab) return;
            if (this.activeTab) {
                this.activeTab.styles.remove("activeTab");
                this.activeTab.body.style.display = "none";
            }
            this.activeTab = tab;
            this.activeTab.styles.add("activeTab");
            this.activeTab.body.style.display = this.activeTab.body.peer.$display;
        },
		"draw": function draw(tab) {
       //     tab.body.peer.setAttribute("viewBox", "0 0 320 320");
        },
		"view": function view(views) {
            this.super(view);
            if (views) for (let key in views) this.add(views[key]);
            this.activate();
        },
		"extend$actions": {
			"activateTab": function activateTab(event) {
                this.activate(event.tab);
                event.subject = "";
            },
			"collapse": function collapse(event) {
                event.subject = "";
            }
		}
	},
	"Tab": {
		"type$": ["/tabs/Display", "/shape/Shape"],
		"zones": {
			"border": {
				"right": 4
			},
			"cursor": {
				"TR": "ew-resize",
				"CR": "ew-resize",
				"BR": "ew-resize"
			},
			"subject": {
				"TR": "size",
				"CR": "size",
				"BR": "size"
			}
		},
		"var$body": null,
		"extend$actions": {
			"click": function click(event) {
                event.subject = "activateTab";
                event.tab = this;
            },
			"size": function size(event) {
                if (event.track == this) {
                    let r = this.bounds;
                    this.bounds = {
                        width: event.clientX - r.left
                    }
                }
            },
			"moveover": function moveover(event) {
                this.super(moveover, event);
                if (this.style.backgroundColor) {
                    this.style.removeProperty("background-color");
                }
                if (event.zone == "CR") {
                    this.style.backgroundColor = "gainsboro";
                }
            },
			"moveout": function moveout(event) {
                if (this.style.backgroundColor) {
                    this.style.removeProperty("background-color");
                }
            }
		}
	}
}
return pkg;
}

function tree() {
	const pkg = {
	"type$": "/display",
	"ItemHeader": {
		"type$": "/tree/Display",
		"facets": {
			"folder": {
				"icon": "/res/icons/folder-open.svg"
			},
			"file": {
				"icon": "/res/icons/file.svg"
			},
			"pkg": {
				"icon": "/res/icons/archive.svg"
			},
			"interface": {
				"icon": "/res/icons/gift.svg"
			},
			"method": {
				"icon": "/res/icons/settings.svg"
			},
			"type": {
				"icon": "/res/icons/link.svg"
			}
		},
		"states": {
			"collapsed": "/res/icons/chevron-right.svg",
			"expanded": "/res/icons/chevron-bottom.svg",
			"empty": "/res/icons/empty.svg",
			"hidden": ""
		},
		"virtual$state": function virtual$state(value) {
            if (!arguments.length) return this.peer.$state;
            this.peer.$state = value;
            this.peer.firstChild.src = this.states[value];
        },
		"view": function view(model) {
            this.super(view, model);
            if (!model) {
                console.log(this.of.key);
                return;
            }
            let facet = this.facets[model.facet];
            let icon = facet ? facet.icon : "/res/icons/fullscreen.svg";
            let type = model.type;
            let value = "";
            switch (type) {
                case "function":
                case "object":
                    type = "";
                    break;
                case "number":
                    type = "";
                    value = model.expr;
                    icon = "/res/icons/fullscreen-exit.svg";
                    break;
                case "string":
                    type = "";
                    value = model.expr;
                    icon = "/res/icons/tag.svg";
                    break;
                case "boolean":
                    type = "";
                    value = model.expr ? true : false;
                    icon = "/res/icons/flag.svg";
                    break;
            }
            this.peer.innerHTML = `<img> <img src="${icon}" title="${model.facet}"> ${model.name} <i>${type}</i> <span>${value}</span>`;

            if (typeof model.expr == "object") {
                this.state = "collapsed";
            } else {
                this.state = "empty";
            }
        },
		"extend$actions": {
			"click": function click(event) {
                event.value = this.model.expr;
                if (this.state === "collapsed") {
                    this.state = "expanded";
                } else if (this.state == "expanded") {
                    this.state = "collapsed";
                }
                event.subject = this.state;
            }
		}
	},
	"ItemBody": {
		"type$": "/tree/Display",
		"type$contentType": "/tree/Item",
		"view": function view(model) {
            if (this.peer.$show) {
                // let content = model;
                // if (content.expr && typeof content.expr == "object") content = model.expr;
                this.super(view, model.expr);
                this.owner.send(this, "view");
            } else {
                this.peer.$show = true;
            }
        }
	},
	"Item": {
		"type$": "/tree/Display",
		"members": {
			"type$header": "/tree/ItemHeader",
			"type$body": "/tree/ItemBody"
		},
		"extend$actions": {
			"empty": function empty(event) {
                event.subject = "showValue";
            },
			"collapsed": function collapsed(event) {
                this.at("body").style.display = "none";
                event.subject = "";
			},
			"expanded": function expanded(event) {
                const body = this.at("body");
                if (!body.peer.childNodes.length) {
                    body.view(this.model);
                }
                body.style.removeProperty("display");
                event.subject = "";
			}
		}
	}
}
return pkg;
}

