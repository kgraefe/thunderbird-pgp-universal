const { AddonManager } = ChromeUtils.import(
	"resource://gre/modules/AddonManager.jsm"
);
const EnigmailMsgRead = ChromeUtils.import(
  "chrome://openpgp/content/modules/msgRead.jsm"
).EnigmailMsgRead;

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
var renameattachments = class extends ExtensionCommon.ExtensionAPI {
	getAPI(context) {
		return {
			renameattachments: {
				setReplacements(replacements) {
					// Set global replacements object
					Replacements = replacements;

					// Update displayed file names in attachment bar
					for (let win of Services.wm.getEnumerator("mail:3pane", true)) {
						for (let lbl of win.document.getElementsByClassName("attachmentcell-name")) {
							if (lbl.value in replacements) {
								lbl.value = replacements[lbl.value];
							}
						}
					}
				}
			}
		}
	}
};
