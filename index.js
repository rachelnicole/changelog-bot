"use strict";
const builder = require("botbuilder");
const request = require("request");
const queryDatabase = require('./dbquery');
const config = require('./config');

// swap out for (process.env.NODE_ENV == 'development')
const useEmulator = true;

const connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

const bot = new builder.UniversalBot(connector, [
  (session, args, next) => {
    session.send(`Hi! I'm a helpful bot to give you more information about podcasts on the Changelog.`);
    session.beginDialog('topicIntent');
  },
  (session, results, next) => {
    if (results.response) {
      const intent = session.privateConversationData.intent = results.response;

      session.beginDialog('topicMore', { intent: intent });
    } else {
      session.endConversation(`Sorry, I didn't understand the response. Let's start over.`);
    }
  },
  (session, results, next) => {
    if (results.response) {
      const specificInfo = session.privateConversationData.specificIntent = results.response;
      const specificIntent = session.privateConversationData.specificIntent = results.intent;

      session.beginDialog('specificInfo', {specificInfo: specificInfo, specificIntent: specificIntent});
      session.send(`Hello! Please hold on while I get you some more info on ${specificInfo}`);
    } else {

      session.endConversation(`Sorry, I didn't understand the response. Let's start over.`);
    }
  },
]);

bot.dialog('topicIntent', [
  (session, args, next) => {

    if (args) {
      session.dialogData.isReprompt = args.isReprompt;
    }

    builder.Prompts.text(session, 'Would you like more information about a podcast or a specific host? You can just say the word `host` or `podcast`.');
  },
  (session, results, next) => {
    const intent = results.response;

    if (!intent || (intent !== "host" && intent !== "podcast")) {
      if (session.dialogData.isReprompt) {
        session.endDialogWithResult({ response: '' });
      } else {
        session.send('Sorry, you can only say `host` or `podcast`.');
    
        session.replaceDialog('topicIntent', { isReprompt: true });
      }
    } else {
      session.endDialogWithResult({ response: intent.trim() });
    }

  }
]);

bot.dialog('topicMore', [
  (session, args, next) => {
    let intent;

    if (args) {
      session.dialogData.isReprompt = args.isReprompt;
      intent = session.dialogData.intent = args.intent;
    }

    if (intent === 'host') {
      session.send('You can choose from Adam Stacoviak, Jerod Santo, Erik St. Martin, Carlisia Pinto, Brian Ketelsen, Nadia Eghbal, Mikeal Rogers, Alex Sexton, or Rachel White?');
    } else {
      session.send('You can choose from the Changelog, Go Time, Request for Commits, Spotlight, Founders Talk, or JS Party?');
    }

    builder.Prompts.text(session, `Which ${intent} would you like to know more about?`);
  },
  (session, results, next) => {
    const mainQuery = results.response;

    session.endDialogWithResult({ response: mainQuery, intent: session.dialogData.intent });
  }
]);

bot.dialog('specificInfo', [
  (session, args, next) => {
    const mainQuery = args.specificInfo;
    const mainTopic = args.specificIntent;

    queryDatabase(mainQuery, mainTopic, function(data) {
      session.send('Here is the info you requested' + JSON.stringify(data));
      session.endConversation(`Thanks for chatting, if you have any other questions you know where to find me.`);
    });
  },
]);

if (useEmulator) {
  const restify = require('restify');
  const server = restify.createServer();
  server.listen(3978, function () {
    console.log('test bot endpont at http://localhost:3978/api/messages');
  });
  server.post('/api/messages', connector.listen());
} else {
  module.exports = { default: connector.listen() }
}
