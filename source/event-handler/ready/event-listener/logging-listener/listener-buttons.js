const { createRoleMissingEmbed } = require('../../../../services/utilities/embed-players/embeds');
const { ModalBuilder, ActionRowBuilder, TextInputBuilder } = require('discord.js');
const { Events, TextInputStyle, Embed } = require('discord.js');

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {

    if (interaction.isButton()) {
      if (interaction.customId === 'ase-manual-setup') {

        let hasRole = false;
        await interaction.guild.roles.fetch().then(async roles => {
          const role = roles.find(role => role.name === 'AS:E Obelisk Permission');
          if (interaction.member.roles.cache.has(role.id)) hasRole = true;
        });

        if (!hasRole) return await interaction.reply({ embeds: [createRoleMissingEmbed()], ephemeral: true });

        const modal = new ModalBuilder()
          .setCustomId('ase-modal-manual-setup')
          .setTitle('Gameserver Integration Process');

        const modalTokenRequired = new TextInputBuilder()
          .setCustomId('ase-gameserver-identifier-required').setLabel('Required Gameserver Identifier').setMinLength(8).setMaxLength(8)
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const modalRequiredParameter = new ActionRowBuilder()
          .addComponents(modalTokenRequired);

        modal.addComponents(modalRequiredParameter);
        await interaction.showModal(modal);
      };

      if (interaction.customId === 'ase-automatic-setup') {
        await interaction.deferReply({ ephemeral: true });
        await interaction.followUp({ content: 'Temporarily disabled. Please use the manual method.\nContact support if you need assistance.' });
      };
    };
  });
};