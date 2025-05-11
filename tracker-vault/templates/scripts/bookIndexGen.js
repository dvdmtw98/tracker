const dv = app.plugins.plugins["dataview"].api;

// arrayName.array: Convert DV array to JS array
// dv.array(arrayName): Convert JS array to DV array

const groupBooksByYear = (bookDirectory, bookTypes) => {
    // Group books by year added
    let groupedBooks = dv.pages(bookDirectory).groupBy((p) => {
        if (!bookTypes.contains(p.type) && p.chapters === -1) {
            return "Ongoing"
        } else {
            return new Date(p.date).getFullYear();
        }
    });

    // Sort groups (years) in descending order
    groupedBooks.values.sort((a, b) => {
        const valA = a.key === "Ongoing" ? Infinity : Number(a.key);
        const valB = b.key === "Ongoing" ? Infinity : Number(b.key);
        return valB - valA;
    });
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


const bookIndexGenerator = (groupedBooks, bookTypes) => {
    const statusOrder = ["Reading", "Completed", "DNF"];
    const tableHeaders = [
        "Cover", "Title", "Author", "Published", "Pages", "Genre", "Status", "Rating"
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
                .map((k) => {
                    let bookProperties = [];

                    bookProperties.push(
                        dv.func.link(k.file.outlinks[0], "92"),
                        dv.func.link(k.file.link.path, k.altname ? k.altname : k.name),
                        k.author,
                        k.published
                    )

                    if (bookTypes.contains(k.type)) {
                        bookProperties.push(k.pages !== null ? `${k.pages} pages` : `0 pages`);
                    } else {
                        let chapterCount;
                        if (k.chapters === null) {
                            chapterCount = "0 chapter(s)";
                        } else if (k.chapters === -1) {
                            chapterCount = "? chapter(s)";
                        } else {
                            chapterCount = `${k.chapters} chapter(s)`;
                        }
                        bookProperties.push(chapterCount);
                    }

                    bookProperties.push(
                        k.genre,
                        k.status,
                        k.rating
                    )

                    return bookProperties;
                })
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
    const bookTypes = ["Fiction", "Non-Fiction", "Textbook"];

    let groupedBooks = groupBooksByYear(bookDirectory, bookTypes);
    outputMarkdown = bookIndexGenerator(groupedBooks, bookTypes);
    writeOutputToFile(outputMarkdown, fileName, tp);
}

module.exports = bookIndexMain;
