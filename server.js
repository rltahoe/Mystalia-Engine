var sys = require('sys')
var exec = require('child_process').exec;
require('joose'); require('joosex-namespace-depended'); require('hash');

var http = require('http'), io = require('socket.io');

var Mysql = require('mysql').Client,
mysql = new Mysql();

mysql.user = 'mystalia';
mysql.password = 'mystalia777';
mysql.connect();
mysql.query('USE mmorpg');

// Set the server vars below.
var gamename = "Mystalia Online";
var startmap = 1;
var startpos = '10x6';
var workingmsg = "" // "The server will be down for maintenance and integration of Artificial Intelligence!!! (17/02/2011)";
var serverloc = "/var/www/";

var socketOptions = { 
  transportOptions: { 
    'flashsocket': { 
      closeTimeout: 10000, 
      timeout: 10000 
    }, 'websocket': { 
      closeTimeout: 10000, 
      timeout: 10000 
    }, 'htmlfile': { 
      closeTimeout: 10000, 
      timeout: 10000
    }, 'xhr-multipart': { 
      closeTimeout: 10000, 
      timeout: 10000 
    }, 'xhr-polling': { 
      closeTimeout: 10000, 
      timeout: 10000 
    }, 'jsonp-polling': { 
      closeTimeout: 10000, 
      timeout: 10000
    } 
  } 
}; 

function puts(error, stdout, stderr) { sys.puts(stdout) }

// Start the server at port 8080
var server = http.createServer(function(req, res){ 
  res.writeHead(200,{ 'Content-Type': 'text/html' }); 
  res.end('<h1>Hello Socket Lover!</h1>');
});
server.listen(8080);

var PlayerUpdater = Array();
var PlayerChangingMap = Array();

var ClientIds = Array();
var PlayerLoggedIn = Array();
var PlayerId = Array();
var PlayerName = Array();
var PlayerItems = Array();
var PlayerXp = Array();
var PlayerSprite = Array();
var PlayerMap = Array();
var PlayerPosition = Array();
var PlayerAccess = Array();
var PlayerHealth = Array();

var NPCsTotal = 300;
var NPCData = Array();
var NPCIds = Array();
var NPCUpdater = Array();
var NPCMap = Array();
var NPCName = Array();
var NPCSprite = Array();
var NPCPosition = Array();
var NPCHealth = Array();
var NPCItem = Array();
var NPCRange = Array();
var NPCXp = Array();
var NPCSkill = Array();
var NPCDropRate = Array();
var NPCRespawnTime = Array();
var NPCMoveFunctions = Array();

var MapItems = Array();
var MapAttributes = Array();
var MapData = Array();

var PlayersOnMap  = Array();

function Initialise(){
	mysql.query('select * from npcs', function(err, results, fields){
		for(var i = 0; i < results.length; i++){
			var x = results[i];
			x = x['id'];
			NPCData[x] = results[i];
		}
		console.log('NPCs loaded.');
	});
	
	setInterval(function(){ CalculatePlayersOnMaps(); },10000);
}

Initialise();
// Create a Socket.IO instance, passing it our server
var socket = io.listen(server,socketOptions);

// Add a connect listener
socket.on('connection', function(client){ 
	var clientid = client.sessionId;
  console.log('Connection from '+clientid);
  PlayerUpdater[clientid] = false;
  
  var player = 0;
  client.on('message',function(data){ 
	if(workingmsg == ""){ HandleClientData(data,clientid); }else{ SendData(clientid,'working:'+workingmsg); }
	
	if(PlayerUpdater[clientid] == true){
		console.log('Map '+PlayerMap[clientid]+' loaded by '+PlayerName[clientid]+' ('+clientid+')');
		PlayerUpdater[clientid] = false;
	}
  });
  client.on('disconnect',function(){
  console.log(clientid);
	SavePlayerData(clientid,true);
  });  
});

function HandleClientData(data,clientid){
	tempdata = data;
	data = data.split('=');
	tempdata = tempdata.substring(data[0].length+1);
	data = Array(data[0],tempdata);
	var output = "";
	switch(data[0]){
		case "login": DoLogin(data[1],clientid); break;
		case "online": SetPlayerOnline(data[1],clientid); break;
		case "playersonmap": GetPlayersOnMap(data[1],clientid); break;
		case "loadmap": LoadMap(data[1],clientid); break;
		case "maplist": GetMapList(clientid); break;
		case "setloc": SetLoc(data[1],clientid); break;
		case "changemap": PlayerChangeMap(data[1],clientid); break;
		case "register": RegisterAccount(data[1],clientid); break;
		case "maploaded": PlayerChangingMap[clientid] = false; break;
		case "warp": WarpPlayer(clientid); break;
		case "getclasses": GetClasses(clientid); break;
		case "createchar": CreateChar(data[1],clientid); break;
		
		// Chat Commands
		case "localchat": SendLocalChat(clientid,data[1]); break;
		case "globalchat": SendGlobalChat(clientid,data[1]); break;
		case "adminchat": SendAdminChat(clientid,data[1]); break;
		
		// Admin commands.
		case "save": SaveMap(clientid,data[1]); break;
		case "setaccess": break;
		case "setsprite": break;
		case "addnpc": break;
	}
	return output;
}

function SendData(client,data){
	try{ socket.clients[client].send(data); }catch(err){ }
}

/* PLAYER AND ACCOUNT FUNCTIONS */

// Check login and get player characters.
function DoLogin(logindata,clientid){
	var data = logindata.split(':');
	username = data[0];
	password = data[1];
	password = Hash.sha1(password);
	mysql.query('select * from accounts where username="'+username+'" and password="'+password+'" and banned = 0', function(err, results, fields){
		if (err) {
		  console.log(err);
		}else{
			if(results.length > 0){
				RemoveClientId(clientid);
				ClientIds.push(clientid);
				var clientaccount = results[0];
				mysql.query('update accounts set clientid="'+clientid+'" where id='+clientaccount['id']);
				GetPlayerChars(clientaccount['id'],clientid);
				console.log(clientaccount['username']+' has logged in.');
			}else{
				SendData(clientid,"login:fail");
				console.log('Failed login from '+username+'.');
			}
		}
	});
}

function RegisterAccount(reginfo,clientid){
	var reginfo = reginfo.split(':');
	var username = strip_tags(reginfo[0]);
	var password = strip_tags(reginfo[1]);
	var email = strip_tags(reginfo[2]);
	password = Hash.sha1(password);
	
	var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
	if(reg.test(email) == false) { SendData(clientid,'register:Invalid Email Address'); }else{	
		if(username != "" && password != ""){
			mysql.query('select * from accounts = where username = "'+username+'" or email = "'+email+'"',function(err,results,fields){
				if(results == null){
					mysql.query("insert into accounts (username,password,email)values('"+username+"','"+password+"','"+email+"')");
					SendData(clientid,"register:Successful Registration!");
				}else{ SendData(clientid,"register:An account with these details already exists."); }
			});
		}else{ SendData(clientid,'register:Wrong Registration Data.'); }
	}
}

function GetClasses(clientid){
	mysql.query('select * from classes',function(err,results,fields){
		if(results != null){
			var count = 0, output = "";
			for(var i = 0; i <= results.length-1; i++){
				var row = results[i];
				output = output + '<table style="cursor:pointer;width:100%" onclick="selectedclass = '+row['id']+';$(\'#selectedclass\').html(\'Class: '+row['name']+'\');" onmouseout="$(this).css(\'background-color\',\'transparent\')" onmouseover="$(this).css(\'background-color\',\'#222222\')"><tr><td width="32"><div style="width:32px;height:32px" id="charcreateimg-'+count+'"></div><div style="display:none" id="charcreatesprite-'+count+'">'+row['sprite']+'</div></td><td>'+row['name']+'</td></tr></table>';
				count++;
			}
			SendData(clientid,"getclasses:"+results.length+":"+output);
		}
	});
}

// get player characters and return table list.
function GetPlayerChars(accountid,clientid){
	mysql.query('select * from players where account = '+accountid,function(err,results,fields){
		if(results != null){
			var count = 0, output = "";
			for(var i = 0; i <= results.length-1; i++){
				var row = results[i];
				output = output + '<table style="cursor:pointer;width:100%" onclick="SendData(\'online='+row['id']+'\');SendData(\'init='+row['id']+'\')" onmouseout="$(this).css(\'background-color\',\'transparent\')" onmouseover="$(this).css(\'background-color\',\'#222222\')"><tr><td width="32"><div style="width:32px;height:32px" id="charselectimg-'+count+'"></div><div style="display:none" id="charselectsprite-'+count+'">'+row['sprite']+'</div></td><td>'+row['name']+'</td></tr></table>';
				count++;
			}
			SendData(clientid,"login:"+output);
		}else{ SendData(clientid,"login:No Characters"); }
		console.log(clientid + ' has retrieved their characters.');
	});
}

function CreateChar(chardata,clientid){
	chardata = chardata.split(':');
	var charname = strip_tags(chardata[0]);
	var pclass = strip_tags(chardata[1]);
	 mysql.query("select * from accounts where clientid = '"+clientid+"'",function(err,results,fields){
	 var acc = results[0];
		if(results.length != null){
			mysql.query("select * from players where account = "+acc['id'],function(err,results,fields){
				if(results.length < 3){
					mysql.query("select * from classes where id = "+pclass,function(err, results, fields){
						var classx = results[0];
						mysql.query("insert into players (name,sprite,map,position,items,account)values('"+charname+"',"+classx['sprite']+","+startmap+",'"+startpos+"','','"+acc['id']+"')");
						SendData(clientid,'charcreate:Character Created!');
						console.log(charname + ' was born.');
					});
				}else{
					SendData(clientid,'charcreate:3 Characters Max!');
				}
			});
		}else{ SendData('charcreate:Error'); }
	});
}

// Set the player as online.
function SetPlayerOnline(player,clientid){
	if(isLoggedIn(PlayerId[clientid]) == false){
		mysql.query('select * from accounts where clientid="'+clientid+'"', function(err, results, fields){
			if(err){ console.log(err); }
			if(results.length > 0){
				var clientaccount = results[0];
				mysql.query('update players set online=1 where id='+player);
				mysql.query('select * from players where id='+player, function(err, results, fields){
					var clientaccount = results[0];
					PlayerAlreadyLoaded(clientaccount['id']);
					PlayerChangingMap[clientid] = false;
					PlayerId[clientid] = clientaccount['id'];
					PlayerName[clientid] = clientaccount['name'];
					PlayerSprite[clientid] = clientaccount['sprite'];
					PlayerMap[clientid] = clientaccount['map'];
					PlayerPosition[clientid] = clientaccount['position'];
					PlayerItems[clientid] = clientaccount['items'];
					PlayerXp[clientid] = clientaccount['xp'];
					PlayerAccess[clientid] = clientaccount['access'];
					PlayerHealth[clientid] = Array(clientaccount['health'],clientaccount['health']);
					
					SendData(clientid,'online:'+clientaccount['id'] + ":" + clientaccount['name'] + ":" + clientaccount['sprite'] + ":" + clientaccount['map'] + ":" + clientaccount['position'] + ":" + clientaccount['items'] + ":" + clientaccount['xp'] + ":" + clientaccount['access'] + ":" + clientaccount['health']);
					console.log('Player '+PlayerName[clientid]+' has entered the world.');
					SendAnnounceChat(PlayerName[clientid] + ' has entered the world.');
					UpdatePlayersOnMap(PlayerMap[clientid]);
					PlayerLoggedIn[PlayerId[clientid]] = true;
				});
			}
		});
	}
}

// Is player logged in
function isLoggedIn(pid){
	if(pid != "" && pid != null){
		if(PlayerLoggedIn[pid] == true){ return true; }else{ return false; }
	}else{ return false; }
}

function RemoveClientId(clientid){
	for(var i = 0; i < ClientIds.length; i++){
		if(clientid == ClientIds[i]){
			ClientIds[i] = "";
		}
	}
}


// Check of the playerid is already playing.
function PlayerAlreadyLoaded(pid){
	for(var i = 0; i < ClientIds.length; i++){
		var clientid = ClientIds[i];
		if(pid == PlayerId[clientid]){
			ClientIds[i] = "";
			PlayerId[clientid] = "";
			PlayerName[clientid] = "";
			PlayerSprite[clientid] = "";
			PlayerMap[clientid] = "";
			PlayerPosition[clientid] = "";
			PlayerItems[clientid] = "";
			PlayerXp[clientid] = "";
			PlayerAccess[clientid] = "";
			PlayerHealth[clientid] = Array("","");
		}
	}
}

// Submit user data to database
function SavePlayerData(clientid,kickplayer){
	var phealth = PlayerHealth[clientid];
	phealth = Array(15,15);
	mysql.query('update players set name="'+PlayerName[clientid]+'", sprite="'+PlayerSprite[clientid]+'", map="'+PlayerMap[clientid]+'", position="'+PlayerPosition[clientid]+'", items="'+PlayerItems[clientid]+'", xp="'+PlayerXp[clientid]+'", health="'+phealth[0]+'='+phealth[1]+'", online=0 where id='+PlayerId[clientid],function(err,results,fields){
		
		if(kickplayer == true){
			console.log('Player '+PlayerName[clientid]+' has left the world.');
			if(PlayerName[clientid] != null && PlayerName[clientid] != ""){ SendAnnounceChat(PlayerName[clientid] + ' has left the game.'); }
			UpdatePlayersOnMap(PlayerMap[clientid]);
			
			RemoveClientId(clientid);
			
			PlayerId[clientid] = "";
			PlayerName[clientid] = "";
			PlayerSprite[clientid] = "";
			PlayerMap[clientid] = "";
			PlayerPosition[clientid] = "";
			PlayerItems[clientid] = "";
			PlayerXp[clientid] = "";
			PlayerAccess[clientid] = "";
			PlayerHealth[clientid] = Array("","");
		}
	});
}

function GetPlayersOnMap(mapid,clientid){
	var output = "";
	for(var j = 0; j < ClientIds.length; j++){
		i = ClientIds[j];
		if(PlayerMap[i] == mapid){
			var phealth = PlayerHealth[i];
			output = output + PlayerId[i] + ":" + PlayerName[i] + ":" + PlayerSprite[i] + ":" + PlayerMap[i] + ":" + PlayerPosition[i] + ":" + PlayerItems[i] + ":"+ PlayerXp[i] + ":" + PlayerAccess[i] + ":" + phealth[0]+'-'+phealth[1] + ",";
		}
	}
	for(var j = 0; j < NPCsTotal; j++){
		i = NPCIds[j];
		if(NPCMap[i] == mapid){
			var phealth = NPCHealth[i];
			output = output + i + ":" + NPCName[i] + ":" + NPCSprite[i] + ":" + NPCMap[i] + ":" + NPCPosition[i] + ":0:" + NPCXp[i] + ":0:" + phealth[0]+'-'+phealth[1] + ",";
		}
	}
	SendData(clientid,'playersonmap:'+output);
}

function DoUpdatePlayersOnMap(clientid){
	var output = "";
	for(var j = 0; j < ClientIds.length; j++){
		var i = ClientIds[j];
		if(PlayerMap[i] == PlayerMap[clientid]){
			var phealth = PlayerHealth[i];
			output = output + PlayerId[i] + ":" + PlayerName[i] + ":" + PlayerSprite[i] + ":" + PlayerMap[i] + ":" + PlayerPosition[i] + ":" + PlayerItems[i] + ":" + PlayerXp[i] + ":" + PlayerAccess[i] + ":" + phealth[0]+'-'+phealth[1] + ",";
		}
	}
	for(var j = 0; j < NPCsTotal; j++){
		i = NPCIds[j];
		if(NPCMap[i] == PlayerMap[clientid]){
			var phealth = NPCHealth[i];
			output = output + i + ":" + NPCName[i] + ":" + NPCSprite[i] + ":" + NPCMap[i] + ":" + NPCPosition[i] + ":0:" + NPCXp[i] + ":0:" + phealth[0]+'-'+phealth[1] + ",";
		}
	}
	SendData(clientid,'updateplayersonmap:'+output.substring(0,output.length-1));
}

// Get all clients on the map to update.
function UpdatePlayersOnMap(mapid){
	for(var i = 0; i < ClientIds.length; i++){
		if(PlayerMap[ClientIds[i]] == mapid){
			DoUpdatePlayersOnMap(ClientIds[i]);
		}
	}
}

// Update single npc position.
function UpdateSingleNPC(mapid,nid){
	for(var i = 0; i < ClientIds.length; i++){
		if(PlayerMap[ClientIds[i]] == mapid){
			var nhealth = NPCHealth[nid];
			var data = nid + ":" + NPCName[nid] + ":" + NPCSprite[nid] + ":" + NPCMap[nid] + ":" + NPCPosition[nid] + ":0:" + NPCXp[nid] + ":0:" + nhealth[0]+'-'+nhealth[1];
			SendData(ClientIds[i],'updatenpc:'+data);
		}
	}
}

function SetLoc(newloc,clientid){
	if(PlayerChangingMap[clientid] == false){
		PlayerPosition[clientid] = newloc;
		UpdatePlayersOnMap(PlayerMap[clientid]);
	}
}

function PlayerChangeMap(playerlocandmap,clientid){
	
	PlayerChangingMap[clientid] = true;
	PlayerUpdater[clientid] = false;
	
	playerinfo = playerlocandmap.split(':');
	plocation = PlayerPosition[clientid];
	
	// If player is logged in and this location is available to them. Manipulate the map so they are the opposite end.
	var prevmap = PlayerMap[clientid];
	if(prevmap != playerinfo[1]){
		var accessable = false; var direction = 'down';
		mysql.query("select navigate,attributes from map where id = "+prevmap,function(err, results, fields){
			if(results.length > 0){
				var row = results[0];
				var navigate = row['navigate'].split('-');
				var location = playerinfo[0].split('x');
				
				if(navigate[0] == playerinfo[1]){ accessable = true; direction = "up"; location[1] = 14; }
				if(navigate[1] == playerinfo[1]){ accessable = true; direction = "right"; location[0] = 0; }
				if(navigate[2] == playerinfo[1]){ accessable = true; direction = "down"; location[1] = 0; }
				if(navigate[3] == playerinfo[1]){ accessable = true; direction = "left"; location[0] = 19; }
				
				location = location.join('x');
			
				PlayerMap[clientid] = playerinfo[1];
				PlayerPosition[clientid] = location;
				SendData(clientid,'changemap:'+location);
			}else{
				CreateMap(playerinfo[1],location,clientid);
			}
		});
	}else{
		if(PlayerAccess[clientid] > 3){ SendData(clientid,'changemap:'+playerinfo[0]); }
	}
}

function WarpPlayer(clientid){
	PlayerChangingMap[clientid] = true;
	mysql.query("select * from attributes where location = '"+PlayerMap[clientid]+'-'+PlayerPosition[clientid]+"'",function(err, results, fields){
		if(results.length > 0){
			var attribute = results[0];
			if(attribute['value'] != ""){
				var newpos = attribute['value'].split('-');
				PlayerMap[clientid] = newpos[0];
				PlayerPosition[clientid] = newpos[1];
				SendData(clientid,'warp:'+newpos[0]);
				SendData(clientid,'changemap:'+newpos[1]);
			}else{ console.log('Attribute not found'); }
		}else{
			CreateMap(newpos[0],newpos[1],clientid);
		}
	});
}

function CheckRange(pos1,pos2){
	pos1 = pos1.split('x');
	pos2 = pos2.split('x');
	
	var num1 = 0;
	var num2 = 0;
	
	if(pos1[0] > pos2[0]){
		num1 = pos1[0] - pos2[0];
	}else if(pos1[0] < pos2[0]){
		num1 = pos2[0] - pos1[0];
	}
	
	if(pos1[1] > pos2[1]){
		num2 = pos1[1] - pos2[1];
	}else if(pos1[1] < pos2[1]){
		num2 = pos2[1] - pos1[1];
	}
	
	if(num1 > num2){
		return num2;
	}else{ return num1; }
}

/* MAP FUNCTIONS */

function LoadMap(mapid, clientid){
	PlayerMap[clientid] = mapid;
	if(MapData[mapid] == null || MapData[mapid] == ""){
		mysql.query("select * from map where id = "+mapid,function(err, results, fields){
			if(results.length > 0){
				var mapdata = results[0];
				if(mapdata['id'] != ''){
					SetMapAttributes(mapdata['id'],mapdata['attributes']);
					if(mapdata['npcs'] != "" && mapdata['npcs'] != null && AreNPCsOnMap(mapdata['id']) == false){ LoadNPCs(mapdata['id'],mapdata['npcs']); }
					CalculatePlayersOnMaps();
					DoUpdatePlayersOnMap(clientid);
					var output = 'loadmap:'+mapdata['id'] + ":" + mapdata['title'] + ":" + mapdata['floor'] + ":" + mapdata['mask'] + ":" + mapdata['mask2'] + ":" + mapdata['fringe'] + ":" + mapdata['fringe2'] + ":" + mapdata['animated'] + ":" + mapdata['attributes'] + ":" + mapdata['music'] + ':' + mapdata['navigate'];
					exec("php "+serverloc+"tilesgen.php "+output, puts);
					SendData(clientid,output);
					MapData[mapdata['id']] = output;
				}
				PlayerUpdater[clientid] = true;
			}else{
				CreateMap(mapid,PlayerPosition[clientid],clientid);
			}
			
		});
	}else{
		SendData(clientid,MapData[mapid]);
		PlayerUpdater[clientid] = true;
	}
}

function SetMapAttributes(mapid,attributes){
	attributes = attributes.split('-');
	var newarray = Array();
	for(var i = 0; i < attributes.length; i++){
		newarray[TileNumberToPosition(i)] = attributes[i];
	}
	MapAttributes[mapid] = newarray;
}

// Input a tile number and get a tile position.
function TileNumberToPosition(tile){
	var x = 0; var y = 0;
	for(var i = 1; i<=300; i++){
		if(x == 20){
			y++; x=0;
		}
		x++;
		
		if(tile == i){ break; }
	}
	return x-1 + 'x' + y;
}

// Input a tile position (4x3) and get a tile number.
function TilePositionToNumber(x,y){
	x = x + 1;
	y = y * 20;
	return x + y;
}

function CreateMap(mapid,playerloc,clientid){
	mysql.query("insert into map (id,title,floor,mask,mask2,fringe,fringe2,animated,music,navigate) values ("+mapid+",'New Map "+mapid+"','0x0=0x0','0x0=0x0','0x0=0x0','0x0=0x0','0x0=0x0','0x0=0x0','1',1,'0-0-0-0')",function(){
		console.log('Created Map '+mapid);
		PlayerChangeMap(playerloc+':'+mapid,clientid);
	});
}

function SaveMap(clientid,data){
	if(PlayerAccess[clientid] > 2){
		data = decode64(data);
		data = data.split(':');
		var navigate = data[11].split('-');
		navigate = parseInt(navigate[0])+'-'+parseInt(navigate[1])+'-'+parseInt(navigate[2])+'-'+parseInt(navigate[3]);
		var sql = "update map set title='"+data[1]+"',floor='"+data[2]+"',mask='"+data[3]+"',mask2='"+data[4]+"',fringe='"+data[5]+"',fringe2='"+data[6]+"',animated='"+data[7]+"',attributes='"+data[8]+"',music="+data[9]+",navigate='"+navigate+"' where id = "+data[0];
		mysql.query(sql);
		MapData[data[0]] = "";
		SendData(clientid,'save:x');
	}else{
		SendData(clientid,'save:Sorry, you do not have access to save.');
	}
}

// Loads map list for map editor.
function GetMapList(clientid){
	mysql.query("select * from map order by id asc",function(err, results, fields){
		var output = "";
		for(var i = 0; i <= results.length-1; i++){
			var row = results[i];
			output = output + '<option value="'+row['id']+'">'+row['id']+': '+row['title']+'</option>';
		}
		SendData(clientid,'maplist:'+output);
	});
}

function isBlocked(mapid,pos){
	// Check if next tile is blocked
	var attr = MapAttributes[mapid];
	switch(attr[pos.join('x')]){
		case "block": return true; break;
		case "door": return true; break;
		case "keyopen": return true; break;
		case "sign": return true; break;
		case "npc": return true; break;
		default: return false;
	}
}
function isNPCAvoid(mapid,pos){
	var attr = MapAttributes[mapid];
	switch(attr[pos.join('x')]){
		case "npcavoid": return true; break;
		default: return false;
	}
}

// CHAT COMMANDS
function SendLocalChat(clientid,message){
	var pmap = PlayerMap[clientid];
	for(var i = 0; i < ClientIds.length; i++){
		if(pmap == PlayerMap[ClientIds[i]]){
			SendData(ClientIds[i],'localchat:<b>'+PlayerName[clientid]+'</b>: '+strip_tags(message));
			console.log(PlayerName[clientid]+': '+message);
		}
	}
}
function SendGlobalChat(clientid,message){
	for(var i = 0; i < ClientIds.length; i++){
		SendData(ClientIds[i],'globalchat:<b>'+PlayerName[clientid]+'</b>: '+strip_tags(message));
		console.log(PlayerName[clientid]+': '+message);
	}
}
function SendPartyChat(clientid,message){
	
}
function SendAdminChat(clientid,message){
	for(var i = 0; i < ClientIds.length; i++){
		if(PlayerAccess[ClientIds[i]] > 0){
			SendData(ClientIds[i],'adminchat:<b>'+PlayerName[clientid]+'</b>: '+message);
			console.log(PlayerName[clientid]+': '+message);
		}
	}
}
function SendAnnounceChat(message){
	for(var i = 0; i < ClientIds.length; i++){
		SendData(ClientIds[i],'adminchat:<b>Announcement</b>: '+message);
		console.log('Announcement: '+message);
	}
}

/* AI FUNCTIONS */

function LoadNPCs(mapid,npcs){
	npcs = npcs.split(',');
	var count = 0;
	for(var i = 0; i < npcs.length; i++){
		var npc = NPCData[npcs[i]];
		var x = NPCsTotal+1; NPCsTotal++;
		
		NPCIds[x] = x;
		NPCMap[x] = mapid;
		NPCName[x] = npc['name'];
		NPCPosition[x] = '0x0';
		
		// Set npc in a random, suitable position on the map.
		var suitable = false;
		while(suitable == false){
			var randx = Math.floor(Math.random()*20);
			var randy = Math.floor(Math.random()*15);
			if(isBlocked(mapid,Array(randx,randy)) == false){
				if(isNPCAvoid(mapid,Array(randx,randy)) == false){
					suitable = true;
					NPCPosition[x] = randx+'x'+randy;
				}
			}
		}
		
		NPCHealth[x] = Array(npc['health'],npc['health']);
		NPCSprite[x] = npc['sprite'];
		NPCItem[x] = npc['item'];
		NPCRange[x] = npc['range'];
		NPCXp[x] = npc['xp'];
		NPCSkill[x] = npc['skill'];
		NPCDropRate[x] = npc['droprate'];
		NPCRespawnTime[x] = npc['respawntime'];
		NPCMoveFunctions[x] = NPCMove(mapid,x);
		
		var ticker = 1000 + Math.floor(Math.random()*3000);
		NPCUpdater[x] = setTimeout(function(){ NPCMoveFunctions[x]; },ticker);
			
		count = i;
	}
	UpdatePlayersOnMap(mapid);
	console.log((count+1) + ' NPCs Created.');
}

function CalculatePlayersOnMaps(){
	for(var i = 0; i < PlayersOnMap.length; i++){
		PlayersOnMap[i] = 0;
	}
	for(var i = 0; i < ClientIds.length; i++){
		if(PlayerMap[ClientIds[i]] != "" && PlayerMap[ClientIds[i]] != null){ PlayersOnMap[PlayerMap[ClientIds[i]]]++; }
	}
}

function AreNPCsOnMap(mapid){
	var x = false;
	for(var i = 300; i < NPCsTotal; i++){
		if(NPCMap[i] == mapid){ x = true; }
	}
	return x;
}

function NPCMove(mapid,nid){
	var ticker = 3000;
	if(PlayersOnMap[mapid] > 0 || PlayersOnMap[mapid] > 0){
		if(NPCPosition[nid] != null){
			// Randomly pick where npc will travel along X (0) or Y (1) axis.
			var xy = Math.floor(Math.random()*2);
			// Randomly pick whether the npc should go one way or another.
			var ab = Math.floor(Math.random()*2);
			var firstpos = NPCPosition[nid].split('x');
			
			if(xy == 0){
				if(ab == 0 && firstpos[0] > 0){ firstpos[0]--; }else{ if(firstpos[0] < 19){ firstpos[0]++; } }
			}else{
				if(ab == 0 && firstpos[1] > 0){ firstpos[1]--; }else{ if(firstpos[1] < 14){ firstpos[1]++; } }
			}
			
			if(isBlocked(mapid,firstpos) == false){
				if(isNPCAvoid(mapid,firstpos) == false){
					NPCPosition[nid] = firstpos.join('x');
					UpdateSingleNPC(mapid,nid);
				}
			}
		}
		ticker = 1000 + Math.floor(Math.random()*3000);
	}
	
	setTimeout(function(){ NPCMove(mapid,nid); },ticker);
}

/* OTHER FUNCTION */
function strip_tags(html){
	if(arguments.length < 3) {
		html=html.replace(/<\/?(?!\!)[^>]*>/gi, '');
	} else {
		var allowed = arguments[1];
		var specified = eval("["+arguments[2]+"]");
		if(allowed){
			var regex='</?(?!(' + specified.join('|') + '))\b[^>]*>';
			html=html.replace(new RegExp(regex, 'gi'), '');
		} else{
			var regex='</?(' + specified.join('|') + ')\b[^>]*>';
			html=html.replace(new RegExp(regex, 'gi'), '');
		}
	}
		
	var clean_string = html;
	return clean_string;
}

var keyStr = "ABCDEFGHIJKLMNOP" +
                "QRSTUVWXYZabcdef" +
                "ghijklmnopqrstuv" +
                "wxyz0123456789+/" +
                "=";

   function encode64(input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;

      do {
         chr1 = input.charCodeAt(i++);
         chr2 = input.charCodeAt(i++);
         chr3 = input.charCodeAt(i++);

         enc1 = chr1 >> 2;
         enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
         enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
         enc4 = chr3 & 63;

         if (isNaN(chr2)) {
            enc3 = enc4 = 64;
         } else if (isNaN(chr3)) {
            enc4 = 64;
         }

         output = output +
            keyStr.charAt(enc1) +
            keyStr.charAt(enc2) +
            keyStr.charAt(enc3) +
            keyStr.charAt(enc4);
         chr1 = chr2 = chr3 = "";
         enc1 = enc2 = enc3 = enc4 = "";
      } while (i < input.length);

      return output;
   }

   function decode64(input) {
      var output = "";
      var chr1, chr2, chr3 = "";
      var enc1, enc2, enc3, enc4 = "";
      var i = 0;

      // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
      var base64test = /[^A-Za-z0-9\+\/\=]/g;
      if (base64test.exec(input)) {
         alert("There were invalid base64 characters in the input text.\n" +
               "Valid base64 characters are A-Z, a-z, 0-9, ?+?, ?/?, and ?=?\n" +
               "Expect errors in decoding.");
      }
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      do {
         enc1 = keyStr.indexOf(input.charAt(i++));
         enc2 = keyStr.indexOf(input.charAt(i++));
         enc3 = keyStr.indexOf(input.charAt(i++));
         enc4 = keyStr.indexOf(input.charAt(i++));

         chr1 = (enc1 << 2) | (enc2 >> 4);
         chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
         chr3 = ((enc3 & 3) << 6) | enc4;

         output = output + String.fromCharCode(chr1);

         if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
         }
         if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
         }

         chr1 = chr2 = chr3 = "";
         enc1 = enc2 = enc3 = enc4 = "";

      } while (i < input.length);

      return output;
   }