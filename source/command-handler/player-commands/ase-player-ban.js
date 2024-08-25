const { invalidTokenConnection } = require('../../utilities/embeds');
const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder } = require('discord.js');
const { default: axios } = require('axios');
const { db } = require('../../script');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ase-player-ban')
    .setDescription('Performs an in-game player action.')
    .addStringOption(option => option.setName('username').setDescription('Selected action will be performed on given tag.').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Required to submit ban action.').setRequired(true)
      .addChoices({ name: 'Breaking Rules', value: 'breaking rules' }, { name: 'Cheating', value: 'cheating' }, { name: 'Behavior', value: 'behavior' }, { name: 'Meshing', value: 'meshing' }, { name: 'Other', value: 'other reasons' })),

  run: async ({ interaction, client }) => {
    await interaction.deferReply({ ephemeral: false });
    const platforms = ['arkxb'];

    const input = {
      username: interaction.options.getString('username'),
      reason: interaction.options.getString('reason'),
      admin: interaction.user.id,
    };

    input.username = input.username.includes('#') ? input.username.replace('#', '') : input.username;

    const getServiceInformation = async (token, audits) => {
      const url = 'https://api.nitrado.net/services';
      const response = await axios.get(url,
        { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

      let success = 0, overall = 0;
      const tasks = response.data.data.services.map(async service => {
        if (!platforms.includes(service.details.folder_short) || service.status !== 'active') return;
        overall++;

        try {
          const url = `https://api.nitrado.net/services/${service.id}/gameservers/games/banlist`;
          const response = await axios.post(url, { identifier: input.username },
            { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

          response.status === 200 && success++;
        } catch (error) { if (error.response.data.message === "Can't add the user to the banlist.") success++ };
      });

      await Promise.all(tasks).then(async () => {
        const embed = new EmbedBuilder()
          .setDescription(`**Ark Survival Evolved**\n**Game Command Success**\nGameserver action completed.\nExecuted on \`${success}\` of \`${overall}\` servers.\n\`\`\`...${token.slice(0, 12)}\`\`\``)
          .setFooter({ text: 'Note: Contact support if issues persist.' })
          .setThumbnail('https://i.imgur.com/CzGfRzv.png')
          .setColor(0x2ecc71);

        await interaction.followUp({ embeds: [embed] });
      });

      try {
        const channel = await client.channels.fetch(audits.player.channel);

        const embed = new EmbedBuilder()
          .setDescription(`**Gameserver Audit Logging**\nGameserver action completed.\nExecuted on \`${success}\` of \`${overall}\` servers.\n\n${input.username} was...\nRemoved for ${input.reason}.\n\n> ||<@${input.admin}>||\n\`\`\`...${token.slice(0, 12)}\`\`\``)
          .setFooter({ text: 'Note: Contact support if issues persist.' })
          .setColor(0x2ecc71);

        await channel.send({ embeds: [embed] });
      } catch (error) { error.code === 10003 && null };

    }

    const verification = async (token, audits) => {
      try {
        const url = 'https://oauth.nitrado.net/token';
        const response = await axios.get(url,
          { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

        const { scopes } = response.data.data.token;
        response.status === 200 && scopes.includes('service')
          && await getServiceInformation(token, audits);

      } catch (error) {
        error.response.data.message === 'Access token not valid.' && invalidTokenConnection();
      };
    }

    const reference = (await db.collection('ase-configuration').doc(interaction.guild.id).get()).data();
    Object.values(reference.nitrado)?.map(async token => verification(token, reference.audits));
  },

  options: {},
};