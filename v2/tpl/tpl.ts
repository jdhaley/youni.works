export interface Templates {
	[key: string]: Template
}
export interface Template {
	name: string,
	argName: string,
	argType: string,
	template: string
}

export class TemplateGenerator {
	#templates: Templates = Object.create(null);
	add(templates: object, argName?: string, argType?: string) {
		for (let name in templates) {
			if (this.#templates[name]) {
				console.warn(`Template "${name}" already defined. Ignoring.`);
			} else {
				let template = this.processTemplate(templates[name])
				this.#templates[name] = {
					name: name,
					argName: argName || "a",
					argType: argType || "any",
					template: this.processTemplate(template)
				}
			}
		}
	}
	protected processTemplate(template: string) {
		return template.replace(/`/g, "\\`");
	}
	generateTemplates() {
		console.log(this.#templates);
		let out = "return {\n";
		for (let name in this.#templates) {
			out += this.generateTemplate(name) + ",\n";
		} 
		out = out.substring(0, out.length - 2);
		out += "\n}\n";
		console.log(out);
		return new Function(out)();
	}
	generateTemplate(name: string) {
		let template = this.#templates[name];
		return `\t${name}(${template.argName}/*: ${template.argType}*/) {\n\t\treturn \`${template.template}\`;\n\t}`;
	}
}
// export function generateTemplates(templates: object, argName?: string, argType?: string) {
// 	let out = "{\n";
// 	for (let name in templates) out += generateTemplate(name, templates[name], argName || "a", argType || "any");
// 	out += "}\n";
// 	return out;
// }

// // export function createTemplate(tpl: string) {
// // 	let fn = new Function("a", "`" + tpl.replace(/`/g, "\`") + "\`");
// // 	console.log(fn);
// // 	return fn;
// // }

// export function generateTemplate(name: string, tpl: string, arg: string, argType: string): string {
// 	tpl = "`" + tpl.replace(/`/g, "\`") + "\`";
// 	return `\t${name}(${arg}: ${argType}) {\n\t\treturn \`${tpl}\`;\n\t}\n`;
// }