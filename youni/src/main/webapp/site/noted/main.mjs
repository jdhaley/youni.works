import component	from "../base/package/component.mjs";
import client		from "../base/package/client.mjs";
import cmd			from "../base/package/cmd.mjs";
import ui			from "../browser/package/ui.mjs";
import editor		from "../browser/package/editor.mjs";

import services		from "./conf/services.mjs";
import parts		from "./conf/parts.mjs";

let packages = {
	component: component,
	client: client,
	ui: ui,
	cmd: cmd,
	editor: editor,
	services: services,
	parts: parts		
}

export default function main(sys, conf) {
	packages = sys.load(packages);	
	let ui = sys.packages[conf.ui];
	let frame = sys.extend(ui.Frame, {
		window: conf.window,
		content: conf.window.document.body,
		part: packages.parts.public,
		service: packages.services.public,
		controller: {
		}
	});
	sys.implement(frame, packages.cmd.Commander);
	frame.initialize(conf);
	return frame;
}