const { EmbedBuilder } = require('discord.js');
const data = new Set();

const chatExtractionLogic = async (document, service, response, client) => {
  // Regex pattern to match chat logs with timestamps, gamertag, username, and message
  const regex = /\[(\d{4}\.\d{2}\.\d{2}-\d{2}\.\d{2}\.\d{2}:\d{3})\]\[\s*\d+\]([\d.]+_[\d.]+): (\S+(?: \S+)*) \(([^()]+)\): (.+)/g;

  try {
    let counter = 0;
    let result = '', unique = '';
    while ((result = regex.exec(response)) !== null && counter <= 10) {
      const [string, milliseconds, date, gamertag, username, message] = result;

      // Use milliseconds as the unique identifier for this chat message
      const pattern = milliseconds;

      if (!data.has(pattern)) {
        data.add(pattern);
        counter++;

        const [datePart, timePart] = date.split('_');
        const dateTimeString = `${datePart.replace(/\./g, '-')}T${timePart.replace(/\./g, ':')}`;
        const unix = Math.floor(new Date(dateTimeString).getTime() / 1000);

        unique += `<t:${unix}:f>\n**Player Identity Information**\n[${gamertag}]: ${username}\n${message}\n\n`;
      }
    }

    if (!unique) return;

    Object.entries(document.data().chat).forEach(async entry => {
      if (parseInt(entry[0]) === service.id) {
        try {
          const channel = await client.channels.fetch(entry[1]);
          const embed = new EmbedBuilder()
            .setColor(0x2ecc71)
            .setFooter({ text: `Tip: Contact support if there are issues.` })
            .setDescription(unique);

          await channel.send({ embeds: [embed] });
        } catch (error) { null };
      }
    });
  } catch (error) { console.log(error) };
};

// Clear the Set every hour
setInterval(() => data.clear(), 7200000);

module.exports = { chatExtractionLogic };
