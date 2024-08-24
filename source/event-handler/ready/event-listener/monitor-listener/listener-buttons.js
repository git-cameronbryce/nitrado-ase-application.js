const { ModalBuilder, ActionRowBuilder, TextInputBuilder } = require('@discordjs/builders');
const { Events, TextInputStyle } = require('discord.js');

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
      if (interaction.customId === 'ase-connect-service') {
        const modal = new ModalBuilder()
          .setCustomId('ase-modal-connect-setup')
          .setTitle('Monitoring Integration Process');

        const modalTokenRequired = new TextInputBuilder()
          .setCustomId('ase-modal-connect-service-required').setLabel('Required Gameserver Identifier').setMinLength(0).setMaxLength(12)
          .setPlaceholder('Example ID: "15246754"')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const modalRequiredParameter = new ActionRowBuilder()
          .addComponents(modalTokenRequired);

        modal.addComponents(modalRequiredParameter);
        await interaction.showModal(modal);
      }

      if (interaction.customId === 'ase-remove-service') {
        const modal = new ModalBuilder()
          .setCustomId('ase-modal-remove-setup')
          .setTitle('Monitoring Integration Process');

        const modalTokenRequired = new TextInputBuilder()
          .setCustomId('ase-modal-remove-service-required').setLabel('Required Gameserver Identifier').setMinLength(0).setMaxLength(12)
          .setPlaceholder('Example ID: "15246754"')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);

        const modalRequiredParameter = new ActionRowBuilder()
          .addComponents(modalTokenRequired);

        modal.addComponents(modalRequiredParameter);
        await interaction.showModal(modal);
      }
    }
  })
};
