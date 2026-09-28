const currencySymbols = {
  GBP: '£',
  USD: '$',
  EUR: '€'
};

const generatedItemDefaults = {
  description: 'General labour and materials',
  unit: 'job',
  qty: 1,
  unitPrice: 150
};

const stopWords = new Set([
  'and', 'with', 'for', 'plus', 'including', 'replace', 'install', 'run', 'fit', 'repair', 'service',
  'landlord', 'customer', 'client', 'property', 'building', 'work', 'job', 'site', 'house'
]);

const professionalUnits = [
  'socket', 'sockets', 'switch', 'switches', 'fuse box', 'fuse boxes', 'cable', 'pipe',
  'panel', 'panels', 'light fitting', 'light fittings', 'radiator', 'radiators', 'point', 'points',
  'door', 'doors', 'window', 'windows', 'unit', 'units', 'm', 'm2', 'sqm', 'hour', 'hours',
  'visit', 'visits', 'project', 'projects'
];

const quoteData = {
  businessName: document.getElementById('businessName'),
  quoteNumber: document.getElementById('quoteNumber'),
  quoteDate: document.getElementById('quoteDate'),
  clientName: document.getElementById('clientName'),
  currency: document.getElementById('currency'),
  entryScreen: document.getElementById('entryScreen'),
  quoteWorkspace: document.getElementById('quoteWorkspace'),
  jobDescription: document.getElementById('jobDescription'),
  generateBtn: document.getElementById('generateBtn'),
  newQuoteBtn: document.getElementById('newQuoteBtn'),
  addItemBtn: document.getElementById('addItemBtn'),
  printBtn: document.getElementById('printBtn'),
  quoteTableBody: document.getElementById('quoteTableBody'),
  subtotalValue: document.getElementById('subtotalValue'),
  grandTotalValue: document.getElementById('grandTotalValue'),
  quotePreview: document.getElementById('quotePreview')
};

let itemIdCounter = 1;

function formatCurrency(value, currency = 'GBP') {
  const safeValue = Number(value) || 0;
  const symbol = currencySymbols[currency] || '£';
  return `${symbol}${safeValue.toFixed(2)}`;
}

function createEmptyItem() {
  const id = `item-${itemIdCounter++}`;
  return {
    id,
    description: 'New item',
    quantity: 1,
    unit: 'unit',
    unitPrice: 0,
    total: 0
  };
}

function calculateItemTotal(item) {
  const qty = Number(item.quantity) || 0;
  const unitPrice = Number(item.unitPrice) || 0;
  return qty * unitPrice;
}

function getQuoteItems() {
  return Array.from(quoteData.quoteTableBody.querySelectorAll('tr')).map((row) => {
    const id = row.dataset.id;
    const data = {
      id,
      description: row.querySelector('[data-field="description"]').value,
      quantity: Number(row.querySelector('[data-field="quantity"]').value) || 0,
      unit: row.querySelector('[data-field="unit"]').value,
      unitPrice: Number(row.querySelector('[data-field="unitPrice"]').value) || 0
    };
    data.total = calculateItemTotal(data);
    return data;
  });
}

function updateTotals() {
  const items = getQuoteItems();
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  quoteData.subtotalValue.textContent = formatCurrency(subtotal, quoteData.currency.value);
  quoteData.grandTotalValue.textContent = formatCurrency(subtotal, quoteData.currency.value);
}

function renderPreview() {
  const items = getQuoteItems();
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const currency = quoteData.currency.value;
  const dateValue = quoteData.quoteDate.value || new Date().toISOString().slice(0, 10);

  const rowsHtml = items.length
    ? items
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.description)}</td>
              <td>${Number(item.quantity).toFixed(0)}</td>
              <td>${escapeHtml(item.unit)}</td>
              <td>${formatCurrency(item.unitPrice, currency)}</td>
              <td>${formatCurrency(item.total, currency)}</td>
            </tr>
          `
        )
        .join('')
    : `
      <tr>
        <td colspan="5">No items yet. Add a service or material to begin the quote.</td>
      </tr>
    `;

  quoteData.quotePreview.innerHTML = `
    <div class="preview-header">
      <div class="preview-company">
        <h3>${escapeHtml(quoteData.businessName.value || 'Business Name')}</h3>
        <div>Professional trade services</div>
      </div>
      <div class="preview-meta">
        <div><strong>Quote #</strong> ${escapeHtml(quoteData.quoteNumber.value || 'N/A')}</div>
        <div><strong>Date</strong> ${escapeHtml(dateValue)}</div>
        <div><strong>Currency</strong> ${escapeHtml(currency)}</div>
      </div>
    </div>

    <div class="preview-client">
      <div>
        <strong>Client</strong><br />
        ${escapeHtml(quoteData.clientName.value || 'Client Name')}
      </div>
      <div>
        <strong>Prepared for</strong><br />
        ${escapeHtml(quoteData.businessName.value || 'Business Name')}
      </div>
    </div>

    <table class="preview-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Qty</th>
          <th>Unit</th>
          <th>Unit Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>

    <div class="preview-footer">
      <div class="preview-summary-box">
        <div class="preview-summary-row">
          <span>Subtotal</span>
          <span>${formatCurrency(subtotal, currency)}</span>
        </div>
        <div class="preview-summary-row grand">
          <span>Grand total</span>
          <span>${formatCurrency(subtotal, currency)}</span>
        </div>
      </div>
    </div>
  `;
}

function renderRow(item) {
  const row = document.createElement('tr');
  row.dataset.id = item.id;
  row.innerHTML = `
    <td><input data-field="description" type="text" value="${escapeAttribute(item.description)}" aria-label="Description" /></td>
    <td><input data-field="quantity" type="number" min="0" step="0.01" value="${Number(item.quantity || 0)}" aria-label="Quantity" /></td>
    <td><input data-field="unit" type="text" value="${escapeAttribute(item.unit)}" aria-label="Unit" /></td>
    <td><input data-field="unitPrice" type="number" min="0" step="0.01" value="${Number(item.unitPrice || 0)}" aria-label="Unit price" /></td>
    <td>${formatCurrency(item.total || 0, quoteData.currency.value)}</td>
    <td><button class="delete-btn" type="button" aria-label="Delete item">Delete</button></td>
  `;

  const inputs = row.querySelectorAll('input');
  inputs.forEach((input) => {
    input.addEventListener('input', () => {
      const rowItems = getQuoteItems();
      const target = rowItems.find((entry) => entry.id === item.id);
      if (!target) return;

      const current = row.querySelector('[data-field="description"]').value;
      row.querySelectorAll('input').forEach((field) => {
        if (field.dataset.field === 'description') {
          field.value = current;
        }
      });

      const updatedItem = {
        ...item,
        description: row.querySelector('[data-field="description"]').value,
        quantity: Number(row.querySelector('[data-field="quantity"]').value) || 0,
        unit: row.querySelector('[data-field="unit"]').value,
        unitPrice: Number(row.querySelector('[data-field="unitPrice"]').value) || 0
      };
      updatedItem.total = calculateItemTotal(updatedItem);
      row.children[4].textContent = formatCurrency(updatedItem.total, quoteData.currency.value);
      updateTotals();
      renderPreview();
    });
  });

  row.querySelector('.delete-btn').addEventListener('click', () => {
    row.remove();
    updateTotals();
    renderPreview();
  });

  return row;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function setQuoteDateDefault() {
  if (!quoteData.quoteDate.value) {
    quoteData.quoteDate.value = new Date().toISOString().slice(0, 10);
  }
}

function addItem(item) {
  quoteData.quoteTableBody.appendChild(renderRow(item));
  updateTotals();
  renderPreview();
}

function inferItemFromPhrase(phrase) {
  const normalized = phrase.trim();
  if (!normalized) return null;

  const quantityMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:of\s+)?/i);
  const qty = quantityMatch ? Number(quantityMatch[1]) : 1;

  const cleanText = normalized.replace(/^(?:install|replace|fit|run|repair|service|remove|supply)\s+/i, '').trim();
  const textWithoutQty = cleanText.replace(new RegExp(`^${quantityMatch ? quantityMatch[1] : ''}\s*`, 'i'), '').trim();

  let description = textWithoutQty;
  let unit = 'unit';

  const unitPatterns = [
    { regex: /(socket|sockets)/i, unit: 'socket' },
    { regex: /(fuse box|fuse boxes)/i, unit: 'fuse box' },
    { regex: /(cable|cables|wire|wires)/i, unit: 'm' },
    { regex: /(switch|switches)/i, unit: 'switch' },
    { regex: /(light fitting|light fittings|luminaire|luminaires)/i, unit: 'light fitting' },
    { regex: /(radiator|radiators)/i, unit: 'radiator' },
    { regex: /(point|points)/i, unit: 'point' },
    { regex: /(panel|panels)/i, unit: 'panel' },
    { regex: /(door|doors)/i, unit: 'door' },
    { regex: /(window|windows)/i, unit: 'window' },
    { regex: /(m2|sqm|square metre|square meter)/i, unit: 'm2' },
    { regex: /(m\b|metre|meters|metres|meter)/i, unit: 'm' },
    { regex: /(hour|hours)/i, unit: 'hour' },
    { regex: /(visit|visits)/i, unit: 'visit' }
  ];

  for (const pattern of unitPatterns) {
    if (pattern.regex.test(cleanText)) {
      unit = pattern.unit;
      break;
    }
  }

  if (!description || description.length < 2) {
    description = 'General trade work';
  }

  description = description
    .replace(/\s+/g, ' ')
    .replace(/\s+(?:of|for|and|with)\s+$/i, '')
    .replace(/\s+$/g, '');

  if (unit === 'm' && /\b(\d+)\s*(m|metre|meters|metres|meter)\b/i.test(normalized)) {
    description = description.replace(/\b(?:m|meter|metre|meters|metres)\b/gi, '').trim();
  }

  const defaultPrice = (unit === 'm' || unit === 'm2' || unit === 'hour') ? 35 : 120;

  return {
    description: description || normalized,
    quantity: qty,
    unit,
    unitPrice: defaultPrice
  };
}

function parseJobDescription(text) {
  if (!text || !text.trim()) {
    return [];
  }

  const fragments = text
    .split(/[,.;]/)
    .map((fragment) => fragment.trim())
    .filter(Boolean);

  const items = [];

  fragments.forEach((fragment) => {
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(?:of\s+)?([a-zA-Z0-9\s-]+?)(?=\s*(?:,|\.|$|and|plus|with))/i,
      /(\d+(?:\.\d+)?)\s*(?:of\s+)?([a-zA-Z0-9\s-]+?)(?=\s*(?:for|including|\b(?:and|plus)\b))/i,
      /(\d+(?:\.\d+)?)\s*(?:of\s+)?([a-zA-Z0-9\s-]+?)(?=\s*(?:install|replace|run|fit|repair|service|and|,|\.|$))/i
    ];

    let matched = false;

    for (const pattern of patterns) {
      const match = fragment.match(pattern);
      if (!match) continue;

      const qty = Number(match[1]) || 1;
      const phrase = match[2].trim();
      const item = inferItemFromPhrase(`${qty} ${phrase}`);
      if (item) {
        items.push({ ...item, quantity: qty, description: item.description || phrase, unitPrice: item.unitPrice || 120 });
        matched = true;
      }
      break;
    }

    if (matched) return;

    const genericItem = inferItemFromPhrase(fragment);
    if (genericItem) {
      items.push({
        description: genericItem.description || fragment,
        quantity: genericItem.quantity || 1,
        unit: genericItem.unit || 'unit',
        unitPrice: genericItem.unitPrice || 120
      });
    }
  });

  if (!items.length) {
    items.push({
      description: text.trim(),
      quantity: 1,
      unit: 'job',
      unitPrice: 150
    });
  }

  return items.map((item) => ({
    id: `item-${itemIdCounter++}`,
    description: item.description || 'General trade work',
    quantity: Number(item.quantity) || 1,
    unit: item.unit || 'unit',
    unitPrice: Number(item.unitPrice) || 120,
    total: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 120)
  }));
}

function buildQuoteFromJobDescription() {
  const text = quoteData.jobDescription.value.trim();
  if (!text) {
    alert('Please describe the job before generating a quote.');
    quoteData.jobDescription.focus();
    return;
  }

  quoteData.quoteTableBody.innerHTML = '';
  const items = parseJobDescription(text);

  items.forEach((item) => {
    addItem(item);
  });

  quoteData.entryScreen.classList.add('hidden');
  quoteData.quoteWorkspace.classList.remove('hidden');
  setQuoteDateDefault();
  renderPreview();
}

function resetToEntryScreen() {
  quoteData.entryScreen.classList.remove('hidden');
  quoteData.quoteWorkspace.classList.add('hidden');
  quoteData.jobDescription.value = '';
  quoteData.quoteTableBody.innerHTML = '';
  quoteData.quotePreview.innerHTML = '';
  quoteData.subtotalValue.textContent = formatCurrency(0, quoteData.currency.value);
  quoteData.grandTotalValue.textContent = formatCurrency(0, quoteData.currency.value);
}

function bindEvents() {
  quoteData.generateBtn.addEventListener('click', buildQuoteFromJobDescription);
  quoteData.newQuoteBtn.addEventListener('click', resetToEntryScreen);
  quoteData.addItemBtn.addEventListener('click', () => {
    addItem(createEmptyItem());
  });
  quoteData.printBtn.addEventListener('click', () => window.print());

  [quoteData.businessName, quoteData.quoteNumber, quoteData.clientName, quoteData.currency, quoteData.quoteDate].forEach((field) => {
    field.addEventListener('input', renderPreview);
    field.addEventListener('change', renderPreview);
  });

  quoteData.currency.addEventListener('change', () => {
    updateTotals();
    renderPreview();
  });
}

function initialise() {
  bindEvents();
  setQuoteDateDefault();
  quoteData.subtotalValue.textContent = formatCurrency(0, quoteData.currency.value);
  quoteData.grandTotalValue.textContent = formatCurrency(0, quoteData.currency.value);
  const starterItem = createEmptyItem();
  starterItem.description = 'General installation work';
  starterItem.unit = 'job';
  starterItem.unitPrice = 150;
  addItem(starterItem);
  quoteData.quoteTableBody.innerHTML = '';
  renderPreview();
}

initialise();

window.addEventListener('DOMContentLoaded', () => {
  quoteData.entryScreen.classList.remove('hidden');
  quoteData.quoteWorkspace.classList.add('hidden');
});

quoteData.jobDescription.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    buildQuoteFromJobDescription();
  }
});
