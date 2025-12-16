import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
  ExternalHyperlink,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  HorizontalPositionRelativeFrom,
  VerticalPositionRelativeFrom,
  HorizontalPositionAlign,
  VerticalPositionAlign,
  TextWrappingType,
  TextWrappingSide,
} from 'docx';

const COLORS = {
  black: '000000',
  silver: 'c0c0c0',
  gray: '808080',
  white: 'ffffff',
  maroon: '800000',
  red: 'ff0000',
  purple: '800080',
  fuchsia: 'ff00ff',
  green: '008000',
  lime: '00ff00',
  olive: '808000',
  yellow: 'ffff00',
  navy: '000080',
  blue: '0000ff',
  teal: '008080',
  aqua: '00ffff',
  aliceblue: 'f0f8ff',
  antiquewhite: 'faebd7',
  aquamarine: '7fffd4',
  azure: 'f0ffff',
  beige: 'f5f5dc',
  bisque: 'ffe4c4',
  blanchedalmond: 'ffebcd',
  blueviolet: '8a2be2',
  brown: 'a52a2a',
  burlywood: 'deb887',
  cadetblue: '5f9ea0',
  chartreuse: '7fff00',
  chocolate: 'd2691e',
  coral: 'ff7f50',
  cornflowerblue: '6495ed',
  cornsilk: 'fff8dc',
  crimson: 'dc143c',
  cyan: '00ffff',
  darkblue: '00008b',
  darkcyan: '008b8b',
  darkgoldenrod: 'b8860b',
  darkgray: 'a9a9a9',
  darkgreen: '006400',
  darkgrey: 'a9a9a9',
  darkkhaki: 'bdb76b',
  darkmagenta: '8b008b',
  darkolivegreen: '556b2f',
  darkorange: 'ff8c00',
  darkorchid: '9932cc',
  darkred: '8b0000',
  darksalmon: 'e9967a',
  darkseagreen: '8fbc8f',
  darkslateblue: '483d8b',
  darkslategray: '2f4f4f',
  darkslategrey: '2f4f4f',
  darkturquoise: '00ced1',
  darkviolet: '9400d3',
  deeppink: 'ff1493',
  deepskyblue: '00bfff',
  dimgray: '696969',
  dimgrey: '696969',
  dodgerblue: '1e90ff',
  firebrick: 'b22222',
  floralwhite: 'fffaf0',
  forestgreen: '228b22',
  gainsboro: 'dcdcdc',
  ghostwhite: 'f8f8ff',
  gold: 'ffd700',
  goldenrod: 'daa520',
  greenyellow: 'adff2f',
  grey: '808080',
  honeydew: 'f0fff0',
  hotpink: 'ff69b4',
  indianred: 'cd5c5c',
  indigo: '4b0082',
  ivory: 'fffff0',
  khaki: 'f0e68c',
  lavender: 'e6e6fa',
  lavenderblush: 'fff0f5',
  lawngreen: '7cfc00',
  lemonchiffon: 'fffacd',
  lightblue: 'add8e6',
  lightcoral: 'f08080',
  lightcyan: 'e0ffff',
  lightgoldenrodyellow: 'fafad2',
  lightgray: 'd3d3d3',
  lightgreen: '90ee90',
  lightgrey: 'd3d3d3',
  lightpink: 'ffb6c1',
  lightsalmon: 'ffa07a',
  lightseagreen: '20b2aa',
  lightskyblue: '87cefa',
  lightslategray: '778899',
  lightslategrey: '778899',
  lightsteelblue: 'b0c4de',
  lightyellow: 'ffffe0',
  limegreen: '32cd32',
  linen: 'faf0e6',
  magenta: 'ff00ff',
  mediumaquamarine: '66cdaa',
  mediumblue: '0000cd',
  mediumorchid: 'ba55d3',
  mediumpurple: '9370db',
  mediumseagreen: '3cb371',
  mediumslateblue: '7b68ee',
  mediumspringgreen: '00fa9a',
  mediumturquoise: '48d1cc',
  mediumvioletred: 'c71585',
  midnightblue: '191970',
  mintcream: 'f5fffa',
  mistyrose: 'ffe4e1',
  moccasin: 'ffe4b5',
  navajowhite: 'ffdead',
  oldlace: 'fdf5e6',
  olivedrab: '6b8e23',
  orange: 'ffa500',
  orangered: 'ff4500',
  orchid: 'da70d6',
  palegoldenrod: 'eee8aa',
  palegreen: '98fb98',
  paleturquoise: 'afeeee',
  palevioletred: 'db7093',
  papayawhip: 'ffefd5',
  peachpuff: 'ffdab9',
  peru: 'cd853f',
  pink: 'ffc0cb',
  plum: 'dda0dd',
  powderblue: 'b0e0e6',
  rosybrown: 'bc8f8f',
  royalblue: '4169e1',
  saddlebrown: '8b4513',
  salmon: 'fa8072',
  sandybrown: 'f4a460',
  seagreen: '2e8b57',
  seashell: 'fff5ee',
  sienna: 'a0522d',
  skyblue: '87ceeb',
  slateblue: '6a5acd',
  slategray: '708090',
  slategrey: '708090',
  snow: 'fffafa',
  springgreen: '00ff7f',
  steelblue: '4682b4',
  tan: 'd2b48c',
  thistle: 'd8bfd8',
  tomato: 'ff6347',
  turquoise: '40e0d0',
  violet: 'ee82ee',
  wheat: 'f5deb3',
  whitesmoke: 'f5f5f5',
  yellowgreen: '9acd32',
};

/**
 * Convert a URL (including blob URLs) to an ArrayBuffer
 */
async function bufferFromUrl(url) {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

/**
 * Convert HTML to DOCX
 * @param {string} html - The HTML content from TinyMCE
 * @returns {Promise<Blob>} - The DOCX file as a Blob
 */
export async function html2docx(html) {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, 'text/html');

  const docxElements = [];
  let nodes = Array.from(
    document.querySelectorAll('p,pre,table,h1,h2,h3,h4,h5,h6,ul,ol')
  );

  // Filter out nested nodes
  nodes = nodes.filter((node) => {
    return !nodes.filter((el) => el !== node).some((el) => el.contains(node));
  });

  for (const node of nodes) {
    const instance = nodes.indexOf(node);

    if (node.nodeName === 'P' || node.nodeName === 'PRE') {
      docxElements.push(await buildParagraph(node));
    } else if (node.nodeName === 'TABLE') {
      docxElements.push(await buildTable(node));
    } else if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(node.nodeName)) {
      docxElements.push(await buildHeading(node));
    } else if (node.nodeName === 'UL') {
      docxElements.push(...(await buildUl(node, instance)));
    } else if (node.nodeName === 'OL') {
      docxElements.push(...(await buildOl(node, instance)));
    }
  }

  const docx = new Document({
    sections: [
      {
        children: docxElements,
      },
    ],
    numbering: {
      config: [
        {
          reference: 'arabic',
          levels: [
            {
              level: 0,
              format: 'decimal',
              text: '%1',
              alignment: AlignmentType.START,
              style: {
                paragraph: {
                  indent: { left: 300, hanging: 200 },
                },
              },
            },
            {
              level: 1,
              format: 'decimal',
              text: '%1.%2',
              alignment: AlignmentType.START,
              style: {
                paragraph: {
                  indent: { left: 600, hanging: 200 },
                },
              },
            },
          ],
        },
      ],
    },
  });

  const blob = await Packer.toBlob(docx);
  return blob;
}

async function buildParagraph(node) {
  const style = parseStyle(node);
  if (style.size == null) style.size = 24;
  if (style.font == null && node.nodeName === 'PRE') style.font = 'Courier New';

  const children = await buildChildNodes(node, style);

  const alignment = getAlign(node);
  const border = parseBorder(node);

  if (node.parentElement?.nodeName === 'BLOCKQUOTE') {
    if (border.left == null) {
      border.left = { color: 'cbd5e1', size: 16, space: 1, style: 'single' };
    }
    if (style.indent == null || style.indent.left === 0) {
      style.indent = { left: 80 };
    }
  }

  const paragraph = new Paragraph({
    alignment,
    indent: style.indent,
    children,
    border,
  });
  return paragraph;
}

async function buildTable(node) {
  const rows = [];
  for (const row of node.querySelectorAll('tr')) {
    const cells = [];
    for (const cell of row.querySelectorAll('th, td')) {
      cells.push(
        new TableCell({
          children: [new Paragraph({ children: await buildChildNodes(cell) })],
        })
      );
    }
    rows.push(
      new TableRow({
        children: cells,
      })
    );
  }

  const firstRow = node.querySelector('tr');
  const numberOfColumns = firstRow
    ? firstRow.querySelectorAll('th, td').length
    : 1;

  const table = new Table({
    rows,
    width: 0,
    columnWidths: Array(numberOfColumns).fill(
      Math.floor(9638 / numberOfColumns),
      0,
      numberOfColumns
    ),
  });
  return table;
}

async function buildHeading(node) {
  const style = parseStyle(node);
  const children = await buildChildNodes(node, style);
  const alignment = getAlign(node);

  let heading;
  switch (node.nodeName) {
    case 'H1':
      heading = HeadingLevel.HEADING_1;
      break;
    case 'H2':
      heading = HeadingLevel.HEADING_2;
      break;
    case 'H3':
      heading = HeadingLevel.HEADING_3;
      break;
    case 'H4':
      heading = HeadingLevel.HEADING_4;
      break;
    case 'H5':
      heading = HeadingLevel.HEADING_5;
      break;
    case 'H6':
      heading = HeadingLevel.HEADING_6;
      break;
    default:
      break;
  }

  const border = parseBorder(node);
  const paragraph = new Paragraph({
    alignment,
    children,
    indent: style.indent,
    heading,
    border,
  });
  return paragraph;
}

async function buildUl(node, instance) {
  const list = [];
  for (const li of node.querySelectorAll(':scope > li')) {
    list.push(
      new Paragraph({
        children: await buildChildNodes(li),
        bullet: { level: 0, instance },
      })
    );
    if (li.querySelectorAll == null) continue;
    for (const subLi of li.querySelectorAll('ul li')) {
      list.push(
        new Paragraph({
          children: await buildChildNodes(subLi),
          bullet: { level: 1, instance },
        })
      );
    }
  }
  return list;
}

async function buildOl(node, instance) {
  const list = [];
  for (const li of node.querySelectorAll(':scope > li')) {
    list.push(
      new Paragraph({
        children: await buildChildNodes(li),
        numbering: { reference: 'arabic', instance, level: 0 },
      })
    );
    if (li.querySelectorAll == null) continue;
    for (const subLi of li.querySelectorAll('ol li')) {
      list.push(
        new Paragraph({
          children: await buildChildNodes(subLi),
          numbering: { reference: 'arabic', instance, level: 1 },
        })
      );
    }
  }
  return list;
}

async function buildChildNodes(node, inheritAttr = {}) {
  let values = [];
  const children = node.childNodes;

  for (const child of children) {
    if (child.nodeName === '#text') {
      const textRun = new TextRun({
        text: child.nodeValue,
        bold: inheritAttr.bold,
        italics: inheritAttr.italics,
        subScript: inheritAttr.subScript,
        superScript: inheritAttr.superScript,
        strike: inheritAttr.strike,
        underline: inheritAttr.underline ? {} : null,
        color: inheritAttr.color,
        shading: inheritAttr.shading,
        size: inheritAttr.size,
        allCaps: inheritAttr.allCaps,
        font: inheritAttr.font,
        style: inheritAttr.style,
      });
      values = [...values, textRun];
    } else if (child.nodeName === 'A' && child.getAttribute('href')) {
      const link = new ExternalHyperlink({
        children: await buildChildNodes(child, { style: 'Hyperlink' }),
        link: child.getAttribute('href'),
      });
      values = [...values, link];
    } else if (child.nodeName === 'IMG') {
      const buffer = await bufferFromUrl(child.src);
      if (buffer) {
        const floating = parseImageFloating(child);
        const imageRun = new ImageRun({
          data: buffer,
          transformation: { width: child.width || 100, height: child.height || 100 },
          floating,
        });
        values = [...values, imageRun];
      }
    } else if (
      node.childNodes.length > 0 &&
      !['UL', 'OL'].includes(node.nodeName)
    ) {
      const passedDownStyle = { ...inheritAttr, ...parseStyle(child) };

      if (child.nodeName === 'STRONG') passedDownStyle.bold = true;
      if (child.nodeName === 'EM') passedDownStyle.italics = true;
      if (child.nodeName === 'SUB') passedDownStyle.subScript = true;
      if (child.nodeName === 'SUP') passedDownStyle.superScript = true;
      if (child.nodeName === 'S') passedDownStyle.strike = true;
      if (child.nodeName === 'U') passedDownStyle.underline = true;

      if (child.nodeName === 'A') {
        passedDownStyle.anchor = child.getAttribute('href');
        passedDownStyle.underline = true;
      }

      values = [...values, ...(await buildChildNodes(child, passedDownStyle))];
    }
  }
  return values;
}

function parseStyle(node) {
  const style = {};

  if (!node.getAttribute) return style;

  const rawStyle = (node.getAttribute('style') || '').split(';');

  for (const el of rawStyle) {
    const values = el.trim().split(':');
    if (values.length === 2) {
      style[values[0].trim()] = values[1].trim();
    }
  }

  const fill = toHex(style['background-color']);
  if (fill) {
    style['shading'] = { fill };
  }

  style['color'] = toHex(style['color']);

  if (style['font-family']) {
    style['font'] = style['font-family'].split(',')[0];
    if (style['font']) {
      style['font'] = style['font'].split("'").join('');
    }
  }

  style['size'] = toHalfpoint(style['font-size']);
  const indentLeft = toHalfpoint(style['padding-left']);
  if (!isNaN(indentLeft)) {
    style['indent'] = { left: indentLeft * 10 };
  }

  if (style['text-transform'] === 'uppercase') {
    style['allCaps'] = true;
  }
  if (style['text-transform'] === 'capitalize') {
    style['smallCaps'] = true;
  }
  if (style['text-decoration'] === 'line-through') {
    style['strike'] = true;
  }
  if (style['text-decoration'] === 'underline') {
    style['underline'] = true;
  }
  if (style['font-style'] === 'italic') {
    style['italics'] = true;
  }
  if (style['font-weight'] === 'bold' || parseInt(style['font-weight']) >= 700) {
    style['bold'] = true;
  }

  const allowAttrs = [
    'color',
    'shading',
    'size',
    'indent',
    'allCaps',
    'strike',
    'font',
    'italics',
    'underline',
    'bold',
  ];
  for (const key of Object.keys(style)) {
    if (!allowAttrs.includes(key) || style[key] == null) {
      delete style[key];
    }
  }
  return style;
}

function toHalfpoint(str) {
  if (str == null || str === '') return null;
  str = str.trim();

  let unit;
  if (str.endsWith('pt')) {
    unit = 'pt';
  } else if (str.endsWith('px')) {
    unit = 'px';
  }

  if (unit) {
    let value = parseInt(str.split(unit).join(''));
    if (isNaN(value)) return null;
    if (unit === 'px') {
      value = 2 * Math.ceil((72 * value) / 96);
    } else if (unit === 'pt') {
      value = 2 * value;
    }
    return value;
  } else {
    return null;
  }
}

function toHex(str) {
  if (str == null || str === '') return null;
  str = str.trim();

  if (COLORS[str] != null) return COLORS[str];

  let color;
  if (str.includes('rgb')) {
    color = rgbToHex(str);
  } else {
    color = str.split('#').join('').trim();
  }

  if (color.length === 3) {
    color = color + color;
  }
  if (color == null || !/^[0-9A-F]{6}$/i.test(color)) {
    color = null;
  }
  return color;
}

function rgbToHex(rgb) {
  const sep = rgb.indexOf(',') > -1 ? ',' : ' ';
  const parts = rgb.substr(4).split(')')[0].split(sep);

  let r = (+parts[0]).toString(16);
  let g = (+parts[1]).toString(16);
  let b = (+parts[2]).toString(16);

  if (r.length === 1) r = '0' + r;
  if (g.length === 1) g = '0' + g;
  if (b.length === 1) b = '0' + b;

  return r + g + b;
}

function parseBorder(node) {
  const style = {};
  if (!node.getAttribute) return {};

  const rawStyle = (node.getAttribute('style') || '').split(';');

  for (const el of rawStyle) {
    const values = el.trim().split(':');
    if (values.length === 2) {
      style[values[0].trim()] = values[1].trim();
    }
  }

  let top, right, bottom, left;

  if (style['border'] != null) {
    const [size, , ...colorParts] = style['border'].split(' ');
    const color = toHex(colorParts.join('').trim());
    const sizeValue = toHalfpoint(size) * 4;
    top = { color, size: sizeValue, space: 1, style: 'single' };
    right = { color, size: sizeValue, space: 1, style: 'single' };
    bottom = { color, size: sizeValue, space: 1, style: 'single' };
    left = { color, size: sizeValue, space: 1, style: 'single' };
  }
  if (style['border-left'] != null) {
    const [size, , ...colorParts] = style['border-left'].split(' ');
    const color = toHex(colorParts.join('').trim());
    const sizeValue = toHalfpoint(size) * 4;
    left = { color, size: sizeValue, space: 1, style: 'single' };
  }
  if (style['border-right'] != null) {
    const [size, , ...colorParts] = style['border-right'].split(' ');
    const color = toHex(colorParts.join('').trim());
    const sizeValue = toHalfpoint(size) * 4;
    right = { color, size: sizeValue, space: 1, style: 'single' };
  }
  if (style['border-top'] != null) {
    const [size, , ...colorParts] = style['border-top'].split(' ');
    const color = toHex(colorParts.join('').trim());
    const sizeValue = toHalfpoint(size) * 4;
    top = { color, size: sizeValue, space: 1, style: 'single' };
  }
  if (style['border-bottom'] != null) {
    const [size, , ...colorParts] = style['border-bottom'].split(' ');
    const color = toHex(colorParts.join('').trim());
    const sizeValue = toHalfpoint(size) * 4;
    bottom = { color, size: sizeValue, space: 1, style: 'single' };
  }

  return { top, right, bottom, left };
}

function parseImageFloating(node) {
  const style = {};

  if (!node.getAttribute) return null;

  const rawStyle = (node.getAttribute('style') || '').split(';');

  for (const el of rawStyle) {
    const values = el.trim().split(':');
    if (values.length === 2) {
      style[values[0].trim()] = values[1].trim();
    }
  }

  const verticalPosition = {
    relative: VerticalPositionRelativeFrom.TOP_MARGIN,
    align: VerticalPositionAlign.TOP,
  };

  const margin = {
    top: 360000,
    right: 360000,
    bottom: 360000,
    left: 360000,
  };

  if (style['margin-left'] === 'auto' && style['margin-right'] === 'auto') {
    return {
      horizontalPosition: {
        relative: HorizontalPositionRelativeFrom.COLUMN,
        align: HorizontalPositionAlign.CENTER,
      },
      verticalPosition,
      margin,
      wrap: { type: TextWrappingType.TOP_AND_BOTTOM, side: TextWrappingSide.BOTH_SIDES },
    };
  }
  if (style['float'] === 'left') {
    return {
      horizontalPosition: {
        relative: HorizontalPositionRelativeFrom.COLUMN,
        align: HorizontalPositionAlign.LEFT,
      },
      verticalPosition,
      margin,
      wrap: { type: TextWrappingType.SQUARE, side: TextWrappingSide.RIGHT },
    };
  }
  if (style['float'] === 'right') {
    return {
      horizontalPosition: {
        relative: HorizontalPositionRelativeFrom.COLUMN,
        align: HorizontalPositionAlign.RIGHT,
      },
      verticalPosition,
      margin,
      wrap: { type: TextWrappingType.SQUARE, side: TextWrappingSide.LEFT },
    };
  }
  return null;
}

function getAlign(node) {
  if (!node.getAttribute) return AlignmentType.LEFT;

  const rawStyle = node.getAttribute('style');
  if (rawStyle == null) return AlignmentType.LEFT;

  const style = {};
  for (const pair of rawStyle.split(';')) {
    if (pair.split(':').length !== 2) continue;
    const key = pair.split(':')[0].trim();
    const value = pair.split(':')[1].trim();
    style[key] = value;
  }

  switch (style['text-align']) {
    case 'left':
      return AlignmentType.LEFT;
    case 'center':
      return AlignmentType.CENTER;
    case 'justify':
      return AlignmentType.JUSTIFIED;
    case 'right':
      return AlignmentType.RIGHT;
    default:
      return AlignmentType.LEFT;
  }
}
