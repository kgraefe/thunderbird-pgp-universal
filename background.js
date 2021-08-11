function handleMessagePart(part, attachements) {
	console.log(part);
		console.log(attachements);

	if (part.hasOwnProperty("name")) {
		if (part.name in attachements) {
			part.contentType = attachements[part.name]["content-type"];
			part.name = attachements[part.name]["name"];
		}
	}

	if (part.hasOwnProperty("parts")) {
		part.parts.forEach((part) => {
			handleMessagePart(part, attachements);
		});
	}
}

messenger.messageDisplay.onMessageDisplayed.addListener(async(tab, message) => {
	//messenger.messages.getFull(message.id).then(handleMessagePart);
	messenger.messages.getRaw(message.id).then((binaryString) => {
		description = null;
		attachements = Array();
		binaryString.split(/(?<!;)\r\n/g).forEach((line) => {
			if (line.startsWith("X-Content-PGP-Universal-Saved-Content-Description: ")) {
				description = line.split(" ", 2)[1];
			}
			if (description == null) {
				return;
			}
			if (line.startsWith("X-Content-PGP-Universal-Saved-Content-Type: ")) {
				contentType = line.split(/[ ;]/)[1];
				fileName = line.split("\"")[1];
				attachements[fileName] = {
					"name": description,
					"content-type": contentType
				};
			}
		});

		console.log(attachements);

		messenger.messages.getFull(message.id).then((part) => {
			handleMessagePart(part, attachements);
		});
	});
});
