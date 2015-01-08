<?php

/*

    [User-ID] => 867428070135cd335ddc640bc7643cfc
    [Caller-ID-Number] => 1002
    [Caller-ID-Name] => Dayton Turner
    [Direction] => inbound
    [ApiVersion] => 2013-05-01
    [ToRealm] => voxteroffice.voxter.sip.voxter.com
    [To] => *990
    [FromRealm] => voxteroffice.voxter.sip.voxter.com
    [From] => 1002
    [Account-ID] => 043a546e37a2e2caa151f91c50d701f5
    [Call-ID] => N2JjZDgyZTk2ZWU2NDY3MDU0ZDc4MjIwNGNjY2Q0MWI.

*/

header('content-type:application/json');

$api_url = "https://devapi.voxter.com:8443";
$userid = $_REQUEST['User-ID'];
$accountid = $_REQUEST['Account-ID'];
//$groupid = "490eed0fd7005b038d8d143e51927960";
$groupid = $_REQUEST['GroupID'];

// Get Auth Token
//
$request = array ("api_key" => "37268811e4952e186762da6fe24bcb9dadf9b3353ef33a336f3e9e43f2d9aeb5");
$data = json_encode(array ("data" => $request));

$api = curl_init($api_url ."/v1/api_auth");
curl_setopt($api, CURLOPT_CUSTOMREQUEST, "PUT");
curl_setopt($api, CURLOPT_RETURNTRANSFER, true);
curl_setopt($api, CURLOPT_HTTPHEADER, array(
  'Content-Type: application/json'));
curl_setopt($api, CURLOPT_POSTFIELDS, $data);

$result = curl_exec($api);

$decoded_result = json_decode($result, true);

$api_key = $decoded_result['auth_token'];

// Get Group
//

$api = curl_init($api_url ."/v1/accounts/".$accountid."/groups/".$groupid);
curl_setopt($api, CURLOPT_RETURNTRANSFER, true);
curl_setopt($api, CURLOPT_HTTPHEADER, array(
  'Content-Type: application/json',
  'X-Auth-Token: '. $api_key));

$result = curl_exec($api);

$decoded_result = json_decode($result, true);

$dataarray = $decoded_result['data'];

// Set Group
//

if (array_key_exists($userid, $dataarray['endpoints'])) {
  $user_exists = true;

  unset($dataarray['endpoints'][$userid]);

  $data = json_encode(array ("data" => $dataarray));

  $api = curl_init($api_url."/v1/accounts/".$accountid."/groups/".$groupid);
  curl_setopt($api, CURLOPT_CUSTOMREQUEST, "POST");
  curl_setopt($api, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($api, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'X-Auth-Token: '. $api_key));
  curl_setopt($api, CURLOPT_POSTFIELDS, $data);

  $result = curl_exec($api);
  $decoded_result = json_decode($result, true);
?>
  {"module":"play"
   ,"data":{"id":"http://awe01.van1.voxter.net:15984/system_media/agent-logged_out/agent-logged_out.wav"}
    ,"children":{}
  }
<?php

} else {
  $user_exists = false;
?>
  {"module":"play"
   ,"data":{"id":"http://awe01.van1.voxter.net:15984/system_media/agent-invalid_choice/agent-invalid_choice.wav"}
    ,"children":{}
  }
<?php
}

// Check to make sure the userid isnt already in the list, and if not,
// modify "endpoints" to contain subarray "_userid_" : [ "type" : "user" ]
// else just abort with an error message.

$fp = fopen('/tmp/pivot.txt', 'w');
fwrite ($fp, 'UserID: '. $userid);
fwrite ($fp, 'APIKEY: '. $api_key);
fwrite ($fp, 'Result: '.print_r($decoded_result, true));
fclose ($fp);


?>
