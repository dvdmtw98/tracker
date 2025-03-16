import { Options } from "../components/Explorer";

const textTransform = (displayName: string) => {

    const filterWords = ["and", "of", "a", "in", "on", "the", "for", "to"];

    if (displayName.includes("-") || !displayName.includes(" ")) {
        const words = displayName.split("-");
        const titleCaseWords = words.map((word, index) => {
            if (filterWords.includes(word) && index !== 0) {
                return word
            }
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        });
        const result = titleCaseWords.join(" ");
        displayName = result;
    }

    return displayName;
}

const textTransformNode: Options["mapFn"] = (node) => {

    // if (node.isFolder === true) {
    //     node.displayName = textTransform(node.displayName);
    // }

    return node.displayName;
}


export { textTransformNode, textTransform }
