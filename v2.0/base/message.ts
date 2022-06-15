import {Signal} from "./control.js";

export class Message<T> implements Signal {
	constructor(subject: string, from: any, to?: any, body?: T) {
		this.subject = subject;
		this.from = from;
		if (to) this.to = to;
		if (body) this.body = body;
	}
	readonly direction = "down";
	subject: string;
	from: any;
	/** The path, control, etc. */
	declare to?: any;
	declare body?: T; // serial | Buffer	//naming compatibility with Express.js
}

export class Response<T> extends Message<T> {
	constructor(request: Message<unknown>, from: any, status: number, body?: T) {
		super(request.subject, from, null, body);
		this.req = request;
		this.statusCode = status;
	}
	readonly req: Message<unknown>;			//naming compatibility with Express.js
	readonly statusCode: number;			//naming compatibility with Express.js
}
