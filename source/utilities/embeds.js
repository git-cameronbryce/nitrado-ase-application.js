const { EmbedBuilder } = require("@discordjs/builders");

const invalidToken = () => {
  return new EmbedBuilder()
    .setDescription(`**Unauthorized Access**\nAn assigned token is no longer validated.\nPlease reauthorize with your provider.\n\`/ase-setup-account\`\n\n**Additional Information**\nEnsure you follow setup procedures.`)
    .setFooter({ text: 'Tip: Contact support if there are issues.' })
    .setColor(0xe67e22);
}

module.exports = { invalidToken };
