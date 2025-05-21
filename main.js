import { Store }       from './store.js';
import { playInput }   from './ui.js';

/* ---------- DOM refs ---------- */
const tabBar   = document.getElementById('tabBar');
const panes    = [...document.querySelectorAll('.pane')];
const plName   = document.getElementById('plName');
const newPlBtn = document.getElementById('newPlBtn');
const ytCode   = document.getElementById('ytCode');
const playBtn  = document.getElementById('playBtn');
const addBtn   = document.getElementById('addBtn');

/* ---------- tab switching (point 2) ---------- */
tabBar.onclick = e => {
  const btn = e.target.closest('button');
  if(!btn) return;
  tabBar.querySelector('.active')?.classList.remove('active');
  btn.classList.add('active');
  panes.forEach(p => p.classList.toggle('active', p.id === btn.dataset.tab));
};

/* ---------- add new playlist ---------- */
newPlBtn.onclick = () => {
  const name = plName.value.trim();
  if(!name) return;
  Store.mutate(s => s.playlists.push({ name, songs: [] }));
  plName.value = '';
};

/* ---------- play input code ---------- */
playBtn.onclick = () => { playInput(ytCode.value.trim()); ytCode.value=''; };
ytCode.onkeypress = e => { if(e.key==='Enter') playBtn.click(); };

/* ---------- add currently playing to playlist ---------- */
addBtn.onclick = () => {
  const s = Store.get();
  const idx = s.current;
  if(idx == null){ alert('Select a playlist first'); return; }
  const id = currentId();
  if(!id){ alert('No video playing'); return; }
  s.playlists[idx].songs.push({ id, title: '' });
  Store.patch({});          // trigger re-render
};
