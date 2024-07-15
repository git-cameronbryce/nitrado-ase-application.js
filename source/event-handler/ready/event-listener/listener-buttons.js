const { ModalBuilder, ActionRowBuilder, TextInputBuilder } = require('@discordjs/builders');
const { Events, TextInputStyle } = require('discord.js');

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
      if (interaction.customId === 'ase-setup-token') {
        const modal = new ModalBuilder()
          .setCustomId('ase-modal-setup')
          .setTitle('Token Integration Process');

        const modalTokenRequired = new TextInputBuilder()
          .setCustomId('ase-nitrado-token-required').setLabel('Required Nitrado Token').setMinLength(25).setMaxLength(100)
          .setPlaceholder('...xMk99ZfXDRtKZDEq24B098-X42zX8kHqo3')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const modalTokenOptional = new TextInputBuilder()
          .setCustomId('ase-nitrado-token-optional').setLabel('Optional Nitrado Token').setMinLength(25).setMaxLength(100)
          .setPlaceholder('...oAg66TcQYUnYXBQn17A161-N86cN5jWDp7')

          .setStyle(TextInputStyle.Short)
          .setRequired(false);

        const modalRequiredParameter = new ActionRowBuilder()
          .addComponents(modalTokenRequired);

        const modalOptionalParameter = new ActionRowBuilder()
          .addComponents(modalTokenOptional);

        modal.addComponents(modalRequiredParameter, modalOptionalParameter);
        await interaction.showModal(modal);
      }
    }
  })
};
