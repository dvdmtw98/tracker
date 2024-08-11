<%*
await Promise.all(
	app.vault.getMarkdownFiles().map(async file => {
		if (file["path"].startsWith("books/")) {
			// console.log(file["path"]);
			try {
				await app.fileManager.processFrontMatter(
					file, (frontmatter) => {
				if (!frontmatter["shortname"]) {
				  frontmatter["shortname"] = frontmatter["name"];
				}
			  });
		} catch (err) {
			console.error(`Failed to process ${file.path}\n\n${err}`);
		}
	  }
	})
);
-%>
