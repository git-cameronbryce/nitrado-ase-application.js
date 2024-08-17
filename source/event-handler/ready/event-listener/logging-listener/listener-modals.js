const { ModalBuilder, ActionRowBuilder, TextInputBuilder } = require('@discordjs/builders');
const { Events, TextInputStyle, ButtonStyle, EmbedBuilder, ChannelType } = require('discord.js');
const { db } = require('../../../../script');
const { default: axios } = require('axios');

const platforms = ['arkxb'];

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'ase-modal-manual-setup') {
        await interaction.deferReply({ ephemeral: false });

        const input = {
          identifier: interaction.fields.getTextInputValue('ase-gameserver-identifier-required'),
          guild: interaction.guild.id
        };

        let gameservers = [];
        const getServiceInformation = async (token) => {
          if (token !== 'Odz6swervAk7ulClVGoRycNQ7XpVBdfqXU66aUQgFvj6MuWJMiXlT1bbsl6Rrv93D3jtvoKCdnwv7OX6ltgauMLM5fD7sj65Mi92') return
          try {
            const url = `https://api.nitrado.net/services/${input.identifier}/gameservers`;
            const response = await axios.get(url,
              { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

            const { game, service_id, query: { server_name } } = response.data.data.gameserver;

            response.status === 200 && server_name && platforms.includes(game)
              && gameservers.push({ id: service_id, name: server_name });

          } catch (error) { console.log('Logging service does not belong to token...') };
        };

        const verification = async (token) => {
          const url = 'https://oauth.nitrado.net/token';
          const response = await axios.get(url,
            { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

          const { scopes } = response.data.data.token;
          response.status === 200 && scopes.includes('service')
            && await getServiceInformation(token);
        };

        // Obtain object snapshot, convert to an array. 
        const reference = (await db.collection('ase-configuration').doc(input.guild).get()).data();
        await Promise.all(Object.values(reference.nitrado)?.map(async token => verification(token)));

        gameservers?.forEach(async gameserver => {
          const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setDescription(`**Obelisk System Information**\nInformation is initialized in our database.\nProceeding with the setup process.\n\n**Collected Information**\nServer Identification: \`${gameserver.id}\``)
            .setFooter({ text: 'Tip: Contact support if there are issues.' })

          // Create new threads
          const onlineThread = await interaction.client.channels.fetch(reference.forum.online).then(forum =>
            forum.threads.create({
              name: `${gameserver.name} - ${gameserver.id}`,
              type: ChannelType.PrivateThread,
              message: { embeds: [embed] }
            })
          );

          const adminThread = await interaction.client.channels.fetch(reference.forum.admin).then(forum =>
            forum.threads.create({
              name: `${gameserver.name} - ${gameserver.id}`,
              type: ChannelType.PrivateThread,
              message: { embeds: [embed] }
            })
          );

          const chatThread = await interaction.client.channels.fetch(reference.forum.chat).then(forum =>
            forum.threads.create({
              name: `${gameserver.name} - ${gameserver.id}`,
              type: ChannelType.PrivateThread,
              message: { embeds: [embed] }
            })
          );

          const joinThread = await interaction.client.channels.fetch(reference.forum.join).then(forum =>
            forum.threads.create({
              name: `${gameserver.name} - ${gameserver.id}`,
              type: ChannelType.PrivateThread,
              message: { embeds: [embed] }
            })
          );

          const data = {
            'online': { [gameserver.id]: { thread: onlineThread.id, message: onlineThread.lastMessageId } },
            'admin': { [gameserver.id]: adminThread.id },
            'chat': { [gameserver.id]: chatThread.id },
            'join': { [gameserver.id]: joinThread.id }
          };

          await db.collection('ase-configuration').doc(interaction.guild.id).set(data, { merge: true })
            .then(() => { console.log('Database Finished:') });
        });
      }
    }
  })
};