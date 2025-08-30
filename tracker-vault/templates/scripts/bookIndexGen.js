const dv = app.plugins.plugins["dataview"].api;

// arrayName.array: Convert DV array to JS array
// dv.array(arrayName): Convert JS array to DV array

const groupBooksByYear = (bookDirectory, bookType) => {
    // Flatten each read into a separate item
    let allReads = dv.pages(bookDirectory).flatMap(book => {
        return book.readingHistory.map(readingInfo => ({
            ...book, current: readingInfo
        }));
    });

    // Group books by year finished
    let groupedBooks = allReads.groupBy((book) => {
        // For ongoing books current year is used
        if (bookType === 'comics' && book.chapters === -1) {
            return new Date().getFullYear();
        }
        return new Date(book.current.end).getFullYear();
    });
    // console.log(groupedBooks);

    // Sort groups (years) in descending order
    groupedBooks.values.sort((a, b) => {
        return Number(b.key) - Number(a.key);
    });

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
        if (!statusGroups[book.current.status]) {
            statusGroups[book.current.status] = [];
        }
        statusGroups[book.current.status].push(book);
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

const getBaseName = (filePath) => {
    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);

    const lastDotIndex = fileName.lastIndexOf('.');
    const fileNameWithoutExtension = fileName.substring(0, lastDotIndex).toLowerCase();

    return [fileName, fileNameWithoutExtension];
}

const getCoverImage = (book) => {
    const fileName = book.file.name;
    const outlinks = book.file.outlinks;

    for (const link of outlinks) {
        const extension = link.path.substring(link.path.lastIndexOf('.') + 1).toLowerCase();
        const [linkName, linkNameWithoutExtension] = getBaseName(link.path);

        if (link.embed === true && extension === "jpg" && linkNameWithoutExtension === fileName) {
            return linkName;
        }
    }

    return null;
}

const bookIndexGenerator = (groupedBooks, bookType) => {
    const statusOrder = ["Reading", "Completed", "DNF"];
    const tableHeaders = [
        "Cover", "Title", "Author", "Type", "Genre", "Status", "Rating"
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
                .map((book) => {
                    return [
                        dv.fileLink(getCoverImage(book), true, "92"),
                        dv.fileLink(book.file.name, false, book.shortname ? book.shortname : book.name),
                        book.author,
                        book.type,
                        book.genre,
                        book.current.status,
                        book.current.rating
                    ];
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
    // Remove quotes from string and then get book type
    const bookType = bookDirectory.replace(/^"|"$/g, '').split('/')[1];

    let groupedBooks = groupBooksByYear(bookDirectory, bookType);
    outputMarkdown = bookIndexGenerator(groupedBooks, bookType);
    writeOutputToFile(outputMarkdown, fileName, tp);
}

module.exports = bookIndexMain;
