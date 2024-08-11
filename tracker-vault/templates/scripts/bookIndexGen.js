const dv = app.plugins.plugins["dataview"].api;

const bookGrouping = (bookTypeList) => {
    let expression = bookTypeList.map(
        (bookType) => `p.type === "${bookType}"`
    ).join(" || ");

    return "p => " + expression;
}

const bookGrouper = (sortOrder) => {
    let groupedBooks = dv
        .pages('"books"')
        .where(eval(bookGrouping(sortOrder)))
        .groupBy((p) => p.type);

    // Cover Proxy Array to Normal Array
    groupedBooks = groupedBooks.array(groupedBooks);

    groupedBooks.sort((a, b) => {
        return sortOrder.indexOf(a.key) - sortOrder.indexOf(b.key);
    });

    groupedBooks = dv.array(groupedBooks);
    // console.log(groupedBooks);

    return groupedBooks;
}

const bookIndexGenerator = (groupedBooks) => {
    const statusOrder = ["Reading", "Completed", "DNF"];
    const tableHeaders = [
        "Cover", "Title", "Author", "Published", "Genre", "Status", "Rating"
    ];

    let outputMarkdown = "\n";

    for (const group of groupedBooks) {
        let headerName = group.key;
        let bookCount = group.rows.length;
        outputMarkdown += `### ${headerName} (${bookCount})\n\n`;

        let groups = {};
        for (const book of group.rows.array()) {
            if (!groups[book.status]) {
                groups[book.status] = [];
            }
            groups[book.status].push(book);
        }

        // Sort each group by title
        for (const status in groups) {
            groups[status].sort((a, b) => a.name.localeCompare(b.name));
        }

        // Concatenate the groups back together in the desired order
        let sortedBooks = [];
        for (const status of statusOrder) {
            if (groups[status]) {
                sortedBooks = sortedBooks.concat(groups[status]);
            }
        }

        outputMarkdown += dv.markdownTable(
            tableHeaders,
            dv
                .array(sortedBooks)
                .map((k) => [
                    dv.func.link(k.file.outlinks[0], "92"),
                    dv.func.link(k.file.link.path, k.altname ? k.altname : k.name),
                    k.author,
                    k.published,
                    k.genre,
                    k.status,
                    k.rating,
                ])
        );
        outputMarkdown += "\n";
    }

    return outputMarkdown;
}

const writeOutputToFile = async (outputMarkdown, fileName, tp) => {
    const filePointer = tp.file.find_tfile(fileName);
    const fileContent = await app.vault.read(filePointer);

    const frontmatterInfo = tp.obsidian.getFrontMatterInfo(fileContent);
    const frontmatter = frontmatterInfo.exists ? fileContent.substring(0, frontmatterInfo.contentStart) : '';
    const modifiedData = frontmatter + outputMarkdown;

    await app.vault.modify(filePointer, modifiedData);
}




const bookIndexMain = async (sortOrder, fileName, tp) => {
    let outputMarkdown = "";

    let groupedBooks = bookGrouper(sortOrder);
    outputMarkdown = bookIndexGenerator(groupedBooks);

    writeOutputToFile(outputMarkdown, fileName, tp);
}

module.exports = bookIndexMain;
