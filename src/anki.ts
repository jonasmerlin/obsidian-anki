type AnkiAction = "createDeck" | "deckNames" | "addNote" | "updateNoteFields";

export function createDeck(name: string) {
	return sendAnkiCommand("createDeck", {
		deck: name,
	});
}

export function listDeckNames() {
	return sendAnkiCommand("deckNames");
}

export function createBasicNote(front: string, back: string, deck: string) {
	return sendAnkiCommand("addNote", {
		note: {
			deckName: deck,
			modelName: "Basic",
			fields: {
				Front: front,
				Back: back,
			},
			tags: ["obsidian"],
		},
	});
}

export function updateBasicNote(id: string, front: string, back: string) {
	return sendAnkiCommand("updateNoteFields", {
		note: {
			id: id,
			fields: {
				Front: front,
				Back: back,
			},
		},
	});
}

function sendAnkiCommand(action: AnkiAction, params = {}) {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.addEventListener("error", () => reject("failed to issue request"));
		xhr.addEventListener("load", () => {
			try {
				const response = JSON.parse(xhr.responseText);
				if (Object.getOwnPropertyNames(response).length != 2) {
					throw "response has an unexpected number of fields";
				}
				if (!response.hasOwnProperty("error")) {
					throw "response is missing required error field";
				}
				if (!response.hasOwnProperty("result")) {
					throw "response is missing required result field";
				}
				if (response.error) {
					throw response.error;
				}
				resolve(response.result);
			} catch (e) {
				reject(e);
			}
		});

		xhr.open("POST", "http://127.0.0.1:8765");
		xhr.send(JSON.stringify({ action, version: 6, params }));
	});
}

export default { createDeck, createNote: createBasicNote, updateBasicNote, listDeckNames };
