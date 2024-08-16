const { invalidToken } = require('../../utilities/embeds');
const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder } = require('discord.js');
const { db } = require('../../script');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ase-player-unban')
    .setDescription('Performs an in-game player action.')
    .addStringOption(option => option.setName('username').setDescription('Selected action will be performed on given tag.').setRequired(true)),

  run: async ({ interaction }) => {
    await interaction.deferReply({ ephemeral: false });
    const platforms = ['arkxb'];

    const input = {
      username: interaction.options.getString('username'),
      reason: interaction.options.getString('reason'),
      guild: interaction.guild.id
    };

    input.username = input.username.includes('#') ? input.username.replace('#', '') : input.username;

    const getServiceInformation = async (token) => {
      const url = 'https://api.nitrado.net/services';
      const response = await axios.get(url,
        { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

      let success = 0, overall = 0;
      const tasks = response.data.data.services.map(async service => {
        if (!platforms.includes(service.details.folder_short) || service.status !== 'active') return;
        overall++;

        try {
          const url = `https://api.nitrado.net/services/${service.id}/gameservers/games/banlist`;
          const response = await axios.delete(url, {
            headers: { 'Authorization': token, 'Content-Type': 'application/json' },
            data: { identifier: input.username }
          });

          response.status === 200 && success++;
        } catch (error) { if (error.response.data.message === "Can't remove the user from the banlist.") success++ };
      });

      await Promise.all(tasks).then(async () => {
        const embed = new EmbedBuilder()
          .setDescription(`**Ark Survival Evolved**\n**Game Command Success**\nGameserver action completed.\nExecuted on \`${success}\` of \`${overall}\` servers.\n\`\`\`...${token.slice(0, 12)}\`\`\``)
          .setFooter({ text: 'Note: Contact support if issues persist.' })
          .setThumbnail('https://i.imgur.com/CzGfRzv.png')
          .setColor(0x2ecc71);

        await interaction.followUp({ embeds: [embed] });
      });
    }

    const verification = async (token) => {
      try {
        const url = 'https://oauth.nitrado.net/token';
        const response = await axios.get(url,
          { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

        const { scopes } = response.data.data.token;
        response.status === 200 && scopes.includes('service')
          && await getServiceInformation(token);

      } catch (error) {
        await interaction.followUp({ embeds: [invalidToken()] });
      };
    }

    // Obtain object snapshot, convert to an array. 
    const reference = (await db.collection('ase-configuration').doc(input.guild).get()).data();
    Object.values(reference.nitrado)?.map(async token => verification(token));
  },

  options: {},
};