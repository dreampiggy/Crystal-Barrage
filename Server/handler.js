var connection = require('./config');
var request = require('superagent');
var events = require("events");
var WebSocket = require('ws');
var WebSocketServer = WebSocket.Server
var wss = new WebSocketServer({ port: 3000 });
var Wechat = require('nodejs-wechat');
var emitter = new events.EventEmitter();

var opt = {
  token: 'uniquehackday',
  url: '/weixin'
};
var wechat = new Wechat(opt);
var uuid = '1';//uuid 客户端提供
var appid = 'wx2fef235fd2d7732f';//微信appid
var appsecret = '8dd09f7bc0751eee5246a5afada99c98';//微信appsecret

var appToken = null;

function refreshToken(){
	if (appToken == null){
		request
		.get('https://api.weixin.qq.com/cgi-bin/token')
		.query({
			grant_type: 'client_credential',
			appid: appid,
			secret: appsecret
		})
		.end(function(err, res){
			if (err){
				console.log('token error');
				return;
			}
			appToken = res.body['access_token'];
			console.log('Token:' + appToken);
		});
	}
}

// refreshToken();
// setInterval(refreshToken,1000*60*60*2);


function getWeixin(req,res){
	var bindFunc = wechat.verifyRequest.bind(wechat);
	bindFunc(req,res);
}

function postWeixin(req,res){
	var bindFunc = wechat.handleRequest.bind(wechat);
	bindFunc(req,res);
}


wechat.on('text', function(session) {
	var json = session.incomingMessage;
	var openid = json.FromUserName;

	// request
	// .get('https://api.weixin.qq.com/cgi-bin/user/info')
	// .query({
	// 	access_token: appToken,
	// 	openid: openid,
	// 	lang: 'zh_CN'
	// })
	// .end(function(err,res) {
	// 	if (err){
	// 		//没申请微信认证
	// 	}
	// })

	var nickname = '微信用户:' + openid;
	var content = json.Content;

	var result = {
		nickname: nickname,
		content: content
	}
	var bullet = checkBullet(result);

	emitter.emit('bullet come',bullet);
	session.replyTextMessage('文字弹幕已上膛发射！');
});

wechat.on('image', function(session) {
	var picurl = session.incomingMessage.PicUrl;
	var nickname = session.incomingMessage.FromUserName;

	var preBullet = {
		nickname: nickname,
		type: 'image',
		url: picurl
	};

	var bullet = checkBullet(preBullet);

	emitter.emit('bullet come',bullet);
	session.replyTextMessage('图片炮弹正装膛点燃！');
});

wechat.on('voice', function(session) {
  session.replyTextMessage('语音炸弹将高空落下！');
});


(function websocket(){
	wss.on('connection', function connection(ws) {
		console.log('WebSocket start!');
		var sendBullet = function(bullet){
			console.log(bullet);
			ws.send(JSON.stringify(bullet));
		};

		var heartTimer = setInterval(function(){
			var empty = {
			  type: "text",
			  color : "",
			  fontsize : "",
			  content : "",
			  duration : "",
			  nickname : ""
			};
			ws.send(JSON.stringify(empty));//发送心跳包防止WebSocket断开
		},1000*60*5);

		emitter.addListener('bullet come',sendBullet);//加入对字幕请求的监听器

		getTime(uuid,function(time){
			getBullet(time,function(results){
				if (results){
					for (var i = 0; i < results.length; i++) {
						var bullet = checkBullet(results[i]);
						ws.send(JSON.stringify(bullet));
					};
				}
			});
		});

		ws.on('message', function incoming(message) {
			try{
				message = JSON.parse(message);
				var result = checkBullet(message);
				if (result){
					emitter.emit('bullet come',result);
					saveBullet(result);
				}
			}
			catch (e){
				console.log('Not legal bullet');
			}
		});

		ws.on('close', function close(){
			emitter.removeListener('bullet come',sendBullet);//取消监听器
			clearInterval(heartTimer);//取消心跳包
			saveTime(uuid);
		});
	});
})();


function getLuck (req,res) {
	getRandomID(function(result){
		res.end(result);//发送抽奖结果
	})
}


function getRandomID(callback){
	connection.query('SELECT * FROM user ORDER BY RAND() LIMIT 1',//参与人数不超过全校人数，性能足够
		function(err, results) {
		if (err){
			console.log(err);
			callback('null');//没人中奖
		}
		else if (!results || results.length == 0){
			console.log('fuck');
			callback('null');//没人中奖
		}
		else{
			callback(results[0]['nickname']);
		}
	});
}


var getRandomColor = function() {
	var colors = ['#FFE300','#FFFFFF','#48FFD1','red','#FF530D'];
	var randomNum = random(0,4);
	return colors[randomNum];
}


function checkBullet (results){
	if (!results){
		return null;
	}

	var bullet = {
	  type: "linear",
	  color : "#ffffff",
	  fontsize : "1",
	  content : "foo",
	  duration : "1000",
	  nickname : "foo"
	};

	if (results['type'] == 'image'){
		bullet.nickname = results['nickname'];
		bullet.type = 'linear';
		bullet.content = '[图片]';
		bullet.nickname = results['url'];
		return bullet;
	}

	console.log(results['content']);

	var type = (function(){
		if (Math.random() < 0.75){
			return 'linear';
		}
		else{
			return 'bomb';
		}
	})();
	var content = results['content'];
	var nickname = results['nickname'];//保留
	var color = '';
	if (!judgeEmoji(content)){
		color = getRandomColor();//not emoji
	}

	var duration = (function(){
		var size = content.length;
		if (size > 20){
			return random(5000,6000);
		}
		else if(size > 10){
			return random(4000,5000);
		}
		else{
			return random(3000,4000);
		}
	})();
	var fontsize = random(15,25) / 10.0;

	bullet.type = type;
	bullet.color = color;
	bullet.fontsize = fontsize;
	bullet.content = content;
	bullet.duration = duration;
	bullet.nickname = nickname

	return bullet;
}

function saveBullet (bullet) {
	if (!bullet){
		return;
	}
	var time = Math.round(new Date().getTime()/1000);
	var nickname = bullet.nickname;
	var content = bullet.content;

	connection.query('INSERT INTO bullet SET time = ?,nickname = ?,content = ?',
		[time,nickname,content],
		function(err, results) {
		if (err){
			console.log('error at saveBullet')
			console.log(err);
		}
		else{
			//ok
		}
	});

	connection.query('INSERT INTO user SET nickname = ?,count = 0 ON DUPLICATE KEY UPDATE count = count+1',
		[nickname],
		function(err,results){
		if(err){
			console.log('err at insert user');
			console.log(err);
		}
		else{
			//ok
		}
	});
}

function getBullet (time,callback){
	connection.query('SELECT time,nickname,content FROM bullet WHERE time > ? ORDER BY id DESC LIMIT 5',
		[time],//最多会取最近的5条
		function(err,results){
		if (err){
			console.log('error at getBullet');
			console.log(err);
			callback(null);
		}
		else if (!results || results.length == 0){
			callback(null);
		}
		else{
			console.log(results);
			callback(results);
		}
	});
}

function saveTime (clientID){
	var time = Math.round(new Date().getTime()/1000);
	connection.query('INSERT INTO client SET id = ?,time = ? ON DUPLICATE KEY UPDATE time = ?',
		[clientID,time,time],
		function(err,results){
		if (err){
			console.log('error at saveTime');
			console.log(err);
		}
		else{
			return true;//ok
		}
	});
}

function getTime (clientID,callback){
	var time = Math.round(new Date().getTime()/1000);
	connection.query('SELECT time FROM client WHERE id = ?',
		[clientID],
		function(err,results){
		if (err){
			console.log('error at getTime');
			callback(time);
		}
		else if (!results || results.length == 0){
			callback(time);
		}
		else{
			callback(results[0]['time']);
		}
	});
}


function random (min,max) {
	return min + Math.floor(Math.random() * ((max-min) + 1));
}


function judgeEmoji(string){
	if (string.length > 0){
		var a = fixedCharCodeAt(string);
		console.log(a);
		if (0x1F601<=a && a<=0x1F64F){//emoji
			return true;
		}
	}
	return false;
}


function fixedCharCodeAt(str, idx) {
  // ex. fixedCharCodeAt('\uD800\uDC00', 0); // 65536
  // ex. fixedCharCodeAt('\uD800\uDC00', 1); // false
  idx = idx || 0;
  var code = str.charCodeAt(idx);
  var hi, low;
  
  // High surrogate (could change last hex to 0xDB7F to treat high
  // private surrogates as single characters)
  if (0xD800 <= code && code <= 0xDBFF) {
    hi = code;
    low = str.charCodeAt(idx + 1);
    if (isNaN(low)) {
      throw 'High surrogate not followed by low surrogate in fixedCharCodeAt()';
    }
    return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
  }
  if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
    // We return false to allow loops to skip this iteration since should have
    // already handled high surrogate above in the previous iteration
    return false;
    /*hi = str.charCodeAt(idx - 1);
    low = code;
    return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;*/
  }
  return code;
}

exports.getLuck = getLuck;
exports.getWeixin = getWeixin;
exports.postWeixin = postWeixin;