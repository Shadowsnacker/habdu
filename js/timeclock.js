// ─────────────────────────────────────────────
// Timeclock Module - Wrapped in namespace to avoid
// collisions with habits code in app.js
// ─────────────────────────────────────────────
const timeclock = {
    // ── Constants ──
    STORAGE_KEY: 'melisa_timeclock_v1',
    DAY_NAMES:   ['SUN','MON','TUE','WED','THU','FRI','SAT'],
    FULL_DAYS:   ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
    MONTH_SHORT: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    // ── State ──
    state: {
        weekStart: null,
        expandedDays: new Set(),
        newEntryDay: null,
        data: {}
    },
    // ── Utilities ──
    toISODate(d) {
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    },
    getWeekStart(d) {
        const dt = new Date(d);
        const day = dt.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        dt.setDate(dt.getDate() + diff);
        dt.setHours(0,0,0,0);
        return dt;
    },
    addDays(d, n) {
        const dt = new Date(d);
        dt.setDate(dt.getDate() + n);
        return dt;
    },
    getWeekDays(weekStart) {
        return Array.from({length:7}, (_,i) => timeclock.addDays(weekStart, i));
    },
    timeToDecimal(t) {
        if (!t) return null;
        const [h, m] = t.split(':').map(Number);
        return h + m/60;
    },
    calcHours(from, to) {
        const f = timeclock.timeToDecimal(from), t = timeclock.timeToDecimal(to);
        if (f === null || t === null) return null;
        let diff = t - f;
        if (diff < 0) diff += 24;
        return diff;
    },
    fmtHours(h) {
        if (h === null || h === undefined) return '—';
        return h.toFixed(2);
    },
    formatWeekRange(ws) {
        const we = timeclock.addDays(ws, 6);
        const sm = timeclock.MONTH_SHORT[ws.getMonth()];
        const em = timeclock.MONTH_SHORT[we.getMonth()];
        if (sm === em) return `${sm} ${ws.getDate()} – ${we.getDate()}, ${ws.getFullYear()}`;
        return `${sm} ${ws.getDate()} – ${em} ${we.getDate()}, ${we.getFullYear()}`;
    },
    isToday(d) {
        const t = new Date();
        return d.getFullYear()===t.getFullYear() && d.getMonth()===t.getMonth() && d.getDate()===t.getDate();
    },
    // ── Data ──
    loadData() {
        try {
            const raw = localStorage.getItem(timeclock.STORAGE_KEY);
            if (raw) timeclock.state.data = JSON.parse(raw);
        } catch(e) { timeclock.state.data = {}; }
    },
    saveData() {
        try { localStorage.setItem(timeclock.STORAGE_KEY, JSON.stringify(timeclock.state.data)); } catch(e) {}
    },
    getEntries(dateStr) {
        return (timeclock.state.data[dateStr] || []);
    },
    setEntries(dateStr, entries) {
        if (entries.length === 0) {
            delete timeclock.state.data[dateStr];
        } else {
            timeclock.state.data[dateStr] = entries;
        }
        timeclock.saveData();
    },
    addEntry(dateStr, from, to) {
        const entries = timeclock.getEntries(dateStr).slice();
        entries.push({ from, to });
        timeclock.setEntries(dateStr, entries);
    },
    deleteEntry(dateStr, idx) {
        const entries = timeclock.getEntries(dateStr).filter((_,i) => i !== idx);
        timeclock.setEntries(dateStr, entries);
    },
    // ── Render ──
    render() {
        const app = document.getElementById('timeclock-app');
        if (!app) return;
        app.innerHTML = timeclock.buildHTML();
        timeclock.attachEvents();
    },
    buildHTML() {
        const days = timeclock.getWeekDays(timeclock.state.weekStart);
        let rawTotal = 0;
        days.forEach(d => {
            timeclock.getEntries(timeclock.toISODate(d)).forEach(e => {
                const h = timeclock.calcHours(e.from, e.to);
                if (h !== null) rawTotal += h;
            });
        });
        const calcTotal = Math.min(rawTotal, 40);
        const ot = rawTotal > 40 ? rawTotal - 40 : 0;
        let daysHTML = days.map(d => timeclock.buildDayCard(d)).join('');
        return `
            <div class="header">
                <div class="header-top">
                    <div>
                        <div class="app-title">Weekly Timesheet</div>
                    </div>
                </div>
                <div class="week-nav">
                    <button class="nav-btn" id="tcPrevWeek">‹</button>
                    <div class="week-label">${timeclock.formatWeekRange(timeclock.state.weekStart)}</div>
                    <button class="nav-btn" id="tcNextWeek">›</button>
                    <button class="today-btn" id="tcGotoToday">Today</button>
                </div>
            </div>
            <div class="totals-bar">
                <div class="total-card raw">
                    <div class="total-value">${timeclock.fmtHours(rawTotal)}</div>
                    <div class="total-label">Raw Total hrs</div>
                    ${ot > 0 ? `<div class="ot-tag">+${timeclock.fmtHours(ot)} OT</div>` : ''}
                </div>
                <div class="total-card calc">
                    <div class="total-value ${rawTotal > 40 ? 'overtime' : ''}">${timeclock.fmtHours(calcTotal)}</div>
                    <div class="total-label">Reg. Total hrs</div>
                </div>
            </div>
            <div class="days-list">${daysHTML}</div>
            <div style="text-align: center; padding: 16px;">
                <button class="btn-cancel" id="tcClearData">Clear All Data</button>
            </div>
            <div class="footer">built with <span>♥</span> for melisa · data saved locally</div>
        `;
    },
    buildDayCard(d) {
        const dateStr   = timeclock.toISODate(d);
        const entries   = timeclock.getEntries(dateStr);
        const expanded  = timeclock.state.expandedDays.has(dateStr);
        const isNew     = timeclock.state.newEntryDay === dateStr;
        const today     = timeclock.isToday(d);
        let dayTotal = 0;
        entries.forEach(e => {
            const h = timeclock.calcHours(e.from, e.to);
            if (h !== null) dayTotal += h;
        });
        const entriesHTML = entries.map((e, i) => {
            const h = timeclock.calcHours(e.from, e.to);
            return `
                <div class="entry-row" data-date="${dateStr}" data-idx="${i}">
                    <div class="entry-field">
                        <label>From</label>
                        <input type="time" class="tc-entry-from" data-date="${dateStr}" data-idx="${i}" value="${e.from||''}">
                    </div>
                    <div class="entry-field">
                        <label>To</label>
                        <input type="time" class="tc-entry-to" data-date="${dateStr}" data-idx="${i}" value="${e.to||''}">
                    </div>
                    <div class="entry-hours">
                        <label>Hours</label>
                        <div class="entry-hours-value ${h===null?'empty':''}" id="tc-hours-${dateStr}-${i}">
                            ${h !== null ? timeclock.fmtHours(h) : '—'}
                        </div>
                    </div>
                    <button class="entry-delete-btn" data-tc-delete="${dateStr}" data-idx="${i}" title="Remove">✕</button>
                </div>
            `;
        }).join('');
        const emptyHTML = entries.length === 0
            ? `<div class="empty-day">No entries — tap + to add time</div>`
            : '';
        const newFormHTML = `
            <div class="new-entry-form ${isNew ? 'visible' : ''}" id="tc-newform-${dateStr}">
                <div class="new-entry-row">
                    <div class="entry-field">
                        <label>From</label>
                        <input type="time" id="tc-newFrom-${dateStr}">
                    </div>
                    <div class="entry-field">
                        <label>To</label>
                        <input type="time" id="tc-newTo-${dateStr}">
                    </div>
                    <div class="entry-hours" style="justify-content:flex-end;padding-top:4px;">
                        <label>Hours</label>
                        <div class="entry-hours-value empty" id="tc-newHours-${dateStr}">—</div>
                    </div>
                </div>
                <div class="new-hours-preview" id="tc-newPreview-${dateStr}"></div>
                <div class="new-entry-actions">
                    <button class="btn-cancel" data-tc-canceldate="${dateStr}">Cancel</button>
                    <button class="btn-save" data-tc-savedate="${dateStr}">Save Entry</button>
                </div>
            </div>
        `;
        return `
            <div class="day-card ${today?'today':''} ${expanded?'expanded':''}" data-date="${dateStr}">
                <div class="day-header" data-tc-toggle="${dateStr}">
                    <span class="day-chevron">›</span>
                    <span class="day-name">${timeclock.DAY_NAMES[d.getDay()]} ${timeclock.MONTH_SHORT[d.getMonth()]} ${d.getDate()}</span>
                    ${today ? '<span class="today-dot"></span>' : ''}
                    <span class="day-total ${dayTotal===0?'zero':''}">${dayTotal > 0 ? timeclock.fmtHours(dayTotal) : '0.00'}</span>
                    <button class="day-add-btn" data-tc-addday="${dateStr}" title="Add entry">+</button>
                </div>
                <div class="day-body">
                    ${emptyHTML}
                    ${entriesHTML}
                    ${newFormHTML}
                </div>
            </div>
        `;
    },
    // ── Events ──
    attachEvents() {
        // Week nav
        document.getElementById('tcPrevWeek')?.addEventListener('click', () => {
            timeclock.state.weekStart = timeclock.addDays(timeclock.state.weekStart, -7);
            timeclock.state.newEntryDay = null;
            timeclock.render();
        });
        document.getElementById('tcNextWeek')?.addEventListener('click', () => {
            timeclock.state.weekStart = timeclock.addDays(timeclock.state.weekStart, 7);
            timeclock.state.newEntryDay = null;
            timeclock.render();
        });
        document.getElementById('tcGotoToday')?.addEventListener('click', () => {
            timeclock.state.weekStart = timeclock.getWeekStart(new Date());
            timeclock.state.newEntryDay = null;
            timeclock.state.expandedDays = new Set();
            const today = timeclock.toISODate(new Date());
            timeclock.state.expandedDays.add(today);
            timeclock.render();
        });
        // Day toggles
        document.querySelectorAll('[data-tc-toggle]').forEach(el => {
            el.addEventListener('click', e => {
                if (e.target.closest('[data-tc-addday]')) return;
                const date = el.dataset.tcToggle;
                timeclock.state.expandedDays.has(date) ? timeclock.state.expandedDays.delete(date) : timeclock.state.expandedDays.add(date);
                timeclock.render();
            });
        });
        // Add entry buttons
        document.querySelectorAll('[data-tc-addday]').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const date = btn.dataset.tcAddday;
                timeclock.state.expandedDays.add(date);
                timeclock.state.newEntryDay = (timeclock.state.newEntryDay === date) ? null : date;
                timeclock.render();
                setTimeout(() => document.getElementById(`tc-newFrom-${date}`)?.focus(), 50);
            });
        });
        // Cancel new entry
        document.querySelectorAll('[data-tc-canceldate]').forEach(btn => {
            btn.addEventListener('click', () => {
                timeclock.state.newEntryDay = null;
                timeclock.render();
            });
        });
        // Save new entry
        document.querySelectorAll('[data-tc-savedate]').forEach(btn => {
            btn.addEventListener('click', () => {
                const date = btn.dataset.tcSavedate;
                const fromEl = document.getElementById(`tc-newFrom-${date}`);
                const toEl   = document.getElementById(`tc-newTo-${date}`);
                const from = fromEl?.value, to = toEl?.value;
                if (!from || !to) {
                    fromEl?.style.setProperty('border-color', 'var(--danger)');
                    toEl?.style.setProperty('border-color', 'var(--danger)');
                    return;
                }
                timeclock.addEntry(date, from, to);
                timeclock.state.newEntryDay = null;
                timeclock.render();
            });
        });
        // Delete entries
        document.querySelectorAll('[data-tc-delete]').forEach(btn => {
            btn.addEventListener('click', () => {
                const date = btn.dataset.tcDelete;
                const idx  = parseInt(btn.dataset.idx);
                if (confirm('Remove this time entry?')) {
                    timeclock.deleteEntry(date, idx);
                    timeclock.render();
                }
            });
        });
        // Live-update existing entry hours on time change
        document.querySelectorAll('.tc-entry-from, .tc-entry-to').forEach(input => {
            input.addEventListener('change', () => {
                const date = input.dataset.date;
                const idx  = parseInt(input.dataset.idx);
                const entries = timeclock.getEntries(date).slice();
                const field   = input.classList.contains('tc-entry-from') ? 'from' : 'to';
                entries[idx][field] = input.value;
                timeclock.setEntries(date, entries);
                const e = entries[idx];
                const h = timeclock.calcHours(e.from, e.to);
                const hoursEl = document.getElementById(`tc-hours-${date}-${idx}`);
                if (hoursEl) {
                    hoursEl.textContent = h !== null ? timeclock.fmtHours(h) : '—';
                    hoursEl.className = `entry-hours-value ${h===null?'empty':''}`;
                }
                timeclock.updateTotalsLive();
            });
        });
        // Live preview new entry hours
        document.querySelectorAll('[id^="tc-newFrom-"], [id^="tc-newTo-"]').forEach(input => {
            input.addEventListener('change', () => {
                const date = input.id.replace('tc-newFrom-','').replace('tc-newTo-','');
                const fromEl = document.getElementById(`tc-newFrom-${date}`);
                const toEl   = document.getElementById(`tc-newTo-${date}`);
                if (!fromEl || !toEl) return;
                const h = timeclock.calcHours(fromEl.value, toEl.value);
                const previewEl = document.getElementById(`tc-newPreview-${date}`);
                const hoursEl   = document.getElementById(`tc-newHours-${date}`);
                if (h !== null && h > 0) {
                    if (previewEl) {
                        previewEl.textContent = `${timeclock.fmtHours(h)} hours`;
                        previewEl.classList.add('visible');
                    }
                    if (hoursEl) {
                        hoursEl.textContent = timeclock.fmtHours(h);
                        hoursEl.classList.remove('empty');
                    }
                } else {
                    if (previewEl) previewEl.classList.remove('visible');
                    if (hoursEl)   { hoursEl.textContent = '—'; hoursEl.classList.add('empty'); }
                }
            });
        });
        // Delete All timeclock data entries
        document.getElementById('tcClearData')?.addEventListener('click', () => {
            if (confirm('Clear all timesheet data? This cannot be undone.')) {
                localStorage.removeItem(timeclock.STORAGE_KEY);
                timeclock.state.data = {};
                timeclock.render();
            }
        });
    },
    updateTotalsLive() {
        const days = timeclock.getWeekDays(timeclock.state.weekStart);
        let rawTotal = 0;
        days.forEach(d => {
            const dateStr = timeclock.toISODate(d);
            let dayTotal = 0;
            timeclock.getEntries(dateStr).forEach(e => {
                const h = timeclock.calcHours(e.from, e.to);
                if (h !== null) { rawTotal += h; dayTotal += h; }
            });
            const dayEl = document.querySelector(`#timeclock-view .day-card[data-date="${dateStr}"] .day-total`);
            if (dayEl) {
                dayEl.textContent = timeclock.fmtHours(dayTotal);
                dayEl.className = `day-total ${dayTotal===0?'zero':''}`;
            }
        });
        const calcTotal = Math.min(rawTotal, 40);
        const ot = rawTotal > 40 ? rawTotal - 40 : 0;

        const rawEl  = document.querySelector('#timeclock-view .total-card.raw .total-value');
        const calcEl = document.querySelector('#timeclock-view .total-card.calc .total-value');
        const otEl   = document.querySelector('#timeclock-view .total-card.raw .ot-tag');

        if (rawEl)  rawEl.textContent  = timeclock.fmtHours(rawTotal);
        if (calcEl) {
            calcEl.textContent = timeclock.fmtHours(calcTotal);
            calcEl.className   = `total-value ${rawTotal > 40 ? 'overtime' : ''}`;
        }
        if (otEl) otEl.textContent = `+${timeclock.fmtHours(ot)} OT`;
        else if (ot > 0) {
            document.querySelector('#timeclock-view .total-card.raw')?.insertAdjacentHTML('beforeend',
                `<div class="ot-tag">+${timeclock.fmtHours(ot)} OT</div>`);
        }
    },

    // ── Initialize ──
    init() {
        timeclock.state.weekStart = timeclock.getWeekStart(new Date());
        timeclock.loadData();
        const todayStr = timeclock.toISODate(new Date());
        timeclock.state.expandedDays.add(todayStr);
        timeclock.render();
    }
};