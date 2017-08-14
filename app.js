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

const bot = new builder.UniversalBot(connector, [
  // this section becomes the root dialog
  // If a conversation hasn't been started, and the message
  // sent by the user doesn't match a pattern, the
  // conversation will start here
  (session, args, next) => {
    session.send(`Hi! I'm a helpful bot to give you more information about podcasts on the Changelog.`);
    // Launch the getName dialog using beginDialog
    // When beginDialog completes, control will be passed
    // to the next function in the waterfall
    session.beginDialog('topicIntent');
  },
  (session, results, next) => {
    // executed when getName dialog completes
    // results parameter contains the object passed into endDialogWithResults

    // check for a response
    if (results.response) {
      const intent = session.privateConversationData.intent = results.response;

      // When calling another dialog, you can pass arguments in the second parameter
      session.beginDialog('topicMore', { intent: intent });
    } else {
      // no valid response received - End the conversation
      session.endConversation(`Sorry, I didn't understand the response. Let's start over.`);
    }
  },
  (session, results, next) => {
    // executed when getAge dialog completes
    // results parameter contains the object passed into endDialogWithResults

    // check for a response
    if (results.response) {
      const specificIntent = session.privateConversationData.specificIntent = results.response;

      session.beginDialog('specificInfo', {specificIntent: specificIntent});
      session.send(`Hello! Please hold on while I get you some more info on ${specificIntent}`);
    } else {
      // no valid response received - End the conversation
      session.endConversation(`Sorry, I didn't understand the response. Let's start over.`);
    }
  },
]);

const LuisModelUrl = config.luisurl;

// Main dialog with LUIS
const recognizer = new builder.LuisRecognizer(LuisModelUrl);

bot.dialog('topicIntent', [
  (session, args, next) => {
    // store reprompt flag
    if (args) {
      session.dialogData.isReprompt = args.isReprompt;
    }

    // prompt user
    builder.Prompts.text(session, 'Would you like more information about a podcast or a specific host? You can just say the word `podcast` or `host`.');
  },
  (session, results, next) => {
    const intent = results.response;

    if (!intent) {
      // Bad response. Logic for single re-prompt
      if (session.dialogData.isReprompt) {
        // Re-prompt ocurred
        // Send back empty string
        session.endDialogWithResult({ response: '' });
      }
      if (intent !== "host" || "podcast") {
        session.send('Sorry, you can only say `host` or `podcast`.');

        // Call replaceDialog to start the dialog over
        // This will replace the active dialog on the stack
        // Send a flag to ensure we only reprompt once
        session.replaceDialog('intent', { isReprompt: true });
      }
      else {
        // Set the flag
        session.send('Sorry, you have to use the single word, podcast or host.');

        // Call replaceDialog to start the dialog over
        // This will replace the active dialog on the stack
        // Send a flag to ensure we only reprompt once
        session.replaceDialog('intent', { isReprompt: true });
      }
    } else {
      // Valid name received
      // Return control to calling dialog
      // Pass the name in the response property of results
      session.endDialogWithResult({ response: intent.trim() });
    }
  }
]);

bot.dialog('topicMore', [
  (session, args, next) => {
    let intent = session.dialogData.intent = 'User';

    if (args) {
      // store reprompt flag
      session.dialogData.isReprompt = args.isReprompt;
      // retrieve the intent
      intent = session.dialogData.intent = args.intent;
    }

    if (intent === 'host') {
      session.send('You can choose from `Adam Stacoviak`, `Jerod Santo`, `Erik St. Martin`, `Carlisia Pinto`, `Brian Ketelsen`, `Nadia Eghbal`, `Mikeal Rogers`, `Alex Sexton`, or `Rachel White`?');
    } else {
      session.send('You can choose from `the Changelog`, `Go Time`, `Request for Commits`, `Spotlight`, `Founders Talk`, or `JS Party`?');
    }

    // prompt user
    builder.Prompts.text(session, `Which ${intent} would you like to know more about?`);
  },
  (session, results, next) => {
    const mainQuery = results.response;

    session.endDialogWithResult({ response: mainQuery });
  }
]);

bot.dialog('specificInfo', [
  (session, args, next) => {
    const mainQuery = args.specificIntent;
    hostInfo(mainQuery);
    console.log('======');
    console.log(mainQuery);
    // if (intent === 'host') {
    //   session.send('You can choose from `Adam Stacoviak`, `Jerod Santo`, `Erik St. Martin`, `Carlisia Pinto`, `Brian Ketelsen`, `Nadia Eghbal`, `Mikeal Rogers`, `Alex Sexton`, or `Rachel White`?');
    // } else {
    //   session.send('You can choose from `the Changelog`, `Go Time`, `Request for Commits`, `Spotlight`, `Founders Talk`, or `JS Party`?');
    // }

    // prompt user
//builder.Prompts.text(session, `Which ${intent} would you like to know more about?`);
  },
  (session, results, next) => {
    console.log(results);
    // const mainQuery = session.dialogData.specificIntent;

    // session.endDialogWithResult({ response: mainQuery });

  }
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

