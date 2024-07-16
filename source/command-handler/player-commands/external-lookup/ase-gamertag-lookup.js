const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder } = require('discord.js');
const { supabase } = require('../../../script');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ase-gamertag-lookup')
    .setDescription('...')
    .addStringOption((option) => option.setName('username').setDescription('...').setRequired(true)),

  run: async ({ interaction }) => {
    await interaction.deferReply({ ephemeral: false });
    const platforms = ['arkxb'];

    const input = {
      username: interaction.options.getString('username'),
      guild: interaction.guild.id
    };

    let output = '';
    let counter = 0;
    const getServiceInformation = async (token) => {
      const url = 'https://api.nitrado.net/services';
      const response = await axios.get(url, {
        headers: { 'Authorization': token, 'Content-Type': 'application/json' }
      });

      await Promise.all(response.data.data.services.map(async service => {
        if (!platforms.includes(service.details.folder_short) || service.status !== 'active') return;

        const url = `https://api.nitrado.net/services/${service.id}/gameservers/games/players`;
        const response = await axios.get(url,
          { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

        response.data.data.players.forEach(async player => {
          if (player.name.toLowerCase().includes(input.username.toLowerCase()) && counter <= 5) {
            const unixTimestamp = Number(Math.floor(new Date("2024-05-24T08:00:14").getTime() / 1000));
            output += `${player.online ? `\`🟢\` \`Player Online\`` : `\`🟠\` \`Player Offline\``}\n\`🔗\` ${player.id.slice(0, 26)}...\n\`🔗\` <t:${unixTimestamp}:F>\n\`🔗\` ${player.name}\n\n`;
            counter++;
          };
        });
      }));
    }

    const verification = async (token) => {
      try {
        const url = 'https://oauth.nitrado.net/token';
        const response = await axios.get(url,
          { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

        const { scopes } = response.data.data.token;
        response.status === 200 && scopes.includes('service')
          && await getServiceInformation(token);

      } catch (error) { console.log('Invalid Token'), console.log(error) };
    }

    const { data } = await supabase
      .from('ase-configuration')
      .select('guild, nitrado').eq('guild', input.guild)

    data?.forEach(async (document) => {
      if (document.guild && document.nitrado) {
        const tokens = Object.values(document.nitrado);
        await Promise.all(tokens.map(token => verification(token)));

        const embed = new EmbedBuilder()
          .setDescription(`${output ? `**Gameserver Matches**\nThe app has filtered through each player.\nMatching items will be displayed below.\n\n${output}` : `**Gameserver Matches**\nThe app has filtered through each player.\nMatching items will be displayed below.\n\nZero players matching given input.`}`)
          .setFooter({ text: 'Note: Contact support if issues persist.' })
          .setColor(0x2ecc71);

        await interaction.followUp({ embeds: [embed] });
      };
    });
  },

  options: {

  },
};