const highlightColor = 'rgb(213, 234, 255)';

const template = `
  <template id="highlightTemplate">
    <span class="highlight" style="background-color: ${highlightColor}; display: inline"></span>
  </template>
  <div id="simpleHighlighter-buttons"> 
    <button id="simpleHighlighter-button-marker">
      <svg class="simpleHighlighter-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 544 512"><path d="M0 479.98L99.92 512l35.45-35.45-67.04-67.04L0 479.98zm124.61-240.01a36.592 36.592 0 0 0-10.79 38.1l13.05 42.83-50.93 50.94 96.23 96.23 50.86-50.86 42.74 13.08c13.73 4.2 28.65-.01 38.15-10.78l35.55-41.64-173.34-173.34-41.52 35.44zm403.31-160.7l-63.2-63.2c-20.49-20.49-53.38-21.52-75.12-2.35L190.55 183.68l169.77 169.78L530.27 154.4c19.18-21.74 18.15-54.63-2.35-75.13z"></path></svg>
    </button>
    <button id="simpleHighlighter-button-delete">
      <svg class="simpleHighlighter-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 544 512"><path d="M380.004,0.001H20.305C9.09,0.001,0,9.092,0,20.306v359.699c0,11.215,9.09,20.305,20.305,20.305h359.699
      c11.217,0,20.307-9.09,20.307-20.305v-359.7C400.309,9.092,391.219,0.001,380.004,0.001z M307.377,251.97
      c4.59,4.592,4.594,12.033,0.002,16.623l-38.783,38.785c-4.594,4.59-12.033,4.589-16.623,0l-51.818-51.814l-51.816,51.814
      c-4.588,4.59-12.031,4.59-16.621,0l-38.785-38.785c-4.59-4.591-4.59-12.032,0-16.623l51.816-51.815L92.933,148.34
      c-4.59-4.591-4.59-12.032,0-16.622l38.785-38.786c4.59-4.59,12.033-4.59,16.621,0l51.816,51.816l51.816-51.816
      c4.59-4.589,12.033-4.589,16.623,0l38.783,38.786c4.592,4.59,4.592,12.032,0,16.622l-51.814,51.815L307.377,251.97z"/></svg>
    </button>
  </div>
`;

const styled = ({ display = 'none', left = 0, top = 0 }) => `
  #simpleHighlighter-buttons {
    align-items: center;
    justify-content: center;
    display: ${display};
    position: fixed;
    left: ${left}px;
    top: ${top}px;
    z-index: 9999;
  }
  [id^="simpleHighlighter-button-"] {
    background-color: black;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    padding: 5px 10px;
    width: 40px;
  }
  .simpleHighlighter-icon {
    fill: white;
  }
  .simpleHighlighter-icon:hover {
    fill: ${highlightColor};
  }
`;

class SimpleHighlighter extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  get markerPosition() {
    return JSON.parse(this.getAttribute('markerPosition') || '{}');
  }

  get styleElement() {
    return this.shadowRoot.querySelector('style');
  }

  get highlightTemplate() {
    return this.shadowRoot.getElementById('highlightTemplate');
  }

  static get observedAttributes() {
    return ['markerPosition'];
  }

  render() {
    this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styled({});
    this.shadowRoot.appendChild(style);
    this.shadowRoot.innerHTML += template;
    this.shadowRoot
      .getElementById('simpleHighlighter-button-marker')
      .addEventListener('click', () => this.highlightSelection());
    this.shadowRoot
      .getElementById('simpleHighlighter-button-delete')
      .addEventListener('click', () => this.deleteSelection());
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'markerPosition') {
      this.styleElement.textContent = styled(this.markerPosition);
    }
  }

  highlightSelection() {
    var userSelection = window.getSelection();
    // highlight the selection on UI
    for (let i = 0; i < userSelection.rangeCount; i++) {
      this.highlightRange(userSelection.getRangeAt(i));
    }
    // save to storage
    let container = userSelection.getRangeAt(0).commonAncestorContainer;
    // sometimes the element will only be text. Get the parent in that case
    while (!container.innerHTML) container = container.parentNode;
    let url = window.location.hostname + window.location.pathname;
    save(userSelection, container, url, highlightColor, (count) => {
      console.log(`saved: \n${url} hightlight id ${count}`);
      // empty selection after saving
      window.getSelection().empty();
    });
  }

  deleteSelection() {
    // deleteOne(userSelection, , )
  }

  // the highlight UI part
  highlightRange(range) {
    const clone =
      this.highlightTemplate.cloneNode(true).content.firstElementChild;
    clone.appendChild(range.extractContents()); // append to span
    range.insertNode(clone);
  }

  // highlight from storage
  loadHighlight(loadedSelection) {
    for (let i = 0; i < loadedSelection.rangeCount; i++) {
      this.highlightRange(loadedSelection.getRangeAt(i));
    }
  }
}

window.customElements.define('simple-highlighter', SimpleHighlighter);
