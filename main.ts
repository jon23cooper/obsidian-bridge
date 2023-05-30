import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

class Deck {

	deck: number[];
	number_of_hands: number
	number_of_cards_in_a_hand: number
	hands: number[][];
	current_card: number;

	constructor(number_of_hands = 4, number_of_cards_in_a_hand = 13){
		this.deck = this.deck = [...Array(52).keys()];
		this.number_of_hands = number_of_hands;
		this.number_of_cards_in_a_hand = number_of_cards_in_a_hand;
		//this.reset();
		this.shuffle();
		this.deal();
		this.current_card = 0;
	}
  
	reset(){
		this.deck = [...Array(52).keys()];
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

	cardValue(idx: number): string {
		//return ['A', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][idx % 13]
		return '4';
	}
  
	deal() {
		this.hands = [];
		for (let hand_idx = 0; hand_idx < this.number_of_hands; hand_idx++){
			// push empty array into hands
			this.hands.push([])
			for (let dealt_card_idx = 0; dealt_card_idx < this.number_of_cards_in_a_hand; dealt_card_idx++){
				// add new item to end of relevant inner array
				this.hands[hand_idx].push(this.deck[hand_idx * this.number_of_cards_in_a_hand + dealt_card_idx])
			}
			this.hands[hand_idx].sort()
		}

	}

	displayHand(idx: number){
		const hand = this.hands[idx]
		const suits: [number[], number [], number [], number[]] = [[], [], [], []];
		console.log(this.cardValue(3))
		hand.forEach(function(card, index) {
			suits[Math.floor(card/13)].push(card)
		})
		// sort hand Aces to the top
		suits.forEach(function(card) {
			card.sort(function(a, b){
				if (a % 13 == 0) {
					return -1
				} else {
					if (b % 13 == 0) {
						return 1
					} else {
					return b - a
					}
				}
			})
		})
		const size = 10;
 		let display_string = '<div class="card-table">'
		suits.forEach(function(suit, idx){
			const suit_symbol: string = ["\u{2660}", "\u{2665}", "\u{2666}", "\u{2663}"][idx]
			const suit_name: string = ["spades", " hearts", "diamonds", "clubs"][idx]
			display_string += '<div><span class="'+suit_name +'">' + suit_symbol + '</span>'
			suit.forEach(function(card){
				display_string += '<span class= "playing-card">' + ['A', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'][card % 13] + '</span><span>&nbsp</span>'
			});
			display_string += '</div>';
			
		})
		display_string += "</div>"


		return display_string;
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
			
			new Notice("help");
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'deal-balanced hand',
			name: 'DealHand',
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
		contentEl.innerHTML = new Deck().displayHand(0)
		//contentEl.setText(new Deck().displayHand(0));
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
