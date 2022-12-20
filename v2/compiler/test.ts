import { Box } from "../control/box.js";
import { TYPE, createCompiler } from "./compiler.js"
import { base } from "./facets.js";

const test = {
	Instance: {
		type$: "",
		prototype$: new Box(),
		get$type() {
			return this[TYPE]
		}
	},
	rocketCup: {
		type$: "Cup rocket",
		size: -1,
		crazy: true,
		object: {
			type$: "Instance"
		}
	},
	Cup: {
		type$: "Instance",
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

const compile = createCompiler(base);
let target = compile(test, "test") as any;
// let out = "";
// for (let name in target.rocketCup) out += name + " ";
console.log(target); 	//type material size target maker crazy 
//console.log(Object.create(target.rocketCup));
