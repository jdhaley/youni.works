import editors from "./conf/editors.mjs";
import views from "./conf/views.mjs";
import testData from "./conf/testData.mjs";

export default {
    type$: "/workbench/App",
    title: "Workbench",
    frame: {
        type$: "/ui/display/Frame",
        editors: editors,
        main: {
            type: "/workbench/Workbench",
            views: views
        }
    },
    data: {
        test: testData
    },
    conf: {
        type$events: "/ui/gdr",
        dataConverter: "/compiler/converter/Converter",
        "objectType": "Module",
        "dataset": "source",
        "dataSource": "/sources",
        "typeSource": "/file/workbench/types.json"
    }
}