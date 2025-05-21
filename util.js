/* grab a YouTube title via noembed */
export async function fetchTitle(id){
  try{
    const r = await fetch(`https://noembed.com/embed?url=https://youtu.be/${id}`);
    if(!r.ok) throw 0;  const j = await r.json();
    return j.title || id;
  }catch{ return id; }
}

/* lightweight toast with Undo –– point 3 */
const box = document.getElementById('toast');
export function toast(msg, undo){
  box.textContent = msg;
  if(undo){
    const u = document.createElement('button');
    u.textContent = 'Undo'; u.style.marginLeft='1ch';
    u.onclick = () => { undo(); hide(); };
    box.append(u);
  }
  box.style.display = 'block';
  setTimeout(hide, 4000);
}
function hide(){ box.style.display='none'; box.innerHTML=''; }
