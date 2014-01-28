var ArticleProvider = require('../articleprovider-mongodb').ArticleProvider;

var articleProvider = new ArticleProvider('localhost', 27017);


exports.index = function(req, res){
	articleProvider.findAll(function(error, docs) {
		res.render('index.jade', {
		    title: 'Men\'s Nest',
		    articles: docs
		});
	});	// end of findAll
};

exports.new = function(req, res){
	res.render('blog_new.jade', {title: 'Neo Post'});
};

exports.save = function(req, res) {
    articleProvider.save({
        title: req.param('title'),
        body: req.param('body')
    }, function( error, docs) {
      res.redirect('/');
    });
};


exports.show = function(req, res){
	console.log("req.params.id is " + req.params.id);
	articleProvider.findById(req.params.id, function(error, article){

	console.log("request is complete " +  article.title);
      // res.send(article);
	res.render('blog_show.jade',{
			title: article.title,
			article:article});
	});
};



exports.addComment = function(req, res){
	articleProvider.addCommentToArticle(req.param('_id'), {
      person: req.param('person'),
      comment: req.param('comment'),
      created_at: new Date()
    }, function (error, docs) {
      res.redirect('/blog/' + req.param('_id'));
  });
};



exports.post_upload = function(req, res){
	//console.log(req);
	console.log ('CKEditor:' + req.param('CKEditor'));
	console.log ('CKEditorFuncNum:' + req.param('CKEditorFuncNum'));
	console.log ('langCode:' + req.param('langCode'));

	console.log (req.files.upload.path);
	console.log (req.files.upload.name);

	var save_url ;

	var newPath = __dirname + "/public/images/crazia" ; // 만약 login 이 되기 시작하면 crazia 대신 개인의 ID 로 처리할 수도 있다.

	fs.stat (newPath , function (err, stats) {
		if (err) {

			fs.mkdirSync (__dirname + "/public/images");
			fs.mkdirSync(newPath); // 지금은 여기에 임시로 만들어 두지만 나중에 회원 가입 하면 이미지 저장하는 디렉토리를 따로 만들어야 할 듯

		}

		save_url = "/images/crazia/" + req.files.upload.name ;

		// 이미 존재하는지 검사 하는 루틴

		fs.stat (newPath + "/" + req.files.upload.name , function (err , stats){
			if (err) {
				// 없다면 없으니 맘 편하게 쓰기
			  fs.readFile(req.files.upload.path , function (err, data) {
				  fs.writeFile(newPath + "/" + req.files.upload.name , data , function (err) {

					  res.send("<script>window.parent.CKEDITOR.tools.callFunction(" +
		         req.param('CKEditorFuncNum') + ", \"" + save_url + "\");</script>");

				  });// end of fs.writeFile
			  }); // end of readFile


			} else {
				// 만약 존재한다면 쓸 파일 이름 변경 시켜야 함
				var regex = /(\w+).(\w+)/;
				var match = regex.exec(req.files.upload.name);
				save_url = "/images/crazia/" + match[1] + '_1.' + match[2] ;


			  fs.readFile(req.files.upload.path , function (err, data) {
				  fs.writeFile(newPath + "/" + match[1] + '_1.' + match[2] , data , function (err) {

					  res.send("<script>window.parent.CKEDITOR.tools.callFunction(" +
		         req.param('CKEditorFuncNum') + ", \"" + save_url + "\");</script>");

				  });// end of fs.writeFile
			  }); // end of readFile

			}// end of else
		}); // end of fs.stat

	});

	// 이 부분은 나중에 따로 빼야 한다. Sync 방식을 썼기 때문에 한시적으로 여기에 둔 것임
	// 굳이 여기에 둔 이유는 images 디렉토리를 안 만들어 주고 이 소스를 사용할 시에 예상 되는 에러를 피하기 위해서임
	// fs.mkdirSync (__dirname + "/public/images");
	// fs.mkdirSync(newPath); // 지금은 여기에 임시로 만들어 두지만 나중에 회원 가입 하면 이미지 저장하는 디렉토리를 따로 만들어야 할 듯

	// save_url = newPath + '/' + req.files.upload.name ;

};
