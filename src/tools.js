/* -------------------------- DEPENDENCIES -------------------------- */

const dayjs = require('dayjs');


/* -------------------------- TOOLS -------------------------- */

const tools = {
  getLatestDate : maxDuration => dayjs().subtract(maxDuration, 'day'), // https://day.js.org/docs/en/manipulate/subtract

  getSpecificDate : unixEpoch => dayjs(unixEpoch), // https://day.js.org/docs/en/manipulate/substract
  
  pause: async duration => {
    process.stdout.write(`Soyons gentil avec slack, on va faire une pause de ${duration/1000}s pour le laisser respirer...`);
    await new Promise(resolve => setTimeout(resolve, duration));
    console.log("Allez c'est reparti ! GOOOOOOOOOOOOOOOOO !!!!!!!!!!!");
  },
};

module.exports = tools;