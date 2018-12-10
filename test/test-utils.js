const {jsdom} = require('jsdom');

const Video = require('../models/video');

const generateRandomUrl = (domain) => {
  return `http://${domain}/embed/${Math.random()}`;
};

const buildVideoObject = (options = {}) => {
  const title = options.title || 'Cool youtube video';
  const description = options.description || 'This video is the best!';
  const url = options.url || generateRandomUrl('www.youtube.com');
  return {title, description, url};
}

const seedItemToDatabase = async (options = {}) => {
  const video = await Video.create(buildVideoObject(options));
  return video;
};

const parseTextFromHTML = (htmlAsString, selector) => {
  const selectedElement = jsdom(htmlAsString).querySelector(selector);
  if (selectedElement !== null) {
    return selectedElement.textContent;
  } else {
    throw new Error(`No element with selector ${selector} found in HTML string`);
  }
};

const parseInputFieldValuesFromHTML = (htmlAsString, selector) => {
  const selectedElement = jsdom(htmlAsString).querySelector(selector);
  if (selectedElement !== null) {
    return selectedElement.value.toString();
  } else {
    throw new Error(`No element with selector ${selector} found in HTML string`);
  }
};

const parseAttributeValuesFromHTML = (htmlAsString, selector, attribute) => {
  const selectedElement = jsdom(htmlAsString).querySelector(selector);
  if (selectedElement !== null) {
    return selectedElement.getAttribute(attribute).toString();
  } else {
    throw new Error(`No element with selector ${selector} found in HTML string`);
  }
};

function submitVideoForm(videoValues){
	browser.setValue('#title-input', videoValues.title);
	browser.setValue('#description-input', videoValues.description);
	browser.setValue('#url-input', videoValues.url)
	browser.click('#submit-button')
}

module.exports = {
  buildVideoObject,
  seedItemToDatabase,
  parseTextFromHTML,
  parseInputFieldValuesFromHTML,
  parseAttributeValuesFromHTML,
  submitVideoForm
}