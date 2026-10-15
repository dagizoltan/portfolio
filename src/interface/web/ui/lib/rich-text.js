const ESCAPES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
};

const escapeHtml = (text) => text.replace(/[&<>"]/g, (ch) => ESCAPES[ch]);

/**
 * Inline formatting for the long-form prose fields in the YAML dictionaries.
 *
 * These fields are hand-written copy, not full markdown documents, so pulling
 * in a markdown parser for them would be overkill — but they do use `**bold**`
 * and `*italic*`, which would otherwise render literally.
 *
 * Input is escaped first, so the emphasis markers are the only markup that can
 * reach the page.
 */
export const inlineRich = (text = '') =>
    escapeHtml(text)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');

/** Splits a blank-line-separated block into paragraphs with inline formatting. */
export const paragraphs = (text = '') =>
    text
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block) => `<p>${inlineRich(block)}</p>`)
        .join('');
