'use strict';

const generate = require('files-generator');

const instance = generate();

function getGenerateInstance(){
	return instance;
}

module.exports = getGenerateInstance;