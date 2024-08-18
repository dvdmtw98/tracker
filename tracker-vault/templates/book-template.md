<%*
const modalForm = app.plugins.plugins.modalforms.api;

const result = await modalForm.openForm('book-form');
await tp.file.rename(result.getValue('file-name').value);

let altName = result.getValue('altname').value;
const altNameOg = result.getValue('altname').value;
if (!altNameOg) {
	altName = result.getValue('name').value;
}

const imageExtensions = [".jpg", ".png"]
const imageName = result.getValue('cover-image').value;
let imageFilename = "";

for (let extension of imageExtensions) {
	let match = tp.file.find_tfile(imageName + extension);
	if (match) {
		imageFilename = imageName + extension;
		break;
	}
}
-%>
---
name: "<% result.getValue('name') %>"
<%* if (altNameOg) { -%>
altname: "<% altNameOg %>"
<%* } -%>
author: <% result.getValue('author') %>
published: <% result.getValue('published') %>
type: <% result.getValue('type') %>
genre: 
<% result.getValue('genre').bullets %>
rating: 🌑🌑🌑🌑🌑
status: Reading
date: <% tp.file.creation_date("YYYY-MM-DD HH:mm:ss ZZ") %>
updated: <% tp.file.creation_date("YYYY-MM-DD HH:mm:ss ZZ") %>
---

![[<% imageFilename %>|300]]

Book Link: [<% altName %>](<% result.getValue('book-url') %>)
<%*
tp.hooks.on_all_templates_executed(async () => {
	await new Promise(r => setTimeout(r, 2000));
	
	tp.user.bookIndexGen(
		["Fiction", "Non-Fiction", "Textbook"], "book-tracker", tp
	);
	
	tp.user.bookIndexGen(
		["Manga", "Manhwa", "Comic"], "comic-tracker", tp
	);
});
-%>