<?php
	$count = strlen($argv[0])+1;
	$mapdata = substr(implode($argv," "),$count);
		$mapdata = explode(':',$mapdata);
		
		$mapid = $mapdata[1];
		$mapfloor = explode('-',$mapdata[3]);
		$mapmask = explode('-',$mapdata[4]);
		$mapmask2 = explode('-',$mapdata[5]);
		$mapfringe = explode('-',$mapdata[6]);
		$mapfringe2 = explode('-',$mapdata[7]);
		$mapanimated = explode('-',$mapdata[8]);
		
		$maptiles = array_merge($mapfloor,$mapmask,$mapmask2,$mapfringe,$mapfringe2,$mapanimated);
		$uniquetiles = Array();
		
		foreach($maptiles as $tile){
			$tile = explode('=',$tile);
			$tile = $tile[1];
			
			$alreadygot = false;
			foreach($uniquetiles as $utile){
				if($tile == $utile){ $alreadygot = true; }
			}
			if($alreadygot == false){
				array_push($uniquetiles,$tile);
			}
		}
		
		// Create a new transparent png with the right size and save.
		$tile = imagecreatetruecolor(count($uniquetiles)*32, 32);
		imagesavealpha($tile, true);
		$trans_colour = imagecolorallocatealpha($tile, 0, 0, 0, 127);
		imagefill($tile, 0, 0, $trans_colour);	
		$source = imagecreatefrompng('html/gfx/Tiles.png');
		
		$addcount = 0;
		foreach($uniquetiles as $utile){
			$utile = explode('x',$utile);
			//  imagecopy ( resource $dst_im , resource $src_im , int $dst_x , int $dst_y , int $src_x , int $src_y , int $src_w , int $src_h )
			imagecopyresized($tile,$source,$addcount*32,0,$utile[0]*32,$utile[1]*32,32,32,32,32);
			$addcount++;
		}
		
		$black = imagecolorallocate($tile, 0, 0, 0);
		imagecolortransparent($tile, $black);
		imagepng($tile,'html/gfx/maps/'.$mapid.'.png');
		echo $mapid.".png Created.";
?>