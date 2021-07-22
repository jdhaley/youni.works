import events from "./conf/events.mjs";
import editors from "./conf/editors.mjs";
export default {
    dataConverter: "/compiler/converter/Converter",
    ownerType: "/display/Frame",
    appType: "/app/App",
    window: null,
    events: events,
    editors: editors,
    type$gdr: "/gdr"
};
