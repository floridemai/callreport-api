var soap = require('soap');
var config = require('./config');

var wsdlFile = "./schema/CallReport7.wsdl";
soap.createClient(wsdlFile, function (err, client) {
    if (err) {
        return console.log(err);
    }

    var headers = {
        callcreditheaders: {
            company: config.company,
            username: config.username,
            password: config.password
        }
    };
    client.addSoapHeader(headers);

    client.Test07a({}, function (err, result) {
        console.log(err);
    });
});
