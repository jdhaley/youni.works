import editors from "./conf/editors.mjs";
export default {
    dataConverter: "/compiler/converter/Converter",
    ownerType: "/display/Frame",
    appType: "/app/App",
    window: null,
    editors: editors,
    type$events: "/gdr",
    title: "Workbench",
    icon: "/res/icon.png",
    styles: "/res/styles.css",
    components: {
        Frame: "/display/Frame",
        Object: "/workbench/Workbench"
    },

    "objectType": "Module",
    "dataset": "source",
    "dataSource": "/sources",
    "typeSource": "/file/workbench/types.json"
};
