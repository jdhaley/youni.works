import { defaultFactory } from "./factory.js"

const test = {
	rocketCup: {
		type$: "cup rocket",
		crazy: true
	},
	cup: {
		type$: "rocketCup", //doesn't error on cross-reference cycles!
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

console.log(defaultFactory(test, "test"));
console.log(defaultFactory(test.cup));