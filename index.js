/* -------------------------- DEPENDENCIES -------------------------- */

const dotenv = require('dotenv');

const scarlett = require("./src/scarlett");
const tools = require("./src/tools");
const slackTools = require("./src/slackTools");

const channelList = require("./channelList");


/* -------------------------- CONFIGURATION -------------------------- */

dotenv.config();
console.log({env: process.env.NODE_ENV});


/* -------------------------- SCRIPT -------------------------- */

const latestDate = tools.getLatestDate(process.env.MAX_DURATION);
scarlett.scanChannelListAndEmpty(channelList, latestDate);
// slackTools.createMessageList(200);