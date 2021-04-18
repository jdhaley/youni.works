export default `
	lift$source:		[strip pn div word name op number string q tt bin invalid]* ^ content,
		none$strip:		[wsChar! nestComment lineComment]*,
		token$pn:		pnChar,
		token$div:		divChar,
		
		token$op:		opChar,
		token$word:		(lower letter*),
		token$name:		(upper letter*),
		token$number:	(#"+-"? digit! (#"." digit!)? (#"Ee" #"+-"? digit!)?),
		token$string:	(quot [(esc quot) ~quot]* quot),
		token$q:		(apos [(esc apos) ~apos]* apos),
		token$tt:		(tick [(esc tick) ~tick]* tick),
		token$bin:		(esc letter*),
		token$invalid:	#"",
	
	lift$content:		[sequence scope collection token #pn #invalid]* ^ statements,
		lift$token:		[#word #name #op #number #string #q #tt #bin],
		sequence:		("("#div content? [")"#div error]),
		scope:			("{"#div content? ["}"#div error]),
		collection:		("["#div content? ["]"#div error]),
		error:			[#div #invalid]!,

	lift$statements:	stmt*,
		lift$value:		[token #sequence #scope #collection #error],
		stmt:			([rcd expr]? ele* ";"#pn?),
		rcd:			(expr? field!),
		field:			(":"#pn value*),
		ele:			(","#pn [rcd value*]?),
		expr:			value*,

	/* Tokenization rules */
	lineComment:		(lineCommentStart ~lineCommentEnd* lineCommentEnd),
	nestComment:		(nestCommentStart ~nestCommentEnd* nestCommentEnd),
	lineCommentStart:	(#"/" #"/"),
	nestCommentStart:	(#"/" #"*"),
	lineCommentEnd:		(#"\n"),
	nestCommentEnd:		(#"*" #"/"),

	/* Charsets */
	char:	[letter wsChar pnChar divChar opChar quot apos tick esc],
	letter: [upper lower letterLike digit],
	wsChar:	#" \t\n\r",
	pnChar:	#";,:",
	divChar:#"{}()[]",
	opChar:	#".@#^*/%+-<=>!&|~?"!,

	upper: #"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	lower: #"abcdefghijklmnopqrstuvwxyz",
	digit:	#"0123456789",
	letterLike: #"$_",
	
	quot:	#"\\\"",
	apos:	#"'",
	tick:	#"\0x60",
	esc:	#"\\\\",
`;