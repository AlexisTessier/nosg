'use strict';

const msg = require('@alexistessier/msg');

const log = require('../tools/log');

const getGenerateInstance = require('../get-generate-instance');

/**
 * @name run-generator
 *
 * @description Run a generator and save the generated files
 *
 * @param {function | string} generator Which generator to use. It can be a function, the name of one nosg generator in the generators layers, or a Javascript Value Locator to a function.
 * @param {object} options The options passed to the generator function.
 *
 * @returns {Promise} A promise which resolve when all the generator ends to generate files.
 */
function runGeneratorCommand({
	generator,
	options = {},
	sourcesDirectory,
	timeout = 10000,
	generate = getGenerateInstance(),
	stdout,
	cli
}) {
	log(stdout, msg(
		`${cli.name} generate will run the generator "${generator.name}"`,
		`with the options ${JSON.stringify(options, '  ')}`
	));

	generate.on('finish', (...args) => {
		//console.log('------')
		//console.log(args)
	});

	generator(generate, options);

	return new Promise();
}

module.exports = runGeneratorCommand;