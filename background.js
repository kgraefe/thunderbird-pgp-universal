messenger.messageDisplay.onMessageDisplayed.addListener(async(tab, message) => {
	messenger.messages.getRaw(message.id).then((binaryString) => {
		attachments = {};

		isPGPUniversal = false;
		plaintextName = null;

		binaryString.split(/(?<!;)\r\n/g).every((line) => {
			if (line.startsWith("X-PGP-Universal: processed")) {
				isPGPUniversal = true;
			}
			if (!isPGPUniversal) {
				if (line == "") {
					/* We processed all mail headers and did not find a trace
					 * of PGP Universal. Stop here.
					 */
					return false;
				}
				return true;
			}

			if (line.startsWith("X-Content-PGP-Universal-Saved-Content-Description: ")) {
				plaintextName = line.substring( line.indexOf(" ") + 1 );
			}
			if (line.startsWith("X-Content-PGP-Universal-Saved-Content-Type: text/calendar")) {
				plaintextName = "Event.ics"
			}
			if (plaintextName == null) {
				return true;
			}
			if (line.startsWith("Content-Type: ")) {
				fileName = line.split("\"")[1];
				attachments[fileName] = plaintextName + ".pgp";
				plaintextName = null;
			}
			return true;
		});

		if (isPGPUniversal) {
			console.log(attachments);
			messenger.renameattachments.setReplacements(attachments);
		}
	});
});
