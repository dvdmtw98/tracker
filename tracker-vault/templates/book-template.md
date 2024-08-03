<%*
const modalForm = app.plugins.plugins.modalforms.api;
const result = await modalForm.openForm('book-form');
await tp.file.rename(result.getValue('file-name').value);

const imageExtensions = [".jpg", ".jpeg", ".png", ".webp"]
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
author: <% result.getValue('author') %>
published: <% result.getValue('published') %>
type: <% result.getValue('type') %>
genre: 
<% result.getValue('genre').bullets %>
rating: 🌑🌑🌑🌑🌑
status: Reading
created: <% tp.file.creation_date("YYYY-MM-DD HH:mm:ss ZZ") %>
updated: <% tp.file.creation_date("YYYY-MM-DD HH:mm:ss ZZ") %>
---

![[<% imageFilename %>|300]]

Book Link: [<% result.getValue('name') %>](<% result.getValue('book-url') %>)
