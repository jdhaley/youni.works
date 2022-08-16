import {Signal} from "../../../../base/controller.js";
import {Display, Article, UserEvent} from "../../items/baseDisplay.js";
import { extend } from "../../../../base/util.js";

export {displayActions, articleActions};

const displayActions = {
	draw(this: Display, msg: Signal) {
	},
	view(this: Display, msg: Signal) {
		this.model = msg.from["model"];
		this.view.textContent = "" + this.model;
	},
	command(this: Display, event: UserEvent) {
		let command = this.shortcuts[event.shortcut];
		if (command) event.subject = command;
	}
}

const articleActions = extend(displayActions, {
	opened(this: Article, msg: any) {
		this.model = msg.status == 404 ? "" : msg.response;
		this.dataset.file = msg.request.url;
		this.send("draw");
		this.send("view");
	},
	saved(this: Article, msg: any) {
		console.log(msg);
	},
	draw(this: Article, msg: UserEvent) {
		this.view["$editor"] = this;
		this.setEditable(true);
	},
	view(this: Article, msg: Signal) {
		let div = this.owner.document.createElement("DIV");
		div.innerHTML = this.model;
		this.view.innerHTML = this.transform.toView(div).innerHTML;
	},
	save(this: Article, event: UserEvent) {
		event.subject = "";
		let target = this.transform.fromView(this.view) as Element;
		this.owner.origin.save(this, this.dataset.file, target.outerHTML);
	},
	selectAll(this: Article, event: UserEvent) {
		event.subject = "";
		let range = this.owner.selectionRange;
		range.selectNodeContents(this.view)
	}
});
