---
layout: post
title: Shopify checkout extension with product HTML
permalink: shopify-checkout-ui-product-html
date: '2024-05-10 13:30:56'
archive: false
category: shopify,javascript,react
---

## Background

A project last month required a build of an upselling checkout UI extension for Shopify. The client wanted the description of the product to be what is displayed in the checkout, however, Shopify's checkout extension system does not support directly using HTML nor the `dangerouslySetInnerHtml` property. Additionally to this, the extensions do not support such services such a [`DOMParser`](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) -- something custom would have to be built.

Given the tight timeline for the project, it was decided to just build a quick transformation helper to convert the HTML Shopify uses for product descriptions into Checkout UI Extension components. It was successful, but I am sure it could be better written if we had more time.

It works by capturing each open and close tag of the HTML element, grabbing its details and contents, parsing into React components, then shifting the HTML string to remove what was just captured, then repeats the process.

## Input/output examples

An example description HTML from a product in Shopify:

```html
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
  LINE 1
</div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph"></div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
  LINE 2
</div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph"></div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
  LINE 3
</div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph"></div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
  LINE 4
</div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph"></div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
  LINE 5
</div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
  <br>
</div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
  LINE 6
</div>
<ul class="RichTextList-bulleted" style="list-style-type: disc;">
  <li>
    <div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
      ITEM 1
    </div>
  </li>
  <li>
    <div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
      ITEM 2
    </div>
  </li>
  <li>
    <div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
      ITEM 3
    </div>
  </li>
  <li>
    <div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
      ITEM 4
    </div>
  </li>
  <li>
    <div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
      ITEM 5
    </div>
  </li>
  <li>
    <div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
      ITEM 6
    </div>
  </li>
  <li>
    <div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
      ITEM 7
    </div>
  </li>
  <li>
    <div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
      ITEM 8
    </div>
  </li>
  <li>
    <div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
      ITEM 9
    </div>
  </li>
</ul>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
  LINE 7
</div>
```

Example of the transformed output:

```jsx
<>
  <TextBlock>
    LINE 1
  </TextBlock>
  <TextBlock>
    LINE 2
  </TextBlock>
  <TextBlock>
    LINE 3
  </TextBlock>
  <TextBlock>
    LINE 4
  </TextBlock>
  <TextBlock>
    LINE 5
  </TextBlock>
  <TextBlock>
    LINE 6
  </TextBlock>
  <List>
    <ListItem>
      <TextBlock>
        ITEM 1
      </TextBlock>
    </ListItem>
    <ListItem>
      <TextBlock>
        ITEM 2
      </TextBlock>
    </ListItem>
    <ListItem>
      <TextBlock>
        ITEM 3
      </TextBlock>
    </ListItem>
    <ListItem>
      <TextBlock>
        ITEM 4
      </TextBlock>
    </ListItem>
    <ListItem>
      <TextBlock>
        ITEM 5
      </TextBlock>
    </ListItem>
    <ListItem>
      <TextBlock>
        ITEM 6
      </TextBlock>
    </ListItem>
    <ListItem>
      <TextBlock>
        ITEM 7
      </TextBlock>
    </ListItem>
    <ListItem>
      <TextBlock>
        ITEM 8
      </TextBlock>
    </ListItem>
    <ListItem>
      <TextBlock>
        ITEM 9
      </TextBlock>
    </ListItem>
  </ListItem>
  <TextBlock>
    LINE 7
  </TextBlock>
</>
```

## Usage

Supports:

- `p`, `div`, `ul`, `ol`, `li`
- `b/strong`, `i/em`
- `h1`-`h4` via `Heading`
- line breaks (`\\n`, `\n`, `<br>`)
- basic table structures (`table`, `thead/tbody/tfoot`, `tr`, `td/th`) mapped to `Grid`/`View`.

### 1) Checkout extension usage

`extensions/checkout-{something}/src/utils/htmlTransform.tsx`:

```tsx
import {
  Grid,
  Heading,
  List,
  ListItem,
  Text,
  TextBlock,
  View,
} from "@shopify/ui-extensions-react/checkout";
import { createHtmlTransformer } from "../../../shared/htmlTransformer";

export default createHtmlTransformer({
  Grid,
  Heading,
  List,
  ListItem,
  Text,
  TextBlock,
  View,
});
```

Then in a component:

```tsx
import htmlTransformer from "../../utils/htmlTransform";

const transformed = htmlTransformer(contentHtml);

return <BlockStack spacing="base">{transformed}</BlockStack>;
```

### 2) Customer account extension usage

`extensions/customer-{something}/src/utils/htmlTransform.tsx`:

```tsx
import {
  Grid,
  Heading,
  List,
  ListItem,
  Text,
  TextBlock,
  View,
} from "@shopify/ui-extensions-react/customer-account";
import { createHtmlTransformer } from "../../../shared/htmlTransformer";

export default createHtmlTransformer({
  Grid,
  Heading,
  List,
  ListItem,
  Text,
  TextBlock,
  View,
});
```

## Code

```tsx
import { Fragment, type ComponentType, type ReactNode } from "react";

const BREAK_REGEX = /\\n|\r?\n/g;

const HTML_TOKENS = {
  TAG_OPEN: "<",
  TAG_CLOSE: ">",
  CLOSING_TAG_PREFIX: "/",
  BR_TAG: "br",
  PARAGRAPH_TAG: "p",
  UNORDERED_LIST_TAG: "ul",
  ORDERED_LIST_TAG: "ol",
  LIST_ITEM_TAG: "li",
  DIV_TAG: "div",
  BOLD_TAG: "b",
  STRONG_TAG: "strong",
  ITALIC_TAG: "i",
  EMPHASIS_TAG: "em",
  H1_TAG: "h1",
  H2_TAG: "h2",
  H3_TAG: "h3",
  H4_TAG: "h4",
  TABLE_TAG: "table",
  TABLE_ROW_TAG: "tr",
  TABLE_DATA_TAG: "td",
  TABLE_HEADER_TAG: "th",
  TABLE_HEAD_TAG: "thead",
  TABLE_BODY_TAG: "tbody",
  TABLE_FOOT_TAG: "tfoot",
} as const;

const NODE_TYPES = {
  TEXT: "text",
  LINE_BREAK: "lineBreak",
  ELEMENT: "element",
} as const;

type TextNode = {
  type: typeof NODE_TYPES.TEXT;
  content: string;
};

type LineBreakNode = {
  type: typeof NODE_TYPES.LINE_BREAK;
};

type ElementNode = {
  type: typeof NODE_TYPES.ELEMENT;
  name: string;
  classes: string[];
  children: HtmlNode[];
};

type HtmlNode = TextNode | LineBreakNode | ElementNode;

type Transformer = (
  element: ElementNode,
  children: ReactNode,
  index: number,
  fallback: () => JSX.Element
) => ReactNode;

type HtmlTransformer = (rawHtml: string, transformer?: Transformer) => ReactNode[];
type ElementRenderer = (element: ElementNode, children: ReactNode, index: number) => JSX.Element;
type ElementRendererMap = Record<string, ElementRenderer>;

type AnyUiComponent = ComponentType<Record<string, unknown>>;

type HtmlTransformerComponents = {
  Grid: AnyUiComponent;
  Heading: AnyUiComponent;
  List: AnyUiComponent;
  ListItem: AnyUiComponent;
  Text: AnyUiComponent;
  TextBlock: AnyUiComponent;
  View: AnyUiComponent;
};

type HtmlTransformerOptions = {
  elementRenderers?: Partial<ElementRendererMap>;
  replaceDefaultElementRenderers?: boolean;
};

const GRID_COLUMNS = {
  FILL: "fill",
} as const;

const DEFAULT_RENDERER_KEY = "__default";

/**
 * Type guard for element nodes.
 *
 * @param node - Candidate node.
 */
function isElementNode(node: HtmlNode): node is ElementNode {
  return node.type === NODE_TYPES.ELEMENT;
}

/**
 * Flattens table-related wrappers and returns row nodes.
 *
 * @param element - Table or section node.
 */
function extractTableRows(element: ElementNode): ElementNode[] {
  const rows: ElementNode[] = [];

  element.children.forEach((child) => {
    if (!isElementNode(child)) {
      return;
    }

    if (child.name === HTML_TOKENS.TABLE_ROW_TAG) {
      rows.push(child);
      return;
    }

    if (
      child.name === HTML_TOKENS.TABLE_HEAD_TAG ||
      child.name === HTML_TOKENS.TABLE_BODY_TAG ||
      child.name === HTML_TOKENS.TABLE_FOOT_TAG
    ) {
      rows.push(...extractTableRows(child));
    }
  });

  return rows;
}

/**
 * Counts cell nodes for a row.
 *
 * @param row - Table row node.
 */
function countRowCells(row: ElementNode): number {
  return row.children.filter((child) =>
    isElementNode(child) &&
    (child.name === HTML_TOKENS.TABLE_DATA_TAG || child.name === HTML_TOKENS.TABLE_HEADER_TAG)
  ).length;
}

/**
 * Builds Grid columns for table layout.
 *
 * @param table - Table element node.
 */
function buildTableColumns(table: ElementNode): Array<typeof GRID_COLUMNS.FILL> {
  const rows = extractTableRows(table);
  const maxColumns = rows.reduce((max, row) => Math.max(max, countRowCells(row)), 0);
  const safeColumns = Math.max(maxColumns, 1);
  return Array.from({ length: safeColumns }, () => GRID_COLUMNS.FILL);
}

/**
 * Extract class names from an HTML tag attribute string.
 *
 * @param attributes - Raw attribute string from a parsed tag.
 */
function parseClasses(attributes: string): string[] {
  const classMatch = attributes.match(/class="([^"]+)"/i);
  return classMatch === null ? [] : classMatch[1].split(" ").filter(Boolean);
}

/**
 * Appends text and line break nodes for plain text chunks.
 * Supports escaped newlines ("\\n") and actual line breaks.
 *
 * @param nodes - Mutable target node collection.
 * @param text - Plain text content to tokenize and append.
 */
function appendTextNodes(nodes: HtmlNode[], text: string): void {
  if (!text) {
    return;
  }

  let lastIndex = 0;
  BREAK_REGEX.lastIndex = 0;
  let match = BREAK_REGEX.exec(text);

  while (match !== null) {
    const beforeBreak = text.slice(lastIndex, match.index);
    if (!/^\s*$/.test(beforeBreak)) {
      nodes.push({
        type: NODE_TYPES.TEXT,
        content: beforeBreak,
      });
    }

    nodes.push({ type: NODE_TYPES.LINE_BREAK });
    lastIndex = match.index + match[0].length;
    match = BREAK_REGEX.exec(text);
  }

  const remaining = text.slice(lastIndex);
  if (!/^\s*$/.test(remaining)) {
    nodes.push({
      type: NODE_TYPES.TEXT,
      content: remaining,
    });
  }
}

/**
 * Parses raw HTML into a simple node tree (elements, text, line breaks).
 *
 * @param html - Raw HTML input.
 * @param index - Cursor position to start parsing from.
 * @param untilTagName - Optional closing tag name to stop at.
 */
function parseNodes(html: string, index = 0, untilTagName: string | null = null): [HtmlNode[], number] {
  const nodes: HtmlNode[] = [];
  let cursor = index;

  while (cursor < html.length) {
    const tagStart = html.indexOf(HTML_TOKENS.TAG_OPEN, cursor);

    if (tagStart === -1) {
      appendTextNodes(nodes, html.slice(cursor));
      return [nodes, html.length];
    }

    if (tagStart > cursor) {
      appendTextNodes(nodes, html.slice(cursor, tagStart));
      cursor = tagStart;
      continue;
    }

    const tagEnd = html.indexOf(HTML_TOKENS.TAG_CLOSE, cursor + 1);
    if (tagEnd === -1) {
      appendTextNodes(nodes, html.slice(cursor));
      return [nodes, html.length];
    }

    const rawTag = html.slice(cursor + 1, tagEnd).trim();
    cursor = tagEnd + 1;

    if (rawTag.startsWith(HTML_TOKENS.CLOSING_TAG_PREFIX)) {
      const closingTagName = rawTag.slice(1).trim().split(/\s+/)[0]?.toLowerCase();
      if (untilTagName && closingTagName === untilTagName) {
        return [nodes, cursor];
      }
      continue;
    }

    const selfClosing = rawTag.endsWith(HTML_TOKENS.CLOSING_TAG_PREFIX);
    const cleanTag = selfClosing ? rawTag.slice(0, -1).trim() : rawTag;
    const tagName = cleanTag.split(/\s+/)[0]?.toLowerCase();
    const attributes = cleanTag.slice(tagName.length);

    if (!tagName) {
      continue;
    }

    if (tagName === HTML_TOKENS.BR_TAG) {
      nodes.push({ type: NODE_TYPES.LINE_BREAK });
      continue;
    }

    const elementNode: ElementNode = {
      type: NODE_TYPES.ELEMENT,
      name: tagName,
      classes: parseClasses(attributes),
      children: [],
    };

    if (!selfClosing) {
      const [children, nextCursor] = parseNodes(html, cursor, tagName);
      elementNode.children = children;
      cursor = nextCursor;
    }

    nodes.push(elementNode);
  }

  return [nodes, cursor];
}

/**
 * Creates the default token to renderer mapping for HTML elements.
 *
 * @param components - Component mapping for a Shopify extension surface.
 */
export function createDefaultElementRendererMap(components: HtmlTransformerComponents): ElementRendererMap {
  const { Grid, Heading, List, ListItem, Text, TextBlock, View } = components;

  return {
    [HTML_TOKENS.H1_TAG]: (_element, children, index) => (
      <Heading key={index} level={1}>{children}</Heading>
    ),
    [HTML_TOKENS.H2_TAG]: (_element, children, index) => (
      <Heading key={index} level={2}>{children}</Heading>
    ),
    [HTML_TOKENS.H3_TAG]: (_element, children, index) => (
      <Heading key={index} level={3}>{children}</Heading>
    ),
    [HTML_TOKENS.H4_TAG]: (_element, children, index) => (
      <Heading key={index} level={4}>{children}</Heading>
    ),
    [HTML_TOKENS.TABLE_TAG]: (element, children, index) => (
      <Grid key={index} columns={buildTableColumns(element)} spacing="none">
        {children}
      </Grid>
    ),
    [HTML_TOKENS.TABLE_HEAD_TAG]: (_element, children, index) => (
      <Fragment key={index}>{children}</Fragment>
    ),
    [HTML_TOKENS.TABLE_BODY_TAG]: (_element, children, index) => (
      <Fragment key={index}>{children}</Fragment>
    ),
    [HTML_TOKENS.TABLE_FOOT_TAG]: (_element, children, index) => (
      <Fragment key={index}>{children}</Fragment>
    ),
    [HTML_TOKENS.TABLE_ROW_TAG]: (_element, children, index) => (
      <Fragment key={index}>{children}</Fragment>
    ),
    [HTML_TOKENS.TABLE_DATA_TAG]: (_element, children, index) => (
      <View key={index} border="base" padding="tight">
        {children}
      </View>
    ),
    [HTML_TOKENS.TABLE_HEADER_TAG]: (_element, children, index) => (
      <View key={index} border="base" padding="tight">
        {children}
      </View>
    ),
    [HTML_TOKENS.PARAGRAPH_TAG]: (_element, children, index) => (
      <TextBlock key={index}>{children}</TextBlock>
    ),
    [HTML_TOKENS.UNORDERED_LIST_TAG]: (_element, children, index) => (
      <List key={index}>{children}</List>
    ),
    [HTML_TOKENS.ORDERED_LIST_TAG]: (_element, children, index) => (
      <List key={index}>{children}</List>
    ),
    [HTML_TOKENS.LIST_ITEM_TAG]: (_element, children, index) => (
      <ListItem key={index}>{children}</ListItem>
    ),
    [HTML_TOKENS.DIV_TAG]: (_element, children, index) => (
      <TextBlock key={index}>{children}</TextBlock>
    ),
    [HTML_TOKENS.BOLD_TAG]: (_element, children, index) => (
      <Text key={index} emphasis="bold">{children}</Text>
    ),
    [HTML_TOKENS.STRONG_TAG]: (_element, children, index) => (
      <Text key={index} emphasis="bold">{children}</Text>
    ),
    [HTML_TOKENS.ITALIC_TAG]: (_element, children, index) => (
      <Text key={index} emphasis="italic">{children}</Text>
    ),
    [HTML_TOKENS.EMPHASIS_TAG]: (_element, children, index) => (
      <Text key={index} emphasis="italic">{children}</Text>
    ),
    [DEFAULT_RENDERER_KEY]: (_element, children, index) => (
      <Text key={index}>{children}</Text>
    ),
  };
}

/**
 * Creates an HTML transformer using surface-specific UI extension components.
 *
 * @param components - Component mapping for a Shopify extension surface.
 * @param options - Optional renderer map overrides.
 */
export function createHtmlTransformer(components: HtmlTransformerComponents, options: HtmlTransformerOptions = {}): HtmlTransformer {
  const { TextBlock } = components;
  const defaultRendererMap = createDefaultElementRendererMap(components);
  const rendererMap: ElementRendererMap = options?.replaceDefaultElementRenderers
    ? {
        ...options.elementRenderers,
      } as ElementRendererMap
    : {
        ...defaultRendererMap,
        ...options?.elementRenderers,
      };

  /**
   * Default HTML element -> UI extension component mapping.
   *
   * @param element - Parsed element node.
   * @param children - React children built from parsed child nodes.
   * @param index - Stable index for keying generated components.
   */
  function defaultTransformer(element: ElementNode, children: ReactNode, index: number): JSX.Element {
    const renderer = rendererMap[element.name] ?? rendererMap[DEFAULT_RENDERER_KEY];
    if (!renderer) {
      throw new Error("Missing default HTML renderer mapping.");
    }
    return renderer(element, children, index);
  }

  /**
   * Transforms parsed nodes into UI extension render output.
   *
   * @param nodes - Parsed nodes to transform.
   * @param transformer - Custom transformer callback.
   * @param keyPrefix - Prefix used for generated React keys.
   */
  function transform(nodes: HtmlNode[], transformer: Transformer, keyPrefix = "node"): ReactNode[] {
    let index = 0;
    const reactElements: ReactNode[] = [];

    nodes.forEach((node, nodeIndex) => {
      if (node.type === NODE_TYPES.TEXT) {
        reactElements.push(node.content);
        return;
      }

      if (node.type === NODE_TYPES.LINE_BREAK) {
        reactElements.push(
          <TextBlock key={`${keyPrefix}-line-break-${nodeIndex}`}>{" "}</TextBlock>
        );
        return;
      }

      if (node.type === NODE_TYPES.ELEMENT) {
        const children = (
          <>
            {transform(node.children, transformer, `${keyPrefix}-${nodeIndex}`)}
          </>
        );

        const fallback = () => defaultTransformer(node, children, index);
        const reactElement = transformer(node, children, index, fallback);
        reactElements.push(reactElement);

        index += 1;
      }
    });

    return reactElements;
  }

  /**
   * Converts basic HTML into Shopify extension UI components.
   *
   * @param rawHtml - HTML string to transform.
   * @param transformer - Optional custom element transformer.
   */
  return function htmlTransformer(
    rawHtml: string,
    transformer: Transformer = defaultTransformer
  ): ReactNode[] {
    const cleanedRawHtml = rawHtml.trim();
    const [nodes] = parseNodes(cleanedRawHtml);
    return transform(nodes, transformer);
  };
}
```
