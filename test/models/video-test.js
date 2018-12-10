const Video = require('../../models/video');

const {assert} = require('chai');
const {connectDatabaseAndDropData, disconnectDatabase} = require('../database-utilities')

describe('Model: Video', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(disconnectDatabase);

  describe('#title', () => {
    it('is a String', () => {
      const titleAsNumber = 1;
      const video = new Video({title: titleAsNumber});
      assert.strictEqual(video.title, titleAsNumber.toString());
    });
    it('is required', () => {
      const video = new Video({});
      video.validateSync();
      assert.equal(video.errors.title.message, 'Path `title` is required.');      
    });
  });
  describe('#description', () => {
    it('is a String', () => {
      const descriptionAsNumber = 1;
      const video = new Video({description: descriptionAsNumber});
      assert.strictEqual(video.description, descriptionAsNumber.toString());
    });
  });
  describe('#url', () => {
    it('is a String', () => {
      const urlAsNumber = 1;
      const video = new Video({url: urlAsNumber});
      assert.strictEqual(video.url, urlAsNumber.toString());
    });
    it('is required', () => {
      const video = new Video({});
      video.validateSync();
      assert.equal(video.errors.url.message, 'Path `url` is required.');      
    });
  });
});