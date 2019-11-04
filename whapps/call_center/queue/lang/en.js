window.translate['queue'] = {
	caller_exit_key: 'Caller Exit Key',
	caller_exit_key_data_content: 'Key caller can press while on hold to exit the queue and continue in the callflow.',
	manage_queues: "Manage Queues",
	queue: "Queue",
	queue_tip: "Direct a Caller to a Queue.",
	queue_login: "Queue Login",
	queue_login_tip: "!",
	queue_logout: "Queue Logout",
	queue_logout_tip: "!",
	agent_pause: "Agent Pause",
	agent_pause_tip: "!",
	agent_resume: "Agent Resume",
	agent_resume_tip: "!",
	logout_agent: "Logout Agent",
	logout_agent_tip: "!",
	login_agent: "Login Agent",
	login_agent_tip: "!",
	agent_availability: "Agent Availability",
	agent_availability_tip: "Conditionally branch callflow based on availability of queue agents",
	required_skills: "Required Agent Skills",
	required_skills_tip: "Add and remove skills required by call center agents answering the call",
	set_call_priority: "Set Call Priority",
	set_call_priority_tip: "Set the priority of the call in call center queues",
	wait_time: "Wait Time",
	wait_time_tip: "Conditionally branch callflow based on the current average wait time for a queue",
	connect_a_caller_to_a_queue: "Connect a caller to a queue...",
	queue_title: "Queue",
	connects_an_agent_to_a_queue: "Connects an agent to a queue...",
	disconnects_an_agent_from_a_queue: "Disconnects an agent from a queue...",
	pause_agent: "Pause Agent",
	pause_duration: "Pause Duration (s)",
	presence_id: "Presence ID",
	optional: "Optional",
	pause_agent_title: "Pause Agent",
	agent: "Agent",
	login_agent_title: "Login Agent",
	resume_action: "Resume",
	agent_resume_title: "Agent Resume",
	logout_action: "Logout",
	logout_agent_title: "Logout Agent",
	agent_availability_title: "Conditionally branch callflow based on agent availability",
	agent_availability_explanation: "Calls that require a specific set of agent skills will consider only those skills for determining agent availability.",
	agent_availability_status: "Availability",
	required_skills_title: "Add/Remove Required Agent Skills",
	required_skills_explanation: "Add and remove skills required by agents answering the call. This module supplements previously set skills on the call.",
	remove_skills_explanation: "Use this section to remove skills that may have been set earlier in the callflow execution.",
	skill_placeholder: "Skill",
	add: "Add",
	remove: "Remove",
	availability_available: "Available",
	availability_unavailable: "Unavailable",
	set_call_priority_explanation: "Assign a priority to the call. The priority affects the position that the call takes in a call center queue. Higher priority calls will always be inserted above lower priority calls.",
	call_priority: "Call Priority",
	call_priority_validation_error: "Call Priority must be between 0 and 255",
	wait_time_title: "Conditionally branch callflow based on the current average wait time",
	wait_time_explanation: "Select a queue and a window over which to calculate the average wait time. A shorter window will respond more quickly to easing in call volume. A longer window will smooth out the effects of outlier calls with long wait times. Calls that require a specific set of agent skills will consider only those skills for calculating the average wait time.",
	wait_time_key_explanation: "Select \"Threshold\" and define a threshold (in seconds) to compare with the current average wait time. The callflow will follow the branch with the highest threshold exceeded by the current average wait time. Select \"Default\" to define a branch to follow when none of the defined thresholds are exceeded.",
	window: "Window",
	minutes: "minutes",
	hours: "hours",
	threshold: "Threshold",
	default: "Default",
	default_disabled: "Default (disabled - already defined)",
	login_action: "Login",
	edit_queue: "Edit Queue",
	create_queue: "Create Queue",
	basic: "Basic",
	advanced: "Advanced",
	queue_configuration: "Queue Configuration",
	notifications: "Notifications",
	name: "Name",
	name_data_content: "Friendly name for this Queue",
	call_recording: "Call Recording",
	call_recording_enabled: "Enabled",
	call_recording_data_content: "You can also change individual agent's recording settings under the Agent's section",
	music_on_hold: "Music on Hold",
	music_on_hold_data_content: "Select the media file that you want to be played by default when it's not set on a user or a device.",
	edit: "Edit",
	create: "Create",
	strategy: "Strategy",
	strategy_data_content: "The queue strategy for connecting agents to caller",
	round_robin: "Round Robin",
	most_idle: "Most Idle",
	skills_based_round_robin: "Skills-Based Round Robin",
	call_recording_url: "URL",
	call_recording_url_data_content: "URL pointing to a server that will host the recording of the calls processed by this queue.",
	call_wrapup_time: "Call Wrap-up Time (s)",
	call_wrapup_time_data_content: "Automatic break time between calls for the agents in this queue.",
	max_number_of_calls: "Max Number of Calls",
	max_number_of_calls_data_content: "How many callers are allowed to wait on hold in the queue (0 for no limit).",
	max_hold_time: "Max Hold Time (s)",
	max_hold_time_data_content: "In seconds, how long to try to connect the caller before progressing past the queue callflow action (0 for no limit).",
	allows_a_caller_to_enter_this_queue: "Allows a caller to enter this queue when no agents are available.",
	hide_queue_in_dashboard: "Hide queue in dashboard",
	notification_on_hangup: "Notification on Hangup",
	notification_on_hangup_data_content: "URL for a callback when the call ends to tell the customer on their own servers that a call has ended.",
	notification_after_pickup: "Notification after Pickup",
	notification_after_pickup_data_content: "URL for a callback when the call is picked up to tell the customer on their own servers that a call has been picked up.",
	method: "Method",
	method_data_content: "What HTTP method to use",
	delete: "Delete",
	save: "Save",
	add_agents: "Add Agents",
	selected_agents: "Selected Agents",
	create_new_agent: "Create new agent",
	search_existing_agents: "Search existing agents by name",
	agents_records_of: "Agents & Records of",
	edit_settings: "Edit settings",
	dashboard: "Dashboard",
	agents: "Agents",
	call_center: "Call-Center",
	missed_calls_logout: "Missed Calls Logout",
	sets_the_number_of_consecutive: "Sets the number of consecutive missed calls before logging out an agent. NOTE: Changes to this setting only take effect after the agent logs out and back in.",
	default_music: "Default Music",
	silence: "Silence",
	there_were_errors_on_the_form: "There were errors on the form, please correct!",
	this_will_remove_this_queue: "This will remove this queue and all the agents and reports attached to this queue as well. Are you sure you want to delete it?",
	no_name: "(no name)",
	add_acd: "Add ACD",
	select_agents: "Select Agents",
	you_didnt_select_any_agent: "You didn\'t select any agent.",
	call_id_title: "Call-ID",
	duration_title: "Duration",
	agent_title: "Agent",
	recorded_at_title: "Recorded at",
	actions_title: "Actions",
	remove_selected_agents: "Remove Selected Agents",
	edit_queue_title: "Edit Queue",
	call_center_category: "Call-Center",
	seconds: " seconds",
	please_enter_a_valid_number_of_seconds: "Please enter a valid number of seconds. It needs to be greater than 0.",
	position_announcements_enabled: "Enable periodic position announcements to caller.",
	wait_time_announcements_enabled: "Enable periodic average wait time announcements to caller.",
	announcements_interval: "Announce Time (s)",
	announcements_interval_data_content: "Time between position and wait time announcements.",
	route_var_ccv: "Route Variable",
	callbacks: "Callbacks",
	enabled: "Enabled",
	callbacks_permitted_from: "Callbacks Permitted From",
	allow: "Allow",
	deny: "Deny"
};
