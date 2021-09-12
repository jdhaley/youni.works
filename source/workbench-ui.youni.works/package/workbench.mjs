export default {
	type$: "/ui/display",
    App: {
        type$: "App"
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