export default {
    type$: "/base/control",
    type$Origin: "/base/origin/Origin",
    App: {
        type$: ["Instance", "Receiver", "Origin", "/base/util/Factory"],
        type$owner: "Component",
        get$folder() {
            let name = this.conf.window.location.pathname;
            name = name.substring(name.lastIndexOf("/") + 1);
            name = name.substring(0, name.lastIndexOf("."));
            return "/file/" + name;
        },
        runScript(name) {
            import(name).then(v => {
                v.default.call(this);
            });
        },
        start(conf) {
            this.let("conf", conf, "extend");
            this.open(this.folder + "/app.json", "initializeApp");
            this.runScript(this.folder + "/index.mjs");
         },
        initializeOwner() {
            this.owner.origin = this;
            this.owner.editors = this.conf.editors;
            this.owner.start(this.conf);
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
            view(msg) {
                this.view.view(this.data);
                this.owner.send(this.view, "view");
            },
            initializeApp(msg) {
                if (msg.response) {
                    this[Symbol.for("owner")].define(this, "conf", JSON.parse(msg.response), "extend");
                }
                let conf = this.conf;
                
                this.let("owner", this.create(conf.ownerType || this.owner));
                this.initializeOwner();

                if (conf.typeSource) {
                    this.open(conf.typeSource, "initializeContext");                 
                } else {
                    this.owner.send(this, "initializeContext");
                }
                this.open(conf.dataSource, "initializeData");
            },
            initializeContext(msg) {
                if (msg.response) {
                    let types = JSON.parse(msg.response);
                    this.types = this.create(types);
                } else {
                    this.types = this.create();
                }
                //Create the view after the types have been initialized
                this.view = this.owner.create(this.conf.components.Object);
                this.view.start(this.types[this.conf.objectType]);
                this.view.file =  this.conf.dataSource;
                this.owner.append(this.view);
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