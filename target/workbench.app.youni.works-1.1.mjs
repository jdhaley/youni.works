import system from "./system.youni.works-2.1.mjs";
import base from "./base.youni.works-1.2.mjs";
import ui from "./ui.youni.works-1.1.mjs";
import compiler from "./compiler.youni.works-1.0.mjs";
const module = {
	"name": "workbench.app.youni.works",
	"version": "1.1",
	"moduleType": "app"
};
module.use = {
	system: system,
	base: base,
	ui: ui,
	compiler: compiler
}
module.package = {
	app: app()
}
const conf = {
	"type$": "/app/App",
	"title": "Workbench",
	"view": {
		"main": {
			"type": "/ui/workbench/Workbench",
			"conf": {
			}
		}
	},
	"frame": {
		"type$": "/ui/display/Frame",
		"editors": {
			"type$string": "/ui/editors/String",
			"type$number": "/ui/editors/Number",
			"type$date": "/ui/editors/Date",
			"type$boolean": "/ui/editors/Boolean",
			"type$link": "/ui/editors/Link",
			"type$color": "/ui/editors/Color"
		}
	},
	"conf": {
		"type$events": "/ui/gdr",
		"icon": "/res/icon.png",
		"styles": "/res/styles.css",
		"dataConverter": "/compiler/converter/Converter",
		"objectType": "Module",
		"dataset": "source",
		"dataSource": "/sources",
		"typeSource": "/file/workbench/types.json"
	}
};
const main = function main(module, conf) {
	module = module.use.system.load(module);
	let app = module.create(conf);
	app.conf.window = window;
	app.start();
	return module;
};
export default main(module, conf);
function app() {
	const pkg = {
	"App": {
		"type$": "/ui/display/App",
		"type$frame": "/ui/display/Frame",
		"start": function start() {
            console.log("Starting application");
            let conf = this.conf;
            this.define(this.frame, "app", this);
            this.frame.start(this.conf);

            // if (conf.typeSource) {
            //     this.open(conf.typeSource, "initializeContext");                 
            // } else {
            //     this.frame.send(this, "initializeContext");
            // }
            // this.open(conf.dataSource, "initializeData");
        },
		"extend$actions": {
			"view": function view(msg) {
                this.view.view(this.data);
                this.view.send("view");
            },
			"initializeContext": function initializeContext(msg) {
                if (msg.response) {
                    let types = JSON.parse(msg.response);
                    this.types = this.create(types);
                } else {
                    this.types = this.create();
                }
                //Create the view after the types have been initialized
                this.view = this.frame.create(this.conf.components.Object);
                this.view.start(this.types[this.conf.objectType]);
                this.view.file =  this.conf.dataSource;
                this.frame.append(this.view);
                if (this.data) this.receive("view");
            },
			"initializeData": function initializeData(msg) {
                let data = JSON.parse(msg.response);
                let converter = this[Symbol.for("owner")].create(this.conf.dataConverter);
                data = converter.convert(data);
                console.debug(data);
                this.data = data; // this.create(data);
                if (this.view) this.receive("view");
            }
		}
	}
}
return pkg;
}

