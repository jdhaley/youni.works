import { DisplayType } from "../display";
import { Shape } from "./shape";

class ItemType extends DisplayType {
	/* if columns is undefined or null, it is a paragraph */
	columns: string[]; // columns.length is the column count. Use "" if needed.
}
class Item extends Shape {
}