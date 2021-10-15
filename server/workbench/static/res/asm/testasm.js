import assemble from "./asm.mjs";
import exec from "./exec.mjs";
let source = `
Code
set r0 27   ; seed
set r1 4    ; increment
set r2 2    ; fraction
set r3 0    ; scratch reg. for conditions
set r4 0;   ; loop count
loop:
    add r4 1;
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
