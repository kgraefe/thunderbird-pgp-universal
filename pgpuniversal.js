const { AddonManager } = ChromeUtils.import(
	"resource://gre/modules/AddonManager.jsm"
);
const EnigmailMsgRead = ChromeUtils.import(
  "chrome://openpgp/content/modules/msgRead.jsm"
).EnigmailMsgRead;

var { MimeParser } = ChromeUtils.import("resource:///modules/mimeParser.jsm");

// Global variables
var Replacements = {};

// Install hook into EnigmailMsgRead.getAttachmentName
var EnigmailGetAttachmentName = EnigmailMsgRead.getAttachmentName;
EnigmailMsgRead.getAttachmentName = function(attachment) {
	if (attachment.name in Replacements) {
		return Replacements[ attachment.name ];
	} else {
		return EnigmailGetAttachmentName(attachment);
	}
};

// Uninstall hook when addon gets disabled
AddonManager.addAddonListener({
	onDisabling(addon, needsRestart) {
		EnigmailMsgRead.getAttachmentName = EnigmailGetAttachmentName;
	}
});

// Implement API
var pgpuniversal = class extends ExtensionCommon.ExtensionAPI {
	getAPI(context) {
		return {
			pgpuniversal: {
				parseMessage(rawmsg) {
					// Parse message
					var msg = MimeParser.extractMimeMsg(rawmsg, {});

					// Check if we got a PGP Universal mail
					if (msg === undefined || !("x-pgp-universal" in msg.headers)) {
						return;
					}

					// Find plaintext attachment names
					Replacements = {}
					for (let attachment of msg.allAttachments) {
						let description = attachment.headers["x-content-pgp-universal-saved-content-description"];
						if (description !== undefined && description.length > 0) {
							Replacements[attachment.name] = MimeParser.parseHeaderField(
								description[0],
								MimeParser.HEADER_OPTION_ALLOW_RAW
									| MimeParser.HEADER_UNSTRUCTURED
									| MimeParser.HEADER_OPTION_DECODE_2047
							);
						} else {
							let type = attachment.headers["x-content-pgp-universal-saved-content-type"];
							if (type !== undefined && type.length > 0 && type[0].startsWith("text/calendar;")) {
								Replacements[attachment.name] = "Event.ics";
							}
						}
					}

					// Update displayed file names in attachment bar
					for (let win of Services.wm.getEnumerator("mail:3pane", true)) {
						for (let lbl of win.document.getElementsByClassName("attachmentcell-name")) {
							if (lbl.value in Replacements) {
								lbl.value = Replacements[lbl.value];
							}
						}
					}
				}
			}
		}
	}
};
