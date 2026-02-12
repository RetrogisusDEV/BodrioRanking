let state = {
    data: [],
    sortKey: 'scoreFinal',
    sortDir: 'desc'
};

function init() {
    if (typeof persons === 'undefined') return;
    
    state.data = Object.keys(persons).map(key => {
        const p = persons[key];
        const dateStr = p.addedDate.toString();
        
        // Ponderación de Score
        const cpuScore = Math.floor((p.realPerformanceMulti || (p.teoricalPerformanceMulti * 0.75)));
        const isOC = p.gpuName.toUpperCase().includes('(OC)') || p.gpuName.toUpperCase().includes('SUPERCLOCKED');
        const gpuBase = Math.floor(p.gpuPerformance);
        const gpuBonus = Math.floor(isOC ? gpuBase * 0.1 : 0);
        const ramScore = Math.floor((p.ramSize * 20 + p.ramspeed / 10) * 0.15);
        
        return {
            id: parseInt(key),
            ...p,
            cpuVal: p.realPerformanceMulti || p.teoricalPerformanceMulti,
            cpuPoints: cpuScore,
            gpuPointsBase: gpuBase,
            gpuPointsBonus: gpuBonus,
            dateDisplay: `${dateStr.slice(0,2)}/${dateStr.slice(2,4)}/${dateStr.slice(4,8)}`,
            dateValue: parseInt(`${dateStr.slice(4,8)}${dateStr.slice(2,4)}${dateStr.slice(0,2)}`),
            scoreFinal: cpuScore + gpuBase + gpuBonus + ramScore,
            vram: p.vram || (p.gpuName.toUpperCase().includes('GTX') ? 2 : (p.gpuName.toUpperCase().includes('R5') ? 2 : 1))
        };
    });
    render();
}

function getBrandLabel(name, type) {
    const text = name.toUpperCase();
    let brand = "",
        colorClass = "";
    if (text.includes('INTEL')) { brand = "INTEL";
        colorClass = "t-intel"; }
    else if (text.includes('AMD') || text.includes('RYZEN') || text.includes('ATHLON')) { brand = "AMD";
        colorClass = "t-amd"; }
    else if (text.includes('NVIDIA') || text.includes('GTX')) { brand = "NVIDIA";
        colorClass = "t-nvidia"; }
    if (!brand) return "";
    return `<div class="brand-label ${colorClass}"><strong>${brand}</strong><small>${type}</small></div>`;
}

function getSpecialLabels(p) {
    let html = "";
    const gpu = p.gpuName.toUpperCase();
    if (gpu.includes('(OC)') || gpu.includes('SUPERCLOCKED')) {
        html += `<div class="brand-label t-oc"><strong>OC</strong><small>ACTIVE</small></div>`;
    }
    if (gpu.includes('GRAPHICS') || gpu.includes('VEGA') || p.vram < 1.5) {
        html += `<div class="brand-label t-novram"><strong>NOVRAM</strong><small>SHARED</small></div>`;
    }
    return html;
}

function sort(key) {
    state.sortDir = (state.sortKey === key && state.sortDir === 'desc') ? 'asc' : 'desc';
    state.sortKey = key;
    render();
}

function render() {
    state.data.sort((a, b) => {
        let vA = a[state.sortKey],
            vB = b[state.sortKey];
        if (typeof vA === 'string') { vA = vA.toLowerCase();
            vB = vB.toLowerCase(); }
        return state.sortDir === 'asc' ? (vA > vB ? 1 : -1) : (vA < vB ? 1 : -1);
    });
    
    document.getElementById('tableBody').innerHTML = state.data.map(p => `
        <tr>
            <td style="color:var(--gray)">#${p.id}</td>
            <td>
                <div class="user-cell">
                    <strong>${p.name}</strong>
                    <div class="medal-container">
                        ${getBrandLabel(p.cpuName, 'CPU')}
                        ${getBrandLabel(p.gpuName, 'GPU')}
                        ${getSpecialLabels(p)}
                    </div>
                </div>
            </td>
            <td>
                <strong>${p.cpuName}</strong>
                <span class="pts-badge">Bench: ${p.cpuVal} | <span class="pts-value">Score: ${p.cpuPoints}</span></span>
            </td>
            <td>
                <strong>${p.gpuName.replace('(OC)', '')}</strong>
                <span class="pts-badge">
                    VRAM: ${p.vram}GB | 
                    <span class="pts-value">Score: ${p.gpuPointsBase}</span> 
                    ${p.gpuPointsBonus > 0 ? `<span class="oc-pts">+ ${p.gpuPointsBonus} OC</span>` : ''}
                </span>
            </td>
            <td>${p.ramSize}GB <small style="color:var(--gray)">${p.ramspeed}MHz</small></td>
            <td>${p.dateDisplay}</td>
            <td class="score-cell ${p.scoreFinal > 3500 ? 'high' : p.scoreFinal > 1500 ? 'mid' : 'low'}">${p.scoreFinal}</td>
        </tr>
    `).join('');
    
    // Render Cards (Mobile)
    document.getElementById('mobileCards').innerHTML = state.data.map(p => `
        <div class="card">
            <div class="user-cell">
                <strong>${p.name}</strong>
                <div class="score-cell ${p.scoreFinal > 3500 ? 'high' : 'mid'}">${p.scoreFinal}</div>
            </div>
            <div style="margin-top:10px; font-size:0.85rem">
                <div><strong>CPU:</strong> ${p.cpuName} <div style="padding:10px" align="right"><strong> ( ${p.cpuPoints} pts )
                </strong></div></div>
                
                <div><strong>GPU:</strong> ${p.gpuName}
                <div style="padding:10px" align="right"><strong> ( ${p.gpuPointsBase} ${p.gpuPointsBonus > 0 ? `+ ${p.gpuPointsBonus} )` : ')'} </strong></div></div>
                <div class="medal-container" style="margin-top:10px">
                    ${getBrandLabel(p.cpuName, 'CPU')} ${getBrandLabel(p.gpuName, 'GPU')} ${getSpecialLabels(p)}
                </div>
            </div>
        </div>
    `).join('');
    
    updateHeaderIcons();
}

function updateHeaderIcons() {
    document.querySelectorAll('th').forEach(th => {
        th.innerHTML = th.innerHTML.replace(' ↑', '').replace(' ↓', '');
        const attr = th.getAttribute('onclick');
        if (attr && attr.includes(`'${state.sortKey}'`)) {
            th.innerHTML += state.sortDir === 'asc' ? ' ↑' : ' ↓';
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
