const {assert} = require('chai');
const {buildVideoObject, submitVideoForm} = require('../test-utils.js');
const {connectDatabaseAndDropData, disconnectDatabase} = require('../database-utilities')

describe('User visits update page', function(){
    beforeEach(function(){
        connectDatabaseAndDropData();
        this.createdVideo = buildVideoObject();
    });

    afterEach(disconnectDatabase);

    it('updates information for an item', function(){
        const updatedVideo = buildVideoObject({
            title: 'Updated title',
            description: 'updated description',
            url: 'https://www.youtube.com/embed/1RA2Zy_IZfQ'
        });
        browser.url(`/videos/create`);
        submitVideoForm(this.createdVideo);
        browser.click('#edit');
        browser.setValue('#title-input', updatedVideo.title);
        browser.click('.input-button');
        assert.include(browser.getText('body'), updatedVideo.title);
    });

    it('does not create a new video', function(){
        const updatedVideo = buildVideoObject({
            title: 'Updated title',
            description: 'updated description',
            url: 'https://www.youtube.com/embed/1RA2Zy_IZfQ'
        });
        browser.url(`/videos/create`);
        submitVideoForm(this.createdVideo);
        browser.click('#edit');
        browser.setValue('#title-input', updatedVideo.title);
        browser.click('.input-button');
        browser.url('/')
        assert.notInclude(browser.getText('.video-title'), this.createdVideo.title);
    });
});