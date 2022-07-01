/* TAGS
#id - task id
@party - party (user, group, agent)
[term]
[#id] - article id.
*/
/* Note: a Term is simply an Artifact of type "term". The title must be unique across all Terms. */

export interface bundle<T> {
	[key: string]: T
}

export interface ItemType {
	name: string;
	types?: bundle<ItemType>;
}

export class Item {
	id: string;
	type: string;
	title: string;
	//path: string; - virtual or physical path
	/** The Party owning the item.  Geneally a group or individual user */
	owner: Party;
	status: string
}

/** All items have the following statuses. Subtypes can have additional ones. */
type ItemStatus = "inactive" | "active" | "review" | "cancelled";

export class Task extends Item {
	declare status: ItemStatus | "completed";
	due: Date;
	priority: "low" | "medium" | "high";
	assignedTo: Party;
	artifact?: Artifact
	comments?: Comment[];
	subtasks?: Task[];
};
/*
Task:
	username?: string;				assignedTo: Party
									owner: Party [Group]
									type: string
									status: string
    name: string;					title: string
    datetime: string;				due: Date
    datetimeformat?: string;
    priority: string;				"low" | "medium" | "high"
    privacy?: boolean;				
    comments?: string[];			comments: Comment[]
    subtasks?: Task[]
Comment:
									author: Party;
									date: Date;
									comment: string
Party:
									name: string
Person extends Party
Group extends Party
*/
export class Comment {
	type: "comment" | "modfication"; //A modfication holds a JSON delta in the comment.
	author: Party;
	date: Date;
	comment: string; //terms are embedded via [TERM], tasks via #id, users via @user
}

export class Artifact extends Item {
	revision: Date;
	priorRevision: Artifact;
	editor: Person;
	/* For a given id, there can only be 1 revision with a published status.
		Revised is a formerly published revision that replaced with another published revision */
	declare status: ItemStatus | "published" | "revised"
	contentType: string;
	content: any;
}

export class Article extends Artifact {
	declare status: "published";
}
/* A Party can be an individual user, group, or agent (i.e. "bot") */
export class Party {
	name: string;
	tasks: Task[]; //root tasks
}

export class Group extends Party {
	members: Member[];
	types: bundle<ItemType>;
	getArtifact(id: string, revision?: Date): Artifact {
		return undefined;
	}
}
export class Person extends Party {
	groups: Group[]
}
export class Agent extends Party {
	methods: bundle<any>; /* functions to act on items, i.e. Tasks and Articles */
}
export class Member {
	group: Group
	member: Party;
	role: "editor" | "approver" | "reader" | "owner"
}

// interface Search {
// 	terms: string[],
// 	parties: string[],
//	types: string[],
//	fromDate: Date
//	toDate: Date
//	title: string
//	content: string
//	status: string[]
// }

/*
	Location:
		path
		co-ordinate
		address
*/