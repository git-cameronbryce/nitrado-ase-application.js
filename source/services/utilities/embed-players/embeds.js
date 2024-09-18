const { EmbedBuilder } = require("@discordjs/builders");

const createPlayerManagementSuccessEmbed = (success, services, token) => {
  return new EmbedBuilder()
    .setDescription(`**Ark Survival Evolved**\n**Game Command Success**\nGameserver action completed.\nExecuted on \`${success}\` of \`${services.length}\` servers.\n\`\`\`...${token.slice(0, 12)}\`\`\``)
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setThumbnail('https://i.imgur.com/CzGfRzv.png')
    .setColor(0x2ecc71);
}

const createRoleMissingEmbed = () => {
  return new EmbedBuilder()
    .setDescription(`**Unauthorized Access**\nYou do not have the required permissions.\nPlease ask an administrator for access.\n\n**Additional Information**\nThe role was generated upon token setup.\nBe sure to add this role to __your__ account.`)
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setColor(0xe67e22);
}

module.exports = {
  createPlayerManagementSuccessEmbed,
  createRoleMissingEmbed
}


