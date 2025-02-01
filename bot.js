const { Client, GatewayIntentBits } = require("discord.js");
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require("@discordjs/voice");
const ytdl = require("@distube/ytdl-core");
const ytSearch = require("yt-search");
let connection;

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates,
	]
});

client.once("ready", () => {
	console.log(`${client.user.tag} online!`);
});

client.on("messageCreate", async (message) => {
	if (message.author.bot) return;
	
	if (message.content.startsWith("!play ")) {
		const query = message.content.split("!play ")[1];
		if (!query) return;
		
		let url = query;
		
		if (!query.match(/^https?:\/\//)) {
			const result = await ytSearch(query);
			url = result?.videos[0]?.url;
		}
		
		if (!url) {
			message.channel.reply("Nenhuma música encontrada!");
			return;
		}
		
		connection = joinVoiceChannel({
			channelId: message.member.voice.channel.id,
			guildId: message.guild.id,
			adapterCreator: message.guild.voiceAdapterCreator,
		});
		
		const player = createAudioPlayer();
		connection.subscribe(player);
		playMusic(url, player);
		
		player.on(AudioPlayerStatus.Idle, () => {
			playMusic(url, player);
		});
		
		message.channel.send(`Tocando: ${url}`);
	}
	else if (message.content.startsWith("!stop")) {
		connection?.destroy();
	}
});

client.login("DiscordToken");

function playMusic(url, player) {
	const stream = ytdl(url, {
		filter: "audioonly",
		quality: "highestaudio",
		fmt: "mp3",
		dlChunkSize: 0,
		highWaterMark: 1 << 62,
		liveBuffer: 1 << 62,
		bitrate: 128
	});
	const resource = createAudioResource(stream);
	player.play(resource);
}