export default {
    type$: "/base/control",
    Service: {
        type$: ["Component", "Publisher"],
        engine: null,
        wire(path, conf) {
            let f;
            if (typeof conf == "string") {
                f = this.engine.static(conf);
            } else {
                let node = this.create(conf);
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
    Endpoint: {
        type$: ["Receiver", "Sender"],
    },
    Test: {
        type$: "Endpoint",
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