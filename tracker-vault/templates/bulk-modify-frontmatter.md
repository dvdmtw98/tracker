<%*
const reorderKeys = (frontmatter, newKeysOrder) => {
    const reorderedTempObject = {};

    // Populate the temporary object with properties in the desired order
    newKeysOrder.forEach(key => {
        if (Object.prototype.hasOwnProperty.call(frontmatter, key)) {
            if (key === 'reads') {
                reorderedTempObject['readingHistory'] = [
                    {
                        format: frontmatter['format'],
                        rating: frontmatter['rating'],
                        status: frontmatter['status'],
                        start: frontmatter['reads'][0].start,
                        end: frontmatter['reads'][0].end
                    }
                ];
                return;
            }

            reorderedTempObject[key] = frontmatter[key];
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
        if (file["path"].startsWith("library/comics/")) {
            // console.log(file["path"]);
            try {
                await app.fileManager.processFrontMatter(file, (frontmatter) => {
                    // console.log(JSON.stringify(frontmatter));
                    // console.log(frontmatter);

                    const newKeysOrder = [
                        'name', 'shortname', 'author', 'artist', 'published', 'type', 'genre', 
                        'chapters', 'ISBN', 'reads', 'updated'
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
