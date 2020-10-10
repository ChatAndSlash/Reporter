"use strict";

const Log       = require('./log');
const Amplitude = require('./amplitude');

const EVENT_QUEUE = 'event_queue';

class Reporter
{
	/**
	 * Initialize bot.
	 *
	 * @param {string} mqUrl - The URL to use when connecting to the MQ.
	 */
	constructor(mqUrl)
	{
		this.mqUrl = mqUrl;
		this.amqp  = require('amqplib');

		this.amplitude = new Amplitude(process.env.AMPLITUDE_API_TOKEN);
	}

	/**
	 * Connect to Slack and get things started.
	 */
	async connect()
	{
		Log.info('Connecting to MQ...');
		this.mqConnection = await this.amqp.connect(this.mqUrl);

		await this.listenToQueue(EVENT_QUEUE);
	}

	/**
	 * Listen to a specific queue.
	 *
	 * @param {string} name - The name of the queue to listen to.
	 */
	async listenToQueue(name)
	{
		const ch = await this.mqConnection.createChannel();
		ch.assertQueue(name);
		Log.info(`Connected to queue ${name}.`);
		ch.consume(name, this.onConsume.bind(this), { noAck: true });
	}

	/**
	 * Consume a queue message.
	 *
	 * @param {object} message - The message to consume.
	 */
	async onConsume(message)
	{
		try {
			const decoded = JSON.parse(message.content.toString());
			await this.processQueueMessage(decoded);
		} catch (e) {
			Log.error(e);
			Log.error(message.content.toString());
			throw e;
		}
	}

	/**
	 * Process a message from the queue, sending it to event tracking services.
	 *
	 * @param object message The message from the queue.
	 */
	async processQueueMessage(message)
	{
		await this.amplitude.track(message);
	}
}

module.exports = Reporter;