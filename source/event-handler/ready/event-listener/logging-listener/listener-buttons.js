const { ModalBuilder, ActionRowBuilder, TextInputBuilder } = require('@discordjs/builders');
const { Events, TextInputStyle, ButtonStyle, EmbedBuilder, ChannelType } = require('discord.js');
const { db } = require('../../../../script');
const { default: axios } = require('axios');

const platforms = ['arkxb'];

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