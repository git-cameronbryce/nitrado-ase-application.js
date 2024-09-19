const { db } = require('../../../script');
const { default: axios } = require('axios');

const rateLimit = require('axios-rate-limit');
const http = rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 1000 });

const { adminExtractionLogic } = require('./logging-logic/module-admin');
const { chatExtractionLogic } = require('./logging-logic/module-chat');

module.exports = async (client) => {
  const platforms = ['arkxb', 'arkps', 'arkse'];

  const loop = async () => {
    const getExtractedFilePath = async (token, document, service, { url }) => {
      const response = await http.get(url,
        { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

      if (document.data().forum?.admin && Object.keys(document.data().forum.admin).length) {
        await adminExtractionLogic(document, service, response.data, client);
      }

      if (document.data().forum?.chat && Object.keys(document.data().forum.chat).length) {
        await chatExtractionLogic(document, service, response.data, client);
      }
    };

    const getFilePathInformation = async (token, document, service, { game_specific: { path } }) => {
      try {
        const url = `https://api.nitrado.net/services/${service.id}/gameservers/file_server/download?file=${path}/ShooterGame/Saved/Logs/ShooterGame.log`;
        const response = await http.get(url,
          { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

        response.status === 200 && getExtractedFilePath(token, document, service, response.data.data.token);
      } catch (error) { null };
    };

    const getServiceInformation = async (token, document) => {
      const url = 'https://api.nitrado.net/services';
      const response = await http.get(url,
        { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

      await Promise.all(
        response.data.data.services.map(async service => {
          if (!platforms.includes(service.details.folder_short) || service.status !== 'active') return;

          const url = `https://api.nitrado.net/services/${service.id}/gameservers`;
          const response = await http.get(url,
            { headers: { 'Authorization': token, 'Content-Type': 'application/json' } });

          response.status === 200 && getFilePathInformation(token, document, service, response.data.data.gameserver);
        }))
    }

    const reference = await db.collection('ase-configuration').get();
    reference?.forEach(async document => {
      const { nitrado } = document.data();
      await Promise.all(Object.values(nitrado)?.map(async token => getServiceInformation(token, document)));
    })
    setTimeout(loop, 60000);
  }
  loop().then(() => console.log('Logging loop started:'));
};

