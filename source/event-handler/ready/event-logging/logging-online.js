const { ButtonStyle, EmbedBuilder } = require('discord.js');
const { db } = require('../../../script');
const { default: axios } = require('axios');
const { getServices } = require('../../../services/requests/getServices');

const rateLimit = require('axios-rate-limit');
const http = rateLimit(axios.create(), { maxRequests: 5, perMilliseconds: 1500 });

module.exports = async (client) => {
  const loop = async () => {

    const reference = await db.collection('ase-configuration').get();
    reference?.forEach(async document => {
      const { nitrado } = document.data();

      Object.values(nitrado)?.map(async token => {
        const services = await getServices(token);

        await Promise.all(services.map(async identifier => {
          let output = '';

          try {
            const url = `https://api.nitrado.net/services/${identifier}/gameservers/games/players`;
            const response = await http.get(url,
              { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

            response.status === 200 &&
              response.data.data.players.forEach(async player => {
                player.online && (output += `\`🟢\` \`Player Online\`\n\`🔗\` ${player.id}\n\`🔗\` ${player.name}\n\n`);
              });

            Object.entries(document.data()?.online || {}).forEach(async entry => {
              if (parseInt(entry[0]) === identifier) {
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

          } catch (error) { console.log(error) };
        }));
      })
    })
    setTimeout(loop, 60000);
  }
  loop().then(() => console.log('Loop started:'));
};

