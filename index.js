'use strict';

var config = require('./config');
var callReport = require('./lib/call-report');

var client = new callReport.Client({
    url: 'https://ct.callcreditsecure.co.uk/Services/CallReport/callreport7.asmx',
    headers: {
        company: config.company,
        username: config.username,
        password: config.password
    }
});

var Search07aInput = {
    SearchDefinition: {
        payload: {
            one: 1,
            two: 2
        },
        yourreference: "ABC 123",
        creditrequest: {
            $: {
                schemaversion: "7.0",
                datasets: 2
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
                dob: "1944-10-13",

                // A value of 1 indicates a household override check is requested for the applicant
                // => HHO was requested but is not enabled in the User's Organisational Unit.
                hho: 0,

                // tpd - Third Party - Alerts - Optional (via admin setting)
                // A value of 1 indicates that the applicant has opted out of use of third party data
                tpoptout: 1,

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

            // A value of 1 indicates that a score has been requested
            score: 1,

            // Credit request search purpose (The list of possible values can be obtained from the web method LookupData07a table id = searchpurpose)
            purpose: "EC",
            // ??? the only purposes that work:
            // EC: "Employee Check (Non-SHARE)"
            // 58: "Limited Subject Access Request (158)"
            // XS: "Exempted Search (not available for input on a search request)"

            // Credit type (The list of possible values can be obtained from the web method LookupData07a table id = credittype)
            //credittype: "ZF",

            // Balance or credit limit applied for
            //balorlim: 999999999,

            // Term of loan applied for
            //term: "P1Y0M0D",

            // A value of 1 indicates that no financial association will be generated from the application (transient association)
            transient: 0,

            // A value of 1 indicates that auto-searching of undeclared addresses has been requested
            autosearch: 0,

            // The maximum number of addresses to auto-search
            autosearchmaximum: 999
        }
    }
};
client.Search07a(Search07aInput, function (err, resp) {
    if (err) {
        throw new Error(err);
    }

    var result = resp.SearchResult;

    var score = parseInt(result.creditreport.applicant.creditscore.score._);
    // the only possible value: 2 (Gauge Scorecard)
    var scoreClass = parseInt(result.creditreport.applicant.creditscore.score.$.class);
    console.log('Score: ' + score);
    console.log('Score class: ' + scoreClass);
});

