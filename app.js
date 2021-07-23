var express = require('express');
var app = express();
var aws = require('aws-sdk');
var bp = require('body-parser');
var cors = require('cors');
//var https = require('https');
var fs = require('fs');
var privateKey  = fs.readFileSync('./sslcert/key.pem', 'utf8');
var certificate = fs.readFileSync('./sslcert/cert.pem', 'utf8');

app.use(bp.json())
app.use(bp.urlencoded({ extended: true }))

app.use((req,res,next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
})

var whitelist = ['https://akashofficial-com.vercel.app', 'https://www.akashofficial.com'];

var corsOptions = {
  origin: function(origin, callback){
    // allow requests with no origin 
    console.log(origin);
    if(!origin) return callback(null, true);
    console.log(whitelist.indexOf(origin) === -1);
    if(whitelist.indexOf(origin) === -1){
      var message = 'The CORS policy for this origin doesnt' + 'allow access from the particular origin.';
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
};

app.use(cors(corsOptions));

// Edit this with YOUR email address.
var email = "hello@akashofficial.com";
var notify_to = "hello@akashofficial.com";

// Load your AWS credentials and try to instantiate the object.
aws.config.loadFromPath(__dirname + '/config.json');

// Instantiate SES.
var ses = new aws.SES({ apiVersion: "2010-12-01" });

app.get('/', (req, res) => { 
	res.send('this is an secure server')
	console.log('GET');
});

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

app.post('/sendEmail', cors(), function (req, res) {
    var customerEmail = {
        Source: email,
        Destination: {
            BccAddresses: [],
            CcAddresses: [],
            ToAddresses: [
                req.body.email
            ]
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `<h1>Hello ${req.body.name},</h1> <p>We are perceived your email, I will reply within <b>24<b> hours.</p>`
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
    var notificationEmail = {
        Source: email,
        Destination: {
            BccAddresses: [],
            CcAddresses: [],
            ToAddresses: [
               notify_to 
            ]
        },
        Message: {
            Body: {
                Html: {
                    Charset: "UTF-8",
                    Data: `<h1>New clients email from <a href="https://www.akashofficial.com/">akashofficial.com<a> received!</h1><p>name: ${req.body.name}</p><p>email: ${req.body.email}</p><p>country: ${req.body.country}</p><p>phone: ${req.body.phone}</p><p>message: ${req.body.message}</p>`
                },
                Text: {
                    Charset: "UTF-8",
                    Data: `New clients email from akashofficial.com was received. Name: ${req.body.name}, email: ${req.body.email}, country: ${req.body.country}, phone: ${req.body.phone}, message: ${req.body.message}`
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: "New received message"
            }
        },
        ReplyToAddresses: [
        ],
    };   

    ses.sendEmail(customerEmail, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });
    ses.sendEmail(notificationEmail, function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data);           // successful response
    });
    res.sendStatus(200);
});

var server = app.listen(5000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('AWS SES example app listening at http://%s:%s', host, port);
});

