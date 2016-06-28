<?php

// Slack URL
define("SLACK_URL", "https://hooks.slack.com/services/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");

// Zendesk email address
define("ZENDESK_EMAIL", "support@voxter.com");

// Incoming request payload
$request = json_decode(file_get_contents("php://input"));

// Die on invalid JSON payload
if($request === null) {
    http_response_code(500);
    header("Content-Type: application/json");
    echo json_encode((object)[
        "status" => "error",
        "data"   => (object)[
            "message" => "Invalid payload."
        ]
    ]);
    die();
}

// Break down the payload
$account = $request->data->account;
$extensions = $request->data->extensions;

// Build the Slack POST payload
$slack_post = (object)[
    "attachments" => [
        (object)[
            "fallback" => "A signup request was received!",
            "pretext"  => "A signup request was received!",
            "text"     => $extensions[0]->user->first_name . " " . $extensions[0]->user->last_name . " (" . $extensions[0]->user->email . ") has requested an account with the following details:",
            "color"    => "good",
            "fields"   => [
                (object)[
                    "title" => "Date/Time",
                    "value" => date("Y-m-d H:i:s"),
                    "short" => false
                ],
                (object)[
                    "title" => "Remote IP Address",
                    "value" => $_SERVER["REMOTE_ADDR"],
                    "short" => false
                ],
                (object)[
                    "title" => "Account Name",
                    "value" => ucfirst($account->name),
                    "short" => false
                ],
                (object)[
                    "title" => "Account Type",
                    "value" => ucfirst($account->role),
                    "short" => false
                ]
            ]
        ]
    ]
];

// Add the extensions
foreach($extensions as $ext) {
    if(!isset($ext->user) || !isset($ext->callflow)) continue;
    if(!isset($ext->user->first_name) || count($ext->callflow->numbers) < 1) continue;

    $slack_post->attachments[0]->fields[] = (object)[
        "title" => ucfirst($ext->user->priv_level) . " Extension " . implode(",", $ext->callflow->numbers),
        "value" => $ext->user->first_name . (isset($ext->user->last_name) ? " {$ext->user->last_name}" : ''),
        "short" => false
    ];
}

// Send notification to Slack first
$curl = curl_init();
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_USERAGENT,      'Vortex_2_by_Voxter_Communications');
curl_setopt($curl, CURLOPT_URL,            SLACK_URL);
curl_setopt($curl, CURLOPT_CUSTOMREQUEST,  'POST');
curl_setopt($curl, CURLOPT_POSTFIELDS,     "payload=".json_encode($slack_post));
$result = curl_exec($curl); // TODO: handle the response if an error is encountered
curl_close($curl);

// Send response back to the browser
http_response_code(200);
header("Content-Type: application/json");
echo json_encode((object)[
    "status" => "success",
    "data"   => (object)[
        "message" => "Your request was received successfully. We will be contacting you shortly to complete the signup process!"
    ]
]);

/******* Example JSON payload request *****************

{
    "data": {
        "account": {
            "available_apps": [
                "voip",
                "cluster",
                "userportal",
                "accounts",
                "developer",
                "numbers",
                "pbxs"
            ],
            "name": "Voxter",
            "role": "reseller"
        },
        "extensions": [
            {
                "callflow": {
                    "numbers": [
                        "2001"
                    ]
                },
                "user": {
                    "apps": {
                        "accounts": {
                            "api_url": "http://devapi.voxter.com:8000/v1",
                            "icon": "account",
                            "label": "Sub-Accounts"
                        },
                        "numbers": {
                            "api_url": "http://devapi.voxter.com:8000/v1",
                            "icon": "menu1",
                            "label": "Phone Numbers"
                        },
                        "voip": {
                            "api_url": "http://devapi.voxter.com:8000/v1",
                            "icon": "phone",
                            "label": "Hosted PBX"
                        }
                    },
                    "credentials": "e9794b42630b3912e6967ed01030fa36",
                    "email": "lucas@voxter.com",
                    "first_name": "Lucas",
                    "last_name": "Bussey",
                    "priv_level": "admin"
                }
            },
            {
                "callflow": {
                    "numbers": [
                        "2002"
                    ]
                },
                "user": {
                    "first_name": "Another",
                    "last_name": "",
                    "priv_level": "user"
                }
            },
            {
                "callflow": {
                    "numbers": [
                        "3000"
                    ]
                },
                "user": {
                    "first_name": "Main",
                    "last_name": "",
                    "priv_level": "user"
                }
            },
            {
                "callflow": {
                    "numbers": [
                        "8000"
                    ]
                },
                "user": {
                    "first_name": "Conference",
                    "last_name": "",
                    "priv_level": "user"
                }
            }
        ],
        "phone_numbers": {},
        "ui_metadata": {
            "ui": "kazoo-ui"
        }
    },
    "verb": "PUT"
}