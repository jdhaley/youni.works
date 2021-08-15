export default {
    type$: "/base/graph",
    Service: {
        type$: ["Graph", "Publisher"],
        engine: null,
        wire(path, node) {
            let f;
            if (typeof node == "string") {
                f = this.engine.static(node);
            } else {
                node = this.create(node);
                node.path = path;
                this.define(node, "owner", this);
                f = function receive(req, res) {
                    node.send({
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

            for (let path in this.endpoints) {
                this.wire(path, this.endpoints[path]);
            }
            return this;
        },
   },
   Test: {
       type$: "Node",
       extend$actions: {
           service(msg) {
               this.owner.publish("test1", this.value);
               msg.response.send(this.value);
           }
       },
       start(conf) {
            this.value = conf.value;
       }
   }
}