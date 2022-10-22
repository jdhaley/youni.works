import { value } from "../../base/model.js";
import { ArticleType, Box } from "../../base/box.js";
import { Actions } from "../../base/control.js";
import { ELE, RANGE } from "../../base/dom.js";
import { bundle } from "../../base/util.js";

import { ElementView } from "../view.js";
import { viewContent } from "../../transform/content.js";

type editor = (this: Box, commandName: string, range: RANGE, content?: value) => RANGE;

export abstract class ElementBox extends ElementView implements Box {
	constructor(actions: Actions, editor: editor) {
		super();
		this.actions = actions;
		if (editor) this["edit"] = editor;
	}
	get type(): ArticleType {
		return this._type as ArticleType;
	}
	get shortcuts(): bundle<string> {
		return this._type.conf.shortcuts;
	}

	getContent(range?: RANGE): ELE {
		return viewContent(this, range);
	}
}
