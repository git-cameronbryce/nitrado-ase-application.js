
const { createPlayerManagementAuditEmbed } = require('../../services/utilities/embed-audits/embeds');
const { createPlayerManagementSuccessEmbed, createRoleMissingEmbed } = require('../../services/utilities/embed-players/embeds');
const { getServices } = require('../../services/requests/getServices');
const { SlashCommandBuilder } = require('discord.js');
const { default: axios } = require('axios');
const { db } = require('../../script');

const rateLimit = require('axios-rate-limit');
const http = rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 100 });

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ase-player-ban')
    .setDescription('Performs an in-game player action.')
    .addStringOption(option => option.setName('username').setDescription('Selected action will be performed on given tag.').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Required to submit ban action.').setRequired(true)
      .addChoices({ name: 'Breaking Rules', value: 'breaking rules' }, { name: 'Cheating', value: 'cheating' }, { name: 'Behavior', value: 'behavior' }, { name: 'Meshing', value: 'meshing' }, { name: 'Other', value: 'other reasons' })),

  run: async ({ interaction, client }) => {

    let hasRole = false;
    await interaction.guild.roles.fetch().then(async roles => {
      const role = roles.find(role => role.name === 'AS:E Obelisk Permission');
      if (interaction.member.roles.cache.has(role.id)) hasRole = true;
    });

    if (!hasRole) return await interaction.reply({ embeds: [createRoleMissingEmbed()], ephemeral: true });

    await interaction.deferReply();

    const input = {
      username: interaction.options.getString('username'),
      reason: interaction.options.getString('reason'),
      admin: interaction.user.id
    };

    input.username = input.username.includes('#') ? input.username.replace('#', '') : input.username;

    const reference = (await db.collection('ase-configuration').doc(interaction.guild.id).get()).data();

    const { audits: { player } } = reference;
    Object.values(reference.nitrado)?.map(async token => {
      const services = await getServices(token);

      let success = 0;
      await Promise.all(services.map(async identifiers => {
        try {
          const url = `https://api.nitrado.net/services/${identifiers}/gameservers/games/banlist`;
          const response = await axios.post(url, { identifier: input.username },
            { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });


          response.status === 200 && success++;

        } catch (error) {
          error.response.data.message === "Can't add the user to the banlist." && success++;
        }
      }));

      await interaction.followUp({ embeds: [createPlayerManagementSuccessEmbed(success, services, token)] });

      try {
        if (!success) return;
        const channel = await client.channels.fetch(player.channel);
        await channel.send({ embeds: [createPlayerManagementAuditEmbed(input, success, services, token)] });

      } catch (error) { error.code === 10003 && null };
    });
  },
};