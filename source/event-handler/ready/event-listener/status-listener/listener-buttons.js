const { EmbedBuilder, ActionRowBuilder } = require('@discordjs/builders');
const { Events, ButtonStyle } = require('discord.js');
const { db } = require('../../../../script');
const axios = require('axios');
const { ButtonKit } = require('commandkit');
const { serverRestartAuditLogging, serverStopAuditLogging } = require('../../../../utilities/embeds');

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
      const platforms = ['arkxb'];

      if (interaction.customId === 'ase-cluster-command') {
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

        const verification = async (token) => {
          try {
            const url = 'https://oauth.nitrado.net/token';
            const response = await axios.get(url,
              { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

            const { scopes } = response.data.data.token;
            response.status === 200 && scopes.includes('service')
              && await getServiceInformation(token);

          } catch (error) { console.log(error) };
        };

        // Obtain object snapshot, convert to an array. 
        const reference = (await db.collection('ase-configuration').doc(interaction.guild.id).get()).data();
        await Promise.all(Object.values(reference.nitrado)?.map(async token => verification(token)));

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

              response.status === 200 && success++;
            } catch (error) { null };
          })
          );
        };

        const verification = async (token) => {
          try {
            const url = 'https://oauth.nitrado.net/token';
            const response = await axios.get(url, {
              headers: { 'Authorization': token, 'Content-Type': 'application/json' },
            });

            const { scopes } = response.data.data.token;
            if (response.status === 200 && scopes.includes('service')) {
              await getServiceInformation(token);
            }
          } catch (error) { null };
        };

        // Minimal change to handle multiple tokens
        const reference = (await db.collection('ase-configuration').doc(interaction.guild.id).get()).data();
        await Promise.all(Object.values(reference.nitrado).map(async (token) => verification(token)));
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
            await channel.send({ embeds: [serverRestartAuditLogging(interaction.user.id, success)] })
          });

        } catch (error) { if (error.code === 10003) { null } };
      };

      if (interaction.customId === 'ase-stop-cluster') {

        let success = 0;
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

              response.status === 200 && success++;
            } catch (error) { null };
          })
          );
        };

        const verification = async (token) => {
          try {
            const url = 'https://oauth.nitrado.net/token';
            const response = await axios.get(url, {
              headers: { 'Authorization': token, 'Content-Type': 'application/json' },
            });

            const { scopes } = response.data.data.token;
            if (response.status === 200 && scopes.includes('service')) {
              await getServiceInformation(token);
            }
          } catch (error) { null };
        };

        // Minimal change to handle multiple tokens
        const reference = (await db.collection('ase-configuration').doc(interaction.guild.id).get()).data();
        await Promise.all(Object.values(reference.nitrado).map(async (token) => verification(token)));
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
            await channel.send({ embeds: [serverStopAuditLogging(interaction.user.id, success)] })
          });

        } catch (error) { if (error.code === 10003) { null } };
      };
    };
  });
};
