import { implement } from "../../../base/util.js";

import { Frame } from "../../frame.js";
import { IArticle } from "../../article.js";

import controller from "../../actions/frame.js";

import baseTypes from "../../conf/baseTypes.js";
import editorTypes from "../../conf/editorTypes.js";
import boxTypes from "../../conf/boxTypes.js";

import articleTypes from "./taskTypes.js";
import devt from "./uiTypes.js";

import value from "./tasks.js";

implement(articleTypes, devt, boxTypes, editorTypes);

let frame = new Frame(window, controller);
let article = new IArticle(frame, {
	baseTypes: baseTypes,
	articleTypes: articleTypes,
	sources: "/journal",
});

let tasks = article.types.taskDialog.create();
frame.view.append(tasks.view);
tasks.draw(value);
frame.send("view", frame.view);
frame.view.setAttribute("contenteditable", "true");