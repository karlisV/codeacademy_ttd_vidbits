const router = require('express').Router();
const Video = require('../models/video');

router.get('/', async (req, res) => {
	const videos = await Video.find({});

	res.render('videos/index', {videos});
})

router.get('/videos/create', async (req, res) => {
	res.render('videos/create');
})

router.post('/videos', async function (req, res) {
	const {title, description, url} = req.body;
	const video = await new Video({title, description, url});
	video.validateSync();
	if (video.errors) {
		res.status(400).render('videos/create', {video: video});
	} else {
		await video.save();
		res.redirect(`/videos/${video._id}`)
	}	
});

router.get('/videos/:videoId', async (req, res) => {
	const video = await Video.findById(req.params.videoId);
	res.render('videos/show', {video});
})

router.get('/videos/:videoId/edit', async (req, res) => {
	const video = await Video.findById(req.params.videoId);
	res.render('videos/edit', {video});
})

router.post('/videos/:videoId/updates', async(req, res) => {
	const videoId = req.params.videoId;
	const {title, description, url} = req.body;
	const video = await new Video({title, description, url});
	video.validateSync();
	if (video.errors) {
		res.status(400).render('videos/edit', {video})
	} else {
		await Video.updateOne(
			{ '_id' : videoId },
			{ "title": title,
			"description": description,
			"url": url 
		});
		res.redirect(`/videos/${videoId}`)
	}
});

router.post('/videos/:videoId/deletes', async (req, res) => {
	await Video.deleteOne( { "_id" : req.params.videoId } )
	res.redirect('/');
});

module.exports = router;