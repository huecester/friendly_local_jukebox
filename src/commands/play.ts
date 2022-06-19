import { AudioPlayerStatus, StreamType, VoiceConnectionStatus, createAudioPlayer, createAudioResource, entersState, joinVoiceChannel } from '@discordjs/voice';
import { CommandInteraction, GuildMember } from 'discord.js';
import { ChannelType } from 'discord-api-types/v10';
import { SlashCommandBuilder } from '@discordjs/builders';

const player = createAudioPlayer();

function getChannelId(interaction: CommandInteraction): string | null {
	const optionId = interaction.options.getChannel('voice_channel')?.id;
	if (optionId) {
		return optionId;
	} else if (interaction.member instanceof GuildMember) {
		const memberId = interaction.member.voice.channel?.id;
		return memberId ?? null;
	} else {
		return null;
	}
}

export default {
	command: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Play a song in a voice channel.')
		.setDMPermission(false)
		.addStringOption(option =>
			option
				.setName('query')
				.setDescription('Song to play.')
				.setRequired(true)
		)
		.addChannelOption(channelOption =>
			channelOption
				.setName('voice_channel')
				.setDescription('Voice channel to join.')
				.addChannelTypes(ChannelType.GuildVoice)
		),
	async execute(interaction: CommandInteraction) {
		interaction.deferReply();
		if (!interaction.guildId || !interaction.guild) return;

		const channel = getChannelId(interaction);
		if (!channel) {
			console.error('No channel found.');
			interaction.reply('No channel could be found. Either join one or use a valid voice channel ID.');
			return;
		}

		const connection = joinVoiceChannel({
			channelId: channel,
			guildId: interaction.guildId,
			adapterCreator: interaction.guild.voiceAdapterCreator,
		});

		try {
			await entersState(connection, VoiceConnectionStatus.Ready, 30000);
		} catch (err) {
			connection.destroy();
			console.error(err);
			interaction.reply('There was an error connecting to the voice channel.');
			return;
		}

		connection.subscribe(player);

		const resource = createAudioResource('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', {
			inputType: StreamType.Arbitrary,
		});

		player.play(resource);

		try {
			await entersState(player, AudioPlayerStatus.Playing, 5000);
			interaction.reply('Playing song.');
		} catch (err) {
			console.error(err);
			interaction.reply('There was an error playing audio.');
			connection.destroy();
		}
	}
};