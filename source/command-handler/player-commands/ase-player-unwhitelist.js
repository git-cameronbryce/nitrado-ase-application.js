
const { createPlayerManagementSuccessEmbed, createRoleMissingEmbed } = require('../../services/utilities/embed-players/embeds');
const { getServices } = require('../../services/requests/getServices');
const { SlashCommandBuilder } = require('discord.js');
const { default: axios } = require('axios');
const { db } = require('../../script');

const rateLimit = require('axios-rate-limit');
const http = rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 250 });

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ase-player-unwhitelist')
    .setDescription('Performs an in-game player action.')
    .addStringOption(option => option.setName('username').setDescription('Selected action will be performed on given tag.').setRequired(true)),

  run: async ({ interaction }) => {

    let hasRole = false;
    await interaction.guild.roles.fetch().then(async roles => {
      const role = roles.find(role => role.name === 'AS:E Obelisk Permission');
      if (interaction.member.roles.cache.has(role.id)) hasRole = true;
    });

    if (!hasRole) return await interaction.reply({ embeds: [createRoleMissingEmbed()], ephemeral: true });

    await interaction.deferReply();
    const input = { username: interaction.options.getString('username') };

    input.username = input.username.includes('#') ? input.username.replace('#', '') : input.username;

    const reference = (await db.collection('ase-configuration').doc(interaction.guild.id).get()).data();
    Object.values(reference.nitrado)?.map(async token => {
      const services = await getServices(token);

      let success = 0;
      await Promise.all(services.map(async identifiers => {
        try {
          const url = `https://api.nitrado.net/services/${identifiers}/gameservers/games/whitelist`;
          const response = await http.delete(url, {
            headers: { 'Authorization': token, 'Content-Type': 'application/json' }, data: { identifier: input.username }
          });

          response.status === 200 && success++;

        } catch (error) { error.response.data.message === "Can't remove the user from the whitelist." && success++ };
      }));

      await interaction.followUp({ embeds: [createPlayerManagementSuccessEmbed(success, services, token)] });
    });
  },
};