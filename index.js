var _ = require('lodash');
var xml2js = require('xml2js');
var request = require('request');

var config = require('./config');


function buildRequest (body) {
    var options = {
        url: 'https://ct.callcreditsecure.co.uk/Services/CallReport/callreport7.asmx',
        method: 'POST',
        headers: {
            'User-Agent': 'callreport7-api',
            'Content-Type': 'text/xml; charset=utf-8',
            'Accept': 'text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8',
            'Accept-Encoding': 'none',
            'Accept-Charset': 'utf-8',
            'Connection': 'close'
        },
        followAllRedirects: true
    };
    options.body = body;

    return options;
}

function getHeaderObject () {
    return {
        callcreditheaders: {
            company: config.company,
            username: config.username,
            password: config.password
        }
    };
}

function addPrefix (obj, prefix) {
    var build = {};
    _.each(obj, function (value, key) {
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
    })

    return build;
}

function buildRequestBody (operationBody) {
    var builder = new xml2js.Builder({
        headless: true
    });

    var header = getHeaderObject();
    var bodyObj = {
        'soap:Envelope': {
            $: {
                'xmlns:soap': 'http://www.w3.org/2003/05/soap-envelope',
                'xmlns:soap1': 'urn:callcredit.co.uk/soap:callreport7'
            },
            'soap:Header': header,
            'soap:Body': operationBody
        }
    }
    var bodyObj = addPrefix(bodyObj, 'soap1');
    return builder.buildObject(bodyObj);
}

var Search07aInput = {
    Search07a: {
        SearchDefinition: {
            payload: {
                one: 1,
                two: 2
            },
            yourreference: "ABC 123",
            creditrequest: {
                $: {
                    schemaversion: "7.0",
                    datasets: 97
                },
                applicant: {
                    address: { // all are optional should do the match against what we have
                        abodeno: "",
                        buildingno: "1",
                        buildingname: "",
                        street1: "TOP GEAR LANE",
                        street2: "",
                        sublocality: "",
                        locality: "",
                        posttown: "TEST TOWN",
                        postcode: "X9 9LF",
                        //startdate: "2000-01-01",
                        //enddate: "2010-01-01",
                        //duration: "P5Y0M0D"
                    },
                    name: {
                        title: "MISS",
                        forename: "JULIA",
                        othernames: "",
                        surname: "AUDI",
                        suffix: ""
                    },
                    //dob: "1944-10-13",
                    hho: 0, // bit - house hold check - ask
                    tpoptout: 0, // bit - has opted out of use of third party data
                    applicantdemographics: {
                        contact: {
                            email: {
                                type: "03",
                                address: "Julia.Audi@email.com"
                            },
                            telephone: {
                                type: "13",
                                std: "0123",
                                number: "456789"
                            }
                        },
                        employment: null
                    }
                },
                score: 0, // bit: 0/1 - investigate
                purpose: "AV", // The list of possible values can be obtained from the web method LookupData07a table id = searchpurpose - ask
                credittype: "ZF", //The list of possible values can be obtained from the web method LookupData07a table id = credittype - ask
                balorlim: 999999, //-ask
                term: "P1Y0M0D", //-ask
                transient: 0, //bit - ask no financial
                autosearch: 0, //bit
                autosearchmaximum: 3
            }
        }
    }
};

var LookupData07aInput = {
    LookupData07a: 'searchpurpose'
}
var body = buildRequestBody(Search07aInput);
var reqOptions = buildRequest(body);
console.log(body);


request(reqOptions, function (err, response, body) {
    var parser = new xml2js.Parser({
        explicitArray: false
    });
    parser.parseString(body,
        function (err, result) {
            console.log(result);
            var respObj = result['soap:Envelope']['soap:Body'];
            var text = respObj['soap:Fault']['soap:Reason']['soap:Text'];
            console.log(text);
            console.log(respObj);
            console.log('Done');
        });
})
