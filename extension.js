// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const api = "http://localhost:3000/api/";
const request = require('request');
const defaulDB = {
	codes: {}
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	
	// Creating Database in case no exist;
	var pathDB = `${context.extensionPath}/database.json`;
	if(!fs.existsSync(pathDB)) fs.writeFileSync(pathDB, JSON.stringify(defaulDB));
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let saveCodeCommand = vscode.commands.registerCommand('extension.savecode', async function () {
		// The code you place here will be executed every time your command is executed
		var editor = vscode.window.activeTextEditor;
		if(!editor) return vscode.window.showErrorMessage("No text Selected");
		var textSelected = editor.document.getText(editor.selection);
		if(textSelected.length < 5) return vscode.window.showWarningMessage('The selection is very short...');
		// var title = await (vscode.window.showInputBox({placeHolder:"Title of code"}));
		// if(!title) vscode.window.showErrorMessage('Please set title of code');
		// let newCode = {
		// 	title,
		// 	text: textSelected, 
		// 	languaje: editor.document.languageId,
		// 	accountId: 1
		// };

		// request.post(api + 'codes', {json: newCode}, (err, code) => {
		// 	if(err) return vscode.window.showErrorMessage('An unexpected error occurred while trying to save the code. Please try later!');
		// 	vscode.window.showInformationMessage('Selection Saved successfully!');
		// });

		var database = JSON.parse(fs.readFileSync(pathDB).toString());
		let token = (Math.random() * Date.now()).toString(36).substring(2, 15).replace(/\./g, '').substr(0, 10);
		var title = await (vscode.window.showInputBox({placeHolder:"Title of code"}));
		if(!title) vscode.window.showErrorMessage('Please set title of code');
		database.codes[token] = {
			title,
			text: textSelected, 
			languaje: editor.document.languageId
		};

		fs.writeFileSync(pathDB, JSON.stringify(database));
		vscode.window.showInformationMessage('Selection Saved successfully!');
	});

	let showCodesSaved = vscode.commands.registerCommand("extension.showcodes", () => {
		var database = JSON.parse(fs.readFileSync(pathDB).toString());
		const panel = vscode.window.createWebviewPanel(
			'catCoding', // Identifies the type of the webview. Used internally
			'Box Codes', // Title of the panel displayed to the user
			vscode.ViewColumn.One, // Editor column to show the new webview panel in.
			{
				enableScripts: true,
				localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'public'))]
			} // Webview options. More on these later.
		);
		panel.iconPath = vscode.Uri.file(context.extensionPath + '/public/images/logo.png');

		panel.onDidChangeViewState((e) => {
			if(e.webviewPanel._visible){
				setTimeout(() => {
					panel.webview.postMessage({codes: database.codes});
				}, 1000);
			}
		})

		let indexHTML = fs.readFileSync(`${context.extensionPath}/public/index.html`).toString().replace(/{{(.*)}}/g, (t, a) => eval(a));
		panel.webview.html = indexHTML;
		setTimeout(() => {
			panel.webview.postMessage({codes: database.codes});
		}, 1000);
	});

	let selectCodes = vscode.commands.registerCommand("extension.boxcodes", () => {
		let quickPick = vscode.window.createQuickPick();
		var database = JSON.parse(fs.readFileSync(pathDB).toString());
		let codes = database.codes;
		console.log(codes);
		quickPick.items = Object.keys(codes).map(id => ({index: id, label: codes[id].title, description: codes[id].languaje, detail: codes[id].text}));
		
		quickPick.onDidChangeSelection(selection => {
			if(!selection[0]) return;
			let index = selection[0].index;
			let selected = codes[index];
			vscode.window.activeTextEditor.insertSnippet(new vscode.SnippetString(selected.text));
			quickPick.hide();
		});

		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();

		// request.get(`${api}accounts/1/codes`, (err, res) => {
		// });
	});

	function getPathFile(folder, name){
		const onDiskPath = vscode.Uri.file(`${context.extensionPath}/public/${folder}/${name}`);
		const file = onDiskPath.with({ scheme: 'vscode-resource' });
		return file.scheme + ":" + file.path;
	}

	context.subscriptions.push(saveCodeCommand);
	context.subscriptions.push(showCodesSaved);
	context.subscriptions.push(selectCodes);
}

exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
