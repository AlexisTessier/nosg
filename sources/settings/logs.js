'use strict';

const msg = require('@alexistessier/msg');

const loggableOptions = options => JSON.stringify(options);
const loggableGenerator = generator => typeof generator === 'function' ? generator.name : generator;

module.exports = {
	// Errors
	unvalidGenerator: ({generator}) => msg(
		`${generator} (${typeof generator}) is not a valid generator value.`,
		`Generator can be a function, a component path to`,
		`a function or a Javascript Value Locator to a function.`
	),
	unvalidSourcesDirectory: ({sourcesDirectory}) => msg(
		`"${sourcesDirectory}" is not a valid sources directory path.`,
		`The path was found but it's not a directory.`
	),
	unexistentSourcesDirectory: ({sourcesDirectory}) => msg(
		`"${sourcesDirectory}" is not a valid sources directory path.`,
		`The directory doesn't seem to exist.`
	),
	ensureCurrentWorkingDirectory: ({command}) => msg(
		`Ensure that you are running the ${command}`,
		`command in an appropriate current working directory.`
	),
	generateNotCalledTimeout: ({ cli = {}, command, generator, timeout }) => msg(
		`${cli.name} ${command} detected an error in the generator "${loggableGenerator(generator)}".`,
		`The generator "${loggableGenerator(generator)}" doesn't have called yet the generate function`,
		`after a timeout of ${timeout}ms. Try to increase the timeout option when using`,
		`${cli.name} ${command}, or check that the generator works correctly and actually`,
		`calls the generate function.`
	),
	generateFinishEventNotEmittedTimeout: ({ cli = {}, command, generator, timeout }) => msg(
		`${cli.name} ${command} detected an error in the generator "${loggableGenerator(generator)}".`,
		`The generator "${loggableGenerator(generator)}" generate instance doesn't have emitted yet`,
		`a finish event after a timeout of ${timeout}ms. Try to increase the timeout option when using`,
		`${cli.name} ${command}, or check that the generator works correctly and actually`,
		`calls the generate function.`
	),
	// Notices
	willRunGenerator: ({ cli = {}, command, generator, options }) => msg(
		`${cli.name} ${command} will run the generator "${loggableGenerator(generator)}"`,
		`with the options ${loggableOptions(options)}.`
	),
	hasRunnedGenerator: ({ cli = {}, command, generator, options }) => msg(
		`${cli.name} ${command} correctly runned the generator "${loggableGenerator(generator)}"`,
		`with the options ${loggableOptions(options)}.`
	),
	// Success
	validSourcesDirectory: ({sourcesDirectory}) => (
		`The sources directory at path "${sourcesDirectory}" is valid.`
	)
};