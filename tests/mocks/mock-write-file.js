'use strict';

const sinon = require('sinon');

/* ----------------- */
//	Because nosg use an unique generate instance
//	It's neccesary to filter call to writeFile
//	Otherwise, tests of the instance in the same file
//	causes multiple call of generate and it's impossible to test
/* ----------------- */
module.exports = function mockWriteFile(absoluteFilePath) {
	const filtered = sinon.spy((filePath, content, options, cb) => cb());

	if (typeof absoluteFilePath !== 'string') {
		return filtered;
	}

	return function writeFile(filePath, content, options, cb){
		if (filePath === absoluteFilePath) {
			writeFile.filtered = filtered;
			writeFile.cb = cb;
			filtered(filePath, content, options, cb);
		}
		else{
			cb();
		}
	}
}