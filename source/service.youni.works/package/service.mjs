export default {
    type$: "/base/graph",
    Service: {
        type$: "Graph",
        engine: null,
        wire(path, node) {
            let f;
            if (typeof node == "string") {
                f = engine.static(node);
            } else {
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
        start(conf) {
            let engine = conf.engine();
            engine.static = conf.engine.static;
            this.define(this, "engine", engine, "const");

            let to = this.endpoints;
            for (let path in to) {
                let node = to[path];
                node = this.create(node);
                this.wire(path, node);
            }
            return engine;
        },
   },
   Test: {
       type$: "Node",
       extend$actions: {
           service(msg) {
               msg.response.send(this.value);
           }
       },
       start(conf) {
            this.value = conf.value;
       }
   }
}