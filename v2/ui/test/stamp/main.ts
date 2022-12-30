
import { Frame } from "../../frame.js";
import { IArticle } from "../../article.js";

import controller from "../../actions/frame.js";

import conf from "./conf.js";

let frame = new Frame(window, controller);
let display = new IArticle(frame, conf);

let filePath = "/" + frame.location.search.substring(1);

display.service.open(filePath, display);
