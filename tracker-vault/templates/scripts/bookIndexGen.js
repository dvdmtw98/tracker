const dv = app.plugins.plugins["dataview"].api;

// arrayName.array: Convert DV array to JS array
// dv.array(arrayName): Convert JS array to DV array

const groupBooksByYear = (bookDirectory, bookTypes) => {
    // Group books by year finished
    let groupedBooks = dv.pages(bookDirectory).groupBy((book) => {
        if (!bookTypes.contains(book.type) && book.chapters === -1) {
            // For ongoing books current year is used
            return new Date().getFullYear();
        } else {
            return new Date(book.finished).getFullYear();
        }
    });

    // Sort groups (years) in descending order
    groupedBooks.values.sort((a, b) => {
        return Number(b.key) - Number(a.key);
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

const yearFormatter = (published) => {
    return Math.sign(published) === 1 ? published : `${Math.abs(published)} BC`;
}

const pageCountFormatter = (book, bookTypes) => {
    if (bookTypes.contains(book.type)) {
        let pageCount;
        if (book.pages !== null || book.pages !== undefined) {
            if (Number.isInteger(book.pages)) {
                pageCount = `${book.pages} pages`
            } else {
                const [hoursStr, minutesStr] = book.pages.toString().split('.');
                pageCount = `${hoursStr} hr ${minutesStr} mins`;
            }
        } else {
            pageCount = "0 pages"
        }
        return pageCount;
    } else {
        let chapterCount;
        if (book.chapters === null || book.chapters === undefined) {
            chapterCount = "0 chapter(s)";
        } else if (book.chapters === -1) {
            chapterCount = "? chapter(s)";
        } else {
            chapterCount = `${book.chapters} chapter(s)`;
        }
        return chapterCount;
    }
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
                .map((book) => {
                    return [
                        dv.fileLink(getCoverImage(book), true, "92"),
                        dv.fileLink(book.file.name, false, book.shortname ? book.shortname : book.name),
                        book.author,
                        yearFormatter(book.published),
                        pageCountFormatter(book, bookTypes),
                        book.genre,
                        book.status,
                        book.rating
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
    const bookTypes = ["Fiction", "Non-Fiction", "Textbook"];

    let groupedBooks = groupBooksByYear(bookDirectory, bookTypes);
    outputMarkdown = bookIndexGenerator(groupedBooks, bookTypes);
    writeOutputToFile(outputMarkdown, fileName, tp);
}

module.exports = bookIndexMain;
