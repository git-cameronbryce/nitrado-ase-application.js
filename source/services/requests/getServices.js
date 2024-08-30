const { default: axios } = require("axios");
const platforms = ['arkxb'];

/**
 * Fetches and filters the services from the Nitrado API based on platform compatibility and active status.
 * 
 * @param {string} token - The authorization token required for the API call.
 * @returns {Promise<number[]>} - A promise that resolves to an array of service IDs that are compatible and active.
 */

const getServices = async (token) => {
  const url = 'https://api.nitrado.net/services';
  const response = await axios.get(url, {
    headers: { 'Authorization': token, 'Content-Type': 'application/json' }
  });

  let identifiers = [];
  response.data.data.services.forEach(service => {
    if (platforms.includes(service.details.folder_short) && service.status === 'active') {
      identifiers.push(service.id);
    }
  });

  return identifiers;
};

module.exports = { getServices };
