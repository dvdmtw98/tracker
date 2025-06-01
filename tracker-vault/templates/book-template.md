<%*
const modalForm = app.plugins.plugins.modalforms.api;

// Get values from Form
const result = await modalForm.openForm('book-form');

const generateSanitizedFileName = (name) => {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')             // Replace '&' with 'and'
    .replace(/[^a-z0-9-\s]/g, '')      // Remove special characters
    .trim()                           // Trim leading/trailing whitespace
    .replace(/\s+/g, '-')             // Replace spaces with hyphens
    .replace(/^-+|-+$/g, '');         // Remove leading/trailing hyphens
};

const name = result.getValue('name').value;
const shortName = result.getValue('short-name')?.value;
const bookType = result.getValue('type').value;

const fileName = generateSanitizedFileName(shortName || name);
const imageName = `${fileName}.jpg`;

const translator = result.getValue('translator')?.value;
const artist = result.getValue('artist')?.value;

// Move and rename file
const category = result.getValue('category').value;
const filePath = (
    category === 'Book' ?
    `library/books/${fileName}` : `library/comics/${fileName}`
);
await tp.file.move(filePath);
-%>
---
name: "<% result.getValue('name') %>"
<%* if (shortName !== undefined) { -%>
shortname: "<% shortName %>"
<%* } -%>
author: <% result.getValue('author') %>
<%* if (translator !== undefined) { -%>
translator: "<% translator %>"
<%* } -%>
<%* if (artist !== undefined) { -%>
artist: "<% artist %>"
<%* } -%>
published: <% result.getValue('published') %>
type: <% result.getValue('type') %>
format: <% result.getValue('format') %>
genre: 
<% result.getValue('genre').bullets %>
<%* if (category === 'Book') { -%>
pages: <% result.getValue('pages') %>
<%* } else { -%>
chapters: <% result.getValue('pages') %>
<%* } -%>
ISBN: <% result.getValue('isbn') %>
rating: 🌑🌑🌑🌑🌑
status: Reading
date: <% tp.date.now("YYYY-MM-DD HH:mm:ss ZZ") %>
finished: <% tp.date.now("YYYY-MM-DD HH:mm:ss ZZ") %>
updated: <% tp.date.now("YYYY-MM-DD HH:mm:ss ZZ") %>
---

![[<% imageName %>|300]]

Book Link: [<% shortName || name %>](<% result.getValue('book-url') %>)
<%*
tp.hooks.on_all_templates_executed(async () => {
	await new Promise(r => setTimeout(r, 2000));
	
	tp.user.bookIndexGen(
		"book-tracker", tp, '"library/books"'
	);
	
	tp.user.bookIndexGen(
		"comic-tracker", tp, '"library/comics"'
	);
});
-%>
