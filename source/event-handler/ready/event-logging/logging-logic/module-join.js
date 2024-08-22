const { EmbedBuilder } = require('discord.js');
const data = new Set();

const joinExtractionLogic = async (document, service, response, client) => {
  // Regex pattern to match join/leave logs with timestamps, username, and join/leave status
  const regex = /(\d{4}\.\d{2}\.\d{2}-\d{2}\.\d{2}\.\d{2}:\d{3})\]\[\d+\](\d{4}\.\d{2}\.\d{2}_\d{2}\.\d{2}\.\d{2}):\s(\w+)\s(joined|left)\sthis\sARK!/g;

  try {
    let counter = 0;
    let result = '', unique = '';
    while ((result = regex.exec(response)) !== null && counter <= 10) {
      const [string, milliseconds, date, playerUsername, playerJoinConditional] = result;

      const pattern = milliseconds;

      if (!data.has(pattern)) {
        data.add(pattern);
        counter++;

        const [datePart, timePart] = date.split('_');
        const dateTimeString = `${datePart.replace(/\./g, '-')}T${timePart.replace(/\./g, ':')}`;
        const unix = Math.floor(new Date(dateTimeString).getTime() / 1000);

        unique += `<t:${unix}:f>\n**Player Identity Information**\n[${playerUsername}]: has ${playerJoinConditional} the Ark.\n\n`;
      }
    }

    if (!unique) return;

    Object.entries(document.data().join).forEach(async entry => {
      if (parseInt(entry[0]) === service.id) {
        try {
          const channel = await client.channels.fetch(entry[1]);
          const embed = new EmbedBuilder()
            .setColor('#2ecc71')
            .setFooter({ text: `Tip: Contact support if there are issues.` })
            .setDescription(unique);

          await channel.send({ embeds: [embed] });
        } catch (error) { null };
      }
    });
  } catch (error) { console.log('Join Extraction Error') };
};

// Clear the Set every hour
setInterval(() => data.clear(), 3600000);

module.exports = { joinExtractionLogic };
