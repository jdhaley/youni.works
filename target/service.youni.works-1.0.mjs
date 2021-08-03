import system from "./system.youni.works-2.1.mjs";
import base from "./base.youni.works-1.2.mjs";
const module = {
	"name": "service.youni.works",
	"version": "1.0",
	"moduleType": "library"
};
module.use = {
	system: system,
	base: base
}
module.package = {
	service: service()
}
const conf = undefined;
const main = function main_loadModule(module) {
			return module.use.system.load(module);
		};
export default main(module, conf);
function service() {
	const pkg = {
	"type$": "/base/graph",
	"Service": {
		"type$": "/service/Graph",
		"engine": null,
		"wire": function wire(path, node) {
            let f;
            if (typeof node == "string") {
                f = this.engine.static(node);
            } else {
                node = this.create(node);
                f = function receive(req, res) {
                    node.owner.send(node, {
                        subject: "service",
                        request: req,
                        response: res,
                        status: 0
                    });
                }
            }
            this.engine.use(path, f);
        },
		"start": function start(conf) {
            let engine = conf.engine();
            engine.static = conf.engine.static;
            this.define(this, "engine", engine, "const");

            let to = this.endpoints;
            for (let path in to) {
                this.wire(path, to[path]);
            }
            return engine;
        }
	},
	"Test": {
		"type$": "/service/Node",
		"extend$actions": {
			"service": function service(msg) {
               msg.response.send(this.value);
           }
		},
		"start": function start(conf) {
            this.value = conf.value;
       }
	}
}
return pkg;
}

