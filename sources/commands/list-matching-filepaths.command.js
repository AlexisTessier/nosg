'use strict';

const path = require('path');

const glob = require('glob');

const defaultOptions = require('../settings/default-options');

const log = require('../tools/log');

const checkSourcesDirectory = require('./check-sources-directory.command');

const pathSep = '/';
const setSep = ':';
const joker = '*';

/**
 * @name list-matching-filepaths
 *
 * @description Take a nosg component path and list the matching filepaths.
 *
 * @param {object} options An object containing the command options.
 * @param {string} options.componentPath The nosg component path from which find the matching filepaths.
 * @param {string} options.layer A layer name. If used, only the component path which are from this layer will be listed.
 * @param {string} options.componentsSet A components set name. If used, only the component path which are from this components set will be listed.
 * @param {string} options.sourcesDirectory The path to the sources directory of the nosg project to use.
 *
 * @returns {Promise} A promise resolving an array of filepaths matching the component path.
 */
function listMatchingFilepathsCommand({
	componentPath,
	layer = '',
	componentsSet = '',
	sourcesDirectory = defaultOptions.sourcesDirectory,
	stdout
}) {
	sourcesDirectory = checkSourcesDirectory({sourcesDirectory});

	const splittedComponentPath = componentPath
		.replace(setSep, [pathSep, joker, pathSep].join(''))
		.split(pathSep);

	for(let i = 3 - splittedComponentPath.length;i>0;i--){
		splittedComponentPath.unshift(joker);
	}

	const patternComponentPath = splittedComponentPath.join(pathSep);
	const fullPatternPath = path.isAbsolute(patternComponentPath)
		? patternComponentPath
		: path.join(sourcesDirectory, patternComponentPath);

	const patterns = [
		`${fullPatternPath}.js`,
		`${fullPatternPath}/index.js`
	];

	const lastFragment = splittedComponentPath[splittedComponentPath.length - 1];
	const lastFragmentExtname = path.extname(lastFragment);
	if (lastFragmentExtname === '.js') {
		patterns.unshift(fullPatternPath);
	}

	return Promise.all(patterns.map(pattern => new Promise((resolve, reject) => {
		glob(pattern, {nodir: true, silent: true}, (err, filepaths) => {
			if (err) {
				reject(err);
				return;
			}

			resolve(filepaths);
		});
	}))).then(filepaths => {
		const uniqFilter = [];
		filepaths = filepaths.reduce((flat, list) => [...flat, ...list]).filter(filepath => {
			const uniq = !uniqFilter.includes(filepath);
			uniqFilter.push(filepath);
			return uniq;
		}).filter(filepath => {
			if (typeof layer === 'string' && layer.trim().length > 0) {
				const relativeToSourceComponentPath = path.relative(sourcesDirectory, filepath);
				const fileLayer = relativeToSourceComponentPath.split(pathSep)[1];

				return layer === fileLayer;
			}

			return true;
		}).sort();

		log(stdout, [
			`List of filepaths matching "${componentPath}":`,
			...filepaths.map(filepath => `\t- "${filepath}"`)
		].join('\n'));

		return filepaths;
	});
}

module.exports = listMatchingFilepathsCommand;