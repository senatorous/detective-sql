// Показываем схемы таблиц как раскрывающиеся списки,
// чтобы занимать меньше места и явно указывать, что список можно раскрыть
export function renderSchema(container, tables) {
  const previousTables = new Set(
    Array.from(container.querySelectorAll('[data-table-name]')).map((el) =>
      el.getAttribute('data-table-name')
    )
  );

  container.innerHTML = tables
    .map((t, index) => {
      const contentId = `schema-table-${index}`;
      const safeName = escapeHtml(t.name);
      return `
        <div class="table" data-table-name="${safeName}">
          <button
            type="button"
            class="table-toggle"
            aria-expanded="false"
            aria-controls="${contentId}"
          >
            <span class="table-name">${safeName}</span>
            <span class="table-chevron" aria-hidden="true"></span>
          </button>
          <div class="table-columns" id="${contentId}" hidden>
            <ul>
              ${t.columns.map((c) => `<li>${escapeHtml(c)}</li>`).join("")}
            </ul>
          </div>
        </div>
      `;
    })
    .join("");

  const tableElements = Array.from(container.querySelectorAll('.table'));
  tableElements.forEach((tableEl) => {
    const toggle = tableEl.querySelector('.table-toggle');
    const content = tableEl.querySelector('.table-columns');
    const tableName = tableEl.getAttribute('data-table-name') || '';

    if (!previousTables.has(tableName)) {
      requestAnimationFrame(() => {
        tableEl.classList.add('table--new');
        tableEl.addEventListener(
          'animationend',
          () => {
            tableEl.classList.remove('table--new');
          },
          { once: true }
        );
      });
    }

    initialiseTableToggle(tableEl, toggle, content);
  });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function initialiseTableToggle(tableEl, toggle, content) {
  if (!toggle || !content) {
    return;
  }

  content.style.height = '0px';
  content.style.opacity = '0';

  let expandTransitionListener = null;
  let collapseTransitionListener = null;

  const expand = () => {
    if (collapseTransitionListener) {
      content.removeEventListener('transitionend', collapseTransitionListener);
      collapseTransitionListener = null;
    }

    tableEl.classList.add('table--open');
    toggle.setAttribute('aria-expanded', 'true');
    content.hidden = false;

    const targetHeight = content.scrollHeight;
    content.style.height = `${targetHeight}px`;
    content.style.opacity = '1';

    expandTransitionListener = (event) => {
      if (event.propertyName === 'height') {
        content.style.height = 'auto';
        content.removeEventListener('transitionend', expandTransitionListener);
        expandTransitionListener = null;
      }
    };

    content.addEventListener('transitionend', expandTransitionListener);
  };

  const collapse = () => {
    if (expandTransitionListener) {
      content.removeEventListener('transitionend', expandTransitionListener);
      expandTransitionListener = null;
    }

    tableEl.classList.remove('table--open');
    toggle.setAttribute('aria-expanded', 'false');

    const startHeight = content.scrollHeight;
    content.style.height = `${startHeight}px`;
    // force reflow to ensure the height transition starts correctly
    void content.offsetHeight;
    content.style.height = '0px';
    content.style.opacity = '0';

    collapseTransitionListener = (event) => {
      if (event.propertyName === 'height') {
        content.hidden = true;
        content.removeEventListener('transitionend', collapseTransitionListener);
        collapseTransitionListener = null;
      }
    };

    content.addEventListener('transitionend', collapseTransitionListener);
  };

  toggle.addEventListener('click', () => {
    const isOpen = tableEl.classList.contains('table--open');
    if (isOpen) {
      collapse();
    } else {
      // Reset height to 0 before expanding if it was left as 'auto'
      if (content.style.height === 'auto') {
        content.style.height = '0px';
      }
      // force reflow to make sure transition starts from 0
      void content.offsetHeight;
      expand();
    }
  });
}
