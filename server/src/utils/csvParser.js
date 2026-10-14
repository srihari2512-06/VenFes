// Lightweight CSV parser with row-level validation (FR-33, S10)
export function parseAndValidateProductCSV(csvContent, vendorId) {
  const lines = csvContent.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length <= 1) {
    return { imported: [], errors: [{ row: 0, reason: 'CSV is empty or missing data rows' }] };
  }

  // Header check
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const nameIdx = header.indexOf('name');
  const priceIdx = header.indexOf('price');
  const categoryIdx = header.indexOf('category');
  const stockIdx = header.indexOf('stock');
  const descIdx = header.indexOf('description');
  const mrpIdx = header.indexOf('mrp');
  const brandIdx = header.indexOf('brand');
  const highlightsIdx = header.indexOf('highlights');
  const specsIdx = header.indexOf('specifications');

  if (nameIdx === -1 || priceIdx === -1 || categoryIdx === -1 || stockIdx === -1) {
    return {
      imported: [],
      errors: [{ row: 1, reason: 'Missing required header columns: name, price, category, stock' }]
    };
  }

  const MAX_ROWS = 500;
  const rowsToProcess = lines.slice(1, MAX_ROWS + 1);

  const imported = [];
  const errors = [];

  rowsToProcess.forEach((line, index) => {
    const rowNumber = index + 2; // 1-indexed including header
    const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));

    const name = cols[nameIdx];
    const priceRaw = cols[priceIdx];
    const category = cols[categoryIdx];
    const stockRaw = cols[stockIdx];
    const description = descIdx !== -1 && cols[descIdx] ? cols[descIdx] : name;

    if (!name || name.length < 2) {
      errors.push({ row: rowNumber, reason: 'Invalid or missing product name' });
      return;
    }

    const price = parseFloat(priceRaw);
    if (isNaN(price) || price < 0) {
      errors.push({ row: rowNumber, reason: `Invalid price: "${priceRaw}"` });
      return;
    }

    const stock = parseInt(stockRaw, 10);
    if (isNaN(stock) || stock < 0) {
      errors.push({ row: rowNumber, reason: `Invalid stock quantity: "${stockRaw}"` });
      return;
    }

    if (!category) {
      errors.push({ row: rowNumber, reason: 'Missing category' });
      return;
    }

    let mrp = undefined;
    if (mrpIdx !== -1 && cols[mrpIdx] !== undefined && cols[mrpIdx] !== '') {
      const parsedMrp = parseFloat(cols[mrpIdx]);
      if (isNaN(parsedMrp) || parsedMrp < price) {
        errors.push({ row: rowNumber, reason: `MRP (${cols[mrpIdx]}) must be greater than or equal to price (${price})` });
        return;
      }
      mrp = parsedMrp;
    }

    const brand = (brandIdx !== -1 && cols[brandIdx]) ? cols[brandIdx].slice(0, 60).trim() : '';

    let highlights = [];
    if (highlightsIdx !== -1 && cols[highlightsIdx]) {
      highlights = cols[highlightsIdx].split('|').map(h => h.trim()).filter(Boolean);
      if (highlights.length > 6) {
        errors.push({ row: rowNumber, reason: 'Highlights cannot exceed 6 items' });
        return;
      }
      if (highlights.some(h => h.length > 120)) {
        errors.push({ row: rowNumber, reason: 'Each highlight must be 120 characters or fewer' });
        return;
      }
    }

    let specifications = [];
    if (specsIdx !== -1 && cols[specsIdx]) {
      const specPairs = cols[specsIdx].split('|').map(s => s.trim()).filter(Boolean);
      if (specPairs.length > 15) {
        errors.push({ row: rowNumber, reason: 'Specifications cannot exceed 15 items' });
        return;
      }
      for (const pair of specPairs) {
        const [label, ...valParts] = pair.split(':');
        if (label && valParts.length > 0) {
          specifications.push({ label: label.trim(), value: valParts.join(':').trim() });
        }
      }
    }

    imported.push({
      name,
      description,
      price,
      mrp,
      brand,
      highlights,
      specifications,
      category,
      stock,
      vendorId,
      isPublished: true
    });
  });

  return { imported, errors };
}
