const {assert} = require('chai');
const {buildVideoObject, submitVideoForm} = require('../test-utils.js');
const {connectDatabaseAndDropData, disconnectDatabase} = require('../database-utilities')

describe('User visits /show page', function(){
    beforeEach(function(){
        connectDatabaseAndDropData();
        this.createdVideo = buildVideoObject();
    });

    afterEach(disconnectDatabase);

    it('deletes the video', function(){
        browser.url('/videos/create');
        submitVideoForm(this.createdVideo);

        browser.click('#delete');

        assert.notOk(browser.isExisting('.video-title'));
    });
});