
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , blog = require('./routes/blog')
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

app.get ('/', blog.index);
app.get ('/blog/new', blog.new);
app.get('/blog/:id', blog.show);
app.post('/blog/addComment', blog.addComment);
app.post ('/upload', blog.post_upload);

// test code 
app.get('/users', user.list);
var socket_name = __dirname + "/comjuck.sock" ; // 만약 login 이 되기 시작하면 crazia 대신 개인의 ID 로 처리할 수도 있다. 	 

// http.createServer(app).listen(socket_name, function(){
//   console.log("Express server listening on port " + app.get('port'));
// });

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
