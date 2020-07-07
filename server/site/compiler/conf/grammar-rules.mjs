export default
{
	"package$": "youniworks.com/grammar-rules",
	"package$parser": "youni.works/compiler/parser",
	"grammar": {
		"type$": "parser.Rule",
		"name": "grammar",
		"production": "lift",
		"type$next": "rules",
		"type$expr": "tokens"
	},
	"tokens": {
		"type$": "parser.Choice",
		"name": "tokens",
		"production": "lift",
		"min": 0,
		"max": 9007199254740991,
		"exprs": [
			{
				"type$": "parser.Rule",
				"type$expr": "ws"
			},
			{
				"type$": "parser.Rule",
				"type$expr": "comment"
			},
			{
				"type$": "parser.Rule",
				"type$expr": "text"
			},
			{
				"type$": "parser.Rule",
				"type$expr": "pn"
			},
			{
				"type$": "parser.Rule",
				"type$expr": "not"
			},
			{
				"type$": "parser.Rule",
				"type$expr": "number"
			},
			{
				"type$": "parser.Rule",
				"type$expr": "name"
			}
		]
	},
	"rules": {
		"type$": "parser.Rule",
		"name": "rules",
		"production": "lift",
		"min": 0,
		"max": 9007199254740991,
		"type$expr": "rule"
	},
	"rule": {
		"type$": "parser.Sequence",
		"name": "rule",
		"exprs": [
			{
				"type$": "parser.Match",
				"viewName": "name"
			},
			{
				"type$": "parser.Match",
				"production": "none",
				"viewText": ":",
				"viewName": "pn"
			},
			{
				"type$": "parser.Rule",
				"type$expr": "expr"
			},
			{
				"type$": "parser.Rule",
				"min": 0,
				"max": 9007199254740991,
				"type$expr": "next"
			},
			{
				"type$": "parser.Match",
				"production": "none",
				"viewText": ",",
				"viewName": "pn"
			}
		]
	},
	"expr": {
		"type$": "parser.Sequence",
		"name": "expr",
		"production": "lift",
		"exprs": [
			{
				"type$": "parser.Choice",
				"exprs": [
					{
						"type$": "parser.Rule",
						"type$expr": "sequence"
					},
					{
						"type$": "parser.Rule",
						"type$expr": "choice"
					},
					{
						"type$": "parser.Rule",
						"type$expr": "term"
					},
					{
						"type$": "parser.Rule",
						"type$expr": "match"
					},
					{
						"type$": "parser.Rule",
						"type$expr": "call"
					},
					{
						"type$": "parser.Match",
						"viewName": "text"
					}
				]
			},
			{
				"type$": "parser.Match",
				"min": 0,
				"max": 1,
				"viewName": "number"
			}
		]
	},
	"next": {
		"type$": "parser.Sequence",
		"name": "next",
		"exprs": [
			{
				"type$": "parser.Match",
				"production": "none",
				"viewText": "^",
				"viewName": "pn"
			},
			{
				"type$": "parser.Choice",
				"exprs": [
					{
						"type$": "parser.Match",
						"viewName": "text"
					},
					{
						"type$": "parser.Match",
						"viewName": "name"
					}
				]
			}
		]
	},
	"sequence": {
		"type$": "parser.Sequence",
		"name": "sequence",
		"exprs": [
			{
				"type$": "parser.Match",
				"production": "none",
				"viewText": "(",
				"viewName": "pn"
			},
			{
				"type$": "parser.Rule",
				"min": 0,
				"max": 9007199254740991,
				"type$expr": "expr"
			},
			{
				"type$": "parser.Match",
				"production": "none",
				"viewText": ")",
				"viewName": "pn"
			}
		]
	},
	"choice": {
		"type$": "parser.Sequence",
		"name": "choice",
		"exprs": [
			{
				"type$": "parser.Match",
				"production": "none",
				"viewText": "[",
				"viewName": "pn"
			},
			{
				"type$": "parser.Rule",
				"min": 0,
				"max": 9007199254740991,
				"type$expr": "expr"
			},
			{
				"type$": "parser.Match",
				"production": "none",
				"viewText": "]",
				"viewName": "pn"
			}
		]
	},
	"term": {
		"type$": "parser.Sequence",
		"name": "term",
		"exprs": [
			{
				"type$": "parser.Match",
				"production": "none",
				"viewText": "#",
				"viewName": "pn"
			},
			{
				"type$": "parser.Match",
				"viewName": "text"
			}
		]
	},
	"match": {
		"type$": "parser.Sequence",
		"name": "match",
		"exprs": [
			{
				"type$": "parser.Match",
				"min": 0,
				"max": 1,
				"viewName": "text"
			},
			{
				"type$": "parser.Sequence",
				"exprs": [
					{
						"type$": "parser.Match",
						"production": "none",
						"viewText": "#",
						"viewName": "pn"
					},
					{
						"type$": "parser.Match",
						"viewName": "name"
					}
				]
			}
		]
	},
	"call": {
		"type$": "parser.Sequence",
		"name": "call",
		"exprs": [
			{
				"type$": "parser.Match",
				"min": 0,
				"max": 1,
				"viewName": "not"
			},
			{
				"type$": "parser.Match",
				"viewName": "name"
			}
		]
	},
	"pn": {
		"type$": "parser.Term",
		"name": "pn",
		"production": "token",
		"term": "()[],:#^"
	},
	"number": {
		"type$": "parser.Term",
		"name": "number",
		"production": "token",
		"term": "?*!"
	},
	"not": {
		"type$": "parser.Term",
		"name": "not",
		"production": "token",
		"term": "~"
	},
	"text": {
		"type$": "parser.Sequence",
		"name": "text",
		"production": "token",
		"type$next": "stripQuotes",
		"exprs": [
			{
				"type$": "parser.Rule",
				"type$expr": "quote"
			},
			{
				"type$": "parser.Choice",
				"min": 0,
				"max": 9007199254740991,
				"exprs": [
					{
						"type$": "parser.Sequence",
						"exprs": [
							{
								"type$": "parser.Rule",
								"type$expr": "esc"
							},
							{
								"type$": "parser.Rule",
								"type$expr": "quote"
							}
						]
					},
					{
						"type$": "parser.Rule",
						"not": true,
						"type$expr": "quote"
					}
				]
			},
			{
				"type$": "parser.Rule",
				"type$expr": "quote"
			}
		]
	},
	"name": {
		"type$": "parser.Sequence",
		"name": "name",
		"production": "token",
		"exprs": [
			{
				"type$": "parser.Rule",
				"type$expr": "lower"
			},
			{
				"type$": "parser.Choice",
				"min": 0,
				"max": 9007199254740991,
				"exprs": [
					{
						"type$": "parser.Rule",
						"type$expr": "lower"
					},
					{
						"type$": "parser.Rule",
						"type$expr": "upper"
					},
					{
						"type$": "parser.Rule",
						"type$expr": "letterLike"
					},
					{
						"type$": "parser.Rule",
						"type$expr": "digit"
					}
				]
			}
		]
	},
	"ws": {
		"type$": "parser.Term",
		"name": "ws",
		"production": "none",
		"min": 0,
		"max": 9007199254740991,
		"term": " \t\r\n"
	},
	"comment": {
		"type$": "parser.Sequence",
		"name": "comment",
		"production": "none",
		"exprs": [
			{
				"type$": "parser.Rule",
				"type$expr": "commentStart"
			},
			{
				"type$": "parser.Rule",
				"min": 0,
				"max": 9007199254740991,
				"not": true,
				"type$expr": "commentEnd"
			},
			{
				"type$": "parser.Rule",
				"type$expr": "commentEnd"
			}
		]
	},
	"upper": {
		"type$": "parser.Term",
		"name": "upper",
		"term": "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	},
	"lower": {
		"type$": "parser.Term",
		"name": "lower",
		"term": "abcdefghijklmnopqrstuvwxyz"
	},
	"letterLike": {
		"type$": "parser.Term",
		"name": "letterLike",
		"term": "$_"
	},
	"digit": {
		"type$": "parser.Term",
		"name": "digit",
		"term": "0123456789"
	},
	"quote": {
		"type$": "parser.Term",
		"name": "quote",
		"term": "\\\""
	},
	"esc": {
		"type$": "parser.Term",
		"name": "esc",
		"term": "\\\\"
	},
	"commentStart": {
		"type$": "parser.Sequence",
		"name": "commentStart",
		"exprs": [
			{
				"type$": "parser.Term",
				"term": "/"
			},
			{
				"type$": "parser.Term",
				"term": "*"
			}
		]
	},
	"commentEnd": {
		"type$": "parser.Sequence",
		"name": "commentEnd",
		"exprs": [
			{
				"type$": "parser.Term",
				"term": "*"
			},
			{
				"type$": "parser.Term",
				"term": "/"
			}
		]
	},
	"stripQuotes": {
		"type$": "parser.strip",
		"name": "stripQuotes"
	}
}
