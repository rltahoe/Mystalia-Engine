var serverworking = false;
// Create SocketIO instance, connect
var socket = new io.Socket('mystalia.org',{
  port: 8080
});

// Add a connect listener
socket.on('connect',function() {
  $('#loading-form').dialog( "close" );
  $('#login-form').dialog( "open" );
  clientconnected = true;
  SendData('testtest');
});
// Add a message listener
socket.on('message',function(data) {
	var tempdata = data.split(':');
	data = data.substring(tempdata[0].length+1);
	switch(tempdata[0]){
		case "working": alert(data); serverworking = true; break;
		
		case "login": DoLogin(data); break;
		case "register": if(data.substr(0,10) == "Successful"){ $('#register-form').dialog( "close" ); $('#login-form').dialog( "open" ); } alert(data); break;
		case "charcreate": CharCreateResponse(data); break;
		case "online": ClearMapGrid(); InitiallyLoadPlayer(data); break;
		case "playersonmap": SetupMapGrid(data); break;
		case "updateplayersonmap": UpdateAllPlayersOnMap(data); break;
		case "loadtileset": LoadTileSetGrid(data); break;
		case "loadmap": LoadMap(data); break;
		case "maplist": LoadMapList(data); break;
		case "changemap": Player_Location[User_Player] = data.split('x'); SendData('playersonmap='+current_active_map); break;
		case "warp": current_active_map = data; break;
		case "save": if(data!='x'){ alert(data); } ChangeMap(current_active_map); break;
		case "getclasses": SetClassSprites(data); break;
		
		case "localchat": WriteLine(data,'444444'); break;
		case "globalchat": WriteLine(data,'003300'); break;
		case "adminchat": WriteLine(data,'FF0000'); break;
	}
});
// Add a disconnect listener
socket.on('disconnect',function() {
	if(serverworking == false){
	  ClearMapGrid();
	  alert('Disconnected!');
	  $('#loading-form').dialog( "open" );
	  $('#login-form').dialog( "close" );
	  socket.connect(); 
	  $('#loading-form-status').html('Welcome To '+domain+'<br /><ul><li>Reconnecting to server...</li></ul>');
	  setTimeout(function(){
		if(clientconnected == false){
			$('#loading-form-status').html('Welcome To '+domain+'<br /><ul><li>Loading Images... Loaded</li><li>Connecting to server... Failed</li></ul>');
		}
	  },3000);
  }
});

// Sends a message to the server via sockets
function SendData(message) {
  socket.send(message);
}

function CharCreateResponse(data){
	if(data=="error"){ 
		alert('Creation Error');
	}else{ alert(data); $( "#charcreate" ).dialog( "close" ); SendData('login='+$('#username').val()+':'+$('#password').val()); ClearMapGrid(); }
}