import { TemplateGenerator } from "./tpl.js"

let person = {
	name: "Fred",
	surname: "Flinstone"
}
let gen = new TemplateGenerator();

gen.add({
	a: "This is ${this.b(a.name)}.",
}, "a", "person");
gen.add ({
	b: "${a}"
}, "a", "string");

let templates = gen.generateTemplates();
console.log(templates);
console.log(templates.a(person))