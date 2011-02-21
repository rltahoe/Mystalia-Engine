<?php
	include '../config.php';
	
	if(isset($_GET['login'])){
		$username = strip_tags($_GET['login']);
		$password = sha1($_GET['password']);
		setcookie("username",$username);
		setcookie("password",$password);
		DoLogin($mysql,$username,$password);
	}else if(isset($_GET['checklogin'])){
		if(isset($_COOKIE['username'])){
			$username = $_COOKIE['username'];
			$password = $_COOKIE['password'];
			DoLogin($mysql,$username,$password);
		}else{ echo "false"; }
	}else if(isset($_GET['register'])){
		$username = strip_tags($_GET['register']);
		$password = strip_tags($_GET['password']);
		$email = strip_tags($_GET['email']);
		$password = sha1($password);
		$row = $mysql->query("select * from accounts = where username = '$username' or email = '$email'");
		if($mysql->num_rows($row) == 0){
			$mysql->query("insert into accounts (username,password,email)values('$username','$password','$email')");
			echo "Successful Registration, Please Login.";
		}else{ echo "An account with these details already exists."; }
	}else if(isset($_GET['logout'])){
		setcookie("username","");
		setcookie("password","");
	}else if(isset($_GET['createcharacter'])){
		$charname = strip_tags($_GET['createcharacter']);
		$class = strip_tags($_GET['class']);
		$username = $_COOKIE['username'];
		$password = $_COOKIE['password'];
		$row = $mysql->query("select * from accounts where username = '$username' and password = '$password'",true);
		if($row['id'] == ""){ die('error'); }
		$row1 = $mysql->query("select * from players where account = ".$row['id']);
		if($mysql->num_rows($row1) == 3){ die('error'); }
		$mysql->query("insert into players (name,sprite,map,position,items,account)values('$charname',120,$start_map,'$start_position','','".$row['id']."')");
		DoLogin($mysql,$username,$password);
	}
	
	function DoLogin($mysql,$username,$password){
		$map = $mysql->query("select id from accounts where username = '$username' and password = '$password' and banned = 0");
		if($mysql->num_rows($map) > 0){
			while($row = $mysql->fetch_array($map)){
				$userid = $row['id'];
				$map = $mysql->query("select * from players where account = $userid");
				if($mysql->num_rows($map) > 0){
					$count = 0;
					while($row2 = $mysql->fetch_array($map)){
						echo '<table style="cursor:pointer;width:100%" onclick="InitiallyLoadPlayer('.$row2['id'].');" onmouseout="$(this).css(\'background-color\',\'transparent\')" onmouseover="$(this).css(\'background-color\',\'#FFFFFF\')"><tr><td width="32"><div style="width:32px;height:32px" id="charselectimg-'.$count.'"></div><div style="display:none" id="charselectsprite-'.$count.'">'.$row2['sprite'].'</div></td><td>'.$row2['name'].'</td></tr></table>';
						$count++;
					}
				}else{ echo "No Characters."; }
			}
		}else{ echo 'false'; }
	}
?>