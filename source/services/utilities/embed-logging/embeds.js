const { EmbedBuilder } = require("@discordjs/builders");

const createDuplicateLoggingEmbed = (success, services, token) => {
  return new EmbedBuilder()
    .setDescription("**Duplicate Gameserver Detected**\nGameserver data stored in database.\nLogging is currently being captured. \n\n**Additional Information**\nLogs can take upwards of 45m to update.\nEnsure your server has logging enabled.")
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setColor(0xe67e22);
}

const createPlayerLoggingEmbed = (success, services, token) => {
  return new EmbedBuilder()
    .setDescription("**Action Authorization Granted**\nGameserver has been stored in database.\nRequested thread will now be generated. \n\`🔐\` \`Command Executed: Locked\`\n\n**Additional Information**\nLogs can take upwards of 45m to update.\nEnsure your server has logging enabled.")
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setColor(0x2ecc71);
}

module.exports = {
  createDuplicateLoggingEmbed,
  createPlayerLoggingEmbed
}
