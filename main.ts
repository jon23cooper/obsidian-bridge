import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

class Deck {

	deck: string[];

	constructor(){
		this.deck = [];
		this.reset();
		this.shuffle();
	}
  
	reset(){
		this.deck = [];
  
		const spades: string[] = ['\u{1F0A1}', '\u{1F0A2}', '\u{1F0A3}', '\u{1F0A4}', '\u{1F0A5}', '\u{1F0A6}', '\u{1F0A7}', '\u{1F0A8}', '\u{1F0A9}', 
			'\u{1F0AA}', '\u{1F0AB}', '\u{1F0AC}', '\u{1F0AD}', '\u{1F0AE}'];
		const hearts: string [] = ['\u{1F0B1}', '\u{1F0B2}', '\u{1F0B3}', '\u{1F0B4}', '\u{1F0B5}', '\u{1F0B6}', '\u{1F0B7}', '\u{1F0B8}', '\u{1F0B9}', 
			'\u{1F0BA}',  '\u{1F0BB}', '\u{1F0BC}', '\u{1F0BD}', '\u{1F0BE}'];
		const diamonds: string[] = ['\u{1F0C1}', '\u{1F0C2}', '\u{1F0C3}', '\u{1F0C4}', '\u{1F0C5}', '\u{1F0C6}', '\u{1F0C7}', '\u{1F0C8}', '\u{1F0C9}', 
		'\u{1F0CA}',  '\u{1F0CB}', '\u{1F0CC}', '\u{1F0CD}', '\u{1F0CE}'];
		const clubs = ['\u{1F0D1}', '\u{1F0D2}', '\u{1F0D3}', '\u{1F0D4}', '\u{1F0D5}', '\u{1F0D6}', '\u{1F0D7}', '\u{1F0D8}', '\u{1F0D9}', 
		'\u{1F0DA}',  '\u{1F0DB}', '\u{1F0DC}', '\u{1F0DD}', '\u{1F0DE}'];
	
		this.deck = [spades, hearts, diamonds, clubs].flat()
	}
  
	shuffle(){
		const { deck } = this;
		let m = deck.length, i;
  
		while(m){
			i = Math.floor(Math.random() * m--);
  
			[deck[m], deck[i]] = [deck[i], deck[m]];
		}
  
		return this;
	}
  
	deal(): string{
		return this.deck.pop()??"error";
	}
  }

interface BridgePluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: BridgePluginSettings = {
	mySetting: 'default'
}

export default class BridgePlugin extends Plugin {
	settings: BridgePluginSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			const pack = new Deck().shuffle()
			new Notice(pack.deal());
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new BridgeModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new BridgeModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new BridgeSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class BridgeModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class BridgeSettingTab extends PluginSettingTab {
	plugin: BridgePlugin;

	constructor(app: App, plugin: BridgePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for my awesome plugin.'});

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					console.log('Secret: ' + value);
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
