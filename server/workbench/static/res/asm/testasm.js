import assemble from "./asm.mjs";
import exec from "./exec.mjs";
let source = `
Code
set r0 total   ; total (start as seed)
get r0 r0;
set r1 4    ; increment
set r2 2    ; fraction
; r3 =scratch for conditions
set r4 0;
loop:
    add r4 1; //loop count.
    add r0 r1;
    set r3 r0;
    mod r3 2; 0 = even, 1 = odd;
    jnz r3 loop;
    div r0 r2
    set r3 r0
    mod r3 2
    jnz r3 loop
    hlt;
Data
    total: 27
            -32
    limit: -1000000000
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
    data: asm.segments[1].data
}
exec(vm);
