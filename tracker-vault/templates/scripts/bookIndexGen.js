const dv = app.plugins.plugins["dataview"].api;

// arrayName.array: Convert DV array to JS array
// dv.array(arrayName): Convert JS array to DV array

const groupBooksByYear = (bookDirectory, bookTypes) => {
    // Group books by year added
    let groupedBooks = dv.pages(bookDirectory).groupBy((book) => {
        if (!bookTypes.contains(book.type) && book.chapters === -1) {
            return "Ongoing"
        } else {
            return getMajorityYear(book.date, book.finished);
            // return new Date(book.date).getFullYear();
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

const getMajorityYear = (startDate, endDate) => {
    // Parse the input date strings into Date objects
    let start = new Date(startDate);
    let end = new Date(endDate);

    // Ensure start is before end
    if (start > end) [start, end] = [end, start];

    // Map to store duration spent in each year
    const yearDurations = new Map();

    // Iterate through each year spanned by the date range
    for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
        // Start and end of the current year
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year + 1, 0, 1);

        // Calculate the overlap between the reading period and the current year
        const periodStart = start > yearStart ? start : yearStart;
        const periodEnd = end < yearEnd ? end : yearEnd;

        // Calculate duration in milliseconds
        const duration = periodEnd - periodStart;

        // Accumulate duration for the current year
        yearDurations.set(year, (yearDurations.get(year) || 0) + duration);
    }

    // Determine the year with the maximum duration
    return [...yearDurations.entries()].reduce((a, b) => (b[1] > a[1] ? b : a))[0];
}


const yearFormatter = (published) => {
    return Math.sign(published) === 1 ? published : `${Math.abs(published)} BCE`;
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
