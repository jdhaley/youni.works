import { TemplateGenerator } from "./tpl.js"

let person = {
	name: "Fred",
	surname: "Flinstone"
}
let gen = new TemplateGenerator();

gen.add({
	main: "This is ${this.str(arg.name)}.",
}, "arg", "person");
gen.add ({
	main: "xxx",
	str: "${arg}"
}, "arg", "string");

let templates = gen.generateTemplates();
console.log(templates);
console.log(templates.main(person))