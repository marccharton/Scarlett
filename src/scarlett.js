/* -------------------------- DEPENDENCIES -------------------------- */

require('dotenv').config();
const asyncForEach = require('async-await-foreach') 

const slackAPI = require("./slackAPI");
const tools = require("./tools");
const slackTools = require("./slackTools");


/* -------------------------- SCARLETT -------------------------- */

const scarlett = {
  
  scanChannelListAndEmpty : async (channelList, latestDate) => {
    await asyncForEach(channelList, async (channelId, i) => {
      if (i > 0)
        console.log("\n----------------------------------------------------\n");
      await scarlett.emptyChannel(channelId, latestDate);
    });
  },
  
  emptyChannel : async (channelId, latestDate) => {
    const limit = 30;
    
    // Check if channel exists
    const channelInfo = await scarlett.getChannelInfo(channelId);
    if (channelInfo === undefined)
      return ;
    console.log(`Suppression de tous les messages du channel ${channelInfo.channel.is_private? "privé" : "public"} "${channelInfo.channel.name}" avant le ${latestDate.format("DD/MM/YYYY")}...`);
    
    // Get history from this channel
    let channelHistory = await slackAPI.conversationsHistory(channelId, latestDate, limit);
    if (channelHistory.length == 0) {
      console.log("-> Il n'y a aucun message à supprimer");
      return ;
    }
  
    // Check if some not pinned messages remain
    let doesUnpinnedMessagesRemain = await slackTools.doesUnpinnedMessagesRemain(channelId, channelHistory);
    if (!doesUnpinnedMessagesRemain) {
      console.log("Bon et bien il n'y avait rien à traiter on dirait... C'est déjà fini 🎉");
      return ;
    }
  
    // Delete every message
    while (channelHistory.length >= 0 && doesUnpinnedMessagesRemain) {
      await scarlett.deleteMessageList(channelId, channelHistory);
      
      // Process following messages
      channelHistory = await slackAPI.conversationsHistory(channelId, latestDate, limit);
      doesUnpinnedMessagesRemain = await slackTools.doesUnpinnedMessagesRemain(channelId, channelHistory);
  
      // Pause API calls if needed
      if (doesUnpinnedMessagesRemain)
        await tools.pause(process.env.RATE_LIMIT_PAUSE_DURATION);
    }
  
    console.log("Et voilà c'est terminé ! 😄");
  },
  
  getChannelInfo : async (channelId) => {
    const channelInfo = await slackAPI.conversationsInfo(channelId);
      if (!channelInfo.ok) {
        if (channelInfo.error === 'channel_not_found') {
          console.warn(`[!] Oups, on dirait bien que le channel "${channelId}" n'existe pas, pensez à mettre à jour le fichier "channelsId.json"`);
          return ;
        }
      }
      return channelInfo;
  },
  
  deleteMessageList : async (channelId, messageList, threadMode = false) => {
    console.log(`-> Il y a ${messageList.length} messages ${threadMode ? "dans ce thread" : ""} à traiter.`);
  
    await asyncForEach(messageList, async (message) => {
      if (slackTools.doesThreadExists(message))
        await scarlett.deleteThread(channelId, message);
      
      if (!slackTools.isPinnedMessage(message) && !slackTools.isDeletedMessage(message)) {
        await slackAPI.deleteMessageById(channelId, message.ts);
      }
    });
  },
  
  deleteThread : async (channelId, message) => {
    if (message.reply_count === 0)
      return false;
    
    const threadMessageList = await slackAPI.conversationsReplies(channelId, message.ts);
    
    if (threadMessageList.messages !== undefined && threadMessageList.messages.length > 1) {
      threadMessageList.messages.shift();
      await scarlett.deleteMessageList(channelId, threadMessageList.messages, true);
    } 
  },

};

module.exports = scarlett;