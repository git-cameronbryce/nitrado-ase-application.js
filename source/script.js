const { discord, database } = require('./config.json');
const { Client, GatewayIntentBits } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');
const { CommandKit } = require('commandkit');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

new CommandKit({
  client,
  commandsPath: path.join(__dirname, 'command-handler'),
  eventsPath: path.join(__dirname, 'event-handler'),
  devGuildIds: ['1219480518131716126'],
  bulkRegister: true
});

const supabase = createClient(database.url, database.key);
module.exports = { supabase };

client.login(discord.token)
  .then(() => console.log('Client logged in...'));