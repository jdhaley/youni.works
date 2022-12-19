import { Box } from "../../../control/box.js";
import { compile, TYPE } from "./compiler.js"

const test = {
	instance: {
		type$: "",
		prototype$: new Box(),
		get$type() {
			return this[TYPE]
		}
	},
	rocketCup: {
		type$: "cup rocket",
		size: -1,
		crazy: true,
		object: {
			type$: "instance"
		}
	},
	cup: {
		type$: "instance",
		type: "coffee",
		material: "clay",
		size: 23,
	},
	rocket: {
		type$: "",
		size: 2000,
		target: "moon",
		material: "steel",
		get$maker() {
			return "NASA";
		}
	}
}

let target = compile(test, "test") as any;
let out = "";
for (let name in target.rocketCup) out += name + " ";
console.log(out); 	//type material size target maker crazy 
console.log(Object.create(target.rocketCup));
