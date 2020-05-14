import system 	from "../system/main.mjs";
import platform	from "../browser/conf/platform.mjs";
import main		from "./main.mjs";

const conf = {
	platform: platform,
	ui: "youniworks.com/editor",
	window: window
}
const sys = system();
const frame = main(sys, conf);

console.info(frame);
frame.activate();
