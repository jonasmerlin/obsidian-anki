# Obsidian Anki

Another plugin to create Anki cards from Obsidian. This one is highly opinionated and mostly exists because the existing ones weren't maintained and started to fall apart on me. So here's one I can maintain myself. If it fits your workflow - or you're open to changing your workflow to fit it - , you're very welcome to use it and improve it with me. Otherwise, I can't promise anything.

# How to Install

First, you'll have to install the [Anki Connect](https://github.com/FooSoft/anki-connect) Anki plugin. This creates a local HTTP server that allows other programs to essentially "remote control" Anki.

To install Anki Connect ...

* Open Anki
* Select **Tools -> Add-ons** from the menu bar
* Click **Get Add-ons**
* Paste 2055492159
* Press **Ok**
* Restart Anki

Then you will have to install Obsidian Anki like you would any other Obsidian community plugin.

Once installed and enabled, go ahead and check the settings. Right now, there is only one: the name of the default deck. This setting defaults to, well ... "Default". If that's okay for you, you're ready to create cards. Otherwise change it to your liking.

# How to Use

## Defining Cards

You define cards using JSON inside special `flashcard` codeblocks.

For the "Basic" Card that comes with Anki:

```flashcard
{
    "cardId": null, // Will be filled by the plugin upon card generation.
    "tags": [tag1, tag2],
    "noteType": "Basic",
    "fields": {
	    "Front": "Front Text",
	    "Back": "Back Text"
    }
}
```

For the "Cloze" Cards that comes with Anki:

```flashcard
{
    "cardId": 1658266510510,
    "tags": [],
    "noteType": "Cloze",
    "fields": {
	    "Text": "Text {{c1::cloze deletion}}",
	    "Back Extra": "Explanation"
    }
}
```

The advantage of this syntax is that in theory, all custom card styles should be supported. 

To make card definition easier, **there are two commands to add themplates for either Basic or Cloze cards** at your current cursor location:

1. `Add Anki Card: Basic`
2. `Add Anki Card: Cloze`

## Creating Cards

Once you defined your cards, you can run the command `Create Anki Cards in Current File` to create them in Anki. **Make sure Anki is running for this**!

In the future, I'll probably add a command to create all cards found in all files globally. But that doesn't exist yet.

## Updating Cards

If card creation succeeded, the `cardId` field should now be set to the Card's ID in Anki. _Don't change this!_

If you want to update the card with new text, just edit the values of the fields and then run `Create Anki Cards in Current File`. Instead of creating new cards, it will update the card with the corresponding ID.

## Deleting Cards

Deletion is not implemented yet. It's on the roadmap though.
