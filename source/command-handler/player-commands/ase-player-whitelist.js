const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder } = require('discord.js');
const { default: axios } = require('axios');
const { db } = require('../../script');
const { getServices } = require('../../services/requests/getServices');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ase-player-whitelist')
    .setDescription('Performs an in-game player action.')
    .addStringOption(option => option.setName('username').setDescription('Selected action will be performed on given tag.').setRequired(true)),

  run: async ({ interaction }) => {
    await interaction.deferReply({ ephemeral: false });

    const input = { username: interaction.options.getString('username') };

    input.username = input.username.includes('#') ? input.username.replace('#', '') : input.username;

    const reference = (await db.collection('ase-configuration').doc(interaction.guild.id).get()).data();
    Object.values(reference.nitrado)?.map(async token => {
      const services = await getServices(token);

      let success = 0;
      await Promise.all(services.map(async identifiers => {
        try {
          const url = `https://api.nitrado.net/services/${identifiers}/gameservers/games/whitelist`;
          const response = await axios.post(url, { identifier: input.username },
            { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

          response.status === 200 && success++;

        } catch (error) { error.response.data.message === "Can't add the user to the whitelist." && success++ };
      }));

      const embed = new EmbedBuilder()
        .setDescription(`**Ark Survival Evolved**\n**Game Command Success**\nGameserver action completed.\nExecuted on \`${success}\` of \`${services.length}\` servers.\n\`\`\`...${token.slice(0, 12)}\`\`\``)
        .setFooter({ text: 'Note: Contact support if issues persist.' })
        .setThumbnail('https://i.imgur.com/CzGfRzv.png')
        .setColor(0x2ecc71);

      await interaction.followUp({ embeds: [embed] });
    });
  },
};