import test from 'node:test';
import assert from 'node:assert/strict';
const api=await import('../lib/cms/error-message.ts').catch(()=>({}));
test('malformed security form JSON never echoes a submitted password in its error',()=>{
 assert.equal(typeof api.clientErrorMessage,'function');const submitted='Private temporary passphrase 987!';
 const message=api.clientErrorMessage(new SyntaxError(`Unexpected token, "${submitted}" is not valid JSON`));
 assert.equal(message,'Check the form details and try again.');assert.equal(message.includes(submitted),false);
 assert.equal(api.clientErrorMessage(new Error('Only an owner can manage administrators.')),'Only an owner can manage administrators.');
});
