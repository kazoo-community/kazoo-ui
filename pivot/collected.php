<?php

header('content-type:application/json');

$dtmf = $_REQUEST['Digits'];

if ( empty($dtmf) ) {
?>

{"module":"tts"
 ,"data":{"text":"We didn't get that","voice":"female","language":"en-US","engine":"ispeech"}
 ,"children":{}
}

<?php } else if ( is_string($dtmf) ) { ?>

  {"module":"tts"
 ,"data":{"text":"You typed <?= $dtmf ?>","voice":"female","language":"en-US","engine":"ispeech"}
 ,"children":{}
}

<?php } else { ?>

  {"module":"kvs_set"
 ,"data":{"key":"some key","value":"some value"}
 ,"children":{
 	"_":{
  		"module":"tts"
 		,"data":{"text":"You typed <?= $dtmf['custom_name'] ?>","voice":"female","language":"en-US","engine":"ispeech"}
 		,"children":{}
 	}
 }
}

<?php } ?>

<?php

header('content-type:application/json');

$fp = fopen('/tmp/data.txt', 'a');
fwrite($fp, print_r($_REQUEST, true));
fclose($fp);

?>
