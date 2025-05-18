<%*
const reorderKeys = (frontmatter, newKeysOrder) => {
    const reorderedTempObject = {};

    // Populate the temporary object with properties in the desired order
    newKeysOrder.forEach(key => {
        if (Object.prototype.hasOwnProperty.call(frontmatter, key)) {
            if (key !== 'date_finished') {
	            reorderedTempObject[key] = frontmatter[key];
            } else {
	            reorderedTempObject['finished'] = frontmatter['date_finished'];
            }
        }
    });

    // Remove all properties from the original object
    Object.keys(frontmatter).forEach(key => {
        delete frontmatter[key];
    });

    // Reassign properties to the original object in the new order
    Object.keys(reorderedTempObject).forEach(key => {
        frontmatter[key] = reorderedTempObject[key];
    });
}

await Promise.all(
    app.vault.getMarkdownFiles().map(async file => {
        if (file["path"].startsWith("library/")) {
            // console.log(file["path"]);
            try {
                await app.fileManager.processFrontMatter(file, (frontmatter) => {
                    console.log(JSON.stringify(frontmatter));

                    const newKeysOrder = [
                        'name', 'shortname', 'author', 'published',
                        'type', 'format', 'genre', 'pages', 'ISBN',
                        'rating', 'status', 'date', 'finished', 'updated'
                    ]
                    reorderKeys(frontmatter, newKeysOrder);
                });
            } catch (err) {
                console.error(`Failed to process ${file.path}\n${err}`);
            }
        }
    })
);
-%>
