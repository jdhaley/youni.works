export default {
	type$: "/base.youni.works/util",
    App: {
        type$: ["Control", "Origin"],
        type$owner: "Owner",
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
            initializeApp: function(msg) {
                let conf = this.conf;
                const frame = this.sys.extend(conf.ownerType || this.owner, {
                    window: conf.window,
                    events: conf.events,
                    editors: conf.editors
                });
                this.sys.define(this, "owner" , frame);
                frame.start(conf)        
    
                let app = JSON.parse(msg.response);
                conf = frame.sys.extend(conf, app);
                this.conf = conf;
                this.initializeDocument(conf);
                this.open(conf.typeSource, "initializeTypes");
                this.open(conf.dataSource, "initializeData");
                this.open(conf.diagram, "initializeDiagram");
            },
            initializeTypes: function(msg) {
                let types = JSON.parse(msg.response);
                this.types = this.sys.extend(null, types);
            },
            initializeData: function(msg) {
                let data = JSON.parse(msg.response);
                data = this.sys.extend(null, data);
                let view = this.owner.create(this.conf.components.Object, this.types[this.conf.objectType]);
                this.owner.append(view);
                view.view(data);
            },
            initializeDiagram: function(msg) {
                let data = JSON.parse(msg.response);
                data = this.sys.extend(null, data);
                let view = this.owner.create(this.conf.components.Diagram);
                this.owner.append(view);
                view.file = this.conf.diagram;
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
