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
	const loggableOptions = JSON.stringify(options, '  ');
	const loggableGenerator = generator.name;

	log(stdout, msg(
		`${cli.name} run-generator will run the generator "${loggableGenerator}"`,
		`with the options ${loggableOptions}.`
	));

	let generateCallCount = 0;
	function generateProxy(...args){
		generateCallCount++;
		generate(...args);
	}

	const promise = new Promise((resolve, reject) => {
		const rejectTimeout = setTimeout(()=>{
			if (generateCallCount === 0) {
				reject(new Error(msg(
					`${cli.name} run-generator detected an error in the generator "${loggableGenerator}".`,
					`The generator "${loggableGenerator}" doesn't have called yet the generate function`,
					`after a timeout of ${timeout}ms. Try to increase the timeout option when using`,
					`${cli.name} run-generator, or check that the generator works correctly and actually`,
					`calls the generate function.`
				)));
			}
		}, timeout);

		const resolver = () => {
			clearTimeout(rejectTimeout);
			generate.off('finish', resolver);

			log.success(stdout, msg(
				`${cli.name} run-generator correctly runned the generator "${loggableGenerator}"`,
				`with the options ${loggableOptions}.`
			));

			resolve();
		};
		generate.on('finish', resolver);
	});

	generator(generateProxy, options);

	return promise;
}

module.exports = runGeneratorCommand;