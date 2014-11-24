<?php

require 'vendor/autoload.php';

$json_string = json_encode($_POST);

$file_handle = fopen('/tmp/webhookpost.json', 'a');
fwrite($file_handle, $json_string);
fwrite($file_handle, "\r\n");
fclose($file_handle);

use GorkaLaucirica\HipchatAPIv2Client\Auth\OAuth2;
use GorkaLaucirica\HipchatAPIv2Client\Client;
use GorkaLaucirica\HipchatAPIv2Client\API\RoomAPI;
use GorkaLaucirica\HipchatAPIv2Client\API\UserAPI;


//$auth = new OAuth2('vCFSkIgybYU0QUQlIsQRv9PNoJLocU2Xlgc2G9S6');
$auth = new OAuth2('erbG7hbaqvCXnFU6J3ORnIeGzOY6kwkPottV0mU5');
$client = new Client($auth);

$roomAPI = new RoomAPI($client);

$msg = "From: ". $_POST['from'] ."<br>To: ". $_POST['to'] ."<br>Account: ". $_POST['account_id'];


$to = explode("@", $_POST['to']);
$from = explode("@", $_POST['from']);

$update = false;

switch ($_POST['hook_event']) {
	case 'channel_create':
		$color = 'yellow';
		break;
	case 'channel_answer':
		$color = 'green';

                if ($to[0] == '6046383851') { $talking_to = $from[0]; $status = "dnd"; $update = true; $msg .= "talking to ".$talking_to; }
		if ($to[0] == '1002') { $talking_to = $from[0]; $status = "dnd"; $update = true; $msg .= "talking to ".$talking_to; }
                if ($to[0] == 'user_9qswhl') { $talking_to = $from[0]; $status = "dnd"; $update = true; $msg .= "talking to ".$talking_to; }
                if ($from[0] == 'user_9qswhl') { $talking_to = $to[0]; $status = "dnd"; $update = true; $msg .= "talking to ".$talking_to;}
		if ($from[0] == '1002') { $talking_to = $to[0]; $status = "dnd"; $update = true; $msg .= "talking to ".$talking_to;}
                if ($from[0] == '6046383851') { $talking_to = $to[0]; $status = "dnd"; $update = true; $msg .= "talking to ".$talking_to;}
		
		break;
	case 'channel_destroy':
		$color = 'red';

                if ($to[0] == '6046383851') { $talking_to = null; $status = "chat"; $update = true; $msg .= "talking to ".$talking_to; }
                if ($to[0] == '1002') { $talking_to = null; $status = 'chat'; $update = true;$msg .= "talking to ".$talking_to;}
                if ($to[0] == 'user_9qswhl') { $talking_to = null; $status = 'chat'; $update = true;$msg .= "talking to ".$talking_to;}
                if ($from[0] == 'user_9qswhl') { $talking_to = null; $status = 'chat'; $update = true;$msg .= "talking to ".$talking_to;}
                if ($from[0] == '1002') { $talking_to = null; $status = 'chat'; $update = true;$msg .= "talking to ".$talking_to;}
                if ($from[0] == '6046383851') { $talking_to = null; $status = 'chat'; $update = true;$msg .= "talking to ".$talking_to;}

		break;
	default:
		$color = 'gray';
		break;
}

if ( $talking_to == "*97" ) $talking_to = "Voicemail";

$messageData = array('message' => $msg,
		'notify' => false,
		'color' => $color);

$messageAPI = new GorkaLaucirica\HipchatAPIv2Client\Model\Message($messageData);

$room = $roomAPI->sendRoomNotification(60187, $messageAPI);

if ( $update == TRUE ) {

	$userauth = new OAuth2('vCFSkIgybYU0QUQlIsQRv9PNoJLocU2Xlgc2G9S6');
	$newclient = new Client($userauth);
	$userAPI = new UserAPI($newclient);
	$user = $userAPI->getUser('dayton@voxter.ca');
	
	$newuser = $user->toJson();

	if  ($status != "chat") {
		$newuser['presence']['status'] = "On le phone w/ ".$talking_to;
	} else {
	        $newuser['presence']['status'] = "";	
	}
	$newuser['presence']['show'] = $status;

	$updateduser = new GorkaLaucirica\HipchatAPIv2Client\Model\User($newuser);
	
	$file_handle = fopen('/tmp/webhook.json', 'a');
	fwrite($file_handle, "user: ".print_r($user,true));
	fwrite($file_handle, "userarray: ".print_r($newuser,true));
	fwrite($file_handle, "updateduser: ".print_r($updateduser,true));
	fwrite($file_handle, "\r\n");
	fclose($file_handle);	


	$response = $userAPI->updateUser($updateduser);
}

?>
