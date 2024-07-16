const { ActionRowBuilder } = require('@discordjs/builders');
const { ButtonStyle, EmbedBuilder } = require('discord.js');
const { supabase } = require('../../../script');
const { ButtonKit } = require('commandkit');
const axios = require('axios');

module.exports = async (client) => {
  const platforms = ['arkxb'];
  const servers = [];

  let output = '';
  let counter = 0, current = 0, maximum = 0;
  const getServiceInformation = async (token) => {
    const url = 'https://api.nitrado.net/services';
    const response = await axios.get(url,
      { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

    await Promise.all(response.data.data.services.map(async service => {
      if (!platforms.includes(service.details.folder_short)) return;

      const { suspend_date } = service;

      const url = `https://api.nitrado.net/services/${service.id}/gameservers`;
      const response = await axios.get(url,
        { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

      const { query } = response.data.data.gameserver;

      query?.player_current ? current += query.player_current : null;
      query?.player_max ? maximum += query.player_max : null;

      if (counter >= 25) return;
      let serverOutput = '';
      switch (response.data.data.gameserver.status) {
        case 'started':
          serverOutput = `\`🟢\` \`Service Online\`\n${query?.server_name ? query?.server_name.slice(0, 40) : 'Data Fetch Error - API Outage'}\nPlayer Count: \`${query?.player_current ? query?.player_current : 0}/${query?.player_max ? query?.player_max : 0}\`\nID: ||${service.id}||\n\n**Server Runtime**\n<t:${new Date(suspend_date).getTime() / 1000}:f>\n\n`;
          counter++;
          break;
        case 'restarting':
          serverOutput = `\`🟠\` \`Service Restarting\`\n${query?.server_name ? query?.server_name.slice(0, 40) : 'Data Fetch Error - API Outage'}\nPlayer Count: \`${query?.player_current ? query?.player_current : 0}/${query?.player_max ? query?.player_max : 0}\`\nID: ||${service.id}||\n\n**Server Runtime**\n<t:${new Date(suspend_date).getTime() / 1000}:f>\n\n`;
          counter++;
          break;
        case 'updating':
          serverOutput = `\`🟠\` \`Service Updating\`\n${query?.server_name ? query?.server_name.slice(0, 40) : 'Data Fetch Error - API Outage'}\nPlayer Count: \`${query?.player_current ? query?.player_current : 0}/${query?.player_max ? query?.player_max : 0}\`\nID: ||${service.id}||\n\n**Server Runtime**\n<t:${new Date(suspend_date).getTime() / 1000}:f>\n\n`;
          counter++;
          break;
        case 'stopping':
          serverOutput = `\`🔴\` \`Service Stopping\`\n${query?.server_name ? query?.server_name.slice(0, 40) : 'Data Fetch Error - API Outage'}\nPlayer Count: \`${query?.player_current ? query?.player_current : 0}/${query?.player_max ? query?.player_max : 0}\`\nID: ||${service.id}||\n\n**Server Runtime**\n<t:${new Date(suspend_date).getTime() / 1000}:f>\n\n`;
          counter++;
          break;
        case 'stopped':
          serverOutput = `\`🔴\` \`Service Stopped\`\n${query?.server_name ? query?.server_name.slice(0, 40) : 'Data Fetch Error - API Outage'}\nPlayer Count: \`${query?.player_current ? query?.player_current : 0}/${query?.player_max ? query?.player_max : 0}\`\nID: ||${service.id}||\n\n**Server Runtime**\n<t:${new Date(suspend_date).getTime() / 1000}:f>\n\n`;
          counter++;
          break;

        default:
          break;
      };

      servers.push({ output: serverOutput, playerCurrent: query?.player_current || 0 });
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

    } catch (error) { console.log(error), null };
  };

  const { data } = await supabase
    .from('ase-configuration')
    .select('nitrado, status')

  data?.forEach(async (document) => {
    if (document.nitrado && document.status) {
      const tokens = Object.values(document.nitrado);
      await Promise.all(tokens.map(token => verification(token)));

      try {
        const channel = await client.channels.fetch(document.status?.channel);
        const message = await channel.messages.fetch(document.status?.message);

        // Sort servers by player current count.
        // Build the output string from the sorted servers.
        servers.sort((a, b) => b.playerCurrent - a.playerCurrent);
        output = servers.map(server => server.output).join('');

        const cluster = new ButtonKit()
          .setCustomId('ase-cluster-command')
          .setLabel('Cluster Command')
          .setStyle(ButtonStyle.Success);

        const support = new ButtonKit()
          .setURL('https://discord.gg/VQanyb23Rn')
          .setLabel('Support Server')
          .setStyle(ButtonStyle.Link);

        const row = new ActionRowBuilder()
          .addComponents(cluster, support);

        const embed = new EmbedBuilder()
          .setDescription(`${output}**Cluster Player Count**\n \`🌐\` \`(${current}/${maximum})\`\n\n<t:${Math.floor(Date.now() / 1000)}:R>\n**[Partnership & Information](https://nitra.do/obeliskdevelopment)**\nConsider using our partnership link to purchase your gameservers, it will help fund development.`)
          .setFooter({ text: 'Note: Contact support if issues persist.' })
          .setImage('https://i.imgur.com/2ZIHUgx.png')
          .setColor(0x2ecc71);

        await message.edit({ embeds: [embed], components: [row] });
      } catch (error) { console.log('Cannot edit status page.'), null }
    };
  });
};

