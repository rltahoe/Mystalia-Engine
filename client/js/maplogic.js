var current_active_map = 1;
var active_map_title = '';
var mapnorth, mapeast, mapsouth, mapwest;

function InitialiseMapGrid(layer){
	var cellstyle='width:32px;height:32px;';
	var cellbackgroundcolor = 'transparent';
	var display = 'inline';
	
	// If it's the floor layer, make the background black.
	if(layer=='floor'){ cellbackgroundcolor = 'black'; }
		
	// Apply all styles to the cell.
	cellstyle = cellstyle + ';background-color:' + cellbackgroundcolor + ';';
	
	// Setup map loop.
	var rowcount = 1;
	var mapgridhtml = '<table id="'+layer+'_table" style="position:absolute" cellpadding="0" cellspacing="0" border="0"><tr>';
	
	// Map loop.
	for(var i = 1; i<=300; i++){
		// Set cell id and style.
		mapgridhtml = mapgridhtml + '<td align="center" id="'+layer+'-'+i+'" style="'+cellstyle+'"';
		
		// Set cell highlighting if wanted.
		mapgridhtml = mapgridhtml + 'onmouseover="UpdateMouseOverCell(this);" onmouseout="UpdateMouseOverCell(0);"';
		
		mapgridhtml = mapgridhtml + '></td>';
		if(rowcount == 20){ mapgridhtml = mapgridhtml + '</tr><tr>'; rowcount=1; }else{rowcount++;}
	}
	
	mapgridhtml = mapgridhtml + '</tr></table>';
	AddMapElement(mapgridhtml);
}

// Sets a single map cell.
function SetMapCellImage(cellnumber,tileset,x,y,layer){

	// Set the background image for an individual tile.
	$('#'+layer+'-'+cellnumber).css('background-image','url(gfx/'+tileset+')');
	
	// Turn easy grid numbers to real ones.
	x = x*32;
	y = y*32;
	if(x > 0){ x = '-'+x; }
	if(y > 0){ y = '-'+y; }
	
	// Apply the background position.
	$('#'+layer+'-'+cellnumber).css('background-position',x+'px '+y+'px');
}

function SetAnimatedMapCellImage(cellnumber,tileset,x,y){
	var x = x * 32;
	var y = y * 32;
	if(x > 0){ x = '-'+x; }
	if(y > 0){ y = '-'+y; }
	
	$('#mask-'+cellnumber).html('<div id="animatedtile'+cellnumber+'" style="width:32px;height:32px;background-image:url(gfx/'+tileset+');background-position:'+x+'px '+y+'px"></div>');
}

function ClearMapGrid(){
	$('#map').html('');
}

// Load Tilesets for Map Editor
function LoadTileSetGrid(data){
	$('#tilesetsdropdown').html($('#tilesetsdropdown').html()+'<option value="">Please Select A Tileset.</option>');
	var tilesets = data.split(',');
		for(var i = 0; i <= tilesets.length -1; i++){
		if(tilesets[i]!=''){
			tileset = tilesets[i].split(':');
			$('#tilesetsdropdown').html($('#tilesetsdropdown').html()+'<option value="'+tilesets[i]+'">'+tileset[0]+'</option>');
		}
	}
	SendData('loadmap='+current_active_map);
}

function SetupMapGrid(data){
	ClearMapGrid();
	// Under player sprite
	InitialiseMapGrid('floor');
	InitialiseMapGrid('mask');
	InitialiseMapGrid('mask2');
	
	// Over Player Sprite.
	AddMapElement('<div id="spritelayer"></div>');	
	
	PlaceAllPlayersOnMap(data);
	$('#map').hide();
	
	InitialiseMapGrid('fringe');
	InitialiseMapGrid('fringe2');
	InitialiseMapGrid('attributes');
	
	// Invisible overlay for tile calculations
	InitialiseMapGrid('overlay');
	
	// UI Elements
	AddMapElement('<div id="mapname" style="font-weight:bold;color:#FFF;text-shadow:1px 1px #666;text-align:center;position:relative;width:200px;margin-left:auto;margin-right:auto;zindex:9"></div>');
	
	//Set ZIndexes
	$('#floor_table').css('zindex','0');
	$('#mask_table').css('zindex','1');
	$('#mask2_table').css('zindex','2');
	$('#fringe_table').css('zindex','4');
	$('#fringe2_table').css('zindex','5');
	$('#attributes_table').css('zindex','6');
	$('#overlay_table').css('zindex','9');
	SendData('loadmap='+current_active_map);	
	
	$('#healthbar').animate({ width: "100%" },5000);
	$('#manabar').animate({ width: "100%" },8000);
	$('#xpbar').animate({ width: "60%" },10000);
}

function RefreshMapGrid(){
	if($('#show_floor').attr('checked')){ $('#floor_table').css('display','inline'); }else{ $('#floor_table').css('display','none'); }
	if($('#show_mask').attr('checked')){ $('#mask_table').css('display','inline'); }else{ $('#mask_table').css('display','none'); }
	if($('#show_mask2').attr('checked')){ $('#mask2_table').css('display','inline'); }else{ $('#mask2_table').css('display','none'); }
	if($('#show_fringe').attr('checked')){ $('#fringe_table').css('display','inline'); }else{ $('#fringe_table').css('display','none'); }
	if($('#show_fringe2').attr('checked')){ $('#fringe2_table').css('display','inline'); }else{ $('#fringe2_table').css('display','none'); }
}

// Function loads map data from db.
function LoadMap(data){
		if(data != ''){
			HandleMapData(data);
			$('#MapNumber').html(current_active_map);
			$('#attributes_table').css('display','none');
			clearInterval(AnimationInterval[User_Player]);
			Sprite_Animation_Moving[User_Player] = false;
			SendData('maploaded=x');
			$('#map').fadeIn(500);
		}
}

// Function loads map data from db.
function SaveMap(){
	var navigate = parseInt($('#northmapid').val())+'-'+parseInt($('#eastmapid').val())+'-'+parseInt($('#southmapid').val())+'-'+parseInt($('#westmapid').val());
	var data = current_active_map+':'+$('#MapName').val()+':'+ExportLayerToData('floor')+':'+ExportLayerToData('mask')+':'+ExportLayerToData('mask2')+':'+ExportLayerToData('fringe')+':'+ExportLayerToData('fringe2')+':'+ExportAnimatedLayerToData('animated')+':'+AttributeArray.join('-')+':'+$("#tilesetsdropdown").attr("selectedIndex")+':'+'1'+':'+navigate;
	SendData('save='+encode64(data));
	$('#mapname').html($('#MapName').val());
	$('#rightuitabs').tabs('select', 0);
	LoadMapList();
}

// Function handles map data from ajax request.
function HandleMapData(data){
	var mapdata = data.split(':');
	
	current_active_map = mapdata[0];
	var maptitle = mapdata[1];
	var mapfloor = TilesArrayHandler(mapdata[2]);
	var mapmask = TilesArrayHandler(mapdata[3]);
	var mapmask2 = TilesArrayHandler(mapdata[4]);
	var mapfringe = TilesArrayHandler(mapdata[5]);
	var mapfringe2 = TilesArrayHandler(mapdata[6]);
	var mapanimated = TilesArrayHandler(mapdata[7]);
	var mapattribute = "";
	if(mapdata[8] != null){ mapattribute = mapdata[8].split('-'); }
	var maptileset = mapdata[9];
	var mapmusic = mapdata[10];
	var navigate = mapdata[11].split('-');
	
	if(ismapeditor){
		$("#tilesetsdropdown").get(0).selectedIndex = maptileset;
		TileSetSelect();
		maptileset = $("#tilesetsdropdown").val().split(':')[0];
	}else{
		maptileset = 't'+maptileset+'.png';
	}
	
	// Set Map Title.
	active_map_title = maptitle;
	$('#mapname').html(maptitle);
	
	if(ismapeditor){
		$('#MapName').val(maptitle);
		
		// Set Navigation Boxes and Settings.
		$('#northmapid').val(navigate[0]);
		$('#eastmapid').val(navigate[1]);
		$('#southmapid').val(navigate[2]);
		$('#westmapid').val(navigate[3]);
	}
	
	// Set Attribute Tiles
	for(var i = 0; i <= 300; i++){
		SetTileAttribute(i,mapattribute[i]);
	}
	AttributeArray = mapattribute;
		
	mapnorth = parseInt(navigate[0]);
	mapeast = parseInt(navigate[1]);
	mapsouth = parseInt(navigate[2]);
	mapwest = parseInt(navigate[3]);
	
	// Set the tiles down.
	for(var i = 0; i <= mapfloor.length -1; i++){
		SetTilesDown(mapfloor[i],maptileset,'floor');
	}
	for(var i = 0; i <= mapmask.length -1; i++){
		SetTilesDown(mapmask[i],maptileset,'mask');
	}
	for(var i = 0; i <= mapmask2.length -1; i++){
		SetTilesDown(mapmask2[i],maptileset,'mask2');
	}
	for(var i = 0; i <= mapfringe.length -1; i++){
		SetTilesDown(mapfringe[i],maptileset,'fringe');
	}
	for(var i = 0; i <= mapfringe2.length -1; i++){
		SetTilesDown(mapfringe2[i],maptileset,'fringe2');
	}
	for(var i = 0; i <= mapanimated.length -1; i++){
		SetAnimatedTilesDown(mapanimated[i],maptileset);
	}
	
}

// This function receives a tiles string from the db and splits it up returning a nice clean array.
function TilesArrayHandler(raw_tiles_string){
	if(raw_tiles_string != null){
		var splitarray = raw_tiles_string.split('-');
		var newarray = Array();
		for(var i = 0; i <= splitarray.length -1; i++){
			newarray.push(splitarray[i]);
		}
		return newarray;
	}else{ return ""; }
}

function SetTilesDown(tiledata,tileset,layer){
	try{
		tiledata = tiledata.split('=');
		tileloc = tiledata[1].split('x');
		SetMapCellImage(tiledata[0],tileset,tileloc[0],tileloc[1],layer);
	}catch(error){}
}

function SetAnimatedTilesDown(tiledata,tileset){
	// Similar to SetTilesDown function except it places a new div inside the mask cell.
	try{
		tiledata = tiledata.split('=');
		tileloc = tiledata[1].split('x');
				
		SetAnimatedMapCellImage(tiledata[0],tileset,tileloc[0],tileloc[1]);
	}catch(error){}
}

function AddMapElement(element){
	$('#map').html($('#map').html()+element);
}

// Input a tile number and get a coordinate position.
function TileNumberToPosition(tile){
	if(tile != 'None'){
		var x = 0; var y = 0;
		for(var i = 1; i<=300; i++){
			if(x == 20){
				y++; x=0;
			}
			x++;
			
			if(tile == i){ break; }
		}
		return (x-1)*32 +'x'+y*32;
	}else{ return ''; }
}

// Input a tile position (4x3) and get a tile number.
function TilePositionToNumber(x,y){
	x = x + 1;
	y = y * 20;
	return x + y;
}

// Input a tile position (32x32) and get a tile number.
function TileRealPositionToNumber(cell){
	x = cell[0] / 32;
	y = cell[1] / 32;
	return TilePositionToNumber(cell[0],cell[1]);
}

function ExportLayerToData(layer){
	var layerdata = '';
	for(var i = 1; i<=300; i++){
		var cellid = '#'+layer+'-'+i;
		if($(cellid).css('background-image') != 'none' && $(cellid).css('background-position').substring(0,2) != '0%'){
			var celltileset = $(cellid).css('background-image');
			var celltile = $(cellid).css('background-position');
			
			celltileset = celltileset.replace('url(gfx/','');
			celltile = celltile.split(' ');
			celltile[0] = celltile[0].replace('-',''); celltile[0] = celltile[0].replace('px','');
			celltile[1] = celltile[1].replace('-',''); celltile[1] = celltile[1].replace('px','');
			
			layerdata = layerdata +i+'='+celltile[0]/32+'x'+celltile[1]/32+'-';
		}
	}
	return layerdata;
}

// Exports the animated tiles to data for ajaxsavemap.
function ExportAnimatedLayerToData(){
	var layerdata = '';
	for(var i = 1; i<=300; i++){
		var cellid = '#mask-'+i;
		if($(cellid).html() != ''){
			var maskcell = $(cellid).children('div');
			if($(maskcell).css('background-image') != 'none' && $(maskcell).css('background-position').substring(0,2) != '0%'){
				var celltileset = $(maskcell).css('background-image');
				var celltile = $(maskcell).css('background-position');
				
				celltileset = celltileset.replace('url(gfx/','');
				celltile = celltile.split(' ');
				celltile[0] = celltile[0].replace('-',''); celltile[0] = celltile[0].replace('px','');
				celltile[1] = celltile[1].replace('-',''); celltile[1] = celltile[1].replace('px','');
				
				layerdata = layerdata + i+'='+celltile[0]/32+'x'+celltile[1]/32+'-';
			}
		}
	}
	return layerdata;
}

// Check if next tile is blocked
function isBlocked(x,y){
	var tile = TilePositionToNumber(x,y);
	switch(AttributeArray[tile]){
		case "block": return true; break;
		case "door": return true; break;
		case "keyopen": return true; break;
		case "sign": return true; break;
		case "npc": return true; break;
		default: return false;
	}
}

function isDoor(x,y){
	var tile = TilePositionToNumber(x,y);
	switch(AttributeArray[tile]){
		case "door": WarpPlayer(); break;
	}
}

function WarpPlayer(){
	Sprite_Animation_Moving[User_Player] = true;
	clearInterval(AnimationInterval[User_Player]);
	
	// Read and adjust player position if needed.
	$('#playersprite-'+User_Player).remove();
	$('#playertitle-'+User_Player).remove();
	
	// Update player location.
	$('#map').fadeOut(500,function(){
		ClearMapGrid();
		SendData('warp=x');
		$('#map').show();
		AddMapElement('<div id="mapname" style="font-weight:bold;color:#FFF;text-shadow:1px 1px #666;text-align:center;position:relative;width:200px;margin-left:auto;margin-right:auto;zindex:9">Loading...</div>');
	});
}

// Changes map to id
function ChangeMap(id){

	current_active_map = id;
	clearInterval(AnimationInterval[User_Player]);
	
	// Read and adjust player position if needed.
	$('#playersprite-'+User_Player).remove();
	$('#playertitle-'+User_Player).remove();
	
	// Update player location.
	var loc = Player_Location[User_Player].join('x');
	$('#map').fadeOut(500,function(){
		ClearMapGrid();
		SendData('changemap='+loc+':'+current_active_map);
		$('#map').show();
		AddMapElement('<div id="mapname" style="font-weight:bold;color:#FFF;text-shadow:1px 1px #666;text-align:center;position:relative;width:200px;margin-left:auto;margin-right:auto;zindex:9">Loading...</div>');
	});
}

function LoadNextMap(direction){
	var id=1;
	Sprite_Animation_Moving[User_Player] = true;
	switch(direction){
		case "up": id=mapnorth; break;
		case "right": id=mapeast; break;
		case "down": id=mapsouth; break;
		case "left": id=mapwest; break;
	}
	
	ChangeMap(id);
	$("body").animate({ scrollTop: 0 }, "slow");
}