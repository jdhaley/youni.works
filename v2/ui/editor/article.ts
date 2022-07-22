import { CommandBuffer } from "../../base/command.js";
import { DisplayOwner, ViewElement } from "../../base/display.js";
import { content } from "../../base/model.js";
import { RemoteFileService } from "../../base/remote.js";
import { bundle } from "../../base/util.js";
import { ViewType } from "../../base/view.js";
import { DisplayType } from "../peer.js";
import { Frame } from "../ui.js";

type editor = (this: DisplayType, commandName: string, range: Range, content?: content) => Range;
export class Article extends DisplayOwner {
	constructor(frame: Frame, conf: bundle<any>) {
		super(conf);
		this.frame = frame;
		this.service = new RemoteFileService(this.frame.location.origin + conf.sources);
		this.editors = conf.editors;
		this.actions = conf.actions.article;
		this.initTypes(conf.viewTypes, conf.baseTypes);
		this.type = this.types[this.conf.type];
		console.info("Types:", this.types, this.conf.unknownType);
		this.unknownType = this.types[this.conf.unknownType]
	}
	editors: bundle<editor>;
	readonly frame: Frame;
	readonly service: RemoteFileService;
	type: ViewType<ViewElement>;
	view: ViewElement;
	model: content;

	createElement(tagName: string): HTMLElement {
		return this.frame.createElement(tagName);
	}

	readonly commands: CommandBuffer<Range> = new CommandBuffer();
	save(): void {
		let model = this.type.toModel(this.view);
		console.log(model);
		this.service.save(this.view.getAttribute("data-file"), JSON.stringify(model, null, 2), this);
	}

}
