var isLeftMouseButtonDown = false;
var isRightMouseButtonDown = false;
var isMiddleMouseButtonDown = false;
var isLoggedIn = false;

var MouseOverCell = 'None';
var AttributeArray = Array();

var Editor = true;
var Attributes = false;

function WriteLine(text,color){
	text = '<font color="#'+color+'">'+text+'</font>';
	$('#playeroutput').html($('#playeroutput').html()+'<br />'+text);
	$('#playeroutput').clearQueue();
	$('#playeroutput').animate({ scrollTop: $("#playeroutput").attr("scrollHeight") }, 'slow');
}
function Write(text,color){
	text = '<font color="#'+color+'">'+text+'</font>';
	$('#playeroutput').html($('#playeroutput').html()+text);
	$('#playeroutput').clearQueue();
	$('#playeroutput').animate({ scrollTop: $("#playeroutput").attr("scrollHeight") }, 'slow');
}

function SendPlayerInput(sender,e){
	if(sender.value!='' && e.keyCode == 13) {
		SendData('localchat='+sender.value);
		sender.value = '';
	}
}

function PressLoginButton(sender,e){
	if(sender.value!='' && e.keyCode == 13) {
		$("#login-form").dialog("option","buttons")['Login'].apply(); 
	}
}

function GoOffline(){
	$.ajax({ url: "ajax/player.php", data:'offline='+User_Player_Id });
}

// This function updates the mouseover cell number.
function UpdateMouseOverCell(cell){
	var layer = $('input:radio[name=ActiveLayer]:checked').val();
	var output = "None";
	
	// Get Cell Number
	if(cell != 0 && cell != null){
		output = String(cell.id).split('-');
		output = output[1];
		MouseOverCell = output;
	}
	var xandy = TileNumberToPosition(output);
	xandy = xandy.split('x');
	xandy[0] = xandy[0]/32;
	xandy[1] = xandy[1]/32;
	if(xandy != ''){ xandy = ' (X:'+xandy[0]+',Y:'+xandy[1]+')'; }
	$('#mouseovercell').html('Mouse Over Tile: '+output+xandy);
	
	if(isRightMouseButtonDown){
		if(Editor == true){
			if(layer!='animated'){
				$('#'+layer+'-'+output).css('background-image','none');
				$('#'+layer+'-'+output).css('background-position','0px 0px');
			}else{
				$('#mask-'+output).html('');
			}
		}else if(Attributes == true){
			$('#attributes-'+output).html('');
			AttributeArray[output] = '';
		}
	}else if(isLeftMouseButtonDown){ 
		if(Editor == true){
			// Get background image position of new tile.
			var bgpos = $('#ActiveTile-').css('background-position');
			bgpos = bgpos.split(' ');
			bgpos[0] = bgpos[0].replace('px','');
			bgpos[1] = bgpos[1].replace('px','');
			bgpos[0] = bgpos[0].replace('-','');
			bgpos[1] = bgpos[1].replace('-','');
			
			bgpos[0] = bgpos[0] / 32;
			bgpos[1] = bgpos[1] / 32;
			
			// Get tileset.
			var tileset = $('#tilesetsdropdown').val().split(':');
			if(layer!='animated'){
				SetMapCellImage(output,tileset[0],bgpos[0],bgpos[1],layer);
			}else{
				SetAnimatedMapCellImage(output,tileset[0],bgpos[0],bgpos[1]);
			}
		}else if(Attributes == true){
			var activeattribute = $('input:radio[name=ActiveAttribute]:checked').val();
			SetTileAttribute(output,activeattribute);
			if(output!='None'){ AttributeArray[output] = activeattribute; }
		}
	}
}

// Set the attribute of a tile.
function SetTileAttribute(output,activeattribute){
	switch(activeattribute){
		case "block": $('#attributes-'+output).html('<font color="#660000"><b>B</b></font>'); break;
		case "npcavoid": $('#attributes-'+output).html('<font color="#FFF"><b>N</b></font>'); break;
		case "door": $('#attributes-'+output).html('<font color="#FFDD33"><b>D</b></font>'); break;
		case "warp": $('#attributes-'+output).html('<font color="#3366AA"><b>W</b></font>'); break;
		case "item": $('#attributes-'+output).html('<font color="#FFFF44"><b>I</b></font>'); break;
		case "key": $('#attributes-'+output).html('<font color="#FFDD00"><b>K</b></font>'); break;
		case "keyopen": $('#attributes-'+output).html('<font color="#FF9900"><b>O</b></font>'); break;
		case "heal": $('#attributes-'+output).html('<font color="#338833"><b>H</b></font>'); break;
		case "damage": $('#attributes-'+output).html('<font color="#FF0000"><b>D</b></font>'); break;
		case "sign": $('#attributes-'+output).html('<font color="#FF88DD"><b>S</b></font>'); break;
		case "shop": $('#attributes-'+output).html('<font color="#0044CC"><b>S</b></font>'); break;
		case "npc": $('#attributes-'+output).html('<font color="#99FF44"><b>N</b></font>'); break;
		case "event": $('#attributes-'+output).html('<font color="#0044AA"><b>E</b></font>'); break;
	}
}

// Floods the map with the selected tile on the selected layer.
function FloodFill(){
	isLeftMouseButtonDown=true;
	for(var i = 1; i<=300; i++){
		var cell = document.getElementById($('input:radio[name=ActiveLayer]:checked').val()+'-'+i);
		UpdateMouseOverCell(cell);
	}
	isLeftMouseButtonDown=false;
}

function FloodClear(){
	isRightMouseButtonDown=true;
	var layer = $('input:radio[name=ActiveLayer]:checked').val();
	
	if(layer!='animated'){
		for(var i = 1; i<=300; i++){
			var cell = document.getElementById(layer+'-'+i);
			UpdateMouseOverCell(cell);
		}
	}else{
		for(var i = 1; i<=300; i++){
			$('#mask-'+i).html('');
		}
	}
	isRightMouseButtonDown=false;
}

// Required to begin drawing onto the map. This sets up left, right and middle mouse clicks.
function SetupMouse(){
	
	$('#map').mouseleave(function(){
		ResetMouseButtons();
	});
	
	$('#map').mousemove(function(){
		if(isLeftMouseButtonDown==true || isRightMouseButtonDown==true){
			var cell = document.getElementById($('input:radio[name=ActiveLayer]:checked').val()+'-'+MouseOverCell);
			UpdateMouseOverCell(cell);
		}
	});
	
	$('#map').mousedown(function(event){
		switch(event.which){
			case 1: isLeftMouseButtonDown = true; break;
			case 2: isMiddleMouseButtonDown = true; break;
			case 3: isRightMouseButtonDown = true; break;
		}
	});
	
	$('#map').mouseup(function(event){
		ResetMouseButtons();
		switch(event.which){
			case 1: isLeftMouseButtonDown = true; break;
			case 2: isMiddleMouseButtonDown = true; FloodFill(); break;
			case 3: isRightMouseButtonDown = true; break;
		}
		var cell = document.getElementById($('input:radio[name=ActiveLayer]:checked').val()+'-'+MouseOverCell);
		UpdateMouseOverCell(cell);
		ResetMouseButtons();
	});
}

function ResetMouseButtons(){
	isLeftMouseButtonDown = false;
    isMiddleMouseButtonDown = false;
    isRightMouseButtonDown = false;
}

// Load Maplist for Map Editor
function LoadMapList(data){
	$('#MapList').html(data);
}

function TileSetSelect(){
	tileset = $('#tilesetsdropdown').val().split(':');
	$('#TileSet').css('width',parseInt(tileset[1])+18);
	$('#TileSetGrid').css('width',tileset[1]);
	$('#TileSetGrid').css('height',tileset[2]);
	$('#TileSetGrid').css('background-image','url(gfx/'+tileset[0]+')');
	
	// Load map editor overgrid.
	var tileswidth = Math.floor(tileset[1]/32);
	var tilesheight = Math.floor(tileset[2]/32);
	var tilestotal = tilesheight * tileswidth;
	
	var mapgridhtml = '<table id="editor_table" cellpadding="0" cellspacing="0"><tr>';
	var cellstyle = 'width:32px;height:32px';
	var rowcount = 0; var colcount = 0;
	for(var i = 0; i<=tilestotal; i++){
		mapgridhtml = mapgridhtml + '<td id="editor'+rowcount+'x'+colcount+'" style="'+cellstyle+'" onclick="SetActiveTile(\''+tileset[0]+'\',this)"></td>';
		if(rowcount == tileswidth-1){ mapgridhtml = mapgridhtml + '</tr><tr>'; rowcount=0; colcount++; }else{rowcount++;}
	}
	mapgridhtml = mapgridhtml + '</tr></table>';
	$('#TileSetGrid').html(mapgridhtml);
}

function SetActiveTile(tileset,element){
	var output = String(element.id).replace('editor','');
	var offsets = output.split('x');
	SetMapCellImage('',tileset,offsets[0],offsets[1],'ActiveTile');
	SetupMouse();
}

function OnTabChange(){
	var selected = $( "#rightuitabs" ).tabs( "option", "selected" );
	switch(selected){
		case 0: Editor = true; Attributes = false; $('#attributes_table').css('display','none'); break;
		case 1: Attributes = true; Editor = false; $('#attributes_table').css('display','inline'); SetupMouse(); break;
		case 2: Editor = false; Attributes = false; $('#attributes_table').css('display','none'); break;
	}
}

// Set the sprites for character select.
function SetCharSelectSprite(id){
	$('#charselectimg-'+id).css('background-image','url(gfx/Sprites.png)');
	var sprite = $('#charselectsprite-'+id).html();
	
	var y = sprite * 32;
	var x = 0;
	switch(sprite){
		case "up": x=0; break;
		case "down": x=96; break;
		case "left": x=192; break;
		case "right": x=288; break;
	}
	x = x + (sprite*32);
	
	if(y>0){ y = '-' + y; }
	if(x>0){ x = '-' + x; }
	
	$('#charselectimg-'+id).css('background-position',x+'px '+y+'px');
}

// Set the sprites for character create.
function SetCharCreateSprite(id){
	$('#charcreateimg-'+id).css('background-image','url(gfx/Sprites.png)');
	var sprite = $('#charcreatesprite-'+id).html();
	
	var y = sprite * 32;
	var x = 0;
	switch(sprite){
		case "up": x=0; break;
		case "down": x=96; break;
		case "left": x=192; break;
		case "right": x=288; break;
	}
	x = x + (sprite*32);
	
	if(y>0){ y = '-' + y; }
	if(x>0){ x = '-' + x; }
	
	$('#charcreateimg-'+id).css('background-position',x+'px '+y+'px');
}

function SetClassSprites(data){
	data = data.split(':');
	
	var x = data[0];
	data = data.join(':').substring(x.length+1);
	$('#classselect').html(data);
	
	for(var i = 0; i < x; i++){
		SetCharCreateSprite(i);
	}
}

function isGameInFocus(){
	var focusedInputs = $("#MapName:focus");
	if (focusedInputs != null && focusedInputs.length > 0) { return false; }
	
	focusedInputs = $("#playerinput:focus");
	if (focusedInputs != null && focusedInputs.length > 0) { return false; }
	
	return true;
}

function doBlink() {
	for (var i=1; i <= 300; i++){
		if(document.getElementById('animatedtile'+i)){
			document.getElementById('animatedtile'+i).style.visibility = document.getElementById('animatedtile'+i).style.visibility == "" ? "hidden" : "" 
		}
	}
}

function startBlink() {
    setInterval("doBlink()",1000)
}