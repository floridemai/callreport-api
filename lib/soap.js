'use strict';

var _ = require('lodash');
var request = require('request');
var xml2js = require('xml2js');

var builder = new xml2js.Builder({headless: true});
var parser = new xml2js.Parser({explicitArray: false});


module.exports = function SoapRequest (type, headers, body, callback) {
    var url = 'https://ct.callcreditsecure.co.uk/Services/CallReport/callreport7.asmx';
    var prefix = 'soap1';
    var version = '07a';

    var envelope = {
        '$': {},
        'soap:Header': {
            'callcreditheaders': {
                company: headers.company,
                username: headers.username,
                password: headers.password
            }
        },
        'soap:Body': {}
    };

    // namespaces
    envelope['$']['xmlns:soap'] = 'http://www.w3.org/2003/05/soap-envelope';
    envelope['$']['xmlns:' + prefix] = 'urn:callcredit.co.uk/soap:callreport7';
    // request type
    var op = type + version;
    envelope['soap:Body'][op] = body;

    var input = addPrefix({'soap:Envelope': envelope}, prefix);
    var options = getRequestOptions(url, input);
    request(options, function (err, response, body) {
        parser.parseString(body, function (err, bodyJson) {
            if (err) {
                return callback(err)
            }

            callback(null, stripPrefix(bodyJson));
        });
    });
};

function addPrefix (object, prefix) {
    var build = {};
    _.each(object, function (value, key) {
        if (key === '$') {
            build['$'] = value;
            return true;
        }

        var newKey = key.indexOf(':') !== -1 ? key : prefix + ':' + key;

        var newValue = value;
        if (_.isObject(value)) {
            newValue = addPrefix(value, prefix);
        }

        build[newKey] = newValue;
    });

    return build;
}

function stripPrefix (object) {
    var build = {};
    _.each(object, function (value, key) {
        var index = key.indexOf(':');
        var newKey = index !== -1 ? key.substring(index + 1) : key;

        var newValue = value;
        //TODO: improve (maybe use xml2js tagNameProcessors?)
        if (_.isObject(value) && !_.isArray(value)) {
            newValue = stripPrefix(value);
        }

        build[newKey] = newValue;
    });

    return build;
}

function getRequestOptions (url, body) {
    return {
        url: url,
        method: 'POST',
        headers: {
            'User-Agent': 'callreport',
            'Content-Type': 'text/xml; charset=utf-8',
            'Accept': 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
            'Accept-Encoding': 'none',
            'Accept-Charset': 'utf-8',
            'Connection': 'close'
        },
        followAllRedirects: true,
        body: builder.buildObject(body)
    };
}
