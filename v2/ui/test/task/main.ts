import { implement } from "../../../base/util.js";

import { Frame } from "../../frame.js";
import { IArticle } from "../../article.js";

import controller from "../../actions/frame.js";

import baseTypes from "../../conf/baseTypes.js";
import editorTypes from "../../conf/editorTypes.js";
import boxTypes from "../../conf/boxTypes.js";
import articleTypes from "./taskTypes.js";
import devt from "./uiTypes.js";

import tasks from "./tasks.js";
import "../../../tpl/test.js";

let frame = new Frame(window, controller);
let article = new IArticle(frame, {
	types: implement(null, articleTypes, devt, boxTypes, editorTypes, baseTypes),
	sources: "/journal",
});

let dialog = article.forName("dialog").create() as Dialog;
frame.view.append(dialog.view);
dialog.draw(tasks, "taskTable");
//frame.send("view", frame.view);
frame.view.setAttribute("contenteditable", "true");

import "../../../compiler/test.js";
import { Dialog } from "../../display.js";
