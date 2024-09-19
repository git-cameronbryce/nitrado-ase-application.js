const { createServerManagementFailureEmbed, createServerManagementSuccessEmbed } = require('../../services/utilities/embed-servers/embeds');
const { createServerStopAuditEmbed } = require('../../services/utilities/embed-audits/embeds');
const { createRoleMissingEmbed } = require('../../services/utilities/embed-players/embeds');
const { getServices } = require('../../services/requests/getServices');
const { SlashCommandBuilder } = require('discord.js');
const { default: axios } = require('axios');
const { db } = require('../../script');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ase-server-stop')
    .setDescription('Performs an in-game server action.')
    .addStringOption(option => option.setName('identifier').setDescription('Selected action will be performed on given tag.').setRequired(true)),

  run: async ({ interaction, client }) => {

    let hasRole = false;
    await interaction.guild.roles.fetch().then(async roles => {
      const role = roles.find(role => role.name === 'AS:E Obelisk Permission');
      if (interaction.member.roles.cache.has(role.id)) hasRole = true;
    });

    if (!hasRole) return await interaction.reply({ embeds: [createRoleMissingEmbed()], ephemeral: true });

    await interaction.deferReply();

    const input = {
      identifier: interaction.options.getString('identifier'),
      admin: interaction.user.id
    };

    const reference = (await db.collection('ase-configuration').doc(interaction.guild.id).get()).data();

    let compatiblePlatform = false;

    const { audits } = reference;
    await Promise.all(Object.values(reference.nitrado)?.map(async token => {
      const services = await getServices(token);

      await Promise.all(services.map(async identifiers => {
        if (input.identifier != identifiers) return currentTokenLoop = token;

        try {
          const url = `https://api.nitrado.net/services/${input.identifier}/gameservers/stop`;
          const response = await axios.post(url, {},
            { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

          if (response.status === 200) compatiblePlatform = true;
          await interaction.followUp({ embeds: [createServerManagementSuccessEmbed(token)] }).then(async () => {
            const channel = await client.channels.fetch(audits.server.channel);
            await channel.send({ embeds: [createServerStopAuditEmbed(token, interaction.user.id, 1)] });
          });

        } catch (error) { error.code === 10003 && null };
      }));
    }));

    if (compatiblePlatform === false) await interaction.followUp({ embeds: [createServerManagementFailureEmbed()] });
  },
};

