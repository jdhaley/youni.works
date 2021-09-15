export default {
	type$: "/ui/display",
    App: {
        type$: ["Component", "Receiver", "/base/origin/Origin"],
		start() {
            console.log("Starting application", this[Symbol.for("owner")]);
            let conf = this.conf;
            this.define(this.frame, "app", this);
            this.frame.start(this.conf);
        },
	},
    Workbench: {
        type$: "Display",
        nodeName: "main",
        extend$conf: {
            views: {
            }
        },
		members: {
            header: {
                type$: "Display"
            },
			body: {
                type$: "/ui/tabs/Tabs",
                extend$conf: {
                    tabType: "/workbench/WorkbenchTab"
                }        
            },
			footer: {
                type$: "Display"
            }
		},
        modelFor(key) {
            if (key == "body") return this.conf.views;
        }
    },
    WorkbenchTab: {
        type$: "/ui/tabs/Tab"
    },
}