const simpleHighlighter = document.createElement('simple-highlighter');
document.body.appendChild(simpleHighlighter);

const setMarkerPosition = (markerPosition) =>
  simpleHighlighter.setAttribute(
    'markerPosition',
    JSON.stringify(markerPosition),
  );

const getMarkerPosition = () => {
  const rangeBounds = window
    .getSelection()
    .getRangeAt(0)
    .getBoundingClientRect();
  return {
    // Substract width of marker button -> 40px / 2 = 20
    left: rangeBounds.left + rangeBounds.width / 2 - 20,
    top: rangeBounds.top - 30,
    display: 'flex',
  };
};

const getSelectedText = () => window.getSelection().toString();

document.addEventListener('click', () => {
  if (getSelectedText().length > 0) {
    setMarkerPosition(getMarkerPosition());
  }
});

document.addEventListener('selectionchange', () => {
  // console.log(window.getSelection());
  if (getSelectedText().length === 0) {
    setMarkerPosition({ display: 'none' });
  }
});

// Alternative to load event
document.onreadystatechange = function () {
  if (document.readyState === 'complete') {
    loadAll(window.location.hostname + window.location.pathname);
  }
};
