const { createServerRestartAuditEmbed, createServerStopAuditEmbed } = require('../../../../services/utilities/embed-audits/embeds');
const { createRoleMissingEmbed, createInvalidTokenEmbed } = require('../../../../services/utilities/embed-players/embeds');
const { EmbedBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { Events, ButtonStyle } = require('discord.js');
const { db } = require('../../../../script');
const { default: axios } = require('axios');
const { ButtonKit } = require('commandkit');

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
      const platforms = ['arkxb', 'arkps', 'arkse'];

      if (interaction.customId === 'ase-cluster-command') {

        let hasRole = false;
        await interaction.guild.roles.fetch().then(async roles => {
          const role = roles.find(role => role.name === 'AS:E Obelisk Permission');
          if (interaction.member.roles.cache.has(role.id)) hasRole = true;
        });

        if (!hasRole) return await interaction.reply({ embeds: [createRoleMissingEmbed()], ephemeral: true });

        await interaction.deferReply({ ephemeral: false });

        let compatiblePlatform = 0;
        const getServiceInformation = async (token) => {
          const url = 'https://api.nitrado.net/services';
          const response = await axios.get(url,
            { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

          await Promise.all(response.data.data.services.map(async service => {
            if (!platforms.includes(service.details.folder_short) || service.status !== 'active') return;
            compatiblePlatform++
          }));
        };

        const reference = (await db.collection('ase-configuration').doc(interaction.guild.id).get()).data();
        if (!reference) return await interaction.followUp({ embeds: [createInvalidTokenEmbed()] });

        await Promise.all(Object.values(reference.nitrado)?.map(async token => getServiceInformation(token)));

        const primaryButton = new ButtonKit()
          .setCustomId('ase-restart-cluster')
          .setLabel('Restart Cluster')
          .setStyle(ButtonStyle.Success);

        const secondaryButton = new ButtonKit()
          .setCustomId('ase-stop-cluster')
          .setLabel('Stop Cluster')
          .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
          .addComponents(primaryButton, secondaryButton);

        const embed = new EmbedBuilder()
          .setDescription(`**Pending Action Authorization**\nGrant permission to access your services.\nPerform a cluster-wide server action.\n\`🟠\` \`${compatiblePlatform} Gameservers Pending\`\n\n**Additional Information**\nDelete this message to return.`)
          .setFooter({ text: 'Note: Contact support if issues persist.' })
          .setColor(0x2ecc71);

        await interaction.followUp({ embeds: [embed], components: [row] });
      };

      if (interaction.customId === 'ase-restart-cluster') {

        let success = 0;
        let compatibleToken = '';
        const message = await interaction.message;
        const getServiceInformation = async (token) => {
          const url = 'https://api.nitrado.net/services';
          const response = await axios.get(url, {
            headers: { 'Authorization': token, 'Content-Type': 'application/json' },
          });

          await Promise.all(response.data.data.services.map(async (service) => {
            if (!platforms.includes(service.details.folder_short) || service.status !== 'active') return;

            try {
              const url = `https://api.nitrado.net/services/${service.id}/gameservers/restart`;
              const response = await axios.post(url, {}, {
                headers: { 'Authorization': token, 'Content-Type': 'application/json' },
              });

              response.status === 200 && (compatibleToken = token), success++;
            } catch (error) { null };
          })
          );
        };

        const reference = (await db.collection('ase-configuration').doc(interaction.guild.id).get()).data();
        if (!reference) return await interaction.followUp({ embeds: [createInvalidTokenEmbed()] });

        await Promise.all(Object.values(reference.nitrado).map(async token => getServiceInformation(token)));
        const { audits } = reference;

        try {
          const primaryButton = new ButtonKit()
            .setCustomId('ase-restart-cluster')
            .setLabel('Restart Cluster')
            .setStyle(ButtonStyle.Success)
            .setDisabled(true);

          const secondaryButton = new ButtonKit()
            .setCustomId('ase-stop-cluster')
            .setLabel('Stop Cluster')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

          const row = new ActionRowBuilder()
            .addComponents(primaryButton, secondaryButton);

          const embed = new EmbedBuilder()
            .setDescription(`**Pending Action Authorization**\nGrant permission to access your services.\nPerform a cluster-wide server action.\n\`🟢\` \`${success} Gameservers Restarting\``)
            .setFooter({ text: 'Note: Contact support if issues persist.' })
            .setColor(0x2ecc71);

          await interaction.reply({ content: 'Data Fetch Success - Response: 200', ephemeral: true });
          await message.edit({ embeds: [embed], components: [row] }).then(async () => {
            const channel = await client.channels.fetch(audits.server.channel);
            await channel.send({ embeds: [createServerRestartAuditEmbed(compatibleToken, interaction.user.id, success)] })
          });

        } catch (error) { error.code === 10003 && null };
      };

      if (interaction.customId === 'ase-stop-cluster') {

        let success = 0;
        let compatibleToken = '';
        const message = await interaction.message;
        const getServiceInformation = async (token) => {
          const url = 'https://api.nitrado.net/services';
          const response = await axios.get(url, {
            headers: { 'Authorization': token, 'Content-Type': 'application/json' },
          });

          await Promise.all(response.data.data.services.map(async (service) => {
            if (!platforms.includes(service.details.folder_short) || service.status !== 'active') return;

            try {
              const url = `https://api.nitrado.net/services/${service.id}/gameservers/stop`;
              const response = await axios.post(url, {}, {
                headers: { 'Authorization': token, 'Content-Type': 'application/json' },
              });

              response.status === 200 && (compatibleToken = token), success++;
            } catch (error) { null };
          })
          );
        };

        const reference = (await db.collection('ase-configuration').doc(interaction.guild.id).get()).data();
        if (!reference) return await interaction.followUp({ embeds: [createInvalidTokenEmbed()] });

        await Promise.all(Object.values(reference.nitrado).map(async token => getServiceInformation(token)));
        const { audits } = reference;

        try {
          const primaryButton = new ButtonKit()
            .setCustomId('ase-restart-cluster')
            .setLabel('Restart Cluster')
            .setStyle(ButtonStyle.Success)
            .setDisabled(true);

          const secondaryButton = new ButtonKit()
            .setCustomId('ase-stop-cluster')
            .setLabel('Stop Cluster')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

          const row = new ActionRowBuilder()
            .addComponents(primaryButton, secondaryButton);

          const embed = new EmbedBuilder()
            .setDescription(`**Pending Action Authorization**\nGrant permission to access your services.\nPerform a cluster-wide server action.\n\`🟢\` \`${success} Gameservers Stopping\``)
            .setFooter({ text: 'Note: Contact support if issues persist.' })
            .setColor(0x2ecc71);

          await interaction.reply({ content: 'Data Fetch Success - Response: 200', ephemeral: true });
          await message.edit({ embeds: [embed], components: [row] }).then(async () => {
            const channel = await client.channels.fetch(audits.server.channel);
            await channel.send({ embeds: [createServerStopAuditEmbed(compatibleToken, interaction.user.id, success)] })
          });

        } catch (error) { error.code === 10003 && null };
      };
    };
  });
};
