const { ActionRowBuilder } = require('@discordjs/builders');
const { Events, EmbedBuilder, ButtonStyle } = require('discord.js');
const { invalidToken } = require('../../../../utilities/embeds');
const { supabase } = require('../../../../script');
const { default: axios } = require('axios');
const { ButtonKit } = require('commandkit');

const platforms = ['arkxb'];

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
      if (interaction.customId === 'ase-cluster-command') {
        await interaction.deferReply({ ephemeral: false });

        let counter = 0;
        const getServiceInformation = async (token) => {
          const url = 'https://api.nitrado.net/services';
          const response = await axios.get(url,
            { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

          response.status === 200 && counter++;
        }

        const verification = async (token) => {
          try {
            const url = 'https://oauth.nitrado.net/token';
            const response = await axios.get(url,
              { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

            const { scopes } = response.data.data.token;
            response.status === 200 && scopes.includes('service')
              && await getServiceInformation(token);

          } catch (error) { await interaction.followUp({ embeds: [invalidToken()] }) };
        }

        const { data } = await supabase
          .from('ase-configuration')
          .select('guild, nitrado').eq('guild', interaction.guild.id)

        data?.forEach(async (document) => {
          if (document.guild && document.nitrado) {
            const tokens = Object.values(document.nitrado);
            await Promise.all(tokens.map(token => verification(token)));

            const restartCluster = new ButtonKit()
              .setCustomId('ase-restart-command')
              .setLabel('Restart Cluster')
              .setStyle(ButtonStyle.Success);

            const stopCluster = new ButtonKit()
              .setCustomId('ase-stop-command')
              .setLabel('Stop Cluster')
              .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder()
              .addComponents(restartCluster, stopCluster);

            const embed = new EmbedBuilder()
              .setDescription(`**Pending Action Authorization**\nGrant permission to access your services.\nPerform a cluster-wide server action.\n\`🟠\` \`${counter} Gameservers Pending\`\n\n**Additional Information**\nDelete message to void action.`)
              .setFooter({ text: 'Note: Contact support if issues persist.' })
              .setColor(0x2ecc71);

            await interaction.followUp({ embeds: [embed], components: [row] });
          }
        });
      };

      if (interaction.customId === 'ase-restart-command') {
        await interaction.deferReply({ ephemeral: true });

        let counter = 0;
        const getServiceInformation = async (token) => {
          const url = 'https://api.nitrado.net/services';
          const response = await axios.get(url,
            { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

          await Promise.all(
            response.data.data.services.map(async service => {
              if (!platforms.includes(service.details.folder_short) || service.status !== 'active') return;

              const url = `https://api.nitrado.net/services/${service.id}/gameservers/restart`;
              const response = await axios.post(url, { message: `Cluster Restart: By ${interaction.user.id}` },
                { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

              response.status === 200 && counter++;
            }))
        }

        const verification = async (token) => {
          try {
            const url = 'https://oauth.nitrado.net/token';
            const response = await axios.get(url,
              { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

            const { scopes } = response.data.data.token;
            response.status === 200 && scopes.includes('service')
              && await getServiceInformation(token);

          } catch (error) { await interaction.followUp({ embeds: [invalidToken()] }) };
        }

        const { data } = await supabase
          .from('ase-configuration')
          .select('guild, nitrado').eq('guild', interaction.guild.id)

        data?.forEach(async (document) => {
          if (document.guild && document.nitrado) {
            const tokens = Object.values(document.nitrado);
            await Promise.all(tokens.map(token => verification(token)));

            const restartCluster = new ButtonKit()
              .setCustomId('ase-restart-command')
              .setLabel('Restart Cluster')
              .setStyle(ButtonStyle.Success)
              .setDisabled(true);

            const stopCluster = new ButtonKit()
              .setCustomId('ase-stop-command')
              .setLabel('Stop Cluster')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true);

            const row = new ActionRowBuilder()
              .addComponents(restartCluster, stopCluster);

            const message = interaction.message;

            const embed = new EmbedBuilder()
              .setDescription(`**Pending Action Authorization**\nGrant permission to access your services.\nPerform a cluster-wide server action.\n\`🟢\` \`${counter} Gameservers Restarting\``)
              .setFooter({ text: 'Note: Contact support if issues persist.' })
              .setColor(0x2ecc71);

            await interaction.followUp({ content: 'Data Fetch Success - API Online', ephemeral: true });
            await message.edit({ embeds: [embed], components: [row] });
          }
        });
      };

      if (interaction.customId === 'ase-stop-command') {
        await interaction.deferReply({ ephemeral: true });

        let counter = 0;
        const getServiceInformation = async (token) => {
          const url = 'https://api.nitrado.net/services';
          const response = await axios.get(url,
            { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

          await Promise.all(
            response.data.data.services.map(async service => {
              if (!platforms.includes(service.details.folder_short) || service.status !== 'active') return;

              const url = `https://api.nitrado.net/services/${service.id}/gameservers/stop`;
              const response = await axios.post(url, { message: `Cluster Stop: By ${interaction.user.id}` },
                { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

              response.status === 200 && counter++;
            }))
        }

        const verification = async (token) => {
          try {
            const url = 'https://oauth.nitrado.net/token';
            const response = await axios.get(url,
              { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

            const { scopes } = response.data.data.token;
            response.status === 200 && scopes.includes('service')
              && await getServiceInformation(token);

          } catch (error) { await interaction.followUp({ embeds: [invalidToken()] }) };
        }

        const { data } = await supabase
          .from('ase-configuration')
          .select('guild, nitrado').eq('guild', interaction.guild.id)

        data?.forEach(async (document) => {
          if (document.guild && document.nitrado) {
            const tokens = Object.values(document.nitrado);
            await Promise.all(tokens.map(token => verification(token)));

            const restartCluster = new ButtonKit()
              .setCustomId('ase-restart-command')
              .setLabel('Restart Cluster')
              .setStyle(ButtonStyle.Success)
              .setDisabled(true);

            const stopCluster = new ButtonKit()
              .setCustomId('ase-stop-command')
              .setLabel('Stop Cluster')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true);

            const row = new ActionRowBuilder()
              .addComponents(restartCluster, stopCluster);

            const message = interaction.message;

            const embed = new EmbedBuilder()
              .setDescription(`**Pending Action Authorization**\nGrant permission to access your services.\nPerform a cluster-wide server action.\n\`🟢\` \`${counter} Gameservers Stopping\``)
              .setFooter({ text: 'Note: Contact support if issues persist.' })
              .setColor(0x2ecc71);

            await interaction.followUp({ content: 'Data Fetch Success - API Online', ephemeral: true });
            await message.edit({ embeds: [embed], components: [row] });
          }
        });
      };
    }
  })
};

