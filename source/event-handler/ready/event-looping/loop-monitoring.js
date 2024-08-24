const { ActionRowBuilder } = require('@discordjs/builders');
const { ButtonStyle, EmbedBuilder } = require('discord.js');
const { db } = require('../../../script');
const { ButtonKit } = require('commandkit');
const axios = require('axios');
const { autoMonitoringInstallationUpdate } = require('../../../utilities/embeds');
const { FieldValue } = require('firebase-admin/firestore');

module.exports = async (client) => {
  const loop = async () => {
    const platforms = ['arkxb'];

    const postGameserverAction = async (token, service, audits, document) => {
      const url = `https://api.nitrado.net/services/${service.id}/gameservers/restart`;
      const response = await axios.post(url, {}, {
        headers: { 'Authorization': token, 'Content-Type': 'application/json' },
      });

      response.status === 200 &&
        await db.collection('ase-configuration').doc(document.id)
          .set({ ['monitoring']: { restarts: FieldValue.increment(1) } }, { merge: true });

      try {
        const channel = await client.channels.fetch(audits.monitoring.channel);

        const embed = new EmbedBuilder()
          .setDescription(`**Monitor Audit Logging**\nDowned server has been detected.\nRestoring and bringing back online.\nService ID #: ${service.id}\n\n> ||<@987467099855282276>||`)
          .setFooter({ text: 'Note: Contact support if issues persist.' })
          .setColor(0x2ecc71);

        await channel.send({ embeds: [embed] });

      } catch (error) { if (error.code === 10003) { null } };
    };

    const getGameserverInformation = async (token, service, audits, document) => {
      const url = `https://api.nitrado.net/services/${service.id}/gameservers`;
      const response = await axios.get(url,
        { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

      const { status } = response.data.data.gameserver;

      response.status === 200 && status === 'stopped'
        && await postGameserverAction(token, service, audits, document);
    };

    const getServiceInformation = async (token, identifier, audits, document) => {
      const url = 'https://api.nitrado.net/services';
      const response = await axios.get(url,
        { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

      await Promise.all(response.data.data.services.map(async service => {
        if (!platforms.includes(service.details.folder_short) || service.status !== 'active') return;

        Object.keys(identifier).forEach(async item => {
          service.id === parseInt(item) && await getGameserverInformation(token, service, audits, document);
        });
      }));
    };

    const verification = async (token, identifier, audits, document) => {
      try {
        const url = 'https://oauth.nitrado.net/token';
        const response = await axios.get(url,
          { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

        const { scopes } = response.data.data.token;
        response.status === 200 && scopes.includes('service')
          && await getServiceInformation(token, identifier, audits, document);

      } catch (error) {
        error.response.data.message === 'Access token not valid.' && null;
      };
    };

    const reference = await db.collection('ase-configuration').get();

    await Promise.all(
      reference.docs.map(async document => {
        const { audits, monitoring } = document.data();

        try {
          const channel = await client.channels.fetch(monitoring.channel);
          const message = await channel.messages.fetch(monitoring.message);

          if (!monitoring || !monitoring.server_ids || !Object.keys(monitoring.server_ids).length) return await message.edit({ embeds: [autoMonitoringInstallationUpdate(monitoring)] })
          await Promise.all(Object.entries(monitoring.server_ids).map(async ([token, identifier]) => verification(token, identifier, audits, document)));

          let output = '', counter = 0;
          await Promise.all(Object.values(monitoring.server_ids).map(async item => {
            if (counter > 0 && counter % 3 === 0) { output += '\n' } else if (counter > 0) { output += ', ' };
            output += Object.keys(item), counter++;
          }));

          const embed = new EmbedBuilder()
            .setDescription(`**Auto Monitoring Overview**\nEnter the service IDs to monitor. Fully stopped servers will be automatically restarted.\n\n**Additional Information**\nRemove the IDs to keep servers in an offline state. Supporting upwards of thirty concurrent services.\n\n\`\`\`\n\nx${monitoring.restarts} Gameservers Restored\n\n${output}\n\`\`\`\n<t:${Math.floor(Date.now() / 1000)}:R>\n**[Partnership & Information](https://nitra.do/obeliskdevelopment)**\nConsider using our partnership link to purchase your gameservers, it will help fund development.`)
            .setFooter({ text: 'Note: Contact support if issues persist.' })
            .setImage('https://i.imgur.com/bFyqkUS.png')
            .setColor(0x2ecc71);

          await message.edit({ embeds: [embed] });
        } catch (error) { if (error.code === 10003) { null } };
      })
    );

    setTimeout(loop, 60000);
  };
  loop().then(() => console.log('Monitoring loop started...'));
};


