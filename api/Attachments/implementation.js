var Attachments = class extends ExtensionCommon.ExtensionAPI {
	getAPI(context) {
		function getMessageWindow(tabId) {
			// Get about:message from the tabId.
			let { nativeTab } = context.extension.tabManager.get(tabId);
			if (nativeTab instanceof Ci.nsIDOMWindow) {
				return nativeTab.messageBrowser.contentWindow
			} else if (nativeTab.mode && nativeTab.mode.name == "mail3PaneTab") {
				return nativeTab.chromeBrowser.contentWindow.messageBrowser.contentWindow
			} else if (nativeTab.mode && nativeTab.mode.name == "mailMessageTab") {
				return nativeTab.chromeBrowser.contentWindow;
			}
			return null;
		}

		return {
			Attachments: {
				async updateNames(tabId, replacements) {
					let window = getMessageWindow(tabId);
					if (!window) {
						return
					}

					let modified = false;
					for (let currentAttachment of window.currentAttachments) {
						let name = currentAttachment.name;
						if (replacements.has(name)) {
							currentAttachment.name = replacements.get(name);
							modified = true;
						}
					}
					if (!modified) {
						return
					}

					await window.ClearAttachmentList();
					window.gBuildAttachmentsForCurrentMsg = false;
					await window.displayAttachmentsForExpandedView();
					window.gBuildAttachmentsForCurrentMsg = true;
				}
			}
		}
	}
};
