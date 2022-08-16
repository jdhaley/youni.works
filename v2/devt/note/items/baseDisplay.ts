import { UserEvent } from "../../../ui/ui";
import { RangeCommands } from "./editor";

export {UserEvent, Article, Display}
class Article {
	model: any;
	dataset: any;
	send: any;
	view: any;
	setEditable: any;
	owner: any;
	transform: any;
	
}
type Display = any;

export class Note extends Article {
	declare commands: RangeCommands;
	navigateToText(range: Range, bf: string): Range {
		return null;
	}
}