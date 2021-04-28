export default `
	lift$package: tokens ^ pairs,
	lift$tokens: [ws comment number name word op string bkt pn]*,
	lift$pairs: [pair item]*  ^ items,

	lift$items: [(#pair ";"#pn) error]*,
	error: [item scope bracket paren]!,

	lift$item: [expr value #pn],
	lift$ele: [expr value],
	lift$value: [object array #string #number #name #word code],
	lift$code: [fn eval body exprs #op],
	
	pair: (ele ":"#pn ele?),
	expr: (value value!),

	lift$properties: (pair (","#pn pair)* ","#pn?),
	lift$exprList: (ele (","#pn ele)*),

	object: (#name? "{"#bkt properties? "}"#bkt),
	array:  ("["#bkt exprList? "]"#bkt),
	exprs:  ("("#bkt exprList? ")"#bkt),
	eval: ("{"#bkt value! "}"#bkt),
	body: ("{"#bkt [statement ";"#pn]! "}"#bkt),

	fn: ([args paren] [object body scope] catch? finally?),
	args: ("("#bkt [pair expr value] (","#pn [pair expr value])* ")"#bkt),
	catch: ("catch"#word [object body scope]),
	finally: ("finally"#word [object body scope]),
	
	lift$statement: [if etc pair expr value],
	
	if: ("if"#word [exprs paren] body else?),
	else: ("else"#word [if body]),
	while: ("while"#word exprs body),
	for: ("for"#word paren body),
	switch: ("switch"#word [exprs paren] [object body scope]),
	return: ("return"#word value*),
	throw: ("throw"#word value*),
	lift$etc: [while for switch return],
	
	scope: ("{"#bkt ~endscope* "}"#bkt),
	endscope: "}"#bkt,
	bracket:  ("["#bkt [item braceError parenError]* "]"#bkt),
	paren:  ("("#bkt [item braceError bracketError]* ")"#bkt),
	parenError: [")"#bkt "("#bkt],
	bracketError: ["]"#bkt "["#bkt],
	braceError: ["}"#bkt "{"#bkt],
	
	token$bkt: #"{}()[]", /* bracket */
	token$pn: #":,;", /* punctuation */
	
	token$number: (#"+-"? digit! (#"." digit!)? (#"Ee" #"+-"? digit!)?),
	token$string: (quote [(esc quote) ~quote]* quote),
	token$name: ((lower idPart* #".")* upper idPart*),
	token$word: (lower idPart*),
	token$op: [join access mul add cmp bool],
	
	idPart: [upper lower letterLike digit],
	upper: #"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	lower: #"abcdefghijklmnopqrstuvwxyz",
	letterLike: #"$_",
	digit: #"0123456789",
	
	join: #".",
	access: #"@#^",
	mul: #"*/%",
	add: #"+-",
	cmp: #"<=>!",
	bool: #"&|~",
	
	quote: #"\\\"",
	esc: #"\\\\",
	
	commentStart: (#"/" #"*"),
	commentEnd: (#"*" #"/"),
	none$comment: (commentStart ~commentEnd* commentEnd),
	
	none$ws: #" \t\r\n"*,
`;
