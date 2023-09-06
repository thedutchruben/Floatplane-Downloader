import { defaultSubChannels } from "./lib/defaults.js";
import Subscription from "./lib/Subscription.js";
import { settings, fApi } from "./lib/helpers.js";

export async function* fetchSubscriptions() {
	for (const userSubscription of await fApi.user.subscriptions()) {
		// Add the subscription to settings if it doesnt exist
		settings.subscriptions[userSubscription.creator] ??= {
			creatorId: userSubscription.creator,
			plan: userSubscription.plan.title,
			skip: false,
			channels: defaultSubChannels[userSubscription.creator] ?? [],
		};
		const settingSubscription = settings.subscriptions[userSubscription.creator];

		// Make sure that new subchannels from defaults are added to settings
		if (defaultSubChannels[userSubscription.creator] !== undefined) {
			const channelsToAdd = defaultSubChannels[userSubscription.creator].filter(
				(channel) => settingSubscription.channels.findIndex((chan) => chan.title === channel.title) === -1,
			);
			if (channelsToAdd.length > 0) settingSubscription.channels = [...settingSubscription.channels, ...channelsToAdd];
		}

		const subChannels = await fApi.creator.channels([userSubscription.creator]);
		for (const channel of subChannels) {
			if (settingSubscription.channels.findIndex((chan) => chan.title === channel.title) === -1)
				settingSubscription.channels.push({
					title: channel.title,
					skip: false,
					identifiers: [{ type: "channelId", check: channel.id }],
				});
		}

		if (settingSubscription.skip === true) continue;

		yield new Subscription(settings.subscriptions[userSubscription.creator]);
	}
}
