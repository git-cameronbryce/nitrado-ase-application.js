const { default: axios } = require("axios");
const platforms = ['arkxb', 'arkps', 'arkse'];

const rateLimit = require('axios-rate-limit');
const http = rateLimit(axios.create(), { maxRequests: 1, perMilliseconds: 1000 });

/**
 * Fetches and filters services bases on their status and platform.
 * If the status and platform are as needed, ids are pushed to the array.
 * @param {string} token - bearer authorization token, required for all requests.
 * @returns {Promise<number[]>} - promise array with numbers, includes all service ids. 
 */

const getServices = async (token) => {
  try {
    const url = 'https://api.nitrado.net/services';
    const response = await http.get(url, {
      headers: { 'Authorization': token, 'Content-Type': 'application/json' }
    });

    console.log('Requested: https://api.nitrado.net/services');

    let identifiers = [];
    response.data.data.services.forEach(service => {
      if (platforms.includes(service.details.folder_short) && service.status === 'active') {
        identifiers.push(service.id);
      }
    });

    return identifiers;
  } catch (error) { console.log(error), null }
};

module.exports = { getServices };
