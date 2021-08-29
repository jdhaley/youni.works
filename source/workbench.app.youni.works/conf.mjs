import editors from "./conf/editors.mjs";
export default {
    type$: "/workbench/App",
    title: "Workbench",
    frame: {
        type$: "/ui/display/Frame",
        editors: editors,
        main: {
            type: "/workbench/Workbench",
            views: {
                test: {
                    title: "Test",
                    icon: "/res/icons/activity.svg",
                    body: {
                        type$: "/workbench/content"
                    }
                },
                dummy: {
                    title: "Dummy",
                    icon: "/res/icons/moon.svg"
                }
            }
        }
    },
    conf: {
        //window: null,
        type$events: "/ui/gdr",
        dataConverter: "/compiler/converter/Converter",
        "objectType": "Module",
        "dataset": "source",
        "dataSource": "/sources",
        "typeSource": "/file/workbench/types.json"        
    }
}