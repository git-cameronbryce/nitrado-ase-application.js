const { ModalBuilder, ActionRowBuilder, TextInputBuilder } = require('@discordjs/builders');
const { Events, TextInputStyle } = require('discord.js');

module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {

      if (interaction.customId === 'ase-manual-setup') {
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
      }
    }
  })
};