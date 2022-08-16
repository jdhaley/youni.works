import {ItemTransformer} from "../../items/transform.js"
import {initialize} from "../../items/baseTransform.js";

import tags from "./htmlTags.js";
import htmlTransforms from "./htmlTransform.js";
import viewTransforms from "./viewTransform.js";
import roles from "./viewRoles.js";

const toView = initialize(htmlTransforms, tags);
const fromView = initialize(viewTransforms, roles);

export default new ItemTransformer(toView, fromView)
