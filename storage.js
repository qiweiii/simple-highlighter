// save a highlight to storage
function save(selection, container, url, color, callback) {
  chrome.storage.local.get({ highlights: {} }, (result) => {
    const highlights = result.highlights;

    if (!highlights[url]) highlights[url] = [];

    const count = highlights[url].push({
      string: selection.toString(),
      container: getQuery(container),
      anchorNode: getQuery(selection.anchorNode),
      anchorOffset: selection.anchorOffset,
      focusNode: getQuery(selection.focusNode),
      focusOffset: selection.focusOffset,
      color: color,
    });
    chrome.storage.local.set({ highlights });

    if (callback) callback(count - 1);
  });
}

// update or delete a highlight
function update(highlightIndex, url, newColor) {
  chrome.storage.local.get({ highlights: {} }, (result) => {
    const highlights = result.highlights;
    const highlightsInKey = highlights[url];

    if (highlightsInKey) {
      const highlight = highlightsInKey[highlightIndex];
      if (highlight) {
        highlight.color = newColor;
        chrome.storage.local.set({ highlights });
      }
    }
  });
}

// load all highlights from a url
function loadAll(url) {
  chrome.storage.local.get({ highlights: {} }, (result) => {
    let highlights = [];

    highlights = highlights.concat(result.highlights[url] || []);

    if (!highlights) return;

    for (let i = 0; i < highlights.length; i++) {
      load(highlights[i], i);
    }
  });
}

// load a highlight
function load(highlightVal, highlightIndex, noErrorTracking) {
  const selection = {
    anchorNode: elementFromQuery(highlightVal.anchorNode),
    anchorOffset: highlightVal.anchorOffset,
    focusNode: elementFromQuery(highlightVal.focusNode),
    focusOffset: highlightVal.focusOffset,
  };

  const selectionString = highlightVal.string;
  const container = elementFromQuery(highlightVal.container);
  const color = highlightVal.color;

  if (!selection.anchorNode || !selection.focusNode || !container) {
    if (!noErrorTracking) {
      addHighlightError(highlightVal, highlightIndex);
    }
    return false;
  }

  let success = false;
  success = highlight(
    selectionString,
    container,
    selection,
    color,
    highlightIndex,
  );

  if (!noErrorTracking && !success) {
    addHighlightError(highlightVal, highlightIndex);
  }
  return success;
}

// Get element from stored query
function elementFromQuery(storedQuery) {
  const re = />textNode:nth-of-type\(([0-9]+)\)$/iu;
  const result = re.exec(storedQuery);

  if (result) {
    // For text nodes, nth-of-type needs to be handled differently (not a valid CSS selector)
    const textNodeIndex = parseInt(result[1], 10);
    storedQuery = storedQuery.replace(re, '');
    const parent = document.querySelectorAll(storedQuery)[0];

    if (!parent) return undefined;

    return parent.childNodes[textNodeIndex];
  }

  return document.querySelectorAll(storedQuery)[0];
}

// From a DOM element, get a query to that DOM element
function getQuery(element) {
  if (element.id) return `#${escapeCSSString(element.id)}`;
  if (element.localName === 'html') return 'html';

  const parent = element.parentNode;

  let index = null;
  const parentSelector = getQuery(parent);
  // The element is a text node
  if (!element.localName) {
    // Find the index of the text node:
    index = Array.prototype.indexOf.call(parent.childNodes, element);
    return `${parentSelector}>textNode:nth-of-type(${index})`;
  } else {
    // const jEl = document.querySelector(element);
    index = getChildElementIndex(element) + 1;
    return `${parentSelector}>${element.localName}:nth-of-type(${index})`;
  }
}

// Colons and spaces are accepted in IDs in HTML but not in CSS syntax
// Similar (but much more simplified) to the CSS.escape() working draft
function escapeCSSString(cssString) {
  return cssString.replace(/(:)/gu, '\\$1');
}

// https://stackoverflow.com/a/4649781
function getChildElementIndex(elememnt) {
  return Array.prototype.indexOf.call(elememnt.parentNode.children, elememnt);
}
