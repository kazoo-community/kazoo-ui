<?php

header('content-type:application/json');

$fp = fopen('/tmp/data.txt', 'w');
fwrite($fp, print_r($_REQUEST, true));
fclose($fp);

?>

{"module":"tts"
 ,"data":{"text":"Please enter up to monkey digits.","voice":"female","language":"en-US","engine":"ispeech"}
 ,"children":{
     "_":{
         "module":"collect_dtmf"
         ,"data":{"max_digits":4, "collection_name":"custom_name"}
         ,"children":{
             "_":{
  		"module":"kvs_set"
 		,"data":{"key1":"somethin somethin","another_key":"a somethin somethin more"}
 		,"children":{
        		"_":{
                 		"module":"pivot"
                 		,"data":{"voice_url":"https://awe01.van1.voxter.net/pivot/collected.php","req_format": "kazoo"}
                 		,"children":{}
			}
		}
             }
         }
     }
 }
}
