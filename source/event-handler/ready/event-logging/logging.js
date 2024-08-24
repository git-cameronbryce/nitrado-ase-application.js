const { ButtonStyle, EmbedBuilder } = require('discord.js');
const { db } = require('../../../script');
const axios = require('axios');

const { adminExtractionLogic } = require('./logging-logic/module-admin');
const { chatExtractionLogic } = require('./logging-logic/module-chat');
const { joinExtractionLogic } = require('./logging-logic/module-join');

module.exports = async (client) => {
  const platforms = ['arkxb'];

  const loop = async () => {
    const getExtractedFilePath = async (token, document, service, { url }) => {
      const response = await axios.get(url,
        { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

      if (document.data().forum?.admin && Object.keys(document.data().forum.admin).length) {
        await adminExtractionLogic(document, service, response.data, client);
      }

      if (document.data().forum?.chat && Object.keys(document.data().forum.chat).length) {
        await chatExtractionLogic(document, service, response.data, client);
      }

      if (document.data().forum?.join && Object.keys(document.data().forum.join).length) {
        await joinExtractionLogic(document, service, response.data, client);
      }
    };

    const getFilePathInformation = async (token, document, service, { game_specific: { path } }) => {
      try {
        const url = `https://api.nitrado.net/services/${service.id}/gameservers/file_server/download?file=${path}/ShooterGame/Saved/Logs/ShooterGame.log`;
        const response = await axios.get(url,
          { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

        response.status === 200 && getExtractedFilePath(token, document, service, response.data.data.token);
      } catch (error) { null };
    };

    const getServiceInformation = async (token, document) => {
      const url = 'https://api.nitrado.net/services';
      const response = await axios.get(url,
        { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

      await Promise.all(
        response.data.data.services.map(async service => {
          if (!platforms.includes(service.details.folder_short) || service.status !== 'active') return;

          const url = `https://api.nitrado.net/services/${service.id}/gameservers`;
          const response = await axios.get(url,
            { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

          response.status === 200 && getFilePathInformation(token, document, service, response.data.data.gameserver);
        }))
    }

    const verification = async (token, document) => {
      try {
        const url = 'https://oauth.nitrado.net/token';
        const response = await axios.get(url,
          { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

        const { scopes } = response.data.data.token;
        response.status === 200 && scopes.includes('service')
          && await getServiceInformation(token, document);

      } catch (error) {
        error.response.data.message === 'Access token not valid.' && null;
      };
    };

    const reference = await db.collection('ase-configuration').get();
    reference?.forEach(async document => {
      const { nitrado } = document.data();
      await Promise.all(Object.values(nitrado)?.map(async token => verification(token, document)));
    })
    setTimeout(loop, 15000);
  }
  loop().then(() => console.log('Loop started:'));
};

