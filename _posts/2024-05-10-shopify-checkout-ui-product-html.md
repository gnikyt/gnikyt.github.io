---
layout: post
title: 'Shopify checkout extension with product HTML'
permalink: shopify-checkout-ui-product-html
date: '2024-05-10 13:30:56'
---

## Background

A project last month required a build of an upselling checkout UI extension for Shopify. The client wanted the description of the product to be what is displayed in the checkout, however, Shopify's checkout extension system does not support directly using HTML nor the `dangerouslySetInnerHtml` property. Additionally to this, the extensions do not support such services such a [`DOMParser`](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) -- something custom would have to be built.

Given the tight timeline for the project, it was decided to just build a quick transformation helper to convert the HTML Shopify uses for product descriptions into Checkout UI Extension components. It was successful, but I am sure it could be better written if we had more time.

It works by capturing each open and close tag of the HTML element, grabbing its details and contents, parsing into React components, then shifting the HTML string to remove what was just captured, then repeats the process.

## Input/output examples

An example description HTML from a product in Shopify:

```html
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
  Did you know that once your package leaves our warehouse, it is your responsibility to correct any issues?
</div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph"></div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
  That's why we offer:
</div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph"></div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
  Covered Protection - No matter what the carrier does, you are covered 100%.
</div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph"></div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
  We intervene with the shipper, handles all issues, and gets another shipment to you ASAP.
</div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph"></div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
  This allows you to spend your time with your customers without countless hours on the phone with carriers.
</div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
  <br>
</div>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
  Covers:
</div>
<ul class="RichTextList-bulleted" style="list-style-type: disc;">
  <li>
    <div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
      Damaged
    </div>
  </li>
  <li>
    <div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
      Shipped to the wrong address
    </div>
  </li>
  <li>
    <div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
      Lost
    </div>
  </li>
  <li>
    <div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
      Dis-figured
    </div>
  </li>
  <li>
    <div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
      Mis-delivered
    </div>
  </li>
  <li>
    <div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
      Mis-labeled
    </div>
  </li>
  <li>
    <div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
      Theft
    </div>
  </li>
  <li>
    <div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
      Truck wrecks or Truck breaks down
    </div>
  </li>
  <li>
    <div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
      30-day coverage for the supplies you don't open until later, and then you find a problem with damage.
    </div>
  </li>
</ul>
<div class="TypographyPresentation TypographyPresentation--m RichText3-paragraph--withVSpacingNormal RichText3-paragraph">
  Another way we give the best service for our customers.
</div>
```

Example of the transformed output:

```jsx
<>
  <TextBlock>
    Did you know that once your package leaves our warehouse, it is your responsibility to correct any issues?
  </TextBlock>
  <TextBlock>
    That's why we offer:
  </TextBlock>
  <TextBlock>
    Covered Protection - No matter what the carrier does, you are covered 100%.
  </TextBlock>
  <TextBlock>
    We intervene with the shipper, handles all issues, and gets another shipment to you ASAP.
  </TextBlock>
  <TextBlock>
    This allows you to spend your time with your customers without countless hours on the phone with carriers.
  </TextBlock>
  <TextBlock>
    Covers:
  </TextBlock>
  <List>
    <ListItem>
      <TextBlock>
        Damaged
      </TextBlock>
    </ListItem>
    <ListItem>
      <TextBlock>
        Shipped to the wrong address
      </TextBlock>
    </ListItem>
    <ListItem>
      <TextBlock>
        Lost
      </TextBlock>
    </ListItem>
    <ListItem>
      <TextBlock>
        Dis-figured
      </TextBlock>
    </ListItem>
    <ListItem>
      <TextBlock>
        Mis-delivered
      </TextBlock>
    </ListItem>
    <ListItem>
      <TextBlock>
        Mis-labeled
      </TextBlock>
    </ListItem>
    <ListItem>
      <TextBlock>
        Theft
      </TextBlock>
    </ListItem>
    <ListItem>
      <TextBlock>
        Truck wrecks or Truck breaks down
      </TextBlock>
    </ListItem>
    <ListItem>
      <TextBlock>
        30-day coverage for the supplies you don't open until later, and then you find a problem with damage.
      </TextBlock>
    </ListItem>
  </ListItem>
  <TextBlock>
    Another way we give the best service for our customers.
  </TextBlock>
</>
```

## Usage examples

**As-is with default transformer:**

```jsx
import descriptionTransformer from './descriptionTransformer';

// ...

const description = descriptionTransformer(product.desciptionHtml);

// ...

<BlockStack spacing="extraTight">
  {description}
</BlockStack>
```

**With custom transformer:**

```jsx
import descriptionTransformer from './descriptionTransformer';

// ...

const description = descriptionTransformer(html, (element, children, index, defaultTransformer) => {
  if (element.classes.includes("RichQuote")) {
    return (
      <BlockStack key={index}>
        <Text emphasis>Quote</Text>
        {children}
      </BlockStack>
    );
  }
  return defaultTransformer();
});

// ...

<BlockStack spacing="extraTight">
  {description}
</BlockStack>
```

## Code

Also available [on this Gist](https://gist.github.com/gnikyt/3d8f0043281e3ebfa72793c546c2cfe8).

```jsx
/* eslint-disable react/react-in-jsx-scope */
import { List, ListItem, TextBlock } from "@shopify/ui-extensions-react/checkout";

/**
 * Represents open tag.
 * @typedef {Object} OpenTag
 * @property {number} start - Indicates the start position of the open tag.
 * @property {number} end - Indicates the end position of the open tag.
 * @property {string} name - Name of the tag.
 * @property {string[]} classes - Classes of the tag.
 */

/**
 * Represents close tag.
 * @typedef {Object} CloseTag
 * @property {number} start - Indicates the start position of the end tag.
 * @property {number} end - Indicates the end position of the end tag.
 */

/**
 * Represents contents of a tag.
 * @typedef {Object} TagContents
 * @property {string} contents - Contents between the open and close tag.
 * @property {boolean} hasInnerHtml - Indicates if the contents has nested HTML.
 */

/**
 * Represents a parsed element.
 * @typedef {Object} ParsedElement
 * @property {string | ParsedElement[]} contents - Contents between the open and close tag.
 * @property {string} name - Name of the tag.
 * @property {string[]} classes - Classes of the tag.
 */

/**
 * Represents transformer callback.
 *
 * @callback Transformer
 * @param {ParsedElement} element - Parsed element.
 * @param {JSX.Element[]} children - React components parsed from element.
 * @param {number} index - Current index in transforming loop, to use for `key` prop on component.
 * @param {CallableFunction} defaultTransformer - Pre-filled default transformer.
 */

/**
 * Parses open tag to return that start position, end position, tag name, and classes.
 *
 * @param {string} html - Raw HTML to parse.
 *
 * @returns {OpenTag}
 */
function parseOpenTag(html) {
  // Open tag positions
  const start = html.indexOf("<");
  const end = html.indexOf(">") + 1;

  // Open tag's contents
  const contents = html.substring(start, end);

  // Extract tag name
  const name = html.substring(
    start + 1,
    // Until next space or end of tag
    contents.indexOf(" ") > -1 ? contents.indexOf(" ") : end - 1,
  );

  // Extract classes
  const classMatch = contents.match(/class="([^"]+)"/);
  const classes = classMatch === null ? [] : classMatch[1].split(" ");

  return {
    start,
    end,
    name,
    classes,
  };
}

/**
 * Parses close tag to return that start position and end position.
 *
 * @param {string} html - Raw HTML to parse.
 * @param {string} name - Tag name.
 *
 * @returns {CloseTag}
 */
function parseCloseTag(html, name) {
  // Tag itself
  const tag = `</${name}>`;

  // End tag positions
  const start = html.indexOf(tag);
  const end = start + tag.length;

  return {
    start,
    end,
  };
}

/**
 * Get the contents of a tag, returning the content and a flag of it has inner HTML.
 *
 * @param {string} html - Raw HTML to parse.
 * @param {object} openTag - Open tag parsed result.
 * @param {object} closeTag - Close tag parsed result.
 *
 * @returns {TagContents}
 */
function parseContentOfTag(html, openTag, closeTag) {
  const contents = html.substring(openTag.end, closeTag.start).trim();
  const hasInnerHtml = contents.match(/<.*>.*<\/.*>/g);

  return {
    contents,
    hasInnerHtml,
  };
}

/**
 * Default transformer.
 *
 * @param {ParsedElement} element - Parsed element.
 * @param {JSX.Element[]} children - React components.
 * @param {number} index - Parsed element index in loop.
 *
 * @returns {JSX.Element}
 */
function defaultTransformer(element, children, index) {
  /** @type JSX.Element */
  let reactElement;

  // No transformer result, handle defaults
  switch (element.name) {
    case "ul": {
      reactElement = <List key={index}>{children}</List>;
      break;
    }
    case "li": {
      reactElement = <ListItem key={index}>{children}</ListItem>;
      break;
    }
    case "div": {
      reactElement = <TextBlock key={index}>{children}</TextBlock>;
      break;
    }
    default: {
      reactElement = <>No transformer to handle &quot;{element.name}&quot;</>;
    }
  }

  return reactElement;
}

/**
 * Walk through the HTML and parse it into an array of tag name, classes, and nested content.
 *
 * @param {string} html - Raw HTML to parse.
 * @returns {ParsedElement[]}
 */
function walk(html) {
  // Store elements parsed
  /** @type ParsedElement[] */
  const elements = [];

  // Loop until no open tag is found
  let shiftedHtml = html;
  while (shiftedHtml.indexOf("<") !== -1) {
    // Open tag and close tag
    const openTag = parseOpenTag(shiftedHtml);
    const closeTag = parseCloseTag(shiftedHtml, openTag.name);

    // Contents
    const content = parseContentOfTag(shiftedHtml, openTag, closeTag);
    const contents = content.hasInnerHtml ? walk(content.contents) : content.contents;

    // Save, move to next part of the HTML
    elements.push({
      contents,
      name: openTag.name,
      classes: openTag.classes,
    });
    shiftedHtml = shiftedHtml.substring(closeTag.end).trim();
  }

  return elements;
}

/**
 * Convert parsed HTML into React elements.
 *
 * @param {ParsedElement[]} elements - Elements to convert to React components.
 * @param {Transformer | undefined} transformer - Custom transformation function.
 *
 * @returns {JSX.Element[]}
 */
function transform(elements, transformer) {
  let index = 0;
  const reactElements = [];
  for (const element of elements) {
    if (element.contents !== "") {
      // Parse nested elements, if nessessary
      const children = Array.isArray(element.contents) ? transform(element.contents) : <>{element.contents}</>;

      // Transform to React
      const reactElement = transformer
        ? transformer(
            element,
            children,
            index,
            (
              (e, c, i) => () =>
                defaultTransformer(e, c, i)
            )(element, children, index),
          )
        : defaultTransformer(element, children, index);

      reactElements.push(reactElement);
      index += 1;
    }
  }

  return reactElements;
}

/**
 * Parse description HTML of a product into Shopify React elements.
 *
 * @param {string} rawHtml - Raw HTML to parse and transform.
 * @param {Transformer | undefined} transformer - Custom transformation function.
 *
 * @example
 * ```
 * const parsed = descriptionTransformer(html);
 * // ...
 * <>{parsed}</>
 * ```
 *
 * @example
 * ```
 * const parsed = descriptionTransformer(html, (element, children, index, defaultTransformer) => {
 *  if (element.classes.includes("RichQuote")) {
 *    return (
 *       <BlockStack key={index}>
 *          <Text>Quote</Text>
 *          {children}
 *       </BlockStack>
 *    );
 *  }
 *  return defaultTransformer();
 * });
 * // ...
 * <>{parsed}</>
 * ```
 *
 * @returns {JSX.Element[]}
 */
export default function descriptionTransformer(rawHtml, transformer) {
  const cleanedRawHtml = rawHtml.replace(/<br>/g, "").trim();
  return transform(walk(cleanedRawHtml, transformer));
}
```

Hopefully this can help point you in the right direction if you're attempting to use product descriptions in a Shopify Checkout UI Extension.
