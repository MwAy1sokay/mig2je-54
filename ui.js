import { Store }           from './store.js';
import { play, currentId } from './player.js';
import { fetchTitle, toast } from './util.js';   // util.js comes next

/* ---------- helpers ---------- */

function $(id) { return document.getElementById(id); }

/* ---------- rendering ---------- */

const panes = { pl: $('pl'), cur: $('cur'), his: $('his') };

function render(state) {
  renderPlaylists(state);
  renderCurrent(state);
  renderHistory(state);
  syncModeButtons(state);
}
Store.sub(render);   // live updates

/* playlists */
function renderPlaylists({ playlists }) {
  const ul = panes.pl; ul.innerHTML = '';
  playlists.forEach((pl, idx) => {
    const li = row(pl.name,
      button('🗑️', () => deletePlaylist(idx)));
    li.onclick = () => Store.patch({ current: idx });
    ul.append(li);
  });
}

/* current playlist */
function renderCurrent(state) {
  panes.cur.innerHTML = '';
  const idx = state.current;
  if (idx == null) return;
  const list = state.playlists[idx];
  list.songs.forEach((s, i) => {
    const li = row(s.title,
      button('❌', () => removeSong(idx, i)));
    if (i === state.playIndex) li.classList.add('selected');
    li.onclick = () => playFrom(idx, i);
    panes.cur.append(li);
  });
}

/* history */
function renderHistory({ history }) {
  panes.his.innerHTML = '';
  history.forEach((h, i) => {
    const li = row(h.title,
      button('🗑️', () => deleteHistory(i)));
    li.onclick = () => play(h.id);
    panes.his.append(li);
  });
}

/* mode buttons */
const modeBtns = [...document.querySelectorAll('#modeGroup button')];
modeBtns.forEach(b => b.onclick = () =>
  Store.mutate(s => s.prefs.mode = b.dataset.mode));

function syncModeButtons({ prefs }) {
  modeBtns.forEach(b => b.classList.toggle('active', b.dataset.mode === prefs.mode));
}

/* ---------- actions ---------- */

export function playFrom(plIdx, songIdx) {
  const list = Store.get().playlists[plIdx];
  const song = list.songs[songIdx];
  Store.patch({ current: plIdx, playIndex: songIdx });
  play(song.id, nextTrack);
}

export async function playInput(code) {
  if (!code) return;
  await play(code, nextTrack);
  const title = await fetchTitle(code);
  Store.mutate(s => {
    s.history.unshift({ id: code, title });
    s.history.splice(200);
  });
}

function nextTrack() {
  const s = Store.get();
  const list = s.playlists[s.current];
  if (!list || !list.songs.length) return;
  let idx = s.playIndex ?? -1;
  if (s.prefs.mode === 'shuffle')
    idx = Math.floor(Math.random() * list.songs.length);
  else
    idx = (idx + 1) % list.songs.length;
  playFrom(s.current, idx);
}

/* mutations wrapped in Undo toast –– point 3 */
function deletePlaylist(i) {
  const pl = Store.get().playlists[i];
  Store.mutate(s => s.playlists.splice(i, 1));
  toast(`Playlist “${pl.name}” removed`, () =>
    Store.mutate(s => s.playlists.splice(i, 0, pl)));
}
function removeSong(plIdx, songIdx) {
  const song = Store.get().playlists[plIdx].songs[songIdx];
  Store.mutate(s => s.playlists[plIdx].songs.splice(songIdx, 1));
  toast('Song removed', () =>
    Store.mutate(s => s.playlists[plIdx].songs.splice(songIdx, 0, song)));
}
function deleteHistory(i) {
  const entry = Store.get().history[i];
  Store.mutate(s => s.history.splice(i, 1));
  toast('History item removed', () =>
    Store.mutate(s => s.history.splice(i, 0, entry)));
}

/* ---------- small DOM factories ---------- */

function row(title, ...buttons) {
  const li = document.createElement('li');
  li.append(span('ttl', title), ...buttons);
  return li;
}
function span(cls, txt) {
  const s = document.createElement('span'); s.className = cls; s.textContent = txt; return s;
}
function button(txt, fn) {
  const b = document.createElement('button');
  b.className = 'icon'; b.textContent = txt; b.onclick = e => { e.stopPropagation(); fn(); };
  return b;
}
