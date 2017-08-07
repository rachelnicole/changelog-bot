"use strict";
const builder = require("botbuilder");
const request = require("request");
const hostInfo = require('./intents/hostInfo');
const podcastSummary = require('./intents/podcastSummary');
const config = require('./config');

// swap out for (process.env.NODE_ENV == 'development')
const useEmulator = true;

const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const bot = new builder.UniversalBot(connector);

const LuisModelUrl = config.luisurl;

// Main dialog with LUIS
const recognizer = new builder.LuisRecognizer(LuisModelUrl);
const intents = new builder.IntentDialog({ recognizers: [recognizer] })
    .matches('hostInfo', hostInfo)
    .matches('podcastSummary', podcastSummary)
    .matches('greeting', (session, args) => {session.send('hello i am a friendly bot', session.message.text)})
    .onDefault((session) => {session.send('Sorry, I did not understand \'%s\'.', session.message.text)});

bot.dialog('/', intents);

if (useEmulator) {
    const restify = require('restify');
    const server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

