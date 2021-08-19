import editors from "./conf/editors.mjs";
export default {
    type$: "/app/App",
    title: "Workbench",
    view: {
        main: {
            type: "/ui/workbench/Workbench",
            conf: {
            }
        }
    },
    frame: {
        type$: "/ui/display/Frame",
        editors: editors
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