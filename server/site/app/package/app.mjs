export default {
	type$: "/base.youni.works/util",
    App: {
        type$: "Origin",
        type$owner: "/ui.youni.works/view/Frame",
        start: function(conf) {
            this.conf = conf;
            let manifest = "/file/" + conf.window.location.search.substring(1) + "/app.json";
            this.open(manifest, "initializeApp");
        },
        initializeDocument: function() {
            if (this.conf.icon) this.owner.link({
                rel: "icon",
                href: this.conf.icon
            });
            if (this.conf.styles) this.owner.link({
                rel: "stylesheet",
                href: this.conf.styles
            });
        },
        extend$actions: {
            initializeApp: function(on, msg) {
                let conf = on.conf;
                const frame = on.sys.extend(conf.ownerType || on.owner, {
                    window: conf.window,
                    events: conf.events,
                    editors: conf.editors
                });
                on.sys.define(on, "owner", frame);
                frame.start(conf)        
    
                let app = JSON.parse(msg.response);
                conf = frame.sys.extend(conf, app);
                on.conf = conf;
                on.initializeDocument(conf);
                on.open(conf.typeSource, "initializeTypes");
                on.open(conf.dataSource, "initializeData");
                on.open(conf.diagram, "initializeDiagram");
            },
            initializeTypes: function(on, msg) {
                let types = JSON.parse(msg.response);
                on.types = on.sys.extend(null, types);
            },
            initializeData: function(on, msg) {
                let data = JSON.parse(msg.response);
                data = on.sys.extend(null, data);
                let view = on.owner.create(on.conf.components.Object, on.types[on.conf.objectType]);
                on.owner.append(view);
                view.view(data);
            },
            initializeDiagram: function(on, msg) {
                let data = JSON.parse(msg.response);
                data = on.sys.extend(null, data);
                let view = on.owner.create(on.conf.components.Diagram);
                on.owner.append(view);
                view.file = on.conf.diagram;
                view.view(data);
            }       
        }
    }
}


//this.window.styles = createStyleSheet(this.window.document);
//createRule: function(selector, properties) {
//	let out = `${selector} {\n`;
//	out += defineStyleProperties(properties);
//	out += "\n}";
//	let index = this.window.styles.insertRule(out);
//	return this.window.styles.cssRules[index];
//},

function createStyleSheet(document) {
	let ele = document.createElement("style");
	ele.type = "text/css";
	document.head.appendChild(ele);
	return ele.sheet;
}

function defineStyleProperties(object, prefix) {
	if (!prefix) prefix = "";
	let out = "";
	for (let name in object) {
		let value = object[name];
		if (typeof value == "object") {
			out += defineStyleProperties(value, prefix + name + "-");
		} else {
			out += "\t" + prefix + name + ": " + value + ";\n"
		}
	}
	return out;
}
