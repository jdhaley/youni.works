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
        createView: function() {
            this.view = this.owner.create(this.conf.components.Object, this.types[this.conf.objectType]);
            this.owner.append(this.view);
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
            view: function(msg) {
                this.view.view(this.data);
            },
            initializeApp: function(msg) {
                this.conf = this.sys.extend(this.conf, JSON.parse(msg.response));
                let conf = this.conf;
                this.open(conf.typeSource, "initializeTypes");
                this.open(conf.dataSource, "initializeData");
                this.open(conf.diagram, "initializeDiagram");
 
                this.sys.define(this, "owner" , this.sys.extend(conf.ownerType || this.owner));
                this.owner.editors = conf.editors;
                this.owner.start(conf);
                this.initializeDocument(conf);
            },
            initializeTypes: function(msg) {
                let types = JSON.parse(msg.response);
                this.types = this.sys.extend(null, types);
                this.createView();
                if (this.data) this.receive("view");
            },
            initializeData: function(msg) {
                let data = JSON.parse(msg.response);
                this.data = this.sys.extend(null, data);
                if (this.view) this.receive("view");
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
