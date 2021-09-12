import editors from "./conf/editors.mjs";
import views from "./conf/views.mjs";
import test from "./conf/testDataSource.mjs";

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
        test: test
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