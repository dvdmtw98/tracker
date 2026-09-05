const dv = app.plugins.plugins["dataview"].api;

// arrayName.array: Convert DV array to JS array
// dv.array(arrayName): Convert JS array to DV array

const groupArticlesByYear = (articleDirectory) => {
    let allReads = dv.pages(articleDirectory);

    // Group books by year finished
    let groupedArticles = allReads.groupBy((article) => {
        return new Date(article.date).getFullYear();
    });
    // console.log(groupedBooks);

    // Sort groups (years) in descending order
    groupedArticles.values.sort((a, b) => {
        return Number(b.key) - Number(a.key);
    });

    // Within each group (year), sort by date (ascending) 
    groupedArticles.forEach((group) => {
        group.rows.values.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
    });
    // console.log(groupedBooks);

    return groupedArticles;
};

const articleIndexGenerator = (groupedArticles) => {
    const tableHeaders = [
        "SN", "Title", "Author", "Source", "Date"
    ];

    let outputMarkdown = "\n";

    for (const articleGroup of groupedArticles) {
        let headerName = articleGroup.key;
        let articleCount = articleGroup.rows.length;
        outputMarkdown += `### ${headerName} (${articleCount})\n\n`;

        outputMarkdown += dv.markdownTable(
            tableHeaders,
            dv
                .array(articleGroup.rows.array())
                .map((article) => {
                    return [
                        "",
                        dv.fileLink(article.file.name, false, article.shorttitle ? article.shorttitle : article.title),
                        article.author,
                        article.source,
                        new Date(article.date).toLocaleDateString(
                            'en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }
                        )
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

const articleIndexMain = async (fileName, tp, articleDirectory) => {
    let outputMarkdown = "";

    let groupedArticles = groupArticlesByYear(articleDirectory);
    outputMarkdown = articleIndexGenerator(groupedArticles);
    writeOutputToFile(outputMarkdown, fileName, tp);
}

module.exports = articleIndexMain;
