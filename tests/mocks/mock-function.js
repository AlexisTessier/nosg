'use strict';

const sinon = require('sinon');

function mockFunction() {
	return sinon.spy();
}

module.exports = mockFunction;