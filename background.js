messenger.messageDisplay.onMessageDisplayed.addListener(async(tab, message) => {
	messenger.messages.getRaw(message.id).then((rawmsg) => {
		messenger.pgpuniversal.parseMessage(rawmsg);
	});
});
