var Player_Sprite_Number = Array();
var Player_Position = Array();
var Player_Direction = Array();
var Player_Speed = Array();
var Player_Moving = Array();
var Player_Id = Array();
var Sprite_Animation_Progress = Array();
var Sprite_Animation_Moving = Array();
var AnimationInterval = Array();

var UpdatingPosition = false;
var UpdatingPlayers = false;

// actual player id.
var User_Player_Id = 999;

// gui purposes only.
var User_Player = 999;

function DoAnimation(player){
	// 3 sprites facing in a direction. left leg, right leg, attack for directions up down left right.
	if(Sprite_Animation_Progress[player]>=1){Sprite_Animation_Progress[player]=0;}else{Sprite_Animation_Progress[player]++;}
	switch(Player_Direction[player]){
		case "up": SetPlayerSprite(player); break;
		case "down": SetPlayerSprite(player); break;
		case "left": SetPlayerSprite(player); break;
		case "right": SetPlayerSprite(player); break;
		case "attack": SetPlayerSprite(player); break;
	}
}

// This function sets the sprite direction and progress.
function SetPlayerSprite(player){
	$('#playersprite-'+player).css('background-image','url(gfx/Sprites.png)');
	
	var y = Player_Sprite_Number[player] * 32;
	var x = 0;
	switch(Player_Direction[player]){
		case "up": x=0; break;
		case "down": x=96; break;
		case "left": x=192; break;
		case "right": x=288; break;
		default: x=96; break;
	}
	x = x + (Sprite_Animation_Progress[player]*32);
	
	if(y>0){ y = '-' + y; }
	if(x>0){ x = '-' + x; }
	
	$('#playersprite-'+player).css('background-position',x+'px '+y+'px');
}

function AddPlayerElement(element){
	$('#spritelayer').append(element);
}
function AddUIElement(element){
	$('#uilayer').append(element);
}
function AddPlayerTitle(player,name){
	AddUIElement('<div id="playertitle-'+player+'" class="playertitle">'+name+'<br /><div class="healthbarunder" id="healthbar-'+player+'"><div class="healthbarover" id="playerhealth-'+player+'"></div></div></div>');
}
function AddPlayerSprite(player,x,y){
	AddPlayerElement('<div id="playersprite-'+player+'" class="playersprite" style="left:'+x+'px;top:'+y+'px"></div>');
}

function PlacePlayer(player,tile){
	ptpos = $('#mapcontainer').position();
	AddPlayerSprite(player,ptpos.left+(tile[0]*32),ptpos.top+(tile[1]*32));
	SetPlayerSprite(player);
	$('#playertitle-'+player).css('left',ptpos.left+(tile[0]*32)-32);
	$('#playertitle-'+player).css('top',ptpos.top+(tile[1]*32)-21);
}

function AddPlayer(id,name,sprite,position){
	AddPlayerTitle(id,name);
			
	// Set player array data.
	Player_Sprite_Number[id] = sprite;
	Player_Position[id] = position;
	if(id!=User_Player){ Player_Direction[id] = 'down'; }
	Player_Speed[id] = 400;
	Player_Moving[id] = false;
	Sprite_Animation_Progress[id] = 0;
	Sprite_Animation_Moving[id] = false;
	PlacePlayer(id,position);
}

function RemovePlayer(id){
	$('#playersprite-'+id).fadeOut(500,function(){
		$('#playersprite-'+id).remove();
		$('#playertitle-'+id).remove();
	});
	$('#playertitle-'+id).fadeOut(500);
	Player_Id[id] = "";
}

function MovePlayer(player,isinput){
	if(Sprite_Animation_Moving[player] == false){
		DoAnimation(player);
		AnimationInterval[player] = setInterval('DoAnimation('+player+')',(Player_Speed[player] / 2));
		var playerloc = Player_Position[player];
		
		if(isinput){
			switch(Player_Direction[player]){
				case "up": if(playerloc[1] > 0){
					if(isBlocked(playerloc[0],playerloc[1] - 1) == false && isTaken(playerloc[0],playerloc[1] - 1) == false){
						playerloc[1] = playerloc[1] - 1; 
					}else if(isDoor(playerloc[0],playerloc[1] - 1)){
						
					}
				}else{ if(mapnorth > 0){ LoadNextMap(Player_Direction[player]); } } break;
				
				case "down": if(playerloc[1] < 14){
					if(isBlocked(playerloc[0],playerloc[1] + 1) == false && isTaken(playerloc[0],playerloc[1] + 1) == false){
						playerloc[1] = playerloc[1] + 1;
					}else if(isDoor(playerloc[0],playerloc[1] + 1)){
					
					}
				}else{ if(mapsouth > 0){ LoadNextMap(Player_Direction[player]); } } break;
				case "left": if(playerloc[0] > 0){
					if(isBlocked(playerloc[0] - 1,playerloc[1]) == false && isTaken(playerloc[0] - 1,playerloc[1]) == false){
						playerloc[0] = playerloc[0] - 1;
					}else if(isDoor(playerloc[0] - 1,playerloc[1])){
						
					}
				}else{ if(mapwest > 0){ LoadNextMap(Player_Direction[player]); } } break;
				case "right": if(playerloc[0] < 19){
					if(isBlocked(playerloc[0] + 1,playerloc[1]) == false && isTaken(playerloc[0] + 1,playerloc[1]) == false){
						playerloc[0] = playerloc[0] + 1;
					}else if(isDoor(playerloc[0] + 1,playerloc[1])){
						
					}
				}else{ if(mapeast > 0){ LoadNextMap(Player_Direction[player]); } } break;
			}
		}
		
		// Update player Position.
		if(player == User_Player){
			var loc = Player_Position[User_Player].join('x');
			SendData('setloc='+loc);
		}
	
		Sprite_Animation_Moving[player] = true;
		ptpos = $('#mapcontainer').position();
		$('#playertitle-'+player).animate({ "left": ptpos.left+(playerloc[0]*32)-32 + 'px', "top": ptpos.top+(playerloc[1]*32)-21 + 'px'}, Player_Speed[player], 'linear' );
		
		$('#playersprite-'+player).animate({ "left": ptpos.left+(playerloc[0]*32) + 'px', "top": ptpos.top+(playerloc[1]*32) + 'px'}, Player_Speed[player], 'linear', function(){
			Sprite_Animation_Moving[player] = false;
			clearInterval(AnimationInterval[player]);
			if(DirectionKeys.W == true || DirectionKeys.A == true || DirectionKeys.S == true || DirectionKeys.D == true){
				MovePlayer(User_Player,true);
			}else{
				Player_Moving[player] = false;
				ResetDirectionKeys();
			}
		});
		
		Player_Position[player] = playerloc;
	}
}

// Load player data for the current map.
function AjaxLoadPlayers(map){
	$.ajax({ url: "ajax/player.php", data:'map='+map, success: function(xml){
		if(xml!=''){ SetupMapGrid(xml); }
    }});
}

// Load user details.
function InitiallyLoadPlayer(data){
	$("#charselect").dialog("close");
		var player = data.split(':');
		
		var playerid = player[0];
		var name = player[1];
		var sprite = player[2];
		var map = player[3];
		var position = player[4].split('x');
		var items = player[5];
		var xp = player[6];
		var access = player[7];
		
		User_Player_Id = playerid;
		current_active_map = map;
		SendData('playersonmap='+map);
		
		if(ismapeditor){
			// Load first map and map editor tiles.
			SendData('loadtileset=1');
			SendData('maplist=1');
		}
				
		// Initially hide attributes table.
		$('#attributes_table').css('display','none');
}

function PlaceAllPlayersOnMap(data){
	var players = data.split(',');
	
	for(var i = 0; i < players.length; i++){
		var player = players[i].split(':');
		
		if(player==''){ break; }
		
		var playerid = player[0];
		var name = player[1];
		var sprite = player[2];
		var map = player[3];
		var position = player[4].split('x'); position[0] = parseInt(position[0]); position[1] = parseInt(position[1]);
		var items = player[5];
		var xp = player[6];
		var access = player[7];
		var health = player[8].split('-');
	
		Player_Id[playerid] = playerid;
		
		if(playerid == User_Player_Id){ User_Player = playerid; }
		AddPlayerTitle(playerid,name);
		if(health[0] == health[1]){ $('#healthbar-'+playerid).fadeOut(); }
		
		switch(access){
			case "0": $('#playertitle-'+playerid).css('color','#444444'); break;
			case "1": $('#playertitle-'+playerid).css('color','#5585ff'); break;
			case "2": $('#playertitle-'+playerid).css('color','#1c1cff'); break;
			case "3": $('#playertitle-'+playerid).css('color','#dddd19'); break;
			case "4": $('#playertitle-'+playerid).css('color','#00cf45'); break;
			case "5": $('#playertitle-'+playerid).css('color','#ff0000'); break;
		}
			
		// Set player array data.
		Player_Sprite_Number[playerid] = sprite;
		Player_Position[playerid] = position;
		if(playerid!=User_Player){ Player_Direction[playerid] = 'down'; }
		Player_Speed[playerid] = 400;
		Player_Moving[playerid] = false;
		Sprite_Animation_Progress[playerid] = 0;
		Sprite_Animation_Moving[playerid] = false;
		
		PlacePlayer(playerid,position);
	}
}

// Took me days to fix this function up. Probably bugs here. It takes the map player data and loops through to find out who is new, who is current and who is old.
function UpdateAllPlayersOnMap(data){
	
	var players = data.split(',');
	var newplayerid = Array();
	
	// Loop through the current players.
	for(var i = 0; i < players.length; i++){
			
			// Single player var.
			try{var player = players[i].split(':');}catch(err){break;}
			
			// Assign player variables.
			var playerid = player[0];
			var name = player[1];
			var sprite = player[2];
			var map = player[3];
			var position = player[4].split('x'); position[0] = parseInt(position[0]); position[1] = parseInt(position[1]);
			var items = player[5];
			var xp = player[6];
			var access = player[7];
			
			var health = player[8].split('-');
	
			if(health[0] == health[1]){ $('#healthbar-'+playerid).fadeOut(); }
			
			// Find if they are a new player.
			var newplayer = true;
			if(Player_Id[playerid] > 0){ newplayer = false; }
			
			newplayerid[playerid] = playerid;
	
			// Carry out add, remove or update.
			if(newplayer == true){
				AddPlayer(playerid,name,sprite,position);
				Player_Id[playerid] = playerid;
			}
			
			if($('#playersprite-'+playerid).exists() == false){ 
				AddPlayer(playerid,name,sprite,position);
			}
		
			// If the player is still on the map and not the user.
			if(playerid != User_Player_Id){
				// and the player Position has changed.
				var position2 = Player_Position[playerid];
				if(position2[0] != position[0] || position2[1] != position[1]){
					// Update all variables with new player state
					Player_Sprite_Number[playerid] = sprite;
					
					// Set direction.
					var position2 = Player_Position[playerid] 
					if(position2[0] > position[0]){ Player_Direction[playerid] = 'left'; }
					if(position2[0] < position[0]){ Player_Direction[playerid] = 'right'; }
					if(position2[1] > position[1]){ Player_Direction[playerid] = 'up'; }
					if(position2[1] < position[1]){ Player_Direction[playerid] = 'down'; }
					
					Player_Position[playerid] = position;
					MovePlayer(playerid,false);
				}
			}
			
			if(playerid == User_Player_Id){ User_Player = playerid; }
			switch(access){
				case "0": $('#playertitle-'+playerid).css('color','#444444'); break;
				case "1": $('#playertitle-'+playerid).css('color','#5585ff'); break;
				case "2": $('#playertitle-'+playerid).css('color','#1c1cff'); break;
				case "3": $('#playertitle-'+playerid).css('color','#dddd19'); break;
				case "4": $('#playertitle-'+playerid).css('color','#00cf45'); break;
				case "5": $('#playertitle-'+playerid).css('color','#ff0000'); break;
			}
	}
		
	// Removes all excess players
	for(var i = 0; i < Player_Id.length; i++){
		var isgone = true;
		for(var j = 0; j < newplayerid.length; j++){
			if(Player_Id[i] == newplayerid[j]){
				isgone = false;
			}
		}
		if(isgone){ RemovePlayer(Player_Id[i]); }
	}
	
	clearInterval(AnimationInterval[User_Player]);
	UpdatingPlayers = false;
}

function NPCUpdate(data){
	data = data.split(':');
	var playerid = data[0];
	var name = data[1];
	var sprite = data[2];
	var map = data[3];
	var position = data[4].split('x');
	var items = data[5];
	var xp = data[6];
	var access = data[7];
	var health = data[8].split('-');
	
	if(health[0] == health[1]){ $('#healthbar-'+playerid).fadeOut(); }
	
	if($('#playersprite-'+playerid).exists() == false){ 
		AddPlayer(playerid,name,sprite,position);
	}
	
	// Set direction.
	var position2 = Player_Position[playerid] 
	if(position2[0] > position[0]){ Player_Direction[playerid] = 'left'; }
	if(position2[0] < position[0]){ Player_Direction[playerid] = 'right'; }
	if(position2[1] > position[1]){ Player_Direction[playerid] = 'up'; }
	if(position2[1] < position[1]){ Player_Direction[playerid] = 'down'; }
	Player_Position[playerid] = position;
	
	switch(access){
		case "0": $('#playertitle-'+playerid).css('color','#444444'); break;
		case "1": $('#playertitle-'+playerid).css('color','#5585ff'); break;
		case "2": $('#playertitle-'+playerid).css('color','#1c1cff'); break;
		case "3": $('#playertitle-'+playerid).css('color','#dddd19'); break;
		case "4": $('#playertitle-'+playerid).css('color','#00cf45'); break;
		case "5": $('#playertitle-'+playerid).css('color','#ff0000'); break;
	}
	MovePlayer(playerid,false);
}

function MoveAllPlayersOnResize(){
	for(var i = 0; i < Player_Id.length; i++){
		MovePlayer(Player_Id[i],false);
	}
}

function AttackAnimation(id){
	Sprite_Animation_Progress[id]=2;
	SetPlayerSprite(id);
	setTimeout('DoAnimation('+id+')',200);
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

// checks if a tile has a player in it
function isTaken(posx,posy){
	var istaken = false;
	for(var i = 0; i < Player_Id.length; i++){
		if(Player_Id[i] != null){
			playerpos = Player_Position[Player_Id[i]];
			if(playerpos[0] == posx && playerpos[1] == posy){
				istaken = true;
			}
		}
	}
	return istaken;
}