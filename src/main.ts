import {
	App,
	Editor,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
} from "obsidian";

import anki from "./anki";

import { getValueOfFrontmatterKey } from "./util";

const ANKI_DECK_NAME_FRONTMATTER_KEY = "anki-deck";

interface AnkiSettings {
	defaultDeckName: string;
	defaultAnkiSyncPort: string;
}

const DEFAULT_SETTINGS: AnkiSettings = {
	defaultDeckName: "Default",
	defaultAnkiSyncPort: "8765",
};

export default class AnkiPlugin extends Plugin {
	settings: AnkiSettings;

	async onload() {
		console.log("onload()");

		this.addSettingTab(new AnkiSettingTab(this.app, this));

		await this.loadSettings();

		this.addCommand({
			id: "add-anki-card_basic",
			name: "Add Anki Card: Basic",
			editorCallback(editor, view) {
				const cursor = editor.getCursor();

				editor.setLine(cursor.line, "```flashcard\n");
				editor.setLine(cursor.line + 1, "{\n");
				editor.setLine(cursor.line + 2, '    "cardId": null,\n');
				editor.setLine(cursor.line + 3, '    "tags": [],\n');
				editor.setLine(cursor.line + 4, '    "noteType": "Basic",\n');
				editor.setLine(cursor.line + 5, '    "fields": {\n');
				editor.setLine(cursor.line + 6, '        "Front": "Test",\n');
				editor.setLine(cursor.line + 7, '        "Back": "Test"\n');
				editor.setLine(cursor.line + 8, "     }\n");
				editor.setLine(cursor.line + 9, "}\n");
				editor.setLine(cursor.line + 10, "```");
			},
		});

		this.addCommand({
			id: "add-anki-card_cloze",
			name: "Add Anki Card: Cloze",
			editorCallback(editor, view) {
				const cursor = editor.getCursor();

				editor.setLine(cursor.line, "```flashcard\n");
				editor.setLine(cursor.line + 1, "{\n");
				editor.setLine(cursor.line + 2, '    "cardId": null,\n');
				editor.setLine(cursor.line + 3, '    "tags": [],\n');
				editor.setLine(cursor.line + 4, '    "noteType": "Cloze",\n');
				editor.setLine(cursor.line + 5, '    "fields": {\n');
				editor.setLine(cursor.line + 6, '        "Text": "Test",\n');
				editor.setLine(
					cursor.line + 7,
					'        "Back Extra": "Test"\n'
				);
				editor.setLine(cursor.line + 8, "     }\n");
				editor.setLine(cursor.line + 9, "}\n");
				editor.setLine(cursor.line + 10, "```");
			},
		});

		this.addCommand({
			id: "create-anki-cards-in-current-file",
			name: "Create Anki Cards in Current File",
			editorCallback: async (editor: Editor) => {
				const activeFile = this.app.workspace.getActiveFile();

				if (activeFile) {
					const deckName = await this.createAnkiDeck(activeFile);

					const activeFileMetadata =
						this.app.metadataCache.getFileCache(activeFile);

					if (activeFileMetadata && activeFileMetadata.sections) {
						// const contents = await this.app.vault.read(activeFile);

						const sections = activeFileMetadata.sections.filter(
							(section) => {
								return section.type === "code";
							}
						);

						for (const section of sections) {
							const blockStartLine = section.position.start.line;

							const line = editor.getLine(blockStartLine);

							const isFlashcardBlock =
								line.search(/(F|f)lashcard\s*$/) > -1;

							if (isFlashcardBlock) {
								const blockLineEnd = section.position.end.line;

								let cardDataString = "";
								for (
									let currentLine = blockStartLine + 1;
									currentLine < blockLineEnd;
									currentLine++
								) {
									cardDataString +=
										editor.getLine(currentLine);
								}

								let cardData: {
									cardId: string | null;
									tags: string[];
									noteType: "Basic" | "Cloze";
									fields: any;
								} | null = null;
								try {
									cardData = JSON.parse(cardDataString);
								} catch (e) {
									new Notice(
										"Flashcard JSON couldn't be parsed."
									);
								}

								if (cardData) {
									if (cardData.cardId) {
										try {
											await anki.updateBasicNote(
												cardData.cardId,
												cardData.fields,
												cardData.tags
											);
										} catch (e) {
											new Notice(
												`Card couldn't be updated. [cardId=${cardData.cardId}]`
											);
										}
									} else {
										try {
											const noteId =
												await anki.createBasicNote(
													cardData.fields,
													cardData.tags,
													cardData.noteType,
													deckName
												);

											editor.setLine(
												blockStartLine + 2,
												`    "cardId": ${noteId},`
											);
										} catch (e) {
											new Notice(
												"Card couldn't be created."
											);
										}
									}
								}
							}
						}
					}
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

	async createAnkiDeck(activeFile: TFile): Promise<string> {
		const activeFileMetadata =
			this.app.metadataCache.getFileCache(activeFile);

		let ankiDeckName = getValueOfFrontmatterKey(
			activeFileMetadata,
			ANKI_DECK_NAME_FRONTMATTER_KEY
		);

		if (!ankiDeckName) {
			ankiDeckName = this.settings.defaultDeckName;
		}

		await anki.createDeck(ankiDeckName);

		return ankiDeckName;
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

		new Setting(containerEl)
			.setName("Anki Sync Port")
			.setDesc(
				"The port your Anki Sync server runs on."
			)
			.addText((text) =>
				text
					.setPlaceholder(this.plugin.settings.defaultAnkiSyncPort)
					.setValue(this.plugin.settings.defaultAnkiSyncPort)
					.onChange(async (value) => {
						this.plugin.settings.defaultAnkiSyncPort = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
