'use strict';
var _ = require('lodash');
var soap = require('./soap');

function Client (options) {
    this.headers = options.headers;
}

Client.prototype.Test07a = function (input, callback) {
    var name = 'Test';

    soap(name, this.headers, {}, function (err, response) {
        if (err) {
            // error with request; ignore for now
        }
        console.log(JSON.stringify(response, null, 2));
        callback();
    })
};

Client.prototype.Search07a = function (input, callback) {
    var name = 'Search';
    var version = '07a';

    soap(name, this.headers, input, function (err, response) {
        if (err) {
            // error with request; ignore for now
        }

        var responseKey = name + version + 'Response';
        var output = response.Envelope.Body[responseKey];

        callback(null, output);
    });
};

module.exports.Client = Client;