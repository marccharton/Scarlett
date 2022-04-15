/* -------------------------- DEPENDENCIES -------------------------- */

const dotenv        = require('dotenv');
const { WebClient } = require('@slack/web-api');
const Sentry        = require("@sentry/node");


/* -------------------------- CONFIGURATION -------------------------- */

dotenv.config();
const token     = process.env.SLACK_USER_TOKEN;
const webClient = new WebClient(token);

Sentry.init({
  dsn             : "https://10e416f03317457f86684db27d88a522@o173895.ingest.sentry.io/6330899",  
  tracesSampleRate: 1.0,
  environment     : process.env.NODE_ENV,
});


/* -------------------------- SLACK_API -------------------------- */

const slackAPI = {

  // https://api.slack.com/methods/conversations.history
  conversationsHistory : async (conversationId, latestDate, limit = 2) => {
    try {
      const result = await webClient.conversations.history({
        channel: conversationId,
        latest : latestDate.unix(),
        limit  : limit,
      });
    
      return result.messages;
    }
    catch(e) {
      console.error(e);
      Sentry.captureException(e);
    }
  },
  
  // https://api.slack.com/methods/chat.delete
  deleteMessageById : async (conversationId, messageId) => {
    try {
      await webClient.chat.delete({
        channel: conversationId,
        ts     : messageId,
      });
    }
    catch (e) {
      console.error(e);
      if (e.error != "ratelimited")
        Sentry.captureException(e);
    }  
  },
  
  // https://api.slack.com/methods/chat.postMessage
  createMessageInChannel : async (conversationId, message) => {
    try {
      await webClient.chat.postMessage({
        channel: conversationId,
        text: message
      });
    }
    catch (e) {
      console.error(e);
    }  
  },
  
  // https://api.slack.com/methods/conversations.replies
  conversationsReplies : async (conversationId, messageId) => {
    try {
      const response = await webClient.conversations.replies({
        channel: conversationId,
        ts: messageId,
      });

      return response;
    }
    catch (e) {
      return e.data;
    }  
  },
  
  // https://api.slack.com/methods/conversations.info
  conversationsInfo : async (conversationId) => {
    try {
      const response = await webClient.conversations.info({
        channel: conversationId,
      });

      return response;
    }
    catch (error) {
      return error.data;
    }  
  },
  
};

module.exports = slackAPI;