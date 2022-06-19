import 'dotenv/config';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { join } from 'path';
import getCommands from './util/getCommands';

const token = process.env.DISCORD_BOT_TOKEN ?? '';
const clientId = process.env.DISCORD_CLIENT_ID ?? '';

const commands = (await getCommands(join(__dirname, 'commands'))).map(command => command.command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

console.log('Starting refresh of application commands.');

try {
	await rest.put(
		Routes.applicationCommands(clientId),
		{ body: commands },
	);
	console.log('Successfully refreshed application commands.');
} catch (err) {
	console.error(err);
}