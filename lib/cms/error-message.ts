export function clientErrorMessage(error:unknown){return error instanceof SyntaxError?'Check the form details and try again.':error instanceof Error?error.message:'Request failed';}
