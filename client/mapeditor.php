<!doctype html>
<html>
<head>
	<title>Map Editor</title>
	<link rel="stylesheet" href="css/dark-hive/jquery-ui-1.8.9.custom.css" type="text/css" />
	<link rel="stylesheet" href="css/uistructure.css" type="text/css" />
	<script type="text/javascript" src="js/jquery.js"></script>
	<script type="text/javascript" src="js/jqueryui.js"></script>
	<script type="text/javascript" src="js/otherlogic.js"></script>
	<script type="text/javascript" src="js/maplogic.js"></script>
	<script type="text/javascript" src="js/uilogic.js"></script>
	<script type="text/javascript" src="js/playerlogic.js"></script>
	<script type="text/javascript" src="js/loading.js"></script>
	<script type="text/javascript" src="js/socket.io.js"></script>
	<script type="text/javascript" src="js/client.js"></script>
	<script type="text/javascript">ismapeditor = true;</script>
</head>
<body onResize="MoveAllPlayersOnResize()">
<div class="content">
	<div class="header"><h2>Mystalia Engine - Map Editor Test - <a href="http://wiki.mystalia.org">WIKI Located Here</a></h2></div>
		<div id="rightui" style="width:280px;float:right">
			Map Name: <input type="text" id="MapName" /><input type="button" value="Save" onclick="SaveMap()" />
			<div id="rightuitabs">	
				<ul>
					<li><a href="#rightuitabs-1">Editor</a></li>
					<li><a href="#rightuitabs-2">Attributes</a></li>
					<li><a href="#rightuitabs-3">Options</a></li>
				</ul>
				
				<div id="rightuitabs-1" style="height:600px;width:245px;overflow:auto">
					<select id="tilesetsdropdown" name="tilesetsdropdown" onchange="TileSetSelect()">
						
					</select>
					<div id="TileSet" style="background-color:#000;height:390px;overflow:auto"><div id="TileSetGrid"></div></div><br />
					<table><tr><td>Active Tile:</td><td><div id="ActiveTile-" style="background-color:#000;width:32px;height:32px"></div></td>
					<td><input type="button" value="Flood" onclick="FloodFill()" /></td><td><input type="button" value="Clear" onclick="FloodClear()" /></td></tr></table><br />
						Select Layer To Edit:<br />
						<input id="ActiveLayer" type="radio" name="ActiveLayer" value="floor" checked> Floor<br />
						<input id="ActiveLayer" type="radio" name="ActiveLayer" value="mask"> Mask<br />
						<input id="ActiveLayer" type="radio" name="ActiveLayer" value="mask2"> Mask2<br />
						<input id="ActiveLayer" type="radio" name="ActiveLayer" value="fringe"> Fringe<br />
						<input id="ActiveLayer" type="radio" name="ActiveLayer" value="fringe2"> Fringe2<br />
						<input id="ActiveLayer" type="radio" name="ActiveLayer" value="animated"> Animated<br /><br />
						
						<center>
							<table><tr><td><input type="text" id="CustomMapNumber" /></td><td><input type="button" value="Go To" onclick="Map1.Load($('#CustomMapNumber').val());" /></td></tr>
							<tr><td><select id="MapList" name="MapList"></select></td><td><input type="button" value="Go To" onclick="ChangeMap($('#MapList').val());$('body').animate({ scrollTop: 0 }, 'slow');" /></td></tr></table>
							<table>
								<tr><td></td><td align="center"><input type="button" value="N" onclick="LoadNextMap('up')" /><br /><input size="2" type="text" id="northmapid" /></td><td></td></tr>
								<tr><td><input type="button" value="W" onclick="LoadNextMap('left')" /><input size="2" type="text" id="westmapid" /></td><td id="MapNumber" align="center"></td><td><input size="2" type="text" id="eastmapid" /><input type="button" value="E" onclick="LoadNextMap('right')" /></td></tr>
								<tr><td></td><td align="center"><input size="2" type="text" id="southmapid" /><br /><input type="button" value="S" onclick="LoadNextMap('down')" /></td><td></td></tr>
							</table>
						</center>
				</div>
				<div id="rightuitabs-2" style="height:600px;width:245px;overflow:auto">
					Apply Attribute:<br />
						<input id="ActiveAttribute" type="radio" name="ActiveAttribute" value="block" checked /> Block<br />
						<input id="ActiveAttribute" type="radio" name="ActiveAttribute" value="npcavoid" /> NPC Avoid<br />
						<input id="ActiveAttribute" type="radio" name="ActiveAttribute" value="door" /> Door<br />
						<input id="ActiveAttribute" type="radio" name="ActiveAttribute" value="warp" /> Warp<br />
						<input id="ActiveAttribute" type="radio" name="ActiveAttribute" value="item" /> Item<br />
						<input id="ActiveAttribute" type="radio" name="ActiveAttribute" value="key" /> Key<br />
						<input id="ActiveAttribute" type="radio" name="ActiveAttribute" value="keyopen" /> Key Open<br />
						<input id="ActiveAttribute" type="radio" name="ActiveAttribute" value="heal" /> Heal<br />
						<input id="ActiveAttribute" type="radio" name="ActiveAttribute" value="damage" /> Damage<br />
						<input id="ActiveAttribute" type="radio" name="ActiveAttribute" value="sign" /> Sign<br />
						<input id="ActiveAttribute" type="radio" name="ActiveAttribute" value="shop" /> Shop<br />
						<input id="ActiveAttribute" type="radio" name="ActiveAttribute" value="npc" /> NPC<br />
						<input id="ActiveAttribute" type="radio" name="ActiveAttribute" value="event" /> Event
				</div>
				<div id="rightuitabs-3" style="height:600px;width:245px;overflow:auto">
					<p><div id="mouseovercell">Mouse Over Tile: None</div></p>
					
					<p>Show Layers:<br />
					<input type="checkbox" id="show_floor" checked="true" onclick="RefreshMapGrid()" />Floor<br />
					<input type="checkbox" id="show_mask" checked="true" onclick="RefreshMapGrid()" />Mask<br />
					<input type="checkbox" id="show_mask2" checked="true" onclick="RefreshMapGrid()" />Mask2<br />
					<input type="checkbox" id="show_fringe" checked="true" onclick="RefreshMapGrid()" />Fringe<br />
					<input type="checkbox" id="show_fringe2" checked="true" onclick="RefreshMapGrid()" />Fringe2</p>
				</div>
			</div><br />
		</div>
		<div style="background-color:#000;width:640px;height:480px"><div id="map" oncontextmenu="return false;" style="width:640px;height:480px"></div></div><br />
		<input style="width:640px" type="text" id="playerinput" onkeypress="SendPlayerInput(this, event)"/><br />
		<div id="playeroutput" style="padding:10px;height:150px;overflow:auto"></div>
</div>

<div id="loading-form" title="Loading"><div id="loading-form-status"></div></div>
<div id="login-form" title="Login">
	<center>
		<table><tr><td><label for="username">Name: </label></td><td><input type="text" name="username" id="username" /></td></tr>
		<tr><td><label for="password">Password: </label></td><td><input type="password" name="password" id="password" value="" onkeypress="PressLoginButton(this, event)" /></td></tr></table>
	</center>
</div>
<div id="register-form" title="Register">
	<center>
		<table><tr><td><label for="username">Username: </label></td><td><input type="text" name="regusername" id="regusername" /></td></tr>
		<tr><td><label for="password">Password: </label></td><td><input type="password" name="regpassword" id="regpassword" value="" /></td></tr>
		<tr><td><label for="confirmpassword">Confirm Password: </label></td><td><input type="password" name="confirmpassword" id="confirmpassword" value="" /></td></tr>
		<tr><td><label for="email">Email: </label></td><td><input type="text" name="email" id="email" value="" /></td></tr>
		</table>
	</center>
</div>
<div id="charselect" title="Character Select"></div>
<div id="charcreate" title="Create A Character">
	<center>
		<table><tr><td><label for="charname">Name: </label></td><td><input type="text" name="charname" id="charname" /></td></tr></table>
		<div id="classselect">
			
		</div>
	</center>
</div>
</body>
</html>