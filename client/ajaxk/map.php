<?php
	include '../config.php';
	
	if(isset($_GET['map'])){
		GetMap($mysql,strip_tags($_GET['map']));
		die();
	}elseif(isset($_GET['tilesets'])){
		$map = $mysql->query("select * from resources where type = 'tileset' order by id");
		while($row = $mysql->fetch_array($map)){
			$output .= $row['name'] . ":" . $row['width'] . ":" . $row['height'] . ",";
		}
		echo trim($output,',');
		die();
	}elseif(isset($_GET['newmap'])){
		NewMap($mysql,strip_tags($_GET['newmap']));
		die();
	}elseif(isset($_GET['maplist'])){
		GetMapList($mysql);
		die();
	}
	
	function GetMap($mysql,$id){
		/* !!!!!!!! Setup new account row for the active player in the account.
		Load the active player, get the players current map and coordinates.
		Get the maps navigate ids and check against $id here and adjust the
		player location according to the direction */
		$map = $mysql->query("select * from map where id = $id",true);
		if($map['id'] != ''){
			echo $map['id'] . ":" . $map['title'] . ":" . $map['floor'] . ":" . $map['mask'] . ":" . $map['mask2'] . ":" . $map['fringe'] . ":" . $map['fringe2'] . ":" . $map['animated'] . ":" . $map['attributes'] . ":" . $map['tileset'] . ":" . $map['music'] . ':' . $map['navigate'];
		}
	}
	
	function NewMap($mysql,$data){
		
		$data = base64_decode($data);
		echo $data;
		$data = explode(':',$data);
		
		$id = $data[0];
		$title = $data[1];
		$floor = $data[2];
		$mask = $data[3];
		$mask2 = $data[4];
		$fringe = $data[5];
		$fringe2 = $data[6];
		$animated = $data[7];
		$block = $data[8];
		$tileset = $data[9];
		$music = $data[10];
		$navigate = $data[11];
		
		$map = mysql_query("select * from map where id = $id") or die('error');
		if(mysql_num_rows($map) > 0){
			$map = $mysql->query("update map set title='$title',floor='$floor',mask='$mask',mask2='$mask2',fringe='$fringe',fringe2='$fringe2',animated='$animated',attributes='$block',tileset='$tileset',music=$music,navigate='$navigate' where id = $id",false);
		}else{
			$map = $mysql->query("insert into map (id,title,floor,mask,mask2,fringe,fringe2,animated,attributes,tileset,music,navigate) values ($id,'$title','$floor','$mask','$mask2','$fringe','$fringe2','$animated','$block','$tileset',$music,'$navigate')",false);
		}
	}
	
	function GetMapList($mysql){
		$map = $mysql->query("select * from map order by id asc");
		while($row = $mysql->fetch_array($map)){
			echo '<option value="'.$row['id'].'">'.$row['id'].': '.$row['title'].'</option>';
		}
	}

?>