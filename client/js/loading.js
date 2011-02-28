var domain = 'Mystalia Online';
jQuery.fn.exists = function(){return jQuery(this).length>0;}
var clientconnected = false;
var ismapeditor = false;
var selectedclass = 0;

function DoLogin(data){
	if(data != 'false' && data != 'fail'){
		$('#charselect').html(data);
		SetCharSelectSprite(0);
		SetCharSelectSprite(1);
		SetCharSelectSprite(2);
		$( "#charselect" ).dialog( "open" );
		$( "#login-form" ).dialog( "close" );
	}else{ alert('Login Failed'); }
}

function DoLogout(){
	$.ajax({ url: "ajax/accounts.php", data:'logout=1' });
}

// After Images Have Loaded.
$(window).load(function(){
	$('#menuobject-help').hide();
	$('#loading-form-status').html('Welcome To '+domain+'<br /><ul><li>Loading Data... Loaded</li><li>Connecting to server...</li></ul>');
	socket.connect();
	startBlink();
	setTimeout(function(){
	if(clientconnected == false){
		$('#loading-form-status').html('Welcome To '+domain+'<br /><ul><li>Loading Data... Loaded</li><li>Connecting to server... Failed</li></ul>');
	}
  },5000);
});

// Enable tabs.
$(function() {
	$( "#rightuitabs" ).tabs({
	   show: OnTabChange
	});
});

// Set Keyboard Events.
$(document).keyup(function (e) {
	switch(e.which){
		case 87: DirectionKeys.W = false; Player_Moving[User_Player] = false; break;
		case 65: DirectionKeys.A = false; Player_Moving[User_Player] = false; break;
		case 83: DirectionKeys.S = false; Player_Moving[User_Player] = false; break;
		case 68: DirectionKeys.D = false; Player_Moving[User_Player] = false; break;
		case 16: ActionKeys.LEFTSHIFT = false; Player_Speed[User_Player] = 400; break;
		case 70: ActionKeys.F = false; break;
	}
});
$(document).keydown(function (e) {
	if(Sprite_Animation_Moving[User_Player] == false && isGameInFocus() == true){
		if(Player_Moving[User_Player] == false){
			switch(e.which){
				case 87: if(DirectionKeys.W == false){
						ResetDirectionKeys();
						DirectionKeys.W = true;
						Player_Direction[User_Player] = 'up';
						MovePlayer(User_Player,true);
					}
					break;
				case 65: if(DirectionKeys.A == false){
						ResetDirectionKeys();
						DirectionKeys.A = true;
						Player_Direction[User_Player] = 'left';
						MovePlayer(User_Player,true);
					}
					break;
				case 83: if(DirectionKeys.S == false){
						ResetDirectionKeys(); 
						DirectionKeys.S = true; 
						Player_Direction[User_Player] = 'down';
						MovePlayer(User_Player,true);
					}
					break;
				case 68: if(DirectionKeys.D == false){
						ResetDirectionKeys(); 
						DirectionKeys.D = true; 
						Player_Direction[User_Player] = 'right'; 
						MovePlayer(User_Player,true);
					}
					break;
			}
		}
	}
	switch(e.which){
		case 16: ActionKeys.LEFTSHIFT = true; Player_Speed[User_Player] = 200; break;
		case 70: if(ActionKeys.F == false){ ActionKeys.F = true; SendData('attack=1'); AttackAnimation(User_Player); } break;
	}
});

$(window).ready(function(){

	// Login form
	$( "#loading-form" ).dialog({
		autoOpen: true,
		height: 170,
		width: 250,
		modal: true,
		closeOnEscape: false,
		buttons: {
			"Retry": function(){ socket.connect(); $('#loading-form-status').html('Welcome To '+domain+'<br /><ul><li>Loading Data... Loaded</li><li>Connecting to server...</li></ul>'); setTimeout(function(){
			if(clientconnected == false){
				$('#loading-form-status').html('Welcome To '+domain+'<br /><ul><li>Loading Data... Loaded</li><li>Connecting to server... Failed</li></ul>');
			}
		  },5000); }
		}
	});
	
	// Login form
	$( "#login-form" ).dialog({
	autoOpen: false,
	height: 170,
	width: 250,
	modal: true,
	closeOnEscape: false,
	buttons: {
		"Login": function() {
			SendData('login='+$('#username').val()+':'+$('#password').val());
		},
		"Register": function(){
			$( this ).dialog( "close" );
			$('#register-form').dialog( "open" );
		}
		}
	});

	// Register form
	$( "#register-form" ).dialog({
	autoOpen: false,
	height: 240,
	width: 250,
	modal: true,
	buttons: {
		"Register": function() {
			if($('#regpassword').val() == $('#confirmpassword').val()){
			
				var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
				var address = $('#email').val();
				if(reg.test(address) == false) { alert('Invalid Email Address'); }else{
					if($('#regusername').val() != "" && $('#regpassword').val() != ""){
						SendData('register='+$('#regusername').val()+':'+$('#regpassword').val()+':'+$('#email').val());
					}
				}
				
			}else{ alert('Password Confirmation Failed'); }
		},
		Cancel: function() {
			$('#regpassword').val('');
			$('#regusername').val('');
			$('#confirmpassword').val('');
			$('#email').val('');
			
			$( this ).dialog( "close" );
			$('#login-form').dialog( "open" );
		},
		"Back": function(){
			$( this ).dialog( "close" );
			$('#login-form').dialog( "open" );
		}
		}
	});

	// Character select form
	$( "#charselect" ).dialog({
	autoOpen: false,
	height: 215,
	width: 250,
	modal: true,
	hide: "fade",
	buttons: {
		"Logout": function(){
			DoLogout();
			alert("Successfully Logged Out");
			$( "#charselect" ).dialog( "close" );
			$( "#login-form" ).dialog( "open" );
		},
		"Create New": function(){
			$( "#charselect" ).dialog( "close" );
			$( "#charcreate" ).dialog( "open" );
			SendData('getclasses=x');
		}}
	});

	// Character creation form
	$( "#charcreate" ).dialog({
	autoOpen: false,
	height: 400,
	width: 250,
	modal: true,
	buttons: {
		"Create": function(){
			SendData('createchar='+$('#charname').val()+':'+selectedclass);
		},
		Cancel: function() {
			$( "#charcreate" ).dialog( "close" );
			$( "#charselect" ).dialog( "open" );
		}}
	});

	$('#playeroutput').html('Welcome To '+domain);
	$('#loading-form-status').html('Welcome To '+domain+'<br /><ul><li>Loading Data...</li></ul>');
});