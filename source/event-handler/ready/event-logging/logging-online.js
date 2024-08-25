const { ButtonStyle, EmbedBuilder } = require('discord.js');
const { db } = require('../../../script');
const { default: axios } = require('axios');

module.exports = async (client) => {
  const platforms = ['arkxb'];

  const loop = async () => {

    let output = '';
    const getPlayerInformation = async (document, service) => {

      Object.entries(document.data().online).forEach(async entry => {
        if (parseInt(entry[0]) === service.id) {
          try {
            const channel = await client.channels.fetch(entry[1].thread);
            const message = await channel.messages.fetch(entry[1].message);

            const embed = new EmbedBuilder()
              .setColor('#2ecc71')
              .setFooter({ text: `Tip: Contact support if there are issues.` })
              .setDescription(`${output.length > 1 ? `${output}Obelisk is watching for gameservers.\nScanned \`1\` of \`1\` gameservers.\n<t:${Math.floor(Date.now() / 1000)}:R>` : `**Additional Information**\nCurrently, there are zero players online.\n\nObelisk is monitoring for updates.\nScanned \`1\` of \`1\` gameservers.\n<t:${Math.floor(Date.now() / 1000)}:R>`}`);

            await message.edit({ embeds: [embed] });
          } catch (error) { error.code === 10003 && null };
        }
      });
    }

    const getServiceInformation = async (token, document) => {
      const url = 'https://api.nitrado.net/services';
      const response = await axios.get(url,
        { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

      await Promise.all(
        response.data.data.services.map(async service => {
          if (!platforms.includes(service.details.folder_short) || service.status !== 'active') return;

          const url = `https://api.nitrado.net/services/${service.id}/gameservers/games/players`;
          const response = await axios.get(url,
            { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

          await Promise.all(response.data.data.players.map(async player => {
            player.online && (output += `\`🟢\` \`Player Online\`\n\`🔗\` ${player.id}\n\`🔗\` ${player.name}\n\n`);
          }));

          response.status === 200 && getPlayerInformation(document, service);
        }))
    }

    const verification = async (token, document) => {
      try {
        const url = 'https://oauth.nitrado.net/token';
        const response = await axios.get(url,
          { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

        const { scopes } = response.data.data.token;
        response.status === 200 && scopes.includes('service')
          && await getServiceInformation(token, document);

      } catch (error) {
        error.response.data.message === 'Access token not valid.' && null;
      };
    };

    const reference = await db.collection('ase-configuration').get();
    reference?.forEach(async document => {
      const { nitrado } = document.data();
      await Promise.all(Object.values(nitrado)?.map(async token => verification(token, document)));
    })
    setTimeout(loop, 15000);
  }
  loop().then(() => console.log('Loop started:'));
};

