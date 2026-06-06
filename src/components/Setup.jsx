import React, { useState } from 'react';

const Setup = ({ onSetup }) => {
  const [form, setForm] = useState({
    fuelType: 'Petrol Only',
    targetLitres: '',
    costPrice: '',
    lowStockLimit: '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.targetLitres || parseFloat(form.targetLitres) <= 0) e.targetLitres = 'Enter valid target litres';
    if (!form.costPrice || parseFloat(form.costPrice) <= 0) e.costPrice = 'Enter valid cost price';
    if (!form.lowStockLimit || parseFloat(form.lowStockLimit) < 0) e.lowStockLimit = 'Enter valid alert limit';
    if (parseFloat(form.lowStockLimit) >= parseFloat(form.targetLitres)) e.lowStockLimit = 'Must be less than target litres';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onSetup({
      fuelType: form.fuelType,
      targetLitres: parseFloat(form.targetLitres),
      costPrice: parseFloat(form.costPrice),
      lowStockLimit: parseFloat(form.lowStockLimit),
    });
  };

  const investment = (parseFloat(form.targetLitres) || 0) * (parseFloat(form.costPrice) || 0);

  const set = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    setErrors(p => ({ ...p, [field]: undefined }));
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-header">
          <span className="setup-icon">⚙️</span>
          <div>
            <h2>Session Setup</h2>
            <p>Configure your fuel stock for this session</p>
          </div>
        </div>

        <div className="form-group">
          <label>Fuel Type</label>
          <div className="radio-group">
            {['Petrol Only', 'Petrol + Oil'].map(type => (
              <label key={type} className={`radio-card ${form.fuelType === type ? 'active' : ''}`}>
                <input type="radio" name="fuelType" value={type}
                  checked={form.fuelType === type}
                  onChange={() => set('fuelType', type)} />
                <span>{type === 'Petrol Only' ? '⛽' : '🛢️'}</span>
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Target Litres <span className="required">*</span></label>
            <div className="input-wrap">
              <input type="number" min="0" placeholder="e.g. 500"
                value={form.targetLitres} onChange={e => set('targetLitres', e.target.value)} />
              <span className="input-unit">L</span>
            </div>
            {errors.targetLitres && <span className="error-msg">{errors.targetLitres}</span>}
          </div>

          <div className="form-group">
            <label>Cost Price Per Litre <span className="required">*</span></label>
            <div className="input-wrap">
              <span className="input-prefix">₹</span>
              <input type="number" min="0" step="0.01" placeholder="e.g. 95.50"
                value={form.costPrice} onChange={e => set('costPrice', e.target.value)} />
            </div>
            {errors.costPrice && <span className="error-msg">{errors.costPrice}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Low Stock Alert Limit <span className="required">*</span></label>
          <div className="input-wrap">
            <input type="number" min="0" placeholder="e.g. 50"
              value={form.lowStockLimit} onChange={e => set('lowStockLimit', e.target.value)} />
            <span className="input-unit">L</span>
          </div>
          {errors.lowStockLimit && <span className="error-msg">{errors.lowStockLimit}</span>}
          <span className="hint">Alert triggers when remaining stock falls below this value</span>
        </div>

        {investment > 0 && (
          <div className="investment-banner">
            <div>
              <div className="inv-label">Total Investment</div>
              <div className="inv-amount">₹{investment.toFixed(2)}</div>
            </div>
            <div className="inv-details">
              <span>{parseFloat(form.targetLitres) || 0} L × ₹{parseFloat(form.costPrice) || 0}/L</span>
            </div>
          </div>
        )}

        <button className="btn-primary btn-full" onClick={handleSubmit}>
          🚀 Start Session
        </button>
      </div>
    </div>
  );
};

export default Setup;
