
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;
//var ArticleProvider = require('./articleprovider-memory').ArticleProvider;

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// app.get('/', routes.index);

 var articleProvider = new ArticleProvider('192.168.0.87', 27017);
// var articleProvider = new ArticleProvider();

app.get('/', function(req,res) {
	    articleProvider.findAll(function(error, docs) {
		res.render('index.jade', {
		    title: 'Blog',
		    articles: docs
		});
	    });
	});

app.get('/blog/new', function (req, res){
    res.render('blog_new.jade', {title: 'Neo Post'});
});

app.post ('/blog/new', function(req, res){
	      articleProvider.save({
				       title: req.param('title'),
				       body: req.param('body') 
				   }, function (error, docs){
				       res.redirect('/');
				   });
	  });

app.get('/blog/:id', function(req, res) {
	  
    console.log("req.params.id is " + req.params.id);
    articleProvider.findById(req.params.id, function(error, article){
			       
      console.log("request is complete " +  article.title);
      // res.send(article);
      res.render('blog_show.jade',{
      		 title: article.title,
      		 article:article});
    });
});


app.post('/blog/addComment', function (req, res) {
    articleProvider.addCommentToArticle(req.param('_id'), {
      person: req.param('person'),
      comment: req.param('comment'),
      created_at: new Date()
    }, function (error, docs) {
      res.redirect('/blog/' + req.param('_id'));
    });
});

app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
