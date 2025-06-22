import { Date, getDate } from "./Date"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import readingTime from "reading-time"
import { classNames, capitalize } from "../util/lang"
import { i18n } from "../i18n"
import { JSX } from "preact"
import style from "./styles/contentMeta.scss"
import renderToString from 'preact-render-to-string'
import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { Fragment, jsx, jsxs } from 'preact/jsx-runtime';

interface ContentMetaOptions {
  /**
   * Whether to display reading time
   */
  showReadingTime: boolean,
  repoLink: string,
  branch: string,
  rootDirectory: string
}

const defaultOptions: ContentMetaOptions = {
  showReadingTime: true,
  repoLink: "github.com",
  branch: "main",
  rootDirectory: "content"
}

const frontmatterElement = (
  displayClass: QuartzComponentProps["displayClass"], frontmatterKey: string, frontmatterValue: string
) => {
  return `
    <p style="margin: 0;" class="${classNames(displayClass, "content-meta")}">
      <span class="content-meta-title">${frontmatterKey}:</span>
      <span class="content-meta-value">${frontmatterValue}</span>
    </p>
  `;
}

const customSegmentGenerator = (
  cfg: QuartzComponentProps["GlobalConfiguration"], fileData: QuartzComponentProps["fileData"],
  displayClass: QuartzComponentProps["displayClass"]
) => {
  const propertiesWithComma = ["Author", "Translator", "Artist"];
  const propertiesWithDate = ["Start", "End"];
  const propertiesToSkip = ["title", "name", "shortname", "tags", "genre", "created", "modified", "updated"];

  let customSegment = ``;
  Object.entries(fileData.frontmatter ?? {})
    .filter(([key]) => !propertiesToSkip.includes(key)).forEach(([mainKey, mainValue]) => {

      if (!Array.isArray(mainValue)) {
        let mainFrontmatterKey = capitalize(mainKey);
        let mainFrontmatterValue = mainValue as string;

        if (propertiesWithComma.includes(mainFrontmatterKey)) {
          mainFrontmatterValue = mainFrontmatterValue.split(",").map(name => name.trim()).join("<br>");
        }

        customSegment += frontmatterElement(displayClass, mainFrontmatterKey, mainFrontmatterValue);
      } else {
        mainValue.forEach((history, index) => {
          customSegment += `
            <p style="margin: 0;" class="${classNames(displayClass, "content-meta")}">
              <span class="content-meta-value" style="text-decoration: underline;">Reading ${index + 1}</span>
            </p>
          `;

          Object.entries(history).forEach(([nestedKey, nestedValue]) => {
            let nestedFrontmatterKey = capitalize(nestedKey);
            let nestedFrontmatterValue = nestedValue as string;

            if (propertiesWithDate.includes(nestedFrontmatterKey)) {
              const parsedDate = new globalThis.Date(nestedFrontmatterValue);
              nestedFrontmatterValue = renderToString(<Date date={parsedDate} locale={cfg.locale} />)
            }

            if (propertiesWithComma.includes(nestedFrontmatterKey)) {
              nestedFrontmatterValue = nestedFrontmatterValue.split(",").map(name => name.trim()).join("<br>");
            }

            customSegment += frontmatterElement(displayClass, nestedFrontmatterKey, nestedFrontmatterValue);
          });
        });
      }

    });

  return customSegment;
}

const frontmatterComponentGenerator = (
  cfg: QuartzComponentProps["GlobalConfiguration"], fileData: QuartzComponentProps["fileData"], sourceViewUrl: string, blameViewUrl: string, historyViewUrl: string, displayClass: QuartzComponentProps["displayClass"],
  createdTime: JSX.Element, modifiedTime: JSX.Element, readingTimeValue: string
) => {
  let customSegment = ``;

  if (fileData.slug?.includes("books/") || fileData.slug?.includes("comics/")) {
    customSegment = customSegmentGenerator(cfg, fileData, displayClass);
  } else {
    customSegment = `
      <p style="margin: 0;" class="${classNames(displayClass, "content-meta", "date-meta")}">
        <span class="date-group line-1">Created: ${renderToString(createdTime)}</span>
        <span class="date-separator line-2"> • </span>
        <span class="date-group line-3">Modified: ${renderToString(modifiedTime)}</span>
      </p>
      <p style="margin: 0;" class="${classNames(displayClass, "content-meta")}">
        <span>${readingTimeValue}</span>
      </p>
    `;
  }

  const frontmatterString = `
    <p style="margin: 0;">
      <a href=${sourceViewUrl} target="_blank" rel="noreferrer noopener">Source</a> • 
      <a href=${blameViewUrl} target="_blank" rel="noreferrer noopener">Blame</a> • 
      <a href=${historyViewUrl} target="_blank" rel="noreferrer noopener">Git History</a>
    </p>
    ${customSegment}
  `;

  const hastTree = unified().use(rehypeParse, { fragment: true }).parse(frontmatterString);
  return toJsxRuntime(hastTree, { Fragment, jsx, jsxs });
}

export default ((opts?: Partial<ContentMetaOptions>) => {
  // Merge options with defaults
  const options: ContentMetaOptions = { ...defaultOptions, ...opts }

  function ContentMetadata({ cfg, fileData, displayClass }: QuartzComponentProps) {
    const text = fileData.text

    const sourcefilePath = `${options?.rootDirectory}/${fileData.relativePath}`
    const sourceViewUrl = `${options?.repoLink}/blob/${options?.branch}/${sourcefilePath!}`
    const blameViewUrl = `${options?.repoLink}/blame/${options?.branch}/${sourcefilePath!}`

    const gitHistoryBasePath = options?.repoLink.replace("github.com", "github.githistory.xyz")
    const historyViewUrl = `${gitHistoryBasePath}/commits/${options?.branch}/${sourcefilePath!}`

    if (text) {
      let createdTime: JSX.Element = <></>;
      let modifiedTime: JSX.Element = <></>;

      if (fileData.dates) {
        createdTime = <Date date={fileData.dates?.created ?? new globalThis.Date()} locale={cfg.locale} />
        modifiedTime = <Date date={fileData.dates?.modified ?? new globalThis.Date()} locale={cfg.locale} />
      }

      // Display reading time if enabled
      let readingTimeValue: string = ""
      if (options.showReadingTime) {
        const { minutes, words: _words } = readingTime(text)
        const displayedTime = i18n(cfg.locale).components.contentMeta.readingTime({
          minutes: Math.ceil(minutes),
        })
        readingTimeValue = `${_words} words, ${displayedTime}`
      }

      // Generate page specific frontmatter
      const frontmatterElement = frontmatterComponentGenerator(
        cfg, fileData, sourceViewUrl, blameViewUrl, historyViewUrl, displayClass,
        createdTime, modifiedTime, readingTimeValue
      );

      return (
        <div class={classNames(displayClass, "frontmatter-content")}>
          {frontmatterElement}
        </div>
      )
    } else {
      return null
    }
  }

  ContentMetadata.css = style

  return ContentMetadata
}) satisfies QuartzComponentConstructor
