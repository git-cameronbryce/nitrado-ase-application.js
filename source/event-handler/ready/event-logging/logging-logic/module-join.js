const { EmbedBuilder } = require('discord.js');
const data = new Set();

const joinExtractionLogic = async (document, service, response, client) => {
  const regex = /(\d{4}\.\d{2}\.\d{2}_\d{2}\.\d{2}\.\d{2}):\s(\w+)\s(joined|left)\sthis\sARK!/g;

  try {
    let counter = 0;
    let result = '', pattern = '', unique = '';
    while ((result = regex.exec(response)) !== null && counter <= 10) {
      const [string, date, playerUsername, playerJoinConditional] = result;

      const [datePart, timePart] = date.split('_');
      const dateTimeString = `${datePart.replace(/\./g, '-')}T${timePart.replace(/\./g, ':')}`;
      const unix = Math.floor(new Date(dateTimeString).getTime() / 1000);

      switch (playerJoinConditional) {
        case 'joined':
          pattern += `<t:${unix}:f>\n**Player Identity Information**\n[${playerUsername}]: has joined the Ark.\n\n`;
          if (!data.has(pattern)) {
            data.add(pattern), counter++;
            unique += `<t:${unix}:f>\n**Player Identity Information**\n[${playerUsername}]: has joined the Ark.\n\n`;
          };

          break;

        case 'left':
          pattern += `<t:${unix}:f>\n**Player Identity Information**\n[${playerUsername}]: has left the Ark.\n\n`;
          if (!data.has(pattern)) {
            data.add(pattern), counter++;
            unique += `<t:${unix}:f>\n**Player Identity Information**\n[${playerUsername}]: has left the Ark.\n\n`;
          };

          break;

        default:
          break;
      }
    };

    if (data.size >= 2500) data.clear();

    if (!unique) return;
    Object.entries(document.data().join).forEach(async entry => {
      if (parseInt(entry[0]) === service.id) {
        try {
          const channel = await client.channels.fetch(entry[1]);
          const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setFooter({ text: `Tip: Contact support if there are issues.` })
            .setDescription(`${unique}`);

          await channel.send({ embeds: [embed] });
        } catch (error) { console.log(error) };
      };
    });
  } catch (error) { console.log(error) };
};

module.exports = { joinExtractionLogic };