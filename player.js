// YouTube iframe API wrapper, lazy-loaded on first play
let player, apiReady;

function ensureAPI() {
  if (apiReady) return apiReady;
  apiReady = new Promise(res => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    window.onYouTubeIframeAPIReady = () => res();
    document.head.appendChild(tag);
  });
  return apiReady;
}

export async function play(id, onEnd) {
  await ensureAPI();
  if (!player) createPlayer(id, onEnd);
  else         player.loadVideoById(id);
}

function createPlayer(id, onEnd) {
  player = new YT.Player('ytPlayer', {
    height: 0, width: 0, videoId: id,
    playerVars: { controls: 0, rel: 0, modestbranding: 1, playsinline: 1 },
    events: {
      onStateChange: e => {
        if (e.data === YT.PlayerState.ENDED) onEnd?.();
      }
    }
  });
}

export function currentId() {
  try { return player?.getVideoData().video_id || null; } catch { return null; }
}

export function currentTitle() {
  try { return player?.getVideoData().title || ''; } catch { return ''; }
}
