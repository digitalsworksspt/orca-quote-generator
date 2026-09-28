const $ = (id) => document.getElementById(id);
const symbols = { GBP: '£', USD: '$', EUR: '€' };

const elements = {
  job: $('job'),
  start: $('start'),
  workspace: $('workspace'),
  items: $('items'),
  subtotal: $('subtotal'),
  grandTotal: $('grandTotal'),
  preview: $('preview'),
  business: $('business'),
  number: $('number'),
  date: $('date'),
  client: $('client'),
  currency: $('currency'),
  generate: $('generate'),
  add: $('add'),
  newQuote: $('newQuote'),
  print: $('print')
};

let nextId = 1;

function money(value) {
  const currency = elements.currency ? elements.currency.value : 'GBP';
  const amount = Number(value) || 0;
  return `${symbols[currency] || '£'}${amount.toFixed(2)}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getRowData(row) {
  if (!row) return null;
  const descriptionEl = row.querySelector('[data-f="description"]');
  const qtyEl = row.querySelector('[data-f="qty"]');
  const unitEl = row.querySelector('[data-f="unit"]');
  const priceEl = row.querySelector('[data-f="price"]');

  if (!descriptionEl || !qtyEl || !unitEl || !priceEl) return null;

  const qty = Number(qtyEl.value) || 0;
  const price = Number(priceEl.value) || 0;
  const item = {
    description: descriptionEl.value.trim() || 'New item',
    qty,
    unit: unitEl.value.trim() || 'unit',
    price,
    total: qty * price
  };

  return item;
}

function refresh() {
  if (!elements.items) return;

  const rows = Array.from(elements.items.rows || []);
  const data = rows
    .map((row) => getRowData(row))
    .filter(Boolean);

  const subtotal = data.reduce((sum, item) => sum + item.total, 0);

  rows.forEach((row, index) => {
    const rowData = getRowData(row);
    const lineTotalEl = row.querySelector('.line-total');
    if (lineTotalEl && rowData) {
      lineTotalEl.textContent = money(rowData.total);
    }
    if (index < data.length && rowData) {
      rowData.total = rowData.qty * rowData.price;
    }
  });

  if (elements.subtotal) elements.subtotal.textContent = money(subtotal);
  if (elements.grandTotal) elements.grandTotal.textContent = money(subtotal);

  renderPreview(data, subtotal);
}

function renderPreview(data, subtotal) {
  const date = elements.date && elements.date.value ? elements.date.value : new Date().toISOString().slice(0, 10);
  const businessName = elements.business ? elements.business.value : 'Business Name';
  const clientName = elements.client ? elements.client.value : 'Client Name';
  const quoteNumber = elements.number ? elements.number.value : 'N/A';

  if (!elements.preview) return;

  const rowsMarkup = data.length
    ? data
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.description)}</td>
              <td>${Number(item.qty || 0)}</td>
              <td>${escapeHtml(item.unit || 'unit')}</td>
              <td>${money(item.price || 0)}</td>
              <td>${money(item.total || 0)}</td>
            </tr>
          `
        )
        .join('')
    : '<tr><td colspan="5">No items yet.</td></tr>';

  elements.preview.innerHTML = `
    <div class="preview-head">
      <div>
        <h3>${escapeHtml(businessName)}</h3>
        <span>Professional trade services</span>
      </div>
      <div class="meta">
        <span><b>Quote #</b> ${escapeHtml(quoteNumber)}</span>
        <span><b>Date</b> ${escapeHtml(date)}</span>
        <span><b>Currency</b> ${escapeHtml(elements.currency ? elements.currency.value : 'GBP')}</span>
      </div>
    </div>
    <div class="client">
      <div><b>Client</b><br>${escapeHtml(clientName)}</div>
      <div><b>Prepared by</b><br>${escapeHtml(businessName)}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Qty</th>
          <th>Unit</th>
          <th>Unit price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>${rowsMarkup}</tbody>
    </table>
    <div class="summary">
      <div>Subtotal <span>${money(subtotal)}</span></div>
      <div class="grand">Grand total <span>${money(subtotal)}</span></div>
    </div>
  `;
}

function itemRow(item) {
  const tr = document.createElement('tr');
  tr.dataset.id = String(item.id || `item-${nextId++}`);
  tr.innerHTML = `
    <td><input data-f="description" value="${escapeHtml(item.description || 'New item')}"></td>
    <td><input data-f="qty" type="number" min="0" step="0.01" value="${Number(item.qty || 0)}"></td>
    <td><input data-f="unit" value="${escapeHtml(item.unit || 'unit')}"></td>
    <td><input data-f="price" type="number" min="0" step="0.01" value="${Number(item.price || 0)}"></td>
    <td class="line-total">${money((Number(item.qty || 0) * Number(item.price || 0)))}</td>
    <td><button class="delete" type="button">Delete</button></td>
  `;

  const inputs = tr.querySelectorAll('input');
  inputs.forEach((input) => {
    input.addEventListener('input', refresh);
    input.addEventListener('change', refresh);
  });

  const deleteBtn = tr.querySelector('.delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      tr.remove();
      refresh();
    });
  }

  return tr;
}

function addItem(item = { description: 'New item', qty: 1, unit: 'unit', price: 0 }) {
  if (!elements.items) return;
  const safeItem = {
    id: `item-${nextId++}`,
    description: item.description || 'New item',
    qty: Number(item.qty) || 0,
    unit: item.unit || 'unit',
    price: Number(item.price) || 0,
    ...item
  };

  elements.items.appendChild(itemRow(safeItem));
  refresh();
}

function detectUnit(description) {
  const lower = description.toLowerCase();

  if (/fuse box/.test(lower)) return { unit: 'fuse box', price: 250 };
  if (/socket/.test(lower)) return { unit: 'socket', price: 65 };
  if (/switch/.test(lower)) return { unit: 'switch', price: 55 };
  if (/cable|wire/.test(lower)) return { unit: 'm', price: 35 };
  if (/light fitting|luminaire/.test(lower)) return { unit: 'light fitting', price: 90 };
  if (/radiator/.test(lower)) return { unit: 'radiator', price: 120 };
  if (/panel/.test(lower)) return { unit: 'panel', price: 180 };
  if (/point/.test(lower)) return { unit: 'point', price: 80 };
  if (/door/.test(lower)) return { unit: 'door', price: 160 };
  if (/window/.test(lower)) return { unit: 'window', price: 200 };
  if (/hour/.test(lower)) return { unit: 'hour', price: 45 };
  if (/visit/.test(lower)) return { unit: 'visit', price: 120 };
  if (/m2|sqm|square metre|square meter/.test(lower)) return { unit: 'm2', price: 35 };
  if (/\b(m|metre|meter|metres|meters)\b/.test(lower)) return { unit: 'm', price: 35 };
  if (/\bunit\b/.test(lower)) return { unit: 'unit', price: 120 };
  return { unit: 'unit', price: 120 };
}

function parseText(text) {
  const cleanText = String(text || '').trim();
  if (!cleanText) return [];

  const fragments = cleanText
    .split(/[,.;]/)
    .flatMap((part) => part.split(/\s+and\s+|\s+plus\s+/i))
    .map((part) => part.trim())
    .filter(Boolean);

  const items = [];

  fragments.forEach((fragment) => {
    const quantMatch = fragment.match(/(\d+(?:\.\d+)?)\s*(?:of\s+)?(.*)/i);
    if (!quantMatch) {
      const generic = fragment.replace(/^(install|replace|run|fit|repair|service|supply|remove)\s+/i, '').trim();
      if (generic) {
        const unitInfo = detectUnit(generic);
        items.push({
          id: `item-${nextId++}`,
          description: generic,
          qty: 1,
          unit: unitInfo.unit,
          price: unitInfo.price
        });
      }
      return;
    }

    const qty = Number(quantMatch[1]) || 1;
    let description = quantMatch[2].trim();

    description = description
      .replace(/^(install|replace|run|fit|repair|service|supply|remove)\s+/i, '')
      .replace(/\b(?:m|metre|meter|metres|meters)\b/gi, '')
      .replace(/\s+of\s+$/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!description) {
      description = 'General trade work';
    }

    const unitInfo = detectUnit(description + ' ' + qty + ' ' + (fragment.includes('m') ? 'm' : ''));

    items.push({
      id: `item-${nextId++}`,
      description,
      qty,
      unit: unitInfo.unit,
      price: unitInfo.price
    });
  });

  if (!items.length) {
    items.push({
      id: `item-${nextId++}`,
      description: cleanText,
      qty: 1,
      unit: 'job',
      price: 150
    });
  }

  return items;
}

function buildQuoteFromText() {
  if (!elements.job) return;

  const text = elements.job.value.trim();
  if (!text) {
    alert('Please describe the job before generating a quote.');
    elements.job.focus();
    return;
  }

  if (!elements.items) return;

  elements.items.innerHTML = '';

  const items = parseText(text);
  items.forEach((item) => addItem(item));

  if (elements.start) elements.start.classList.add('hidden');
  if (elements.workspace) elements.workspace.classList.remove('hidden');

  if (elements.date && !elements.date.value) {
    elements.date.value = new Date().toISOString().slice(0, 10);
  }

  refresh();
}

function resetQuote() {
  if (elements.start) elements.start.classList.remove('hidden');
  if (elements.workspace) elements.workspace.classList.add('hidden');
  if (elements.job) elements.job.value = '';
  if (elements.items) elements.items.innerHTML = '';
  if (elements.subtotal) elements.subtotal.textContent = money(0);
  if (elements.grandTotal) elements.grandTotal.textContent = money(0);
  if (elements.preview) elements.preview.innerHTML = '';
}

function bindEvents() {
  if (elements.generate) {
    elements.generate.addEventListener('click', buildQuoteFromText);
  }

  if (elements.add) {
    elements.add.addEventListener('click', () => addItem({ description: 'New item', qty: 1, unit: 'unit', price: 0 }));
  }

  if (elements.newQuote) {
    elements.newQuote.addEventListener('click', resetQuote);
  }

  if (elements.print) {
    elements.print.addEventListener('click', () => window.print());
  }

  [elements.business, elements.number, elements.client, elements.currency, elements.date].forEach((field) => {
    if (!field) return;
    field.addEventListener('input', refresh);
    field.addEventListener('change', refresh);
  });

  if (elements.job) {
    elements.job.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        buildQuoteFromText();
      }
    });
  }
}

function init() {
  if (elements.date && !elements.date.value) {
    elements.date.value = new Date().toISOString().slice(0, 10);
  }

  if (elements.subtotal) elements.subtotal.textContent = money(0);
  if (elements.grandTotal) elements.grandTotal.textContent = money(0);

  bindEvents();
  refresh();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
