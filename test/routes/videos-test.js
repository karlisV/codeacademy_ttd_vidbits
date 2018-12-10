const {assert} = require('chai');
const request = require('supertest');
const {jsdom} = require('jsdom');

const app = require('../../app');
const Video = require('../../models/video');

const {buildVideoObject, parseTextFromHTML, seedItemToDatabase, 
  parseInputFieldValuesFromHTML, parseAttributeValuesFromHTML} = require('../test-utils');
  const {connectDatabaseAndDropData, disconnectDatabase} = require('../database-utilities')

  describe('Server path: /videos', () => {
    beforeEach(connectDatabaseAndDropData);

    afterEach(disconnectDatabase);


    describe('POST', async () => {
      it('correct status code is returned', async () => {
        const videoToCreate = buildVideoObject();
        const response = await request(app)
        .post('/videos')
        .type('form')
        .send(videoToCreate);
        assert.equal(response.status, 302)
      });
      
      it('renders a Video', async() => {
        const videoToCreate = buildVideoObject();
        const response = await request(app)
        .post('/videos')
        .type('form')
        .send(videoToCreate)
        .redirects(1);
        assert.include(parseTextFromHTML(response.text, '.video-title h1'), videoToCreate.title)
        assert.include(parseAttributeValuesFromHTML(response.text, 'iframe', 'src'), videoToCreate.url)
      })

      it('saves a new item', async () => {
        const videoToCreate = buildVideoObject();
        const response = await request(app)
        .post('/videos')
        .type('form')
        .send(videoToCreate);
        const createdItem = await Video.findOne(videoToCreate);
        assert.isOk(createdItem, 'Video was not created successfully in the database');
      });


      describe('when invalid payload is sent', async() =>{
        it('does not save when title is missing', async() => {
          const invalidVideoToCreate = {description: 'Without Title'};
          const response = await request(app)
          .post('/videos')
          .type('form')
          .send(invalidVideoToCreate);
          const dbDocuments = await Video.find()
          assert.equal(dbDocuments.length, 0, 'Invalid document is saved, DB contains an entry')
        });

        it('response is 400 when invalid item is submitted', async() => {
          const invalidVideoToCreate = {description: 'Without Title'};
          const response = await request(app)
          .post('/videos')
          .type('form')
          .send(invalidVideoToCreate);
          assert.equal(response.status, 400)
        });

        it('redirects to /create page when is title is empty', async() => {
          const invalidVideoToCreate = {description: 'Without Title'};
          const response = await request(app)
          .post('/videos')
          .type('form')
          .send(invalidVideoToCreate);
          assert.include(parseTextFromHTML(response.text, '#title-input'), '');
          assert.include(parseTextFromHTML(response.text, '#description-input'), '');
        });

        it('error message is displayed when Title is empty', async() => {
          const invalidVideoToCreate = {
            description: 'testDescription',
            url: 'https://www.youtube.com/embed/YbJOTdZBX1g',
          };        
          const response = await request(app)
          .post('/videos')
          .type('form')
          .send(invalidVideoToCreate);
          assert.include(parseTextFromHTML(response.text, '.error'), 'a Title is required');
        });

        it('error message is displayed when URL is empty', async() => {
          const invalidVideoToCreate = {
            title: 'test',
            description: 'testDescription'
          };        
          const response = await request(app)
          .post('/videos')
          .type('form')
          .send(invalidVideoToCreate);
          assert.include(parseTextFromHTML(response.text, '.error'), 'a URL is required');
        });

        it('preserves other information when title is empty', async() =>{
          const invalidVideoToCreate = {
            description: 'Without Title',
            url: 'https://www.youtube.com/embed/YbJOTdZBX1g'
          };
          const response = await request(app)
          .post('/videos')
          .type('form')
          .send(invalidVideoToCreate);
          assert.equal(parseInputFieldValuesFromHTML(response.text, 'textarea#description-input'), invalidVideoToCreate.description)
          assert.equal(parseInputFieldValuesFromHTML(response.text, 'input#url-input'), invalidVideoToCreate.url)
        });

        it('preserves other information when title is empty', async() =>{
          const invalidVideoToCreate = {
            title: 'Title without URL',
            description: 'Description Without URL'
          };
          const response = await request(app)
          .post('/videos')
          .type('form')
          .send(invalidVideoToCreate);
          assert.equal(parseInputFieldValuesFromHTML(response.text, 'input#title-input'), invalidVideoToCreate.title)
          assert.equal(parseInputFieldValuesFromHTML(response.text, 'textarea#description-input'), invalidVideoToCreate.description)
        });
      }); 
    });      
})


describe('Server path: /', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(disconnectDatabase);

  describe('GET', async () => {
    describe('item is in database', () => {
      it('renders an item with a title and a video url', async () => {
        const video = await seedItemToDatabase();

        const response = await request(app)
        .get(`/`);

        assert.include(parseTextFromHTML(response.text, '.video-title'), video.title);
        assert.strictEqual(parseAttributeValuesFromHTML(response.text, 'iframe', 'src'), video.url);
      }); 
    });
  });
});


describe('Server path: /videos/:videoId', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(disconnectDatabase);

  describe('GET', async () => {
    describe('item is in database', () => {
      it('renders a video', async () => {
        const video = await seedItemToDatabase();

        const response = await request(app)
        .get(`/videos/${video._id}`);

        assert.include(parseTextFromHTML(response.text, 'body'), video.title);
        assert.include(parseTextFromHTML(response.text, 'body'), video.description);
        assert.include(parseAttributeValuesFromHTML(response.text, 'iframe', 'src'), video.url);
      }); 
    });
  });
});

describe('Server path: /videos/:videoId/edit', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(disconnectDatabase);

  describe('GET', async () => {
    it('renders a form', async () => {
      const video = await seedItemToDatabase();

      const response = await request(app)
      .get(`/videos/${video._id}/edit`)
      .redirects(1);
      assert.include(parseTextFromHTML(response.text, 'form'), '');
    }); 
  });
});

describe('Server path: /videos/:videoId/updates', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(disconnectDatabase);

  describe('POST', async () => {
    it('updates a document', async () => {
      const video = await seedItemToDatabase();
      const expectedVideo = buildVideoObject({
        title: 'updatedTitle',
        description: 'updatedDescription',
        url: 'https://www.youtube.com/embed/Yxx9I8V4fjA'
      }) 

      const response = await request(app)
      .post(`/videos/${video._id}/updates`)
      .type('form')
      .send(expectedVideo);
      
      const actualVideo = await Video.findById(video._id);

      assert.equal(actualVideo.title, expectedVideo.title);
      assert.equal(actualVideo.description, expectedVideo.description);
      assert.equal(actualVideo.url, expectedVideo.url);      
    }); 
    it('redirects to the correct page', async () => {
      const video = await seedItemToDatabase();
      const expectedVideo = buildVideoObject({
        title: 'updatedTitle',
        description: 'updatedDescription',
        url: 'https://www.youtube.com/embed/Yxx9I8V4fjA'
      }) 

      const response = await request(app)
      .post(`/videos/${video._id}/updates`)
      .type('form')
      .send(expectedVideo);
      
      assert.strictEqual(response.status, 302);
      assert.equal(response.headers.location, `/videos/${video._id}`); 
    }); 
    describe('when Title not submitted', async () => {

      it('video is not saved', async () => {
        const video = await seedItemToDatabase();
        const invalidVideo = {
          title: '',
          description: 'updatedDescription1234',
          url: 'https://www.youtube.com/embed/Yxx9I8V4fjA'
        };
        const response = await request(app)
        .post(`/videos/${video._id}/updates`)
        .type('form')
        .send(invalidVideo)
        
        const actualVideo = await Video.findById(video._id);

        assert.isNotTrue(actualVideo.title.empty)
        assert.notEqual(actualVideo.description, invalidVideo.description);
        assert.notEqual(actualVideo.url, invalidVideo.url);  
      });

      it('responds with 400 status', async () => {
        const video = await seedItemToDatabase();
        const invalidVideo = {
          title: '',
          description: 'updatedDescription1234',
          url: 'https://www.youtube.com/embed/Yxx9I8V4fjA'
        };
        const response = await request(app)
        .post(`/videos/${video._id}/updates`)
        .type('form')
        .send(invalidVideo)
        
        assert.strictEqual(response.status, 400);
      });
      it('renders /edit page', async () => {
        const video = await seedItemToDatabase();
        const invalidVideo = {
          title: '',
          description: 'updatedDescription1234',
          url: 'https://www.youtube.com/embed/Yxx9I8V4fjA'
        };
        const response = await request(app)
        .post(`/videos/${video._id}/updates`)
        .type('form')
        .send(invalidVideo)

        assert.exists(parseTextFromHTML(response.text, '#title-input'));
        assert.exists(parseTextFromHTML(response.text, '#description-input'));
        assert.exists(parseTextFromHTML(response.text, '#url-input'));
      });
    });    
  });

  describe('when URL not submitted', async () => {

    it('video is not saved', async () => {
      const video = await seedItemToDatabase();
      const invalidVideo = {
        title: 'updateTitle',
        description: 'updatedDescription1234',
        url: ''
      };
      const response = await request(app)
      .post(`/videos/${video._id}/updates`)
      .type('form')
      .send(invalidVideo)
      
      const actualVideo = await Video.findById(video._id);

      assert.notEqual(actualVideo.title, invalidVideo.title);
      assert.notEqual(actualVideo.description, invalidVideo.description);
      assert.isNotTrue(actualVideo.url.empty);
    });

    it('responds with 400 status', async () => {
      const video = await seedItemToDatabase();
      const invalidVideo = {
        title: '',
        description: 'updatedDescription1234',
        url: 'https://www.youtube.com/embed/Yxx9I8V4fjA'
      };
      const response = await request(app)
      .post(`/videos/${video._id}/updates`)
      .type('form')
      .send(invalidVideo)
      
      assert.strictEqual(response.status, 400);
    });
    it('renders /edit page', async () => {
      const video = await seedItemToDatabase();
      const invalidVideo = {
        title: '',
        description: 'updatedDescription1234',
        url: 'https://www.youtube.com/embed/Yxx9I8V4fjA'
      };
      const response = await request(app)
      .post(`/videos/${video._id}/updates`)
      .type('form')
      .send(invalidVideo)

      assert.exists(parseTextFromHTML(response.text, '#title-input'));
      assert.exists(parseTextFromHTML(response.text, '#description-input'));
      assert.exists(parseTextFromHTML(response.text, '#url-input'));
    });
  });    
});
describe('Server path: /videos/:videoId/deletions', () => {
  beforeEach(connectDatabaseAndDropData);

  afterEach(disconnectDatabase);

  describe('POST', async () => {
    it('item is deleted', async () => {
      const videoToDelete = await seedItemToDatabase();

      const response = await request(app)
      .post(`/videos/${videoToDelete._id}/deletes`)
      .type('form')
      .send();
      const entries = await Video.find();

      assert.equal(entries.length, 0, 'Entries were not deleted')
    });

    it('is redirected to landing page', async () => {
      const videoToDelete = await seedItemToDatabase();

      const response = await request(app)
      .post(`/videos/${videoToDelete._id}/deletes`)
      .type('form')
      .send();
      assert.equal(response.headers.location, '/'); 
    });
  })
})