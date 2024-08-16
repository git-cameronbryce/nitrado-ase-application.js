const { EmbedBuilder } = require("@discordjs/builders");

const invalidToken = () => {
  return new EmbedBuilder()
    .setDescription(`**Unauthorized Access**\nAn assigned token is no longer validated.\nPlease reauthorize with your provider.\n\`/ase-setup-account\`\n\n**Additional Information**\nEnsure you follow setup procedures.`)
    .setFooter({ text: 'Tip: Contact support if there are issues.' })
    .setColor(0xe67e22);
}

const statusInstallation = () => {
  return new EmbedBuilder()
    .setDescription("**Server Status Information**\nStatus page installing. Every few minutes, this page will update. Displaying accurate and updated server information. \n\n(e.g. Server state, Player data, etc.)\n\n**[Partnership Commission](https://nitra.do/obeliskdevelopment)**\nConsider using our partnership link to purchase your servers, we will recieve partial commission!")
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setImage('https://i.imgur.com/bFyqkUS.png')
    .setColor(0x2ecc71);
}

const loggingInstallation = () => {
  return new EmbedBuilder()
    .setDescription(`**Logging Setup & Information**\nSelect the buttons below to utilize our logging system. Ensure all servers are online and the counter looks correct before accepting.\n\n**Additional Information**\nActive servers generate faster-flowing logs. Nitrado may take upwards of one hour to process logs and submit them to your folder, where we collect them.`)
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setImage('https://i.imgur.com/itvDgx8.png')
    .setColor(0x2ecc71);
}

module.exports = { statusInstallation, loggingInstallation, invalidToken, };
