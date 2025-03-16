import { Options } from "../components/Explorer";

const customTextTransform = (displayName: string) => {
    const filterWords = ["and", "of", "a", "in", "on", "the", "for", "to"];

    // Split on space and hyphen
    const words = displayName.split(/[-\s]+/);

    const titleCaseWords = words.map((word, index) => {
        if (filterWords.includes(word) && index !== 0) {
            return word
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    });
    return titleCaseWords.join(" ");
}

const textTransformNode: Options["mapFn"] = (node) => {
    if (node.isFolder === true) {
        const filterWords = ["and", "of", "a", "in", "on", "the", "for", "to"];

        // Split on space and hyphen
        const words = node.displayName.split(/[-\s]+/);

        const titleCaseWords = words.map((word, index) => {
            if (filterWords.includes(word) && index !== 0) {
                return word
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        });
        node.displayName = titleCaseWords.join(" ");
    }

    return node;
}


export { textTransformNode, customTextTransform }
