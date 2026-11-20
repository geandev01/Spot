const audio = document.getElementById('audioElement');
const btnPlay = document.getElementById('btnPlay');
const playIcon = document.getElementById('playIcon');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const progressBar = document.getElementById('progressBar');
const progressCurrent = document.getElementById('progressCurrent');
const currentTimeEl = document.getElementById('currentTime');
const totalDurationEl = document.getElementById('totalDuration');
const volumeSlider = document.getElementById('volumeSlider');
const btnMute = document.getElementById('btnMute');
const volumeIcon = document.getElementById('volumeIcon');

const audioFileInput = document.getElementById('audioFileInput');
const trackListEl = document.getElementById('trackList');
const emptyNotice = document.getElementById('emptyNotice');
const nowPlayingTitle = document.getElementById('nowPlayingTitle');
const nowPlayingArtist = document.getElementById('nowPlayingArtist');

const navHome = document.getElementById('navHome');
const navSpotifyPlaylist = document.getElementById('navSpotifyPlaylist');
const navLocal = document.getElementById('navLocal');
const quickPlaylistLink = document.getElementById('quickPlaylistLink');
const quickLocalLink = document.getElementById('quickLocalLink');
const viewToggleBtn = document.getElementById('viewToggleBtn');
const viewToggleLabel = document.getElementById('viewToggleLabel');
const spotifySection = document.getElementById('spotifySection');
const localSection = document.getElementById('localSection');

let tracks = [];
let currentIndex = -1;
let lastVolume = 0.8;

audio.volume = lastVolume;

function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function showSpotifyView() {
  spotifySection.classList.remove('hidden');
  localSection.classList.add('hidden');
  viewToggleLabel.textContent = 'Ver Músicas Locais';
  navHome.classList.add('text-neutral-400');
  navSpotifyPlaylist.classList.add('text-white');
  navSpotifyPlaylist.classList.remove('text-neutral-400');
  navLocal.classList.remove('text-white');
  navLocal.classList.add('text-neutral-400');
}

function showLocalView() {
  spotifySection.classList.add('hidden');
  localSection.classList.remove('hidden');
  viewToggleLabel.textContent = 'Ver Playlist Spotify';
  navLocal.classList.add('text-white');
  navLocal.classList.remove('text-neutral-400');
  navSpotifyPlaylist.classList.remove('text-white');
  navSpotifyPlaylist.classList.add('text-neutral-400');
}

navHome.addEventListener('click', showSpotifyView);
navSpotifyPlaylist.addEventListener('click', showSpotifyView);
quickPlaylistLink.addEventListener('click', showSpotifyView);
navLocal.addEventListener('click', showLocalView);
quickLocalLink.addEventListener('click', showLocalView);

viewToggleBtn.addEventListener('click', () => {
  if (spotifySection.classList.contains('hidden')) {
    showSpotifyView();
  } else {
    showLocalView();
  }
});

function renderTrackList() {
  trackListEl.innerHTML = '';
  if (tracks.length === 0) {
    emptyNotice.classList.remove('hidden');
    return;
  }
  emptyNotice.classList.add('hidden');

  tracks.forEach((track, index) => {
    const isPlaying = index === currentIndex;
    const row = document.createElement('div');
    row.className = `grid grid-cols-12 items-center px-4 py-2.5 rounded-lg text-sm cursor-pointer hover:bg-neutral-800/80 transition ${isPlaying ? 'bg-neutral-800 text-green-500' : 'text-neutral-300'}`;

    row.innerHTML = `
      <div class="col-span-1 flex items-center">
        ${isPlaying ? '<i class="fa-solid fa-volume-high text-xs text-green-500"></i>' : `<span class="text-neutral-500 text-xs">${index + 1}</span>`}
      </div>
      <div class="col-span-6 flex flex-col truncate pr-2">
        <span class="font-medium truncate ${isPlaying ? 'text-green-500' : 'text-white'}">${track.title}</span>
        <span class="text-xs text-neutral-400 truncate">${track.artist}</span>
      </div>
      <div class="col-span-3 text-xs text-neutral-400 truncate">Arquivo Local</div>
      <div class="col-span-2 text-xs text-neutral-400 text-right">${track.duration || '--:--'}</div>
    `;

    row.addEventListener('click', () => {
      loadTrack(index);
      playAudio();
    });

    trackListEl.appendChild(row);
  });
}

function loadTrack(index) {
  if (index < 0 || index >= tracks.length) return;
  currentIndex = index;
  const track = tracks[index];
  audio.src = track.url;
  nowPlayingTitle.textContent = track.title;
  nowPlayingArtist.textContent = track.artist;
  renderTrackList();
}

function playAudio() {
  if (tracks.length === 0) return;
  if (currentIndex === -1) {
    loadTrack(0);
  }
  audio.play();
  playIcon.classList.remove('fa-play', 'ml-0.5');
  playIcon.classList.add('fa-pause');
}

function pauseAudio() {
  audio.pause();
  playIcon.classList.remove('fa-pause');
  playIcon.classList.add('fa-play', 'ml-0.5');
}

btnPlay.addEventListener('click', () => {
  if (audio.paused) {
    playAudio();
  } else {
    pauseAudio();
  }
});

btnPrev.addEventListener('click', () => {
  if (tracks.length === 0) return;
  let newIndex = currentIndex - 1;
  if (newIndex < 0) newIndex = tracks.length - 1;
  loadTrack(newIndex);
  playAudio();
});

btnNext.addEventListener('click', () => {
  if (tracks.length === 0) return;
  let newIndex = (currentIndex + 1) % tracks.length;
  loadTrack(newIndex);
  playAudio();
});

audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressCurrent.style.width = `${progress}%`;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  }
});

audio.addEventListener('loadedmetadata', () => {
  totalDurationEl.textContent = formatTime(audio.duration);
  if (currentIndex >= 0 && tracks[currentIndex]) {
    tracks[currentIndex].duration = formatTime(audio.duration);
    renderTrackList();
  }
});

audio.addEventListener('ended', () => {
  btnNext.click();
});

progressBar.addEventListener('click', (e) => {
  if (!audio.duration) return;
  const rect = progressBar.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const width = rect.width;
  audio.currentTime = (clickX / width) * audio.duration;
});

volumeSlider.addEventListener('input', (e) => {
  const val = parseFloat(e.target.value);
  audio.volume = val;
  updateVolumeIcon(val);
});

function updateVolumeIcon(val) {
  if (val === 0) {
    volumeIcon.className = 'fa-solid fa-volume-xmark';
  } else if (val < 0.5) {
    volumeIcon.className = 'fa-solid fa-volume-low';
  } else {
    volumeIcon.className = 'fa-solid fa-volume-high';
  }
}

btnMute.addEventListener('click', () => {
  if (audio.volume > 0) {
    lastVolume = audio.volume;
    audio.volume = 0;
    volumeSlider.value = 0;
    updateVolumeIcon(0);
  } else {
    audio.volume = lastVolume || 0.8;
    volumeSlider.value = audio.volume;
    updateVolumeIcon(audio.volume);
  }
});

audioFileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  files.forEach(file => {
    const url = URL.createObjectURL(file);
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    tracks.push({
      title: nameWithoutExt,
      artist: 'Faixa Local',
      url: url,
      duration: '--:--'
    });
  });
  renderTrackList();
  showLocalView();
});
