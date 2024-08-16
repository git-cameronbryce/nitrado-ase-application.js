const { discord } = require('./other-config/config.json');
const { Client, GatewayIntentBits } = require('discord.js');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { CommandKit } = require('commandkit');
const path = require('path');

const serviceAccount = require('./other-config/firebase.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
module.exports = { db };

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

new CommandKit({
  client,
  commandsPath: path.join(__dirname, 'command-handler'),
  eventsPath: path.join(__dirname, 'event-handler'),
  devGuildIds: ['1273018144822267915'],
  bulkRegister: true
});

client.login(discord.token)
  .then(() => console.log('Client logged in...'));