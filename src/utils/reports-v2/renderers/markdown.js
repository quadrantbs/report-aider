export function renderToMarkdown(ast) {
  if (!ast) return "";

  let markdown = "";

  ast.parts.forEach((part) => {
    if (part.label) {
      markdown += `**${part.label}**\n`;
    }
    markdown += `${part.content}\n\n`;
  });

  return markdown.trim();
}
