export function fromCsv(data: string) {
	let lines = parseCsv(data) as string[][];
	let header = lines.shift();
	for (let i = 0; i < lines.length; i++) {
		let line = lines[i];
		let object = Object.create(null);
		for (let col = 0; col < header.length; col++) {
			if (line[col] !== undefined) object[header[col]] = line[col];
		}
		for (let col = header.length; col < line.length; col++) {
			if (line[col] !== undefined) object["$" + col] = line[col];
		}
		lines[i] = object; 
	}
	return lines;
}

export function parseCsv(data: string): unknown[][] {
	let lines = [];
	let length = data.length;
	let index = 0;
	while (index < length) {
		let line = [];
		index = parseLine(line, data, index);
		lines.push(line);
	}
	return lines;
}

function parseLine(line: unknown[], data: string, index: number): number {
	let start = index;
	while (index < data.length) {
		switch (data[index]) {
			case "\n":
				line.push(parseField(data, start, index - (data[index - 1] == "\r" ? 1 : 0)))
				return ++index;
			case ",":
				line.push(parseField(data, start, index));
				index++;
				start = index;
				break;
			case "\"":
				index = parseQuotedField(line, data, index);
				start = index;
				break;
			default:
				index++;
				break;
		}
	}
	if (index != start) line.push(data.substring(start, index));
	return index;
}

function parseQuotedField(line: unknown[], data: string, index: number): number {
	index++;
	let start = index;
	while (index < data.length) {
		if (data[index] == "\"") {
			if (data[index + 1] == "\"") {
				index += 2;
			} else {
				line.push(data.substring(start, index).replace(/""/g, "\""));
				return ++index;
			}
		} else {
			index++;
		}
	}
	return index;
}

function parseField(data: string, start: number, end: number): unknown {
	data = data.substring(start, end);
	if (!data) return undefined;
	let num = Number(data);
	if (!isNaN(num)) return num;
	if (data == "true") return true;
	if (data == "false") return false;
	if (data == "null") return null;
	return data;
}