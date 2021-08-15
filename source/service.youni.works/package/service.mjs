export default {
    type$: "/base/graph",
    Service: {
        type$: "Graph",
        engine: null,
        publish() {
            if (!this.io) {
                console.error("No socket");
            }
            let event = arguments[0];
            //agruments can be a string, string/object, or an event with a subject.
            let subject = event && typeof event == "object" ? event.subject : event;
            if (!subject) {
                console.error("No subject.", arguments);
            }
            if (arguments.length > 1) {
                event = arguments[1];
            }
            this.io.emit(subject, event);
        },
        wire(path, node) {
            let f;
            if (typeof node == "string") {
                f = this.engine.static(node);
            } else {
                node = this.create(node);
                node.path = path;
                this.define(node, "owner", this);
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