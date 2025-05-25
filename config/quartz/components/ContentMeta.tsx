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

const customSegmentGenerator = (
  cfg: QuartzComponentProps["GlobalConfiguration"], fileData: QuartzComponentProps["fileData"],
  displayClass: QuartzComponentProps["displayClass"], propertyList: string[],
  createdTime: JSX.Element
) => {
  const propertiesWithComma = ["author", "translator", "artist"];
  let customSegment = ``;

  for (const property of propertyList) {
    let frontMatterValue = fileData.frontmatter?.[property] as string;
    if (!frontMatterValue) {
      continue;
    }

    let frontMatterName = capitalize(property);

    if (property === "date") {
      frontMatterName = "Started";
      frontMatterValue = renderToString(createdTime);
    }

    if (property === "finished") {
      const parsedDate = new globalThis.Date(frontMatterValue);
      frontMatterValue = renderToString(<Date date={parsedDate} locale={cfg.locale} />)
    }

    if (propertiesWithComma.includes(property)) {
      frontMatterValue = frontMatterValue.split(",").map(name => name.trim()).join("<br>");
    }

    customSegment += `
      <p style="margin: 0;" class="${classNames(displayClass, "content-meta")}">
        <span class="content-meta-title">${frontMatterName}:</span>
        <span class="content-meta-value">${frontMatterValue}</span>
      </p>
    `;
  }

  return customSegment;
}

const frontmatterComponentGenerator = (
  cfg: QuartzComponentProps["GlobalConfiguration"], fileData: QuartzComponentProps["fileData"], sourceViewUrl: string, blameViewUrl: string, historyViewUrl: string, displayClass: QuartzComponentProps["displayClass"],
  createdTime: JSX.Element, modifiedTime: JSX.Element, readingTimeValue: string
) => {
  let customSegment = ``;

  const sharedProperties = [
    'author', 'published', 'type', 'format', 'ISBN', 'rating', 'status', 'date', 'finished'
  ];

  if (fileData.slug?.includes("books/")) {
    const bookProperties = [...sharedProperties];
    bookProperties.splice(4, 0, 'pages');
    bookProperties.splice(1, 0, 'translator');
    customSegment = customSegmentGenerator(cfg, fileData, displayClass, bookProperties, createdTime);
  } else if (fileData.slug?.includes("comics/")) {
    const comicProperties = [...sharedProperties];
    comicProperties.splice(4, 0, 'chapters');
    comicProperties.splice(1, 0, 'artist');
    customSegment = customSegmentGenerator(cfg, fileData, displayClass, comicProperties, createdTime);
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
      let modifiedTime: JSX.Element = <></>;
      let createdTime: JSX.Element = <></>;

      if (fileData.dates) {
        // For backward compatibility, just in case this is used somewhere else
        const cfgDefaultDataType = cfg.defaultDateType

        if (fileData.dates.created) {
          cfg.defaultDateType = "created"
          createdTime = <Date date={getDate(cfg, fileData)!} locale={cfg.locale} />
        }

        if (fileData.dates.modified) {
          cfg.defaultDateType = "modified"
          modifiedTime = <Date date={getDate(cfg, fileData)!} locale={cfg.locale} />
        }

        cfg.defaultDateType = cfgDefaultDataType
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
