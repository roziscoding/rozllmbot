export function sanitizeTelegramHTML(text: string): string {
  const allowedTags = [
    "b",
    "i",
    "u",
    "s",
    "tg-spoiler",
    "a",
    "code",
    "pre",
    "blockquote",
  ];

  // Remove any opening or closing tags that are not in the allowed list
  return text.replace(/<\/?([a-z][a-z0-9-]*)\b[^>]*>/gi, (match, tagName) => {
    if (allowedTags.includes(tagName.toLowerCase())) {
      return match;
    }

    if (tagName.toLowerCase() === "br") {
      return "\n";
    }

    return "";
  });
}
