const { EmbedBuilder } = require("@discordjs/builders");

const invalidTokenConnection = () => {
  return new EmbedBuilder()
    .setDescription("**Token Invalidation Error**\nYou do not have a connected account. \nPlease reauthorize and setup again.\n`'/ase-setup-account'`\n\n**Additional Information**\nToken is invalid or not in our database.")
    .setFooter({ text: 'Note: Contact support if issues persist.' })
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

const serverRestartAuditLogging = (token, identifier) => {
  return new EmbedBuilder()
    .setDescription(`**Gameserver Audit Logging**\nGameserver action completed.\nRestarting \`1\` of \`1\` servers.\n\n> ||<@${identifier}>||\n\`\`\`...${token.slice(0, 12)}\`\`\``)
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setColor(0x2ecc71);
}

const serverStopAuditLogging = (token, identifier) => {
  return new EmbedBuilder()
    .setDescription(`**Gameserver Audit Logging**\nGameserver action completed.\nStopping \`1\` of \`1\` servers.\n\n> ||<@${identifier}>||\n\`\`\`...${token.slice(0, 12)}\`\`\``)
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setColor(0x2ecc71);
}

const autoMonitoringInstallationUpdate = (monitoring) => {
  return new EmbedBuilder()
    .setDescription(`**Auto Monitoring Overview**\nEnter the service IDs to monitor. Fully stopped servers will be automatically restarted.\n\n**Additional Information**\nRemove the IDs to keep servers in an offline state. Supporting upwards of thirty concurrent services.\n\n\`\`\`x${monitoring.restarts} Gameservers Restored\nAwaiting connected gameserver...\n\n\`\`\`\n<t:${Math.floor(Date.now() / 1000)}:R>\n**[Partnership & Information](https://nitra.do/obeliskdevelopment)**\nConsider using our partnership link to purchase your gameservers, it will help fund development.`)
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setImage('https://i.imgur.com/bFyqkUS.png')
    .setColor(0x2ecc71);
}

const autoMonitoringInstallation = () => {
  return new EmbedBuilder()
    .setDescription(`**Auto Monitoring Overview**\nEnter the service IDs to monitor. Fully stopped servers will be automatically restarted.\n\n**Additional Information**\nRemove the IDs to keep servers in an offline state. Supporting upwards of thirty concurrent services.\n\n\`\`\`x0 Gameservers Restored\nAwaiting connected gameserver...\n\n\`\`\`\n<t:${Math.floor(Date.now() / 1000)}:R>\n**[Partnership & Information](https://nitra.do/obeliskdevelopment)**\nConsider using our partnership link to purchase your gameservers, it will help fund development.`)
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setImage('https://i.imgur.com/bFyqkUS.png')
    .setColor(0x2ecc71);
}

module.exports = { statusInstallation, loggingInstallation, invalidTokenConnection, serverRestartAuditLogging, serverStopAuditLogging, autoMonitoringInstallation, autoMonitoringInstallationUpdate };
