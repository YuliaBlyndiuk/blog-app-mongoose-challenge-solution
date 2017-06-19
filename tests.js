const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const should = chai.should();

const {BlogPost} = require('../models');
const {app, runServer, closeServer}  = require('../server');
const {TEST_DATABASE_URL} = require('../config');

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
	author: faker.author.authorName(),
    content: generateContent(),
    title: generateTitle(),
	}
}

console.log(seedBlogPostData);