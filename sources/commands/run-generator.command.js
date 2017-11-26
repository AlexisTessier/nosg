'use strict';

const fs = require('fs');
const path = require('path');

const generateGenerate = require('files-generator');

const checkSourcesDirectory = require('./check-sources-directory.command');

const {
	unvalidGenerator: UNV_GEN,
	generateNotCalledTimeout: GEN_NOT_CAL_TMO,
	generateFinishEventNotEmittedTimeout: GEN_FIN_EVT_TMO,
	willRunGenerator: WIL_RUN_GEN,
	hasRunnedGenerator: HAS_RUN_GEN,
	generatedFilesList: GEN_FIL_LIS
} = require('../settings/logs');

const log = require('../tools/log');

/**
 * @name run-generator
 *
 * @description Run a NOSG generator. A NOSG generator is a function which generate files using a generate function.
 *
 * @param {object} options An object containing the command options.
 * @param {function | string} options.generator The generator to use. It can be a function or a component path to a function.
 * @param {object} options.options The options passed to the generator function.
 * @param {string} options.sourcesDirectory The path to the sources directory of the nosg project to use.
 * @param {number} options.timeout The command timeout. If the command is not terminated after this duration, an error will be thrown.
 * @param {function | string | JVL} options.generate The generate function to pass to the generator.
 *
 * @returns {Promise} A promise which resolve when all the generator ends to generate files.
 */
function runGeneratorCommand({
	generator,
	options = {},
	sourcesDirectory = 'sources',
	timeout = 10000,
	generate = generateGenerate(),
	stdout,
	cli
}) {
	if (typeof generator !== 'function' && typeof generator !== 'string') {
		throw new TypeError(UNV_GEN({generator}));
	}

	/*----------------------------*/

	const command = 'run-generator';

	sourcesDirectory = checkSourcesDirectory({sourcesDirectory});

	const generatorFunction = typeof generator === 'string' ? require(path.join(sourcesDirectory, generator)) : generator;

	log(stdout, WIL_RUN_GEN({
		cli, command, generator, options
	}));

	let generateCallCount = 0;
	const generateProxy = new Proxy(generate, {
		apply(_generate, context, args){
			generateCallCount++;
			_generate.apply(context, args);
		}
	});

	const promise = new Promise((resolve, reject) => {
		const rejectTimeout = setTimeout(()=>{
			if (generateCallCount === 0) {
				reject(new Error(GEN_NOT_CAL_TMO({
					cli, command, generator, timeout
				})));
			}
			else{
				reject(new Error(GEN_FIN_EVT_TMO({
					cli, command, generator, timeout
				})));
			}
		}, timeout);

		const resolver = event => {
			clearTimeout(rejectTimeout);
			generate.off('finish', resolver);

			log.success(stdout, HAS_RUN_GEN({
				cli, command, generator, options
			}));

			const filesList = event.success.sort();

			log(stdout, GEN_FIL_LIS({
				filesList
			}));

			resolve(filesList);
		};
		generate.on('finish', resolver);
	});

	generatorFunction(generateProxy, Object.assign({
		sourcesDirectory
	}, options));

	return promise;
}

module.exports = runGeneratorCommand;