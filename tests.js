const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const should = chai.should();

const {BlogPost} = require('./models');
const {app, runServer, closeServer}  = require('./server');
const {TEST_DATABASE_URL} = require('./config');

chai.use(chaiHttp);

function seedBlogPostData() {
	console.log('seeding restaurant data');
	const seedData = [];

	for (let i = 1; i <=10; i++) {
		seedData.push(generateBlogPostData());
	}
	return BlogPost.insertMany(seedData);
}

function generateContent() {
	const contents = ['this is randon blogpost content', 'this is another random blog post content',
	'here goes one more random content'];
	return contents[Math.floor(Math.random() * contents.length)];
}

function generateTitle() {
	const titles = ['title1', 'title2', 'title3', 'title4'];
	return titles[Math.floor(Math.random() * titles.length)];
}

function generateBlogPostData() {
	return {
	author: faker.name.firstName(),
    content: generateContent(),
    title: generateTitle(),
	}
}

function tearDownDb() {
	console.warn('Deleting test db');
	return mongoose.connection.dropDatabase();
}

describe('blog API resource', function() {

	before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function() {
		return seedBlogPostData();
	});

	afterEach(function() {
		return tearDownDb();
	});

	after(function() {
		return closeServer();
	})

	describe('GET endpoint', function() {
		it('should return all existing blogposts', function() {
			let res;
			return chai.request(app)
			.get('/posts')
			.then(function(_res) {
				res = _res;
				res.should.have.status(200);
				res.body.should.have.length.of.at.least(1);
				return BlogPost.count();
			})
			.then(function(count) {
				res.body.should.have.lengthOf(count);
			});
		});

		it('should return blogposts with right fields', function() {
			let resBlogPost;
			return chai.request(app)
			.get('/posts')
			.then(function(res) {
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.an('array');
				res.body.should.have.length.of.at.least(1);

				res.body.forEach(function(blogpost) {
					blogpost.should.be.an('object');
					blogpost.should.include.keys(
						'id', 'author', 'title', 'content');
				});
				resBlogPost = res.body[0];
				return BlogPost.findById(resBlogPost.id);
			})
			.then(function(blogpost) {
				resBlogPost.id.should.equal(blogpost.id);
				resBlogPost.author.should.equal(blogpost.authorName);
				resBlogPost.title.should.equal(blogpost.title);
				resBlogPost.content.should.equal(blogpost.content);
			});
		});
	});

	describe('POST endpoint', function() {
		it('should add a new blogpost', function() {
			const newBlogPost = generateBlogPostData();

			return chai.request(app)
			.post('/posts')
			.send(newBlogPost)
			.then(function(res) {
				res.should.have.status(201);
				res.should.be.json;
				res.body.should.be.an('object');
				res.body.should.include.keys(
					'id', 'author', 'title', 'content');
				// console.log(res.body.author);
				// res.body.author.should.equal(newBlogPost.author);
				res.body.content.should.equal(newBlogPost.content);
				res.body.title.should.equal(newBlogPost.title);
			});
		});
	});
	// describe('PUT endpoint', function() {
	// 	it('should update fields one sends over', function() {
	// 		const updData = {
	// 			title: 'testTitle',
	// 			content: 'testContent'
	// 		};

	// 		return BlogPost
	// 		.findOne()
	// 		.exec()
	// 		.then(function(post) {
	// 			updData.id = post.id;
	// 			return chai.request(app)
	// 			.put('/posts/${post.id}')
	// 			.send(updData);
	// 		})

	// 		.then(function(res) {
	// 			res.should.have.status(204);
	// 			return BlogPost.findById(updData.id).exec();
	// 		})
	// 		.then(function(post) {
	// 			post.title.should.equal(updData.title);
	// 			post.content.should.equal(updData.content);
	// 		});
	// 	});
	// });

	describe('DELETE endpoint', function() {
		it('Delete a blogpost by id', function() {
			let post;

			return BlogPost
			.findOne()
			.exec()
			.then(function(_post) {
				post = _post;
				return chai.request(app).delete(`/posts/${post.id}`);
			})
			.then(function(res) {
				res.should.have.status(204);
				return BlogPost.findById(post.id).exec();
			})
			.then(function(_post) {
				should.not.exist(_post);
			});
		});
	});
});