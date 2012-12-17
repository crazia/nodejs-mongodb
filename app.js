
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var fs = require ('fs');

// redis 설정해 주는 부분 
var RedisStore = require ('connect-redis')(express);
var redis = require('redis');

var ArticleProvider = require('./articleprovider-mongodb').ArticleProvider;
//var ArticleProvider = require('./articleprovider-memory').ArticleProvider;
// redis 클라이언트 실제로 세팅해주는 부분 

// var redisClient = redis.createClient( 6379 , 'grr');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
	              
  /// session 설정시 필요한 것들 
//  app.use(express.cookieParser());	              
  app.use(express.bodyParser());
	              
  // session 을 redis 를 이용해서 저장한다고 설정 하는 부분
  // app.use(express.session({
	//   secret: 'session fo mongo',
	//   store: new RedisStore({ 
	// 		  client: redisClient
	// 		  })
	//   }));
	              
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
	              
  // source 가 예쁘게 출력되게 할려는 옵션 
  app.locals.pretty = true;
});

// app.get('/', routes.index);


// mongodb 주소가 필요합니다. 
// 보통은 localhost 인데 제 경우는 osx 에 SSD 를 사용하고 있는 중이라 
// 몽고디비를 도저히 제꺼에 설치할 수가 없더군요. 
// grr 는 버추얼 머신에 띄워놓은 우분투 서버 입니다. 

 var articleProvider = new ArticleProvider('grr', 27017);
// var articleProvider = new ArticleProvider();

app.get('/', function(req,res) {
	    articleProvider.findAll(function(error, docs) {
		res.render('index.jade', {
		    title: 'Men\'s Nest',
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


app.post ('/upload', function (req, res){
	//console.log(req);
	console.log ('CKEditor:' + req.param('CKEditor'));
	console.log ('CKEditorFuncNum:' + req.param('CKEditorFuncNum'));
	console.log ('langCode:' + req.param('langCode'));
	          
	console.log (req.files.upload.path);
	console.log (req.files.upload.name);
	          
	var save_url ;

	var newPath = __dirname + "/public/images/crazia" ; // 만약 login 이 되기 시작하면 crazia 대신 개인의 ID 로 처리할 수도 있다. 	 

	// 이 부분은 나중에 따로 빼야 한다. Sync 방식을 썼기 때문에 한시적으로 여기에 둔 것임 
	// 굳이 여기에 둔 이유는 images 디렉토리를 안 만들어 주고 이 소스를 사용할 시에 예상 되는 에러를 피하기 위해서임 
	fs.mkdirSync (__dirname + "/public/images");
	fs.mkdirSync(newPath); // 지금은 여기에 임시로 만들어 두지만 나중에 회원 가입 하면 이미지 저장하는 디렉토리를 따로 만들어야 할 듯 		          	          

	// save_url = newPath + '/' + req.files.upload.name ;
	save_url = "/images/crazia/" + req.files.upload.name ;
	          
	          
 	fs.readFile(req.files.upload.path, function (err, data) {
    fs.writeFile(newPath + "/" + req.files.upload.name , data, function (err) {
	    if (err) {
		    // fs.writeFile 형식을 쓰면 거의 에러가 발생하지 않는다. 따라서 파일을 저장하기 전에 저장되는 위치에 같은 
		    // 이름의 파일이 있는지 조사해야 한다. 
		    console.log (err);
		    var regex = /(\w+).(\w+)/;
		    var match = regex.exec(req.files.upload.name);
		    save_url = "/images/crazia/" + + match[1] + '_1.' + match[2] ; 

		    fs.writeFile (save_url , data , function (err){
			    res.send("<script>window.parent.CKEDITOR.tools.callFunction(" +
		         req.param('CKEditorFuncNum') + ", \"" + save_url + "\");</script>");

		    });
		    
		    
	    } else {
		    
			    console.log (save_url);
			    res.send("<script>window.parent.CKEDITOR.tools.callFunction(" +
		         req.param('CKEditorFuncNum') + ", \"" + save_url + "\");</script>");
		    
	    }
	               
	               
    });
  });
	          
});




app.get('/users', user.list);

var socket_name = __dirname + "/comjuck.sock" ; // 만약 login 이 되기 시작하면 crazia 대신 개인의 ID 로 처리할 수도 있다. 	 

http.createServer(app).listen(socket_name, function(){
  console.log("Express server listening on port " + app.get('port'));
});
