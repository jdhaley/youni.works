import editor		from "./editor.mjs";

import services		from "./services.mjs";
import parts		from "./parts.mjs";

export default function main(sys, conf) {
	let pkgs = sys.load({
		editor: editor,
		services: services,
		parts: parts
	});	
	let ui = sys.packages[conf.ui];
	let frame = sys.extend(ui.Frame, {
		window: window,
		content: window.document.body,
		part: pkgs.parts.public,
		service: pkgs.services.public,
		controller: {
		}
	});
	
	frame.initialize(conf);
	console.log(frame);
	frame.activate();
}