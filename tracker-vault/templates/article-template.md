<%*
const modalForm = app.plugins.plugins.modalforms.api;
const formResult = await modalForm.openForm('article-form');

const generateSanitizedFileName = (name) => {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')             // Replace '&' with 'and'
    .replace(/[^a-z0-9-\s]/g, '')      // Remove special characters
    .trim()                           // Trim leading/trailing whitespace
    .replace(/\s+/g, '-')             // Replace spaces with hyphens
    .replace(/^-+|-+$/g, '');         // Remove leading/trailing hyphens
};

const title = formResult.getValue('title').value;
const shortTitle = formResult.getValue('short-title')?.value;

const author = formResult.getValue('author')?.value || "Unknown";
const source = formResult.getValue('source').value;
const url = formResult.getValue('url').value;
const date = formResult.getValue('date').value || tp.date.now("YYYY-MM-DD");

const fileName = generateSanitizedFileName(shortTitle || title);
const filePath = `articles/${date}-${fileName}`;
await tp.file.move(filePath);
-%>
---
title: "<% title %>"
<%* if (shortTitle !== undefined) { -%>
shortTitle: "<% shortTitle %>"
<%* } -%>
author: <% author %>
source: <% source %>
date: <% date %>
updated: <% tp.date.now("YYYY-MM-DD HH:mm:ss ZZ") %>
---

Article Link: [<% shortTitle || title %>](<% url %>)
<%*
tp.hooks.on_all_templates_executed(async () => {
	await new Promise(r => setTimeout(r, 2000));
	
	tp.user.articleIndexGen(
		"article-tracker", tp, '"articles"'
	);
});
-%>