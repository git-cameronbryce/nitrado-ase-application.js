const { EmbedBuilder } = require('discord.js');
const data = new Set();

const adminExtractionLogic = async (document, service, response, client) => {
  // Regex to match the log line and extract relevant parts
  const regex = /(\d{4}\.\d{2}\.\d{2}-\d{2}\.\d{2}\.\d{2}:\d{3})\]\[\d+\](\d{4}\.\d{2}\.\d{2}_\d{2}\.\d{2}\.\d{2}): AdminCmd: (.*?) \(PlayerName: (.+?), ARKID: (\d+), SteamID: (\d+)/g;

  try {
    let counter = 0;
    let result = '', unique = '';
    while ((result = regex.exec(response)) !== null && counter <= 10) {
      const [string, milliseconds, date, playerCommand, playerUsername, playerArkIdentifier, playerSteamIdentifier] = result;

      const pattern = milliseconds;

      if (!data.has(pattern)) {
        data.add(pattern);
        counter++;

        const [datePart, timePart] = date.split('_');
        const dateTimeString = `${datePart.replace(/\./g, '-')}T${timePart.replace(/\./g, ':')}`;
        const unix = Math.floor(new Date(dateTimeString).getTime() / 1000);

        unique += `<t:${unix}:f>\n**Admin Identity Information**\n[${playerSteamIdentifier}]: ${playerUsername}\n${playerCommand}\n\n`;
      }
    }

    if (!unique) return;

    Object.entries(document.data().admin).forEach(async entry => {
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

  } catch (error) { null };
};

setInterval(() => data.clear(), 7200000);

module.exports = { adminExtractionLogic };
