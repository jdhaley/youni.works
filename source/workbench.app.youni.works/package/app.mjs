export default {
    App: {
        type$: "/ui/display/App",
        type$frame: "/ui/display/Frame",
        start(conf) {
            console.log("Starting application");
            this.let("conf", conf, "extend");
            this.let("frame", this.create(conf.frame));
            this.define(this.frame, "app", this);
            this.frame.start(this.conf);

            if (conf.typeSource) {
                this.open(conf.typeSource, "initializeContext");                 
            } else {
                this.frame.send(this, "initializeContext");
            }
            this.open(conf.dataSource, "initializeData");
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