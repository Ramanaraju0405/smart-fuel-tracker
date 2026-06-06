import React, { useState } from 'react';
import { calculations } from '../utils/calculations';

const AddSale = ({ session, onAddSale, onNotify }) => {
  const [form, setForm] = useState({
    saleType: session.setup.fuelType === 'Petrol + Oil' ? 'Petrol Only' : 'Petrol Only',
    litres: '',
    sellingPrice: '',
  });
  const [errors, setErrors] = useState({});

  const remaining = calculations.getRemainingStock(session.setup.targetLitres, session.transactions);
  const revenue = (parseFloat(form.litres) || 0) * (parseFloat(form.sellingPrice) || 0);

  const set = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    setErrors(p => ({ ...p, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    const l = parseFloat(form.litres);
    const p = parseFloat(form.sellingPrice);
    if (!form.litres || l <= 0) e.litres = 'Enter valid litres';
    if (l > remaining) e.litres = `Cannot exceed remaining stock (${remaining.toFixed(2)}L)`;
    if (!form.sellingPrice || p <= 0) e.sellingPrice = 'Enter valid selling price';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const transaction = {
      id: `tx-${Date.now()}`,
      saleType: form.saleType,
      litres: parseFloat(form.litres),
      sellingPrice: parseFloat(form.sellingPrice),
      revenue: revenue,
      timestamp: new Date().toISOString(),
    };
    onAddSale(transaction);
    setForm({ saleType: form.saleType, litres: '', sellingPrice: '' });
    setErrors({});
    onNotify({ type: 'success', message: `Sale recorded! ₹${revenue.toFixed(2)} revenue added.` });
  };

  const saleTypes = session.setup.fuelType === 'Petrol + Oil'
    ? ['Petrol Only', 'Petrol + Oil']
    : ['Petrol Only'];

  return (
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-header">
          <span className="setup-icon">➕</span>
          <div>
            <h2>Add Sale</h2>
            <p>Record a new fuel sale transaction</p>
          </div>
        </div>

        <div className="stock-banner">
          <div className="stock-info">
            <span className="stock-label">Remaining Stock</span>
            <span className="stock-val">{remaining.toFixed(2)} L</span>
          </div>
          <div className={`stock-status ${remaining <= session.setup.lowStockLimit ? 'low' : 'ok'}`}>
            {remaining <= session.setup.lowStockLimit ? '⚡ Low Stock' : '✅ In Stock'}
          </div>
        </div>

        {saleTypes.length > 1 && (
          <div className="form-group">
            <label>Sale Type</label>
            <div className="radio-group">
              {saleTypes.map(type => (
                <label key={type} className={`radio-card ${form.saleType === type ? 'active' : ''}`}>
                  <input type="radio" name="saleType" value={type}
                    checked={form.saleType === type}
                    onChange={() => set('saleType', type)} />
                  <span>{type === 'Petrol Only' ? '⛽' : '🛢️'}</span>
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Litres Sold <span className="required">*</span></label>
            <div className="input-wrap">
              <input type="number" min="0" step="0.01" placeholder="e.g. 10.5"
                value={form.litres} onChange={e => set('litres', e.target.value)} />
              <span className="input-unit">L</span>
            </div>
            {errors.litres && <span className="error-msg">{errors.litres}</span>}
          </div>

          <div className="form-group">
            <label>Selling Price Per Litre <span className="required">*</span></label>
            <div className="input-wrap">
              <span className="input-prefix">₹</span>
              <input type="number" min="0" step="0.01" placeholder="e.g. 105.50"
                value={form.sellingPrice} onChange={e => set('sellingPrice', e.target.value)} />
            </div>
            {errors.sellingPrice && <span className="error-msg">{errors.sellingPrice}</span>}
          </div>
        </div>

        {revenue > 0 && (
          <div className="investment-banner">
            <div>
              <div className="inv-label">Revenue Preview</div>
              <div className="inv-amount">₹{revenue.toFixed(2)}</div>
            </div>
            <div className="inv-details">
              <span>{form.litres}L × ₹{form.sellingPrice}/L</span>
            </div>
          </div>
        )}

        <button className="btn-primary btn-full" onClick={handleSubmit} disabled={remaining === 0}>
          {remaining === 0 ? '🚫 Stock Depleted' : '💾 Record Sale'}
        </button>
      </div>
    </div>
  );
};

export default AddSale;
