const { EmbedBuilder } = require("@discordjs/builders");

const createInvalidServiceEmbed = () => {
  return new EmbedBuilder()
    .setDescription("**Invalid Service Detected**\nCreation failed due to incorrect args.\n\n**Additional Information**\nUnable to authorize with stored token.\nYou must provide a valid identifier.")
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setColor(0xe67e22);
}

const createDuplicateEntryEmbed = () => {
  return new EmbedBuilder()
    .setDescription(`**Duplicate Entry Detected**\nCreation failed due to an existing setup.\nThread already stored in database.\n\n**Additional Information**\nOverwriting does not remove the thread.\nYou must delete the thread afterward.`)
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setColor(0xe67e22);
}

const createInvalidTokenEmbed = () => {
  return new EmbedBuilder()
    .setDescription("**Token Invalidation Error**\nYou do not have a connected account. \nPlease reauthorize and setup again.\n`'/ase-setup-account'`\n\n**Additional Information**\nToken is invalid or not in our database.")
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setColor(0xe67e22);
}

const createServerStatusEmbed = () => {
  return new EmbedBuilder()
    .setDescription("**Server Status Information**\nStatus page installing. Every few minutes, this page will update. Displaying accurate and updated server information. \n\n(e.g. Server state, Player data, etc.)\n\n**[Partnership Commission](https://nitra.do/obeliskdevelopment)**\nConsider using our partnership link to purchase your servers, we will receive partial commission!")
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setImage('https://i.imgur.com/bFyqkUS.png')
    .setColor(0x2ecc71);
}

const createLoggingSetupEmbed = () => {
  return new EmbedBuilder()
    .setDescription(`**Logging Creation & Tooling**\nSelect the buttons to utilize our logging tooling. Ensure your server is online before proceeding.\n\n**Additional Information**\nEnsure you have logging enabled in your settings. Nitrado may take upwards of one hour to update your log files. Request support before deleting.`)
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setImage('https://i.imgur.com/bFyqkUS.png')
    .setColor(0x2ecc71);
}

const createDonationEmbed = () => {
  return new EmbedBuilder()
    .setDescription(`**Ark Survival Evolved**\n**Development Funding & Overview**\nWe receive a commission for each server you purchase through us, as we are partnered. Help keep our app free, it doesn't cost anything extra.\n\n**Additional Information**\nThere are two ways to support, you can purchase via our link, or you can submit a normal donation. For those that do either, please @ us in our server.\n\n**[Partnership & Affiliation](https://nitra.do/obeliskdevelopment)**\nConsider using our partnership link to purchase your servers, we will receive partial commission!`)
    .setFooter({ text: 'Note: Contact support if issues persist.' })
    .setImage('https://i.imgur.com/OKBEGmT.png')
    .setColor(0x2ecc71);
}

module.exports = {
  createInvalidServiceEmbed,
  createDuplicateEntryEmbed,
  createServerStatusEmbed,
  createLoggingSetupEmbed,
  createInvalidTokenEmbed,
  createDonationEmbed
};
