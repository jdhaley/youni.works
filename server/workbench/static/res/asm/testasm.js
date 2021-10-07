import assemble from "./asm.mjs";
import exec from "./exec.mjs";
let source = `
Code
set r2 99       ; the value must be less than 99.
loop:
    get r1 var  ; fetch the data into r1. It is externally set to 7.
    add r1 13   ; add 13 to the value in r1.
    put r1 var  ; put the r1 value into memory at r0.
    add r1 r2   ; if (r1 < r2)...
    jn  r1 loop ;   goto loop
hlt
Data
 ;           -32
    var:  7 60 61 62 63  ; comment test.
    arr: *5
    string: "Hello, world!!"
    next: 13
`
let asm = assemble(source);
document.body.innerHTML = asm.target;

let vm = {
    asm: asm,
    pc: 0,
    r: [0, 0, 0, 0, 0, 0, 0, 0],
    code: asm.segments[0].opcodes,
    data: asm.segments[1].value
}
exec(vm);
