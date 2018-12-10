const {assert} = require('chai');
const {buildVideoObject, submitVideoForm} = require('../test-utils.js');


describe('User visits the create page', () => {
  describe('posts a new item', () => {
    it('and it\'s rendered', () => {
      const videoToCreate = buildVideoObject();
      browser.url('/videos/create');
      submitVideoForm(videoToCreate);
      assert.include(browser.getText('body'), videoToCreate.title);
      assert.include(browser.getText('body'), videoToCreate.description);
    });
    it('and form is posted to /videos ', () => {
      const expectedAction = '/videos'
      browser.url('/videos/create');
      assert.include(browser.getAttribute('form', 'action'), expectedAction);
    });     
  });
});