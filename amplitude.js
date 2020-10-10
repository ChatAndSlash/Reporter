"use strict";

const Log       = require('./log');
const Amplitude = require('amplitude');
const nanoid    = require('nanoid');

const TRACKED_MESSAGES = [
	// General
	'Workspace Install',
	'Fight End',
	'Profile',
	'Equipment Purchased',
	'Premium Purchase',
	'Train Stat',
	'Train Skill',
	'Train Mastery',
	'Improve Mastery',
	'Purchase Scales',
	'Cursed Chest',
	'Crier Message Purchased',
	'Newsletter Signup',

	// Tyrose
	'Find Apprentice',
	'Discover Lair',
	'Find Pet Collar',
	'Find Ringmakers Tools',
	'Discover Cave',
	'Green Dragon Killed',

	// Scatterslide
	'Explode Quarry Entrance',
	'Repair Mine Elevator',
	'Unlock Underdrift Door',
	'Rebuild Scatterslide Blacksmith',
	'Rebuild Scatterslide Artificer',
	'Brown Dragon Killed',

	// Watermoon - Rumble
	'Shadow Lesser Defeated',
	'Drunken Master Defeated',
	'Jackie Mann Defeated',
	'Shadow Greater Defeated',
	'Red Dragon Killed',

	// Watermoon - Scholar
	'Empusa Defeated',
	'Gorgon Defeated',
	'Minotaur Defeated',
	'Black Dragon Killed',

	// Watermoon - Mystic
	'Portal Opened',
	'Open Catacombs',
	'Blackpool Prime Defeated',
	'Tentacled Demigod Defeated',
	'Grand Lich Defeated',
	'Necrodragon Killed',
];

const CUSTOM_EVENTS = {
	'Profile': 'formatProfileEventData',
	'Workspace Install': 'formatWorkspaceInstallEventData',
};

const CUSTOM_ACTIONS = {
	'Profile': 'identify',
};

class Tracker
{
	constructor(apiToken, trackedMessages = TRACKED_MESSAGES, customEvents = CUSTOM_EVENTS, customActions = CUSTOM_ACTIONS)
	{
		this.amplitude = new Amplitude(apiToken);
		this.trackedMessages = trackedMessages;
		this.customEvents = customEvents;
		this.customActions = customActions;
	}

	/**
	 * Only certain events are reported.
	 *
	 * @param {string} event - The event to check.
	 *
	 * @return {boolean}
	 */
	isEventTracked(event)
	{
		return this.trackedMessages.includes(event);
	}

	/**
	 * Certain events generate their own custom options.
	 *
	 * @param {string} event - The event to check.
	 *
	 * @return {boolean}
	 */
	hasCustomOptions(event)
	{
		return ! _.isUndefined(this.customEvents[event]);
	}

	/**
	 * Certain events aren't tracked, but have a custom action.
	 *
	 * @param {string} even - The even to check.
	 *
	 * @return {boolean}
	 */
	hasCustomAction(event)
	{
		return ! _.isUndefined(this.customActions[event]);
	}

	/**
	 * Track a message with Calc.io.
	 *
	 * @param {object} message - The message to track.
	 */
	async track(message)
	{
		if ( ! this.isEventTracked(message.event)) {
			return;
		}

		try {
			const data = this.hasCustomOptions(message.event)
				? this[this.customEvents[message.event]](message)
				: this.formatEventData(message);

			if (this.hasCustomAction(message.event)) {
				await this.amplitude[this.customActions[message.event]](data);
			}
			else {
				await this.amplitude.track(data);
			}
		}
		catch (e) {
			Log.error(e);
		}
	}

	/**
	 * Format event data in a way that Amplitude is expecting.
	 *
	 * @param {object} message - The message to convert into Amplitude data format.
	 *
	 * @return {object}
	 */
	formatEventData(message)
	{
		return {
			event_type: message.event,
			user_id: message.character_id,
			event_properties: message.fields
		};
	}

	/**
	 * Format profile event data in a way that Amplitude is expecting.
	 *
	 * @param {object} message - The message to convert into request options.
	 *
	 * @return {object}
	 */
	formatProfileEventData(message)
	{
		return {
			user_id: message.character_id,
			user_properties: {
				name: message.fields.name,
				email: message.fields.email,
			},
		};
	}

	/**
	 * Format Workspace Install event data in a way that Amplitude is expecting.
	 *
	 * @param {object} message - The message to convert into request options.
	 *
	 * @return {object}
	 */
	formatWorkspaceInstallEventData(message)
	{
		return {
			event_type: message.event,
			user_id: nanoid(),
			event_properties: {
				team_name: message.fields.name,
			},
		};
	}
}

module.exports = Tracker;