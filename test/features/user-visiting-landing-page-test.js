const {assert} = require('chai');
const {buildVideoObject, submitVideoForm} = require('../test-utils.js');
const {connectDatabaseAndDropData, disconnectDatabase} = require('../database-utilities')



describe('User visits landing page', () => {
	describe('without existing videos', () => {
		it('renders blank page', () => {
			browser.url('/');
			assert.isNotOk(browser.isExisting('.video-title'));
		});
	});
	describe('after creating a video', () => {
		beforeEach(function(){
			connectDatabaseAndDropData();
			this.itemToCreate = buildVideoObject();
		})

		afterEach(disconnectDatabase);
		it('renders the video title on landing page', function() {
			browser.url('/')
			browser.click('a[href="/videos/create"]');
			submitVideoForm(this.itemToCreate);
			browser.url('/')
			assert.include(browser.getText('.video-title'), this.itemToCreate.title);
			assert.include(browser.getAttribute('.video-player', 'src'), this.itemToCreate.url);

		});
	});

	describe('can navigate', () => {
		it('to the create page', () => {
	      // Setup
	      browser.url('/');
	      // Exercise
	      browser.click('a[href="/videos/create"]');
	      // Verification
	      assert.include(browser.getText('body'), 'Save a video');
	  });
		it('to the show page by clicking on Title', () => {
	      // Setup
	      const itemToCreate = buildVideoObject()
	      browser.url('/')
	      browser.click('a[href="/videos/create"]');
	      submitVideoForm(itemToCreate);
	      browser.url('/');
          // Exercise
          browser.click('div.video-title');
          // Verification
          assert.include(browser.getText('body'), itemToCreate.title);
          assert.include(browser.getText('body'), itemToCreate.description);
          assert.include(browser.getAttribute('iframe', 'src'), itemToCreate.url);
      });	    
	});
});