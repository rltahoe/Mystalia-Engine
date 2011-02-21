<?php
	include '../config.php';
	
	if(isset($_GET['map'])){
		$map = strip_tags($_GET['map']);
		$result = $mysql->query("select * from players where map = $map and online = 1");
		while($row = $mysql->fetch_array($result)){
			$output .= $row['id'] . ":" . $row['name'] . ":" . $row['sprite'] . ":" . $row['map'] . ":" . $row['position'] . ":" . $row['items'] . ":" . $row['xp'] . ":" . $row['access'].",";
		}
		echo trim($output,',');
		die();
	}else if(isset($_GET['player'])){
		$id = strip_tags($_GET['player']);
		$row = $mysql->query("select * from players where id = $id",true);
		echo $row['id'] . ":" . $row['name'] . ":" . $row['sprite'] . ":" . $row['map'] . ":" . $row['position'] . ":" . $row['items'] . ":" . $row['xp'] . ":" . $row['access'];
		die();
	}else if(isset($_GET['setloc'])){
		
		$playerid = strip_tags($_GET['pid']);
		$mapid = strip_tags($_GET['mid']);
		$location = strip_tags($_GET['setloc']);
		
		// If player is logged in and this location is available to them. Manipulate the map so they are the opposite end.
		$row = $mysql->query("select map from players where id = $playerid",true); $previousmap = $row['map'];
		if($previousmap != $mapid){
			echo "test";
			$accessable = false; $direction = 'down';
			$row = $mysql->query("select navigate,attributes from map where id = $previousmap",true); $navigate = $row['navigate'];
			$navigate = explode('-',$navigate);
			$location = explode('x',$location);
			if($navigate[0] == $mapid){ $accessable = true; $direction = "up"; $location[1] = 14; }
			if($navigate[1] == $mapid){ $accessable = true; $direction = "right"; $location[0] = 0; }
			if($navigate[2] == $mapid){ $accessable = true; $direction = "down"; $location[1] = 0; }
			if($navigate[3] == $mapid){ $accessable = true; $direction = "left"; $location[0] = 19; }
			
			$location = implode('x',$location);
		}
		// A cron job checks online players and if they are not active for 60 seconds then they are removed.
		$lastactive = date('U');
		
		$mysql->query("update players set map = $mapid, position = '$location', lastactive = '$lastactive' where id = $playerid") or die('false');
		echo 'true';
	}else if(isset($_GET['warp'])){
		$playerid = strip_tags($_GET['warp']);
		$row1 = $mysql->query("select * from players where id = $playerid",true) or die('false1');
		$row2 = $mysql->query("select * from attributes where location = '".$row1['map'].'-'.$row1['position']."'",true) or die(mysql_error());
		if($row2['value'] != ""){ $newpos = explode('-',$row2['value']); echo $newpos[0].'-'.$newpos[1]; mysql_query("update players set map = ".$newpos[0].",position = '".$newpos[1]."' where id = $playerid") or die(mysql_error()); }else{ echo $mysql->num_rows($row2); }
		
	}else if(isset($_GET['online'])){
		$playerid = strip_tags($_GET['online']);
		$mysql->query("update players set online = 1 where id = $playerid") or die('false');
	}else if(isset($_GET['offline'])){
		$playerid = strip_tags($_GET['offline']);
		$mysql->query("update players set online = 0 where id = $playerid") or die('false');
	}
	
?>