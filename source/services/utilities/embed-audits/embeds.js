const { EmbedBuilder } = require("@discordjs/builders");


const createPlayerManagementAuditEmbed = (input, success, services, token) => {
  return new EmbedBuilder()
    .setDescription(`**Gameserver Audit Logging**\nGameserver action completed.\nExecuted on \`${success}\` of \`${services.length}\` servers.\n\n${input.username} was...\nRemoved for ${input.reason}\n\n> ||<@${input.admin}>||\n\`\`\`...${token.slice(0, 12)}\`\`\``)
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setColor(0x2ecc71);
}

const createServerRestartAuditEmbed = (token, identifier, success) => {
  return new EmbedBuilder()
    .setDescription(`**Gameserver Audit Logging**\nGameserver action completed.\nRestarting \`${success}\` of \`${success}\` servers.\n\n> ||<@${identifier}>||\n\`\`\`...${token.slice(0, 12)}\`\`\``)
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setColor(0x2ecc71);
}

const createServerStopAuditEmbed = (token, identifier, success) => {
  return new EmbedBuilder()
    .setDescription(`**Gameserver Audit Logging**\nGameserver action completed.\nStopping \`${success}\` of \`${success}\` servers.\n\n> ||<@${identifier}>||\n\`\`\`...${token.slice(0, 12)}\`\`\``)
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setColor(0x2ecc71);
}

module.exports = {
  createPlayerManagementAuditEmbed,
  createServerRestartAuditEmbed,
  createServerStopAuditEmbed
};

