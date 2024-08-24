const { ActionRowBuilder, EmbedBuilder } = require('@discordjs/builders');
const { loggingInstallation, statusInstallation, autoMonitoringInstallation } = require('../../../../utilities/embeds');
const { Events, ButtonStyle, ChannelType } = require('discord.js');
const { db } = require('../../../../script');
const { ButtonKit } = require('commandkit');
const axios = require('axios');
const { FieldValue } = require('firebase-admin/firestore');


module.exports = (client) => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isModalSubmit()) {
      const platforms = ['arkxb'];

      if (interaction.customId === 'ase-modal-connect-setup') {
        await interaction.deferReply({ ephemeral: true })

        const input = {
          identifier: parseInt(interaction.fields.getTextInputValue('ase-modal-connect-service-required')),
        };

        let compatibleGameserver = false;
        const getServiceInformation = async (token) => {
          const url = 'https://api.nitrado.net/services';
          const response = await axios.get(url,
            { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

          await Promise.all(response.data.data.services.map(async service => {
            if (!platforms.includes(service.details.folder_short) || service.status !== 'active') return;

            if (service.id === input.identifier) {
              const duplicate = Object.values(server_ids).find(item => {
                return Object.keys(item).find(key => parseInt(key) === input.identifier);
              });

              duplicate
                ? compatibleGameserver = false
                : compatibleGameserver = true, await db.collection('ase-configuration').doc(interaction.guild.id)
                  .set({ ['monitoring']: { ['server_ids']: { [token]: { [service.id]: true } } } }, { merge: true });
            };
          }));
        };

        const verification = async (token) => {
          try {
            const url = 'https://oauth.nitrado.net/token';
            const response = await axios.get(url,
              { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

            const { scopes } = response.data.data.token;
            response.status === 200 && scopes.includes('service')
              && await getServiceInformation(token);

          } catch (error) { console.log(error) };
        };

        const reference = (await db.collection('ase-configuration').doc(interaction.guild.id).get()).data();
        const { monitoring: { server_ids = {} } } = reference;

        await Promise.all(Object.values(reference.nitrado)?.map(async token => verification(token)));

        if (compatibleGameserver !== true) return await interaction.followUp({ content: 'Invalid server identifier or duplicate provided.' });

        const embed = new EmbedBuilder()
          .setDescription(`**Pending Action Authorization**\nGranted permission to access the service.\nStopped server will automatically restart.\n\`🟢\` \`1 Gameserver Monitoring\`\n\n**Additional Information**\nRemove the \"ID\" to disbale feature.\nOnce active, the server __stays__ online.`)
          .setFooter({ text: 'Note: Contact support if issues persist.' })
          .setColor(0x2ecc71);

        await interaction.followUp({ embeds: [embed] });
      }

      if (interaction.customId === 'ase-modal-remove-setup') {
        await interaction.deferReply({ ephemeral: true });

        const input = {
          identifier: parseInt(interaction.fields.getTextInputValue('ase-modal-remove-service-required')),
        };

        let compatibleGameserver = false;
        const getServiceInformation = async (token) => {
          const url = 'https://api.nitrado.net/services';
          const response = await axios.get(url,
            { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

          await Promise.all(response.data.data.services.map(async service => {
            if (!platforms.includes(service.details.folder_short) || service.status !== 'active') return;

            service.id === input.identifier &&
              await db.collection('ase-configuration').doc(interaction.guild.id)
                .update({ [`monitoring.server_ids.${token}.${service.id}`]: FieldValue.delete() });




            return
            duplicate
              ? compatibleGameserver = false
              : compatibleGameserver = true, await db.collection('ase-configuration').doc(interaction.guild.id)
                .set({ ['monitoring']: { ['server_ids']: { [token]: { [service.id]: true } } } }, { merge: true });

          }));
        };

        const verification = async (token) => {
          try {
            const url = 'https://oauth.nitrado.net/token';
            const response = await axios.get(url,
              { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

            const { scopes } = response.data.data.token;
            response.status === 200 && scopes.includes('service')
              && await getServiceInformation(token);

          } catch (error) { console.log(error) };
        };

        const reference = (await db.collection('ase-configuration').doc(interaction.guild.id).get()).data();
        const { monitoring: { server_ids = {} } } = reference;

        await Promise.all(Object.values(reference.nitrado)?.map(async token => verification(token)));
      }
    }
  })
};

