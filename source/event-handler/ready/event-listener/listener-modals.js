const { ActionRowBuilder, EmbedBuilder } = require('@discordjs/builders');
const { Events, ButtonStyle, ChannelType } = require('discord.js');
const { supabase } = require('../../../script');
const { ButtonKit } = require('commandkit');
const axios = require('axios');

const upsertTokenData = async (identifier, requiredToken, optionalToken) => {
  await supabase
    .from('ase-configuration')
    .upsert([{ guild: identifier, nitrado: { requiredToken: requiredToken, optionalToken: optionalToken } }])
    .select()
};

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isModalSubmit()) {
      if (interaction.customId === 'ase-modal-setup') {
        await interaction.deferReply({ ephemeral: false })
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
            await upsertTokenData(interaction.guild.id, requiredToken, optionalToken);

          } else if (requiredResponse) {
            await upsertTokenData(interaction.guild.id, requiredToken);
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

            const statusCategory = await interaction.guild.channels.create({
              name: `AS:E Status Overview`,
              type: ChannelType.GuildCategory,
            });

            const statusChannel = await interaction.guild.channels.create({
              name: '🔗│𝗦erver-𝗦tatus',
              type: ChannelType.GuildText,
              parent: statusCategory
            });

            const embed = new EmbedBuilder()
              .setDescription("**Server Status Information**\nStatus page installing. Every few minutes, this page will update. Displaying accurate and updated server information. \n\n(e.g. Server state, Player data, etc.)\n\n**[Partnership Commission](https://nitra.do/obeliskdevelopment)**\nConsider using our partnership link to purchase your servers, we will recieve partial commission!")
              .setFooter({ text: 'Note: Contact support if issues persist.' })
              .setImage('https://i.imgur.com/bFyqkUS.png')
              .setColor(0x2ecc71);

            const statusMessage = await statusChannel.send({ embeds: [embed] });

            await supabase
              .from('ase-configuration')
              .upsert([{ guild: interaction.guild.id, status: { channel: statusChannel.id, message: statusMessage.id } }])
              .select()
          });
      }
    }
  })
};

