import readingTime from "reading-time"
import { classNames } from "../util/lang"
import { formatDate, getDate } from "./Date"
import { QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { i18n } from "../i18n"
import { JSX } from "preact"
import style from "./styles/contentMeta.scss"

interface ContentMetaOptions {
  /**
   * Whether to display reading time
   */
  showReadingTime: boolean
  showComma: boolean
}

const defaultOptions: ContentMetaOptions = {
  showReadingTime: true,
  showComma: true,
}

export default ((opts?: Partial<ContentMetaOptions>) => {
  // Merge options with defaults
  const options: ContentMetaOptions = { ...defaultOptions, ...opts }

  function ContentMetadata({ cfg, fileData, displayClass }: QuartzComponentProps) {
    const text = fileData.text

    if (text) {
      let modifiedTimeStr: string = ""
      let createdTimeStr: string = ""
      // const segments: string[] = []

      if (fileData.dates) {
        const cfgDefaultDataType = cfg.defaultDateType
        // For backward compatibility, just in case this is used somewhere else

        if (fileData.dates.created) {
          cfg.defaultDateType = "created"
          createdTimeStr = `Created: ${formatDate(getDate(cfg, fileData)!)}`
        }

        if (fileData.dates.modified) {
          cfg.defaultDateType = "modified"
          modifiedTimeStr = `Modified: ${formatDate(getDate(cfg, fileData)!)}`
        }

        cfg.defaultDateType = cfgDefaultDataType
      }

      // Display reading time if enabled
      let readingTimeStr: string = ""
      if (options.showReadingTime) {
        const { minutes, words: _words } = readingTime(text)
        const displayedTime = i18n(cfg.locale).components.contentMeta.readingTime({
          minutes: Math.ceil(minutes),
        })
        readingTimeStr = `${_words} words, ${displayedTime}`
      }

      if (fileData.relativePath?.startsWith("books/")) {
        const frontMatter = fileData.frontmatter

        const authorStr = `Author: ${frontMatter?.author}`
        const publishedStr = `Published: ${frontMatter?.published}`
        const typeStr = `Type: ${frontMatter?.type}`
        const ratingStr = `Rating: ${frontMatter?.rating}`
        const statusStr = `Status: ${frontMatter?.status}`

        return (
          <p class={classNames(displayClass, "content-meta")}>
            {authorStr}<br />
            {publishedStr}<br />
            {typeStr}<br />
            {ratingStr}<br />
            {statusStr}<br />
            {createdTimeStr}<br />
            {modifiedTimeStr}
          </p>
        )
      } else {
        return (
          <p class={classNames(displayClass, "content-meta")}>
            {createdTimeStr} • {modifiedTimeStr}<br />
            {readingTimeStr}
          </p>
        )
      }
    } else {
      return null
    }
  }

  ContentMetadata.css = style

  return ContentMetadata
}) satisfies QuartzComponentConstructor
