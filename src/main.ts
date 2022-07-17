import { App, Notice, Plugin, PluginSettingTab, Setting, TFile } from "obsidian";

import anki from "./anki";

import { getValueOfFrontmatterKey } from "./util";

const ANKI_DECK_NAME_FRONTMATTER_KEY = "anki-deck";

interface AnkiSettings {
	defaultDeckName: string;
}

const DEFAULT_SETTINGS: AnkiSettings = {
	defaultDeckName: "Default",
};

export default class AnkiPlugin extends Plugin {
	settings: AnkiSettings;

	async onload() {
		console.log("onload()");

		this.addSettingTab(new AnkiSettingTab(this.app, this));

		await this.loadSettings();

		this.addCommand({
			id: "create-anki-cards",
			name: "Create Anki Cards",
			callback: async () => {
				const activeFile = this.app.workspace.getActiveFile();

				if (activeFile) {
					await this.createAnkiDeck(activeFile);
				} else {
					new Notice(
						"This command only works if there's an open file."
					);
				}
			},
		});
	}

	onunload() {
		console.log("onunload()");
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async createAnkiDeck(activeFile: TFile) {
		const activeFileMetadata =
			this.app.metadataCache.getFileCache(activeFile);

		let ankiDeckName = getValueOfFrontmatterKey(
			activeFileMetadata,
			ANKI_DECK_NAME_FRONTMATTER_KEY
		);

		if (!ankiDeckName) {
			ankiDeckName = this.settings.defaultDeckName;
		}

		const result = await anki.createDeck(ankiDeckName);

		return result;
	}
}

class AnkiSettingTab extends PluginSettingTab {
	plugin: AnkiPlugin;

	constructor(app: App, plugin: AnkiPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Obsidian Anki Settings" });

		new Setting(containerEl)
			.setName("Default Deck")
			.setDesc(
				"If anki-deck is not present in the frontmatter, this deck will be used for new cards."
			)
			.addText((text) =>
				text
					.setPlaceholder("Anki deck name")
					.setValue(this.plugin.settings.defaultDeckName)
					.onChange(async (value) => {
						this.plugin.settings.defaultDeckName = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
