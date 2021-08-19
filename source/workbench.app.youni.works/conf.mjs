import editors from "./conf/editors.mjs";
export default {
    type$: "/workbench/App",
    title: "Workbench",
    view: {
        workbench: {
            type: "/workbench/Workbench",
            conf: {
            }
        }
    },
    frame: {
        type$: "/ui/display/Frame",
        editors: editors,
        main: "workbench"
    },
    conf: {
        //window: null,
        type$events: "/ui/gdr",
        icon: "/res/icon.png",
        styles: "/res/styles.css",
        dataConverter: "/compiler/converter/Converter",
        "objectType": "Module",
        "dataset": "source",
        "dataSource": "/sources",
        "typeSource": "/file/workbench/types.json"        
    }
}