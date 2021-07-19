// Require objects.
var express = require('express');
var app = express();
var aws = require('aws-sdk');
var bp = require('body-parser');
var cors = require('cors')
app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))
// app.use(cors())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Edit this with YOUR email address.
var email = "lovelyplanet@tutanota.com";

// Load your AWS credentials and try to instantiate the object.
aws.config.loadFromPath(__dirname + '/config.json');

// Instantiate SES.
var ses = new aws.SES({ apiVersion: "2010-12-01" });

app.get('/verify', function (req, res) {
    var params = {
        EmailAddress: email
    };

    ses.verifyEmailAddress(params, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data);
        }
    });
});

// Listing the verified email addresses.
app.get('/list', function (req, res) {
    ses.listVerifiedEmailAddresses(function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data);
        }
    });
});

// Deleting verified email addresses.
app.get('/delete', function (req, res) {
    var params = {
        EmailAddress: email
    };

    ses.deleteVerifiedEmailAddress(params, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data);
        }
    });
});

app.post('/testargs', function (req, res) {
    console.log(req.body)
});

app.post('/sendEmail', function (req, res) {
    var params = {
        Source: email,
        Destination: {
            BccAddresses: [ ],
            CcAddresses: [],
            ToAddresses: [
                req.body.email
            ]
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `<h1>Hello ${req.body.name},</h1> <p>We are perceived your email, I will reply within 24 hours.</p>`
                },
                Text: {
                    Charset: "UTF-8",
                    Data: `Hello ${req.body.name}, we are perceived your email. I will reply to you within 24 hours`
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: "We are received your email"
            }
        },
        ReplyToAddresses: [
        ],
    };
    ses.sendEmail(params, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });
});

// Start server.
var server = app.listen(8888, 'localhost', function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('AWS SES example app listening at http://%s:%s', host, port);
});
