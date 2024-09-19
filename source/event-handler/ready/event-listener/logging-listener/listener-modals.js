const { createInvalidServiceEmbed } = require('../../../../services/utilities/embed-events/embeds');
const { Events, EmbedBuilder, ChannelType } = require('discord.js');
const { db } = require('../../../../script');
const { default: axios } = require('axios');

const rateLimit = require('axios-rate-limit');
const { createDuplicateLoggingEmbed, createPlayerLoggingEmbed } = require('../../../../services/utilities/embed-logging/embeds');
const http = rateLimit(axios.create(), { maxRequests: 5, perMilliseconds: 1500 });

const platforms = ['arkxb'];

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'ase-modal-manual-setup') {

        await interaction.deferReply({ ephemeral: true });

        const input = { identifier: interaction.fields.getTextInputValue('ase-gameserver-identifier-required') };

        let gameservers = [];
        const getServiceInformation = async (token) => {
          try {
            const url = `https://api.nitrado.net/services/${input.identifier}/gameservers`;
            const response = await http.get(url,
              { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

            const { game, service_id, query: { server_name } } = response.data.data.gameserver;

            response.status === 200 && server_name && platforms.includes(game)
              && gameservers.push({ id: service_id, name: server_name });

          } catch (error) {
            await interaction.followUp({ embeds: [createInvalidServiceEmbed()] });
          };
        };


        const reference = (await db.collection('ase-configuration').doc(interaction.guild.id).get()).data();
        await Promise.all(Object.values(reference.nitrado)?.map(async token => {
          await getServiceInformation(token);
        }));

        const { admin } = reference;

        let duplicate = false;
        Object.entries(admin || {}).forEach(async ([key, value]) => {

          if (key == input.identifier) {
            duplicate = true, await interaction.followUp({ embeds: [createDuplicateLoggingEmbed()] });
          };
        })

        if (duplicate) return;

        gameservers?.forEach(async gameserver => {
          const embed = new EmbedBuilder()
            .setDescription(`**Obelisk System Information**\nInformation is initialized in our database.\nProceeding with the setup process.\n\n**Collected Information**\nServer Identification: \`${gameserver.id}\``)
            .setFooter({ text: 'Note: Contact support if issues persist.' })
            .setColor('#2ecc71')

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

          const data = {
            'online': { [gameserver.id]: { thread: onlineThread.id, message: onlineThread.lastMessageId } },
            'admin': { [gameserver.id]: adminThread.id },
            'chat': { [gameserver.id]: chatThread.id }
          };

          await db.collection('ase-configuration').doc(interaction.guild.id).set(data, { merge: true })
            .then(() => { console.log('Database Logging Finished:') });

          await interaction.followUp({ embeds: [createPlayerLoggingEmbed()] })
        });
      };
    };
  });
};