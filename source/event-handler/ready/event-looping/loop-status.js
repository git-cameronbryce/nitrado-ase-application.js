const { ActionRowBuilder } = require('@discordjs/builders');
const { ButtonStyle, EmbedBuilder } = require('discord.js');
const { db } = require('../../../script');
const { ButtonKit } = require('commandkit');
const axios = require('axios');
const { FieldValue } = require('firebase-admin/firestore');

module.exports = async (client) => {
  const loop = async () => {
    const platforms = ['arkxb'];

    const getServiceInformation = async (token, servers, current, maximum, counter) => {
      const url = 'https://api.nitrado.net/services';
      const response = await axios.get(url, {
        headers: { 'Authorization': token, 'Content-Type': 'application/json' },
      });

      await Promise.all(
        response.data.data.services.map(async (service) => {
          if (!platforms.includes(service.details.folder_short) || service.status !== 'active') return;

          const { suspend_date } = service;

          const url = `https://api.nitrado.net/services/${service.id}/gameservers`;
          const response = await axios.get(url, {
            headers: { 'Authorization': token, 'Content-Type': 'application/json' },
          });

          const { query } = response.data.data.gameserver;

          if (query?.player_current) current.value += query.player_current;
          if (query?.player_max) maximum.value += query.player_max;

          if (counter.value >= 25) return;
          let serverOutput = '';
          switch (response.data.data.gameserver.status) {
            case 'started':
              serverOutput = `\`🟢\` \`Service Online\`\n${query?.server_name ? query?.server_name.slice(0, 40) : 'Data Fetch Error - API Outage'}\nPlayer Count: \`${query?.player_current ? query?.player_current : 0}/${query?.player_max ? query?.player_max : 0}\`\nID: ||${service.id}||\n\n**Server Runtime**\n<t:${new Date(suspend_date).getTime() / 1000}:f>\n\n`;
              counter.value++;
              break;
            case 'restarting':
              serverOutput = `\`🟠\` \`Service Restarting\`\n${query?.server_name ? query?.server_name.slice(0, 40) : 'Data Fetch Error - API Outage'}\nPlayer Count: \`${query?.player_current ? query?.player_current : 0}/${query?.player_max ? query?.player_max : 0}\`\nID: ||${service.id}||\n\n**Server Runtime**\n<t:${new Date(suspend_date).getTime() / 1000}:f>\n\n`;
              counter.value++;
              break;
            case 'updating':
              serverOutput = `\`🟠\` \`Service Updating\`\n${query?.server_name ? query?.server_name.slice(0, 40) : 'Data Fetch Error - API Outage'}\nPlayer Count: \`${query?.player_current ? query?.player_current : 0}/${query?.player_max ? query?.player_max : 0}\`\nID: ||${service.id}||\n\n**Server Runtime**\n<t:${new Date(suspend_date).getTime() / 1000}:f>\n\n`;
              counter.value++;
              break;
            case 'stopping':
              serverOutput = `\`🔴\` \`Service Stopping\`\n${query?.server_name ? query?.server_name.slice(0, 40) : 'Data Fetch Error - API Outage'}\nPlayer Count: \`${query?.player_current ? query?.player_current : 0}/${query?.player_max ? query?.player_max : 0}\`\nID: ||${service.id}||\n\n**Server Runtime**\n<t:${new Date(suspend_date).getTime() / 1000}:f>\n\n`;
              counter.value++;
              break;
            case 'stopped':
              serverOutput = `\`🔴\` \`Service Stopped\`\n${query?.server_name ? query?.server_name.slice(0, 40) : 'Data Fetch Error - API Outage'}\nPlayer Count: \`${query?.player_current ? query?.player_current : 0}/${query?.player_max ? query?.player_max : 0}\`\nID: ||${service.id}||\n\n**Server Runtime**\n<t:${new Date(suspend_date).getTime() / 1000}:f>\n\n`;
              counter.value++;
              break;
            default:
              break;
          }

          servers.push({ output: serverOutput, playerCurrent: query?.player_current || 0 });
        })
      );
    };

    const verification = async (token, servers, current, maximum, counter, document) => {

      try {
        const url = 'https://oauth.nitrado.net/token';
        const response = await axios.get(url, {
          headers: { 'Authorization': token, 'Content-Type': 'application/json' },
        });

        const { scopes } = response.data.data.token;
        if (response.status === 200 && scopes.includes('service')) {
          await getServiceInformation(token, servers, current, maximum, counter);
        }
      } catch (error) {
        error.response.data.message === 'Access token not valid.' && null;
      };
    };

    const reference = await db.collection('ase-configuration').get();

    await Promise.all(
      reference.docs.map(async document => {
        let current = { value: 0 }, maximum = { value: 0 }, counter = { value: 0 };
        const { nitrado, status } = document.data();
        const servers = [];

        await Promise.all(
          Object.values(nitrado).map(async (token) => verification(token, servers, current, maximum, counter, document))
        );

        try {
          const channel = await client.channels.fetch(status.channel);
          const message = await channel.messages.fetch(status.message);

          servers.sort((a, b) => b.playerCurrent - a.playerCurrent);
          const output = servers.map((server) => server.output).join('');

          const cluster = new ButtonKit()
            .setCustomId('ase-cluster-command')
            .setLabel('Cluster Command')
            .setStyle(ButtonStyle.Success);

          const support = new ButtonKit()
            .setURL('https://discord.gg/VQanyb23Rn')
            .setLabel('Support Server')
            .setStyle(ButtonStyle.Link);

          const row = new ActionRowBuilder().addComponents(cluster, support);

          const embed = new EmbedBuilder()
            .setDescription(`${output}**Cluster Player Count**\n \`🌐\` \`(${current.value}/${maximum.value})\`\n\n<t:${Math.floor(Date.now() / 1000)}:R>\n**[Partnership & Information](https://nitra.do/obeliskdevelopment)**\nConsider using our partnership link to purchase your gameservers, it will help fund development.`)
            .setFooter({ text: 'Note: Contact support if issues persist.' })
            .setImage('https://i.imgur.com/2ZIHUgx.png')
            .setColor(0x2ecc71);

          await message.edit({ embeds: [embed], components: [row] });
        } catch (error) { if (error.code === 10003) { null } };
      })
    );

    setTimeout(loop, 60000);
  };
  loop().then(() => console.log('Status loop started...'));
};
