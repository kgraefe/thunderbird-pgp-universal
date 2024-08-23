function checkParts(parts, replacements) {
	if (!Array.isArray(parts)) {
		return;
	}

	for (let part of parts) {
		checkParts(part.parts, replacements)
		
		// Skip non-attachments.
		if (!part.name) {
			continue;
		}
		let description = part.headers["x-content-pgp-universal-saved-content-description"];
		if (Array.isArray(description) && description.length > 0) {
			replacements.set(part.name,`${part.headers["x-content-pgp-universal-saved-content-description"][0]}.pgp`);
			continue;
		}
		let type = part.headers["x-content-pgp-universal-saved-content-type"];
		if (Array.isArray(type) && type.length > 0 && type[0].startsWith("text/calendar;")) {
			replacements.set(part.name, "Event.ics.pgp");
		}
	}
}

messenger.messageDisplay.onMessageDisplayed.addListener(async (tab, message) => {
	let full = await messenger.messages.getFull(message.id, {decrypt: true});
	let isPgpUniversal = full.headers["x-pgp-universal"]?.length > 0
	if (!isPgpUniversal) {
		return;
	}
	
	let replacements = new Map();
	checkParts(full.parts, replacements);
	if (replacements.size == 0) {
		return;
	}
	await messenger.Attachments.updateNames(tab.id, replacements);
});
