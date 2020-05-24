import component	from "../base/package/component.mjs";
import client		from "../base/package/client.mjs";
import cmd			from "../base/package/cmd.mjs";
import ui			from "../browser/package/ui.mjs";
import editor		from "../browser/package/editor.mjs";

import platform		from "../browser/conf/platform.mjs";
import services		from "./conf/services.mjs";
import parts		from "./conf/parts.mjs";
import actions		from "./conf/actions.mjs";

let packages = {
	component: component,
	client: client,
	cmd: cmd,
	ui: ui,
	editor: editor,
	
	services: services,
	parts: parts		
}

export default function main(sys) {
	packages = sys.load(packages);	
	let ui = packages.editor;
	let frame = sys.extend(ui.Frame, {
		window: window,
		part: packages.parts.public,
		service: packages.services.public,
	});
	sys.implement(frame, packages.cmd.Commander);
	frame.initialize({
		platform: platform,
		actions: actions
	});
	console.info(frame);
	frame.activate();
	return frame;
}