import mammoth from 'mammoth';

const monospaceFonts = ['consolas', 'courier', 'courier new'];

const options = {
  transformDocument: mammoth.transforms.paragraph(transformParagraph),
  preserveColors: true,
  preserveFonts: true,
  styleMap: [
    "p[style-name='Title'] => h1:fresh",
    "p[style-name='Heading 1'] => h1:fresh",
    "p[style-name='Heading 2'] => h2:fresh",
    "p[style-name='Heading 3'] => h3:fresh",
    "p[style-name='Heading 4'] => h4:fresh",
    "p[style-name='Heading 5'] => h5:fresh",
    "p[style-name='Heading 6'] => h6:fresh",
  ],
  convertImage: mammoth.images.imgElement(function (image) {
    return image.read().then(function (buffer) {
      const file = new File([buffer], 'image', { type: image.contentType });
      const url = URL.createObjectURL(file);
      return {
        src: url,
        width: image.width,
        height: image.height,
        style: image.style,
      };
    });
  }),
};

/**
 * Convert a DOCX ArrayBuffer to HTML
 * @param {ArrayBuffer} arrayBuffer - The DOCX file as an ArrayBuffer
 * @returns {Promise<string>} - The HTML content
 */
export async function docx2html(arrayBuffer) {
  try {
    const result = await mammoth.convertToHtml({ arrayBuffer }, options);
    return result.value;
  } catch (error) {
    console.error('Error converting DOCX to HTML:', error);
    return '';
  }
}

/**
 * Transform paragraphs with monospace fonts to code blocks
 */
function transformParagraph(paragraph) {
  const runs = mammoth.transforms.getDescendantsOfType(paragraph, 'run');

  const isMatch =
    runs.length > 0 &&
    runs.every(function (run) {
      return run.font && monospaceFonts.indexOf(run.font.toLowerCase()) !== -1;
    });

  if (isMatch) {
    return {
      ...paragraph,
      styleId: 'code',
      styleName: 'Code',
    };
  } else {
    return paragraph;
  }
}
