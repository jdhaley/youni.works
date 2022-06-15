export default {
    type$: "/ui/display",
    type$tabs: "/ui/tabs",
    type$tree: "/ui/tree",
    type$Shape: "/ui/shape/Shape",
    ArticleView: {
        type$: "Display",
        
    },
    Article: {
        type$: "Display",
        type$origin: "/base/origin/Origin",
        start(conf) {
            this.origin.open(this.location)
        },
        extend$actions: {
            opened(message) {
                console.log(message);
            }
        }
        // group
        // member
        // revision: "",
        // priorRevision: "",
        // status: "",
        // content: ""          
    },
    Dyna: {
        panels: {
            "sidebar": "sidebar/name",
            "": ""
        }
    },
    sidebar: {
        type$: ["Display", "Shape"],
        members: {
            tree: {
                type$: "Display",
                type$contentType: "tree/Item"
            },
            value: {
                type$: ["Display", "Shape"],
                nodeName: "pre",
                zones: {
                    border: {
                        top: 8
                    },
                    cursor: {
                        "TC": "ns-resize"
                    },
                    subject: {
                        "TC": "size"
                    }
                },
                extend$actions: {
                    showValue(event) {
                        this.peer.innerText = event.value;
                    },
                    size(event) {
                        if (event.track == this) {
                            let r = this.bounds;
                            this.bounds = {
                                height: r.bottom - event.clientY
                            }
                        }
                    }
                }        
            }
        },
        zones: {
            border: {
                right: 4
            },
            cursor: {
                "CR": "ew-resize",
            },
            subject: {
                "CR": "size",
            }
        },	
        extend$actions: {
            showValue(event) {
                this.owner.send(this.parts.value, event);
            },
            size(event) {
                if (event.track == this) {
                    let r = this.bounds;
                    this.bounds = {
                        width: event.clientX - r.left
                    }
                }
            }
        }
    },
    OldApp: {
        type$: "/ui/display/App",
        type$frame: "/ui/display/Frame",
        start() {
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
        extend$actions: {
            view(msg) {
                this.view.view(this.data);
                this.view.send("view");
            },
            initializeContext(msg) {
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
            initializeData(msg) {
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