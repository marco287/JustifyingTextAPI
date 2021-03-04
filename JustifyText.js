const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const SPACE = " ";
const DOUBLE_SPACE = "  ";
const PERIOD = ".";
const COMMA = ",";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text());
var rateLimit = [];

const SECRET_KEY = 'JeanMarcVanie';
const JUSTIFY_BY = 80;
const WORDS_DAILY_LIMIT = 80000;

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'JeanMarcVanieJustifyText'
});

connection.connect(function (err) {
    if (!err) {
        console.log("Database is connected ...");
    } else {
        console.log(err);
    }
});

app.get('/api/', function (req, res) {
    res.json({
        message: 'The API is up and running!'
    });
});

app.post('/api/token', function (req, res) {
    var sql = 'SELECT 1 FROM `user` WHERE email = ' + mysql.escape(req.query.email);

    connection.query(sql, function (error, results, fields) {
        if (!error) {
            const user = {
                email: req.query.email
            }
    
            jwt.sign({ user }, SECRET_KEY, { expiresIn: '24h' }, (err, token) => {
                rateLimit[token] = { words: 0, date: new Date() };
                
                res.json({
                    'token' : token
                });
            });
        } else {
            res.json({ message: 'Email not found.' });
            return;         
        }
    });
});

// FORMAT OF TOKEN
// authorization: <access_token>
// Verify Token
function verifyToken(req, res, next) {
    // Get auth header value
    const header = req.headers['authorization'];
    // Check if header is undefined
    if (typeof header !== 'undefined') {
        // Set the token
        req.token = header;
        jwt.verify(req.token, SECRET_KEY, (error) => {

            // Check Authorization
            if (!error) {
                // Next 
                next();
            }
            else {
                res.sendStatus(403);
            }
    
        });
    } else {
        // Forbidden
        res.sendStatus(403);
    }
}

function checkUserRates(req, res) {
    var textWords = req.body.split(/\s+/).length;

    var userRateLimit = rateLimit[req.token];

    // if (!userRateLimit || !userRateLimit.date) {
    //     res.sendStatus(403);
    //     return false;
    // }

    // Check words rate
    let userDay = userRateLimit.date.getDate();
    let currentDay = new Date().getDate();

    if (currentDay !== userDay) {
        userRateLimit.date = new Date();
        userRateLimit.words = 0;
    }

    if ((userRateLimit.words + textWords) > WORDS_DAILY_LIMIT) {
        res.status(402).json({ message: '402 Payment Required.' });
        return false;
    }

    // Update words count
    userRateLimit.words += textWords;

    rateLimit[req.token] = userRateLimit;

    return true;
}

app.post('/api/justify', verifyToken, function (req, res) {
    var text = req.body;

    // Check content
    if (typeof text !== 'string') {
        res.status(400).json({ message: 'Input valid text in the request\'s body (raw).' });
    }

    res.type("text/plain");

    // Check current user data
    if (!checkUserRates(req, res)) {
        return;
    }

    var counter = JUSTIFY_BY - 1;
    var newtext = "";
    var j;
    text = text.replace(/\s\s+/g, SPACE);

    for (var i = 0; i < text.length; i++) {
        newtext += text[i];
        if (i == counter) {
            if (text[i] == SPACE || text[i] == COMMA || text[i] == PERIOD) {
                newtext += '\n';
                counter = i + 1 + JUSTIFY_BY;
            }
            else {
                j = 0;
                while (text[i] !== SPACE && text[i] !== COMMA && text[i] !== PERIOD) {
                    i = i - 1;
                    j++;
                }
                newtext = newtext.substr(0, newtext.length - j);
                newtext += '\n';
                counter = i + JUSTIFY_BY;
            }
        }
    }

    result = addSpace(newtext);
    res.send(result);
});

function addSpace(text) {
    MaxLineLength = JUSTIFY_BY;

    var newLines = text.split(/\n/);

    for (var i = 0; i < newLines.length; i++) {
        var line = newLines[i].trim();

        if (line.length >= MaxLineLength) {
            continue;
        }

        var k = 1;
        
        for (var j = 0; j < line.length; j++) {
            if (line[j] == SPACE && line.length < MaxLineLength) {
                if (j <= line.length - 1) {
                    line = line.substr(0, j) + DOUBLE_SPACE + line.substr(j + 1);
                }
                j += k;
            }
            if (j == line.length - 1 && line.length < MaxLineLength) {
                j = 0;
                k++;
            }
        }
        
        newLines[i] = line;
    }
    return newLines.join("\n");
}

app.listen(3000, () => console.log('Server started on port 3000'));
