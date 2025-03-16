const dv = app.plugins.plugins["dataview"].api;

// arrayName.array: Convert DV array to JS array
// dv.array(arrayName): Convert JS array to DV array

const groupBooksByYear = (bookDirectory) => {
    // Group books by year added
    let groupedBooks = dv.pages(bookDirectory).groupBy((p) => {
        return new Date(p.date).getFullYear();
    });

    // Sort groups (years) in descending order
    groupedBooks.values.sort((a, b) => b.key - a.key);
    // console.log(groupedBooks);

    // Within each group (year), sort by title (ascending) 
    groupedBooks.forEach((group) => {
        group.rows.values.sort((a, b) => a.file.name.localeCompare(b.file.name));
    });
    // console.log(groupedBooks);

    return groupedBooks;
};

const sortBooksByStatus = (bookGroup, statusOrder) => {
    // Segregate books into groups based on status
    let statusGroups = {};
    for (const book of bookGroup.rows.array()) {
        if (!statusGroups[book.status]) {
            statusGroups[book.status] = [];
        }
        statusGroups[book.status].push(book);
    }

    // Concatenate the (status) groups back together 
    let sortedBookGroup = [];
    for (const status of statusOrder) {
        if (statusGroups[status]) {
            sortedBookGroup = sortedBookGroup.concat(statusGroups[status]);
        }
    }

    return sortedBookGroup;
}


const bookIndexGenerator = (groupedBooks) => {
    const statusOrder = ["Reading", "Completed", "DNF"];
    const tableHeaders = [
        "Cover", "Title", "Author", "Type", "Pages", "Genre", "Status", "Rating"
    ];

    let outputMarkdown = "\n";

    for (const bookGroup of groupedBooks) {
        let headerName = bookGroup.key;
        let bookCount = bookGroup.rows.length;
        outputMarkdown += `### ${headerName} (${bookCount})\n\n`;

        let sortedBookGroup = sortBooksByStatus(bookGroup, statusOrder);

        outputMarkdown += dv.markdownTable(
            tableHeaders,
            dv
                .array(sortedBookGroup)
                .map((k) => [
                    dv.func.link(k.file.outlinks[0], "92"),
                    dv.func.link(k.file.link.path, k.altname ? k.altname : k.name),
                    k.author,
                    k.type,
                    k.pages.toString() ? `${k.pages} pages`: `${k.chapters} chapter(s)`,
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

const bookIndexMain = async (fileName, tp, bookDirectory) => {
    let outputMarkdown = "";

    let groupedBooks = groupBooksByYear(bookDirectory);
    outputMarkdown = bookIndexGenerator(groupedBooks);
    writeOutputToFile(outputMarkdown, fileName, tp);
}

module.exports = bookIndexMain;
