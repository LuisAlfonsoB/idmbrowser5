'use strict';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtBytes = n => n >= 1073741824 ? (n / 1073741824).toFixed(2) + ' GB' : n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : n >= 1024 ? Math.round(n / 1024) + ' KB' : (n || 0) + ' B';
const letter = s => esc((s || '?').trim().charAt(0));
function modal(title, fields, ok = 'Save') {
  return new Promise(resolve => {
    const bg = document.createElement('div'); bg.className = 'modal-bg';
    bg.innerHTML = `<form class="modal"><h3>${esc(title)}</h3>${fields.map((f, i) => f.type === 'select'
      ? `<label>${esc(f.label)}</label><select name="f${i}">${f.options.map(o => `<option value="${esc(o.value)}"${o.value === f.value ? ' selected' : ''}>${esc(o.label)}</option>`).join('')}</select>`
      : f.type === 'message' ? `<p>${esc(f.label)}</p>` : `<label>${esc(f.label)}</label><input type="text" name="f${i}" value="${esc(f.value || '')}">`).join('')}
      <div class="btns"><button type="button" data-c>Cancel</button><button class="primary" type="submit">${esc(ok)}</button></div></form>`;
    document.body.appendChild(bg);
    const form = bg.querySelector('form'); const first = form.querySelector('input,select'); if (first) { first.focus(); if (first.select) first.select(); }
    const done = v => { bg.remove(); resolve(v); };
    form.onsubmit = e => { e.preventDefault(); done(fields.map((f, i) => (form.elements['f' + i] || {}).value)); };
    form.querySelector('[data-c]').onclick = () => done(null);
    bg.addEventListener('mousedown', e => { if (e.target === bg) done(null); });
    bg.addEventListener('keydown', e => { if (e.key === 'Escape') done(null); });
  });
}
const confirmModal = (msg, ok = 'OK') => modal('Confirm', [{ type: 'message', label: msg }], ok).then(v => v !== null);
