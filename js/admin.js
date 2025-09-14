document.addEventListener('DOMContentLoaded', () => {
  const k = 'cj_leads';
  const data = JSON.parse(localStorage.getItem(k) || '[]');
  const box = document.getElementById('leadTable');

  if(!data.length){
    box.innerHTML = '<div class="card">Nenhum lead registrado ainda.</div>';
    return;
  }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Data/Hora</th><th>Busca</th><th>Provedores sugeridos</th></tr>';
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${new Date(row.ts).toLocaleString()}</td>
                    <td>${row.query}</td>
                    <td>${row.results.join(', ')}</td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  box.appendChild(table);

  document.getElementById('exportCsv').addEventListener('click', () => {
    const csvRows = [['ts','query','results']].concat(data.map(r=>[r.ts, r.query, r.results.join('|')]));
    const csv = csvRows.map(r=>r.map(c => '"'+String(c).replaceAll('"','""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'leads_conectaja.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});
