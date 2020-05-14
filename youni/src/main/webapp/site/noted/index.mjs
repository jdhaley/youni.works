import system		from "../config/system-20056.mjs";
import component	from "../package/component.mjs";
import client		from "../package/client.mjs";
import ui			from "../package/ui.mjs";

const sys = system.packages.boot.Booter.boot(system);
sys.load({
	component: component,
	client: client,
	ui: ui
});

import conf from "./ui/conf.mjs";
import main	from "./app/main.mjs";
main(sys, conf);
