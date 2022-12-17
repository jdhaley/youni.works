interface Templates {
	[key: string]: Template
}
interface Template {
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
	generateTemplate(name: string, type?: boolean) {
		let template = this.#templates[name];
		let argType = template.argType;
		argType = type ? `: ${argType}` : `/*: ${argType}*/`;
		return `\t${name}(${template.argName}${argType}) {\n\t\treturn \`${template.template}\`;\n\t}`;
	}
}
