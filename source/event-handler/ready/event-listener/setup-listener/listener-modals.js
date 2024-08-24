const { ActionRowBuilder, EmbedBuilder } = require('@discordjs/builders');
const { loggingInstallation, statusInstallation, autoMonitoringInstallation } = require('../../../../utilities/embeds');
const { Events, ButtonStyle, ChannelType } = require('discord.js');
const { db } = require('../../../../script');
const { ButtonKit } = require('commandkit');
const axios = require('axios');

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'ase-modal-setup') {
        await interaction.deferReply({ ephemeral: false })

        const input = { guild: interaction.guild.id };

        const requiredToken = interaction.fields.getTextInputValue('ase-nitrado-token-required');
        const optionalToken = interaction.fields.getTextInputValue('ase-nitrado-token-optional');
        const url = 'https://oauth.nitrado.net/token';

        try {
          const responses = await Promise.all([
            requiredToken ? axios.get(url, { headers: { 'Authorization': requiredToken } }) : Promise.resolve(null),
            optionalToken ? axios.get(url, { headers: { 'Authorization': optionalToken } }) : Promise.resolve(null)
          ]);

          const [requiredResponse, optionalResponse] = responses;

          if (requiredResponse && optionalResponse) {
            await db.collection('ase-configuration').doc(input.guild)
              .set({ ['nitrado']: { requiredToken: requiredToken, optionalToken, optionalToken } },
                { merge: true });

          } else if (requiredResponse) {
            await db.collection('ase-configuration').doc(input.guild)
              .set({ ['nitrado']: { requiredToken: requiredToken } },
                { merge: true });
          }

        } catch (error) { return await interaction.followUp({ content: 'Token Verification: Error' }), console.log(error) };

        const installation = new ButtonKit()
          .setCustomId('ase-setup-token')
          .setStyle(ButtonStyle.Success)
          .setLabel('Setup Token')
          .setDisabled(true);

        const support = new ButtonKit()
          .setURL('https://discord.gg/VQanyb23Rn')
          .setStyle(ButtonStyle.Link)
          .setLabel('Support Server');

        const row = new ActionRowBuilder()
          .addComponents(installation, support);

        const embed = new EmbedBuilder()
          .setDescription("**Ark Survival Evolved**\n**Cluster Setup & Overview**\nThank you for choosing our service. Below, you'll have the option to link your token, along with a [video preview](https://imgur.com/a3b9GkZ) to display the process.\n\n**Additional Information**\nEnsure this guild is a [community](https://i.imgur.com/q8ElPKj.mp4) server, otherwise, the bot will not be able to integrate properly.\n\n**[Partnership & Affiliation](https://nitra.do/obeliskdevelopment)**\nConsider using our partnership link to purchase your servers, we will recieve partial commission!")
          .setFooter({ text: 'Note: Contact support if issues persist.' })
          .setImage('https://i.imgur.com/bFyqkUS.png')
          .setColor(0x2ecc71);

        await interaction.message?.edit({ embeds: [embed], components: [row] })
          .then(async () => {
            await interaction.followUp({ content: "Proceeding with installation...", ephemeral: true });

            const statisticsCategory = await interaction.guild.channels.create({
              name: `AS:E Statistics Overview`,
              type: ChannelType.GuildCategory,
            });

            const statisticsPlayers = await interaction.guild.channels.create({
              name: 'Active: 0 Players',
              type: ChannelType.GuildVoice,
              parent: statisticsCategory
            });

            const statisticsActive = await interaction.guild.channels.create({
              name: 'Active: 0 Servers',
              type: ChannelType.GuildVoice,
              parent: statisticsCategory
            });

            const statisticsOutage = await interaction.guild.channels.create({
              name: 'Outage: 0 Servers',
              type: ChannelType.GuildVoice,
              parent: statisticsCategory
            });

            const statusCategory = await interaction.guild.channels.create({
              name: `AS:E Status Overview`,
              type: ChannelType.GuildCategory,
            });

            const manageGamesavesChannel = await interaction.guild.channels.create({
              name: '🔗│𝗠anage-𝗚amesaves',
              type: ChannelType.GuildText,
              parent: statusCategory
            });

            const autoMonitoringChannel = await interaction.guild.channels.create({
              name: '🔗│𝗔uto-𝗠onitoring',
              type: ChannelType.GuildText,
              parent: statusCategory
            });

            const statusChannel = await interaction.guild.channels.create({
              name: '🔗│𝗦erver-𝗦tatus',
              type: ChannelType.GuildText,
              parent: statusCategory
            });

            const commandsChannel = await interaction.guild.channels.create({
              name: '🔗│𝗖ommands',
              type: ChannelType.GuildText,
              parent: statusCategory
            });

            const gameProtectionCategory = await interaction.guild.channels.create({
              name: `AS:E Game Detection`,
              type: ChannelType.GuildCategory,
            });

            const adminProtectionChannel = await interaction.guild.channels.create({
              name: '🔐│𝗔dmin-𝗣rotection',
              type: ChannelType.GuildText,
              parent: gameProtectionCategory
            });

            const dupeProtectionChannel = await interaction.guild.channels.create({
              name: '🔐│𝗗upe-𝗣rotection',
              type: ChannelType.GuildText,
              parent: gameProtectionCategory
            });

            const altProtectionChannel = await interaction.guild.channels.create({
              name: '🔐│𝗔lt-𝗣rotection',
              type: ChannelType.GuildText,
              parent: gameProtectionCategory
            });

            const auditLoggingCategory = await interaction.guild.channels.create({
              name: `AS:E Audit Logging`,
              type: ChannelType.GuildCategory,
            });

            const monitoringAuditChannel = await interaction.guild.channels.create({
              name: '📄│𝗠onitor-𝗔udits',
              type: ChannelType.GuildText,
              parent: auditLoggingCategory
            });

            const playerAuditChannel = await interaction.guild.channels.create({
              name: '📄│𝗣layer-𝗔udits',
              type: ChannelType.GuildText,
              parent: auditLoggingCategory
            });

            const serverAuditChannel = await interaction.guild.channels.create({
              name: '📄│𝗦erver-𝗔udits',
              type: ChannelType.GuildText,
              parent: auditLoggingCategory
            });

            const gameLoggingCategory = await interaction.guild.channels.create({
              name: `AS:E Game Logging`,
              type: ChannelType.GuildCategory,
            });

            const onlineForumChannel = await interaction.guild.channels.create({
              name: '📑│𝗢nline-𝗟ogging',
              type: ChannelType.GuildForum,
              parent: gameLoggingCategory
            });

            const adminForumChannel = await interaction.guild.channels.create({
              name: '📑│𝗔dmin-𝗟ogging',
              type: ChannelType.GuildForum,
              parent: gameLoggingCategory
            });

            const chatForumChannel = await interaction.guild.channels.create({
              name: '📑│𝗖hat-𝗟ogging',
              type: ChannelType.GuildForum,
              parent: gameLoggingCategory
            });

            const joinForumChannel = await interaction.guild.channels.create({
              name: '📑│𝗝oin-𝗟ogging',
              type: ChannelType.GuildForum,
              parent: gameLoggingCategory
            });

            const installation = await interaction.guild.channels.create({
              name: '📑│𝗜nstallation',
              type: ChannelType.GuildText,
              parent: gameLoggingCategory
            });

            const autoMonitoringPrimaryButton = new ButtonKit()
              .setCustomId('ase-connect-service')
              .setLabel('Connect Service')
              .setStyle(ButtonStyle.Success);

            const autoMonitoringSecondaryyButton = new ButtonKit()
              .setCustomId('ase-remove-service')
              .setLabel('Remove Service')
              .setStyle(ButtonStyle.Secondary);

            const autoMonitoringButtonRow = new ActionRowBuilder()
              .addComponents(autoMonitoringPrimaryButton, autoMonitoringSecondaryyButton);

            const autoMonitoringMessage = await autoMonitoringChannel.send({ embeds: [autoMonitoringInstallation()], components: [autoMonitoringButtonRow] });
            const statusMessage = await statusChannel.send({ embeds: [statusInstallation()] });

            const loggingPrimaryButton = new ButtonKit()
              .setCustomId('ase-automatic-setup')
              .setLabel('Automatic Setup')
              .setStyle(ButtonStyle.Success)
              .setDisabled(false);

            const loggingSecondaryButton = new ButtonKit()
              .setCustomId('ase-manual-setup')
              .setLabel('Manual Setup')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(false);

            const loggingButtonRow = new ActionRowBuilder()
              .addComponents(loggingPrimaryButton, loggingSecondaryButton);

            await installation.send({ embeds: [loggingInstallation()], components: [loggingButtonRow] });

            const data = {
              monitoring: {
                channel: autoMonitoringChannel.id,
                message: autoMonitoringMessage.id,
                restarts: 0
              },
              status: {
                channel: statusChannel.id,
                message: statusMessage.id
              },
              audits: {
                monitoring: { channel: monitoringAuditChannel.id },
                player: { channel: playerAuditChannel.id },
                server: { channel: serverAuditChannel.id }
              },
              forum: {
                online: onlineForumChannel.id,
                admin: adminForumChannel.id,
                chat: chatForumChannel.id,
                join: joinForumChannel.id,
              },
            }
            await db.collection('ase-configuration').doc(input.guild)
              .set(data, { merge: true });
          });
      }
    }
  })
};

