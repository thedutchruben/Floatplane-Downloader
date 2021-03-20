import { settings, fetchFFMPEG } from "./lib/helpers";

import { cookieJar, fApi } from "./lib/FloatplaneAPI";

import { quickStart, validatePlexSettings } from "./quickStart";

import { loginFloatplane } from "./logins";

import { fetchSubscriptionVideos } from "./subscriptionFetching";

import type { Subscription } from "floatplane/user";

import { processVideos } from "./downloader";
import { MyPlexAccount } from "@ctrl/plex";
/**
 * Main function that triggeres everything else in the script
 */
const startFetching = async () => {
	
	// process.stdout.write("> Fetching user subscriptions... ");
	// process.stdout.write("\u001b[36mDone!\u001b[0m\n\n");


	// const processingVideos = processVideos(await fetchSubscriptionVideos(userSubscriptions));

	// await Promise.all(processingVideos);

	// if (processingVideos.length > 0) {
	// 	console.log(`> Processed ${processingVideos.length} videos!`);
	// 	if (settings.plex.enabled) {
	// 		process.stdout.write("> Refreshing plex sections... ");
	// 		const plexApi = await (new MyPlexAccount(undefined, undefined, undefined, settings.plex.token).connect());
	// 		for (const sectionToUpdate of settings.plex.sectionsToUpdate) {
	// 			await (await (await (await (await plexApi.resource(sectionToUpdate.server)).connect()).library()).section(sectionToUpdate.section)).refresh();
	// 		}
	// 		process.stdout.write("\u001b[36mDone!\u001b[0m\n\n");
	// 	}
	// }

	// fApi.sails.on("syncEvent", syncEvent => {
	// 	if (syncEvent.event === "creatorMenuUpdate") {
	// 		syncEvent.
	// 	}
	// });
};

// Async start
(async () => {
	await fetchFFMPEG();
	// Earlybird functions, these are run before script start and not run again if script repeating is enabled.
	if (settings.runQuickstartPrompts) await quickStart();
	settings.runQuickstartPrompts = false;

	// Get Plex details if not saved
	await validatePlexSettings();

	// Get Floatplane credentials if not saved
	if (cookieJar.toJSON().cookies.length === 0 || await fApi.user.subscriptions().catch(err => {
		console.log(`Unable to authenticate with floatplane... ${err.message}`);
		return undefined;
	}) === undefined) {
		console.log("You dont seem to be authenticated! Please login to floatplane...");
		await loginFloatplane();
	}

	await startFetching();
})().catch(err => {
	console.error("An error occurred!");
	console.error(err);
	process.exit(1);
});