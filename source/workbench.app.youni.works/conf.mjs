import editors from "./conf/editors.mjs";
export default {
    appType: "/app/App",
    frame: {
        type$: "/ui/display/Frame",
        editors: editors
    },
    dataConverter: "/compiler/converter/Converter",
    type$events: "/ui/gdr",
    title: "Workbench",
    icon: "/res/icon.png",
    styles: "/res/styles.css",
    components: {
        Object: "/ui/workbench/Workbench"
    },

    "objectType": "Module",
    "dataset": "source",
    "dataSource": "/sources",
    "typeSource": "/file/workbench/types.json"
};
