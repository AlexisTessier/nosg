'use strict';

const fs = require('fs');
const path = require('path');

const generateGenerate = require('files-generator');

const msg = require('@alexistessier/msg');

const log = require('../tools/log');

/**
 * @name run-generator
 *
 * @description Run a NOSG generator. A NOSG generator is a function which generate files using a generate function.
 *
 * @param {object} options An object containing the command options.
 * @param {function | string} options.generator The generator to use. It can be a function, the name of one nosg generator in the generators layers, or a Javascript Value Locator to a function.
 * @param {object} options.options The options passed to the generator function.
 * @param {object} options.sourcesDirectory The path to the sources directory of the nosg project to use.
 * @param {object} options.timeout The command timeout. If the command is not terminated after this duration, an error will be thrown.
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
	const loggableOptions = JSON.stringify(options);
	const loggableGenerator = generator.name;

	const sourcesDirectoryArg = sourcesDirectory;
	const useAbsoluteSourcesDirectory = path.isAbsolute(sourcesDirectory);

	sourcesDirectory = useAbsoluteSourcesDirectory ? sourcesDirectory : path.join(process.cwd(), sourcesDirectory);

	try{
		if(!fs.lstatSync(sourcesDirectory).isDirectory()){

		}
	}
	catch(err){
		if(err.code == 'ENOENT'){
			if (useAbsoluteSourcesDirectory) {
				throw new Error(msg(
					`"${sourcesDirectory}" is not a valid sources directory path.`,
					`The directory doesn't seem to exist.`
				));
			}

			throw new Error(msg(
				`"${sourcesDirectoryArg}" is not a valid sources directory path.`,
				`The directory doesn't seem to exist. Ensure that you are running the`,
				`run-generator command in an appropriate current working directory.`
			));
		}
		else{
			throw err;
		}
	}


	log(stdout, msg(
		`${cli.name} run-generator will run the generator "${loggableGenerator}"`,
		`with the options ${loggableOptions}.`
	));

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
				reject(new Error(msg(
					`${cli.name} run-generator detected an error in the generator "${loggableGenerator}".`,
					`The generator "${loggableGenerator}" doesn't have called yet the generate function`,
					`after a timeout of ${timeout}ms. Try to increase the timeout option when using`,
					`${cli.name} run-generator, or check that the generator works correctly and actually`,
					`calls the generate function.`
				)));
			}
		}, timeout);

		const resolver = event => {
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

	generator(generateProxy, Object.assign({
		sourcesDirectory
	}, options));

	return promise;
}

module.exports = runGeneratorCommand;