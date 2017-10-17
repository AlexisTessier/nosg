'use strict';

/**
 * @name generate
 *
 * @description Run a generator and save the generated files
 *
 * @param {function | string} generator Which generator to use. It can be a function, the name of one nosg generator in the generators layers, or a Javascript Value Locator to a function.
 * @param {object} options The options passed to the generator function.
 */
function generateCommand({
	generator,
	options = {},
	stdout = process.stdout,
	cli
}) {
	stdout.write(
		`LOG: ${cli.name} generate will run the generator ${generator} with the options ${JSON.stringify(options, '  ')}`
	);
}

module.exports = generateCommand;