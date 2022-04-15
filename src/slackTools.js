/* -------------------------- DEPENDENCIES -------------------------- */

const slackAPI = require("./slackAPI");
const tools = require("./tools");


/* -------------------------- SLACK_TOOLS -------------------------- */

const slackTools = {
  
  createMessageList : async (limit) => {
      for(let i = 0; i < limit; i++) {
        process.stdout.write(`création du message numero ${i}...`);
        await slackAPI.createMessageInChannel("C03ARFNQ1KQ", "Message de scarlett Numéro " + i);
        console.log("done " + i);
        if (i%50 === 0) 
            tools.pause(5000);
      }
  },

  isPinnedMessage : message => message.pinned_to !== undefined && message.pinned_info !== undefined,
  
  isDeletedMessage : message => message.hidden !== undefined && message.hidden === true,

  doesThreadExists : message => message.reply_count !== undefined && message.reply_count > 0,

  doesUnpinnedMessagesRemain : async (channelId, messageList) => {
      const results = await Promise.all(messageList.map(async (message) => {
      if (!slackTools.doesThreadExists(message))
          return !slackTools.isPinnedMessage(message);

      const threadMessageList = await slackAPI.conversationsReplies(channelId, message.ts);
      return !(slackTools.isPinnedMessage(message) || slackTools.isDeletedMessage(message))
          || threadMessageList.messages.some(message => !slackTools.isPinnedMessage(message) && !slackTools.isDeletedMessage(message))
      }));
      return results.some((result) => result === true);
  }
};

module.exports = slackTools;
