import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAndValidateProductCSV } from '../src/utils/csvParser.js';

test('CSV Parser - S10: accepts valid rows and reports bad rows with clear reasons', () => {
  const mockVendorId = '66f123456789abcdef012345';
  const csvData = `name,price,category,stock,description
Headphones,1999,Electronics,25,High quality headphones
,499,Clothing,10,Missing name row
Running Shoes,-50,Footwear,15,Invalid negative price
Coffee Mug,299,Home,invalid_stock,Ceramic mug
Backpack,1299,Accessories,50,Durable waterproof backpack`;

  const { imported, errors } = parseAndValidateProductCSV(csvData, mockVendorId);

  // Should have 2 valid items (Headphones, Backpack)
  assert.equal(imported.length, 2);
  assert.equal(imported[0].name, 'Headphones');
  assert.equal(imported[0].price, 1999);
  assert.equal(imported[0].stock, 25);
  assert.equal(imported[1].name, 'Backpack');
  assert.equal(imported[1].price, 1299);

  // Should have 3 error rows
  assert.equal(errors.length, 3);
  assert.equal(errors[0].row, 3); // missing name
  assert.equal(errors[1].row, 4); // negative price
  assert.equal(errors[2].row, 5); // non-numeric stock
});
