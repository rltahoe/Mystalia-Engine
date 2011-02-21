<!doctype html>
<html>
<head>
	<title>Mystalia Online Test</title>
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
</head>
<body onResize="MoveAllPlayersOnResize()">
<div class="content">
		<div id="rightui" class="rightui"><br /><div class="rightuitop"></div><div class="rightuicontent"><center>
			
			<img src="css/mystalia/rightpanelheader.png" /><br />
			<a href="http://wiki.mystalia.org" target="_blank">WIKI Located Here</a>
			<br /><br />
			<div class="playerhealthsquare">
				Player Status<div style="position:inline" id="PlayerTitle"></div><br />
				
				<table cellpadding="0" cellspacing="5">
					<tr><td>HP&nbsp;</td><td class="statusbarcontainer"><div id="healthbar" class="healthbar"></div></td></tr>
					<tr><td>MP&nbsp;</td><td class="statusbarcontainer"><div id="manabar" class="manabar"></div></td></tr>
					<tr><td>XP&nbsp;</td><td class="statusbarcontainer"><div id="xpbar" class="xpbar"></div></td></tr>
				</table>
			</div>
			<br />
			<table cellpadding="0" cellspacing="5">
				<tr><td>
					<div class="inventory-menu-button"></div>
					<div class="stats-menu-button"></div>
					<div class="abilities-menu-button"></div>
					<div class="guild-menu-button"></div>
					<div class="quests-menu-button"></div>
					<div class="options-menu-button"></div>
				</td><td>
					<div class="playeronlinelist"></div>
				</td></tr>
			</table>
			
			
		</center></div><div class="rightuibottom"></div></div>
		
		<div class="mapcontainer"><div style="background-color:#000;width:640px;height:480px"><div id="map" oncontextmenu="return false;" style="width:640px;height:480px"></div></div></div><br />
		
		<div class="consolecontainer">
			<input style="width:635px" type="text" id="playerinput" onkeypress="SendPlayerInput(this, event)"/><br />
			<div id="playeroutput" style="padding:10px;height:150px;overflow:auto"></div>
		</div
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
		<div id="selectedclass"></div>
		<div id="classselect">
			
		</div>
	</center>
</div>
</body>
</html>