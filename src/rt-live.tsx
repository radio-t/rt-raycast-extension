import { showHUD, showToast, Toast } from "@raycast/api";
import { streamLive, play } from "./utils";

export default async function Command() {
  try {
    const now = new Date();
    const currentDay = now.getUTCDay();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();

    // Calculate the start and end time of the show
    const isSaturday = currentDay === 6;
    const showStartHour = 20;
    const showDurationHours = 3;

    // Check if the show is currently live
    const isShowTime = isSaturday &&
      ((currentHour === showStartHour && currentMinute >= 0) ||
       (currentHour > showStartHour && currentHour < showStartHour + showDurationHours));

    if (!isShowTime) {
      // Calculate time until next show
      const daysUntilSaturday = (6 - currentDay + 7) % 7;
      const nextShowDate = new Date(now);
      nextShowDate.setUTCDate(nextShowDate.getUTCDate() + daysUntilSaturday);
      nextShowDate.setUTCHours(showStartHour, 0, 0, 0);

      await showHUD(`Next show: ${nextShowDate.toUTCString()}`);
      return;
    }

    // Show is live, let's stream it
    await showToast({ title: "Starting Radio-T live stream...", style: Toast.Style.Animated });

    const streamId = await streamLive();
    if (streamId) {
      // Explicitly call play() to ensure the stream starts
      await play();

      await showHUD("Now streaming Radio-T live");
    } else {
      await showHUD("Failed to start live stream");
    }
  } catch (error) {
    console.error("Error in command:", error);
    if (error instanceof Error) {
      await showHUD(`Error: ${error.message}`);
    } else {
      await showHUD("An unknown error occurred");
    }
  }
}