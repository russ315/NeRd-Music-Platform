document.addEventListener('DOMContentLoaded', function() {
    const listEl = document.getElementById('playlistList');
    const detailSection = document.getElementById('playlistDetail');
    const detailTitle = document.getElementById('playlistDetailTitle');
    const detailDesc = document.getElementById('playlistDetailDesc');
    const detailGrid = document.getElementById('playlistTracksGrid');
    const editDetailBtn = document.getElementById('editPlaylistBtn');

    const createBtns = [
        document.getElementById('createPlaylistBtn'),
        document.getElementById('createPlaylistBtnSide')
    ].filter(Boolean);

    const playAllBtn = document.getElementById('playAllBtn');

    createBtns.forEach(btn => btn.addEventListener('click', () => openPlaylistModal()));
    if (editDetailBtn) {
        editDetailBtn.addEventListener('click', () => {
            if (detailSection.dataset.activeId) {
                const playlist = getPlaylists().find(p => p.id === detailSection.dataset.activeId);
                if (playlist) openPlaylistModal(playlist);
            }
        });
    }

    document.getElementById('closePlaylistModal').addEventListener('click', closePlaylistModal);
    document.getElementById('cancelPlaylistBtn').addEventListener('click', closePlaylistModal);
    document.getElementById('playlistModal').addEventListener('click', function(e) {
        if (e.target === this) closePlaylistModal();
    });
    document.getElementById('playlistForm').addEventListener('submit', savePlaylist);

    if (playAllBtn) {
        playAllBtn.addEventListener('click', playAllFromActive);
    }

    renderPlaylists();
    maybeOpenFromQuery();

    async function getPlaylists() {
        try {
            const token = ApiClient && ApiClient.getToken();
            if (token) {
                const data = await ApiClient.request('/playlists', { method: 'GET' });
                return data.map(mapApiPlaylist);
            }
        } catch (e) {
            console.warn('API playlists unavailable, fallback to local', e.message);
        }

        try {
            const local = JSON.parse(localStorage.getItem('NeRuaD_playlists') || '[]');
            return normalizeLocalPlaylists(local);
        } catch (e) {
            return [];
        }
    }

    function savePlaylists(playlists) {
        localStorage.setItem('NeRuaD_playlists', JSON.stringify(playlists));
    }

    function getFavoriteTracks() {
        return window.FavoritesManager ? window.FavoritesManager.readUserFavorites() : [];
    }

    function normalizeAudioPath(path) {
        if (!path) return null;
        if (path.startsWith('frontend/')) {
            return '../' + path.replace(/^frontend\//, '');
        }
        if (path.startsWith('/frontend/')) {
            return '..' + path.replace(/^\/frontend/, '');
        }
        return path;
    }

    function buildTrackData(track) {
        return {
            id: track.id,
            title: track.title,
            img: track.img,
            audio: normalizeAudioPath(track.audio || ''),
            duration: track.duration || 0,
            artist: track.artist || '',
            album: track.album || '',
            source: track.source || 'local'
        };
    }

    function formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) return '—';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${String(s).padStart(2, '0')}`;
    }

    function applyDuration(audioSrc, durationEl, fallbackSeconds) {
        if (fallbackSeconds && fallbackSeconds > 0) {
            durationEl.textContent = formatDuration(fallbackSeconds);
            return;
        }
        if (!audioSrc) {
            durationEl.textContent = '—';
            return;
        }
        try {
            const audio = new Audio();
            audio.preload = 'metadata';
            audio.src = audioSrc;
            audio.addEventListener('loadedmetadata', function() {
                durationEl.textContent = formatDuration(audio.duration);
            });
            audio.addEventListener('error', function() {
                durationEl.textContent = '—';
            });
        } catch (e) {
            durationEl.textContent = '—';
        }
    }

    async function renderPlaylists() {
        const playlists = await getPlaylists();
        listEl.innerHTML = '';

        if (!playlists.length) {
            listEl.innerHTML = '<div class="muted">No playlists yet. Create your first playlist.</div>';
            detailSection.style.display = 'none';
            return;
        }

        playlists.forEach(function(playlist) {
            const row = document.createElement('div');
            row.className = 'playlist-row';
            row.addEventListener('click', function(e) {
                if (e.target.closest('.playlist-row-actions')) return;
                openPlaylistDetail(playlist.id);
            });

            const cover = document.createElement('img');
            cover.className = 'playlist-cover';
            const coverImg = playlist.tracks.length ? playlist.tracks[0].img : '';
            cover.src = coverImg ? coverImg.replace('frontend/src/img/', '../src/img/') : '../src/img/track1.jpeg';
            cover.alt = playlist.name;

            const meta = document.createElement('div');
            meta.className = 'playlist-meta';
            const title = document.createElement('h4');
            title.textContent = playlist.name;
            const desc = document.createElement('p');
            desc.textContent = `${playlist.tracks.length} tracks • ${playlist.description || 'Playlist'}`;
            meta.appendChild(title);
            meta.appendChild(desc);

            const actions = document.createElement('div');
            actions.className = 'playlist-row-actions';

            const openBtn = document.createElement('button');
            openBtn.className = 'btn btn-secondary btn-sm';
            openBtn.textContent = 'Open';
            openBtn.addEventListener('click', function() {
                openPlaylistDetail(playlist.id);
            });

            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-outline-secondary btn-sm';
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', function() {
                openPlaylistModal(playlist);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-outline-danger btn-sm';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', function() {
                deletePlaylist(playlist.id);
            });

            actions.appendChild(openBtn);
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            row.appendChild(cover);
            row.appendChild(meta);
            row.appendChild(actions);
            listEl.appendChild(row);
        });
    }

    async function openPlaylistDetail(id) {
        const playlists = await getPlaylists();
        const playlist = playlists.find(p => p.id === id);
        if (!playlist) return;

        detailSection.style.display = 'block';
        detailSection.dataset.activeId = id;
        detailTitle.textContent = playlist.name;
        detailDesc.textContent = playlist.description || 'No description';
        detailGrid.innerHTML = '';

        if (!playlist.tracks.length) {
            detailGrid.innerHTML = '<div class="muted">No tracks in this playlist yet.</div>';
            return;
        }

        detailGrid.classList.add('track-list');
        playlist.tracks.forEach(function(track, index) {
            const row = document.createElement('div');
            row.className = 'track-row';
            row.setAttribute('data-title', track.title);

            const indexEl = document.createElement('div');
            indexEl.className = 'track-index';
            indexEl.textContent = String(index + 1).padStart(2, '0');

            const playIcon = document.createElement('div');
            playIcon.className = 'track-play';
            playIcon.textContent = '▶';

            const img = document.createElement('img');
            img.className = 'track-cover';
            img.src = track.img.replace('frontend/src/img/', '../src/img/');
            img.alt = track.title;
            if (track.audio) img.setAttribute('data-audio', track.audio);
            playIcon.addEventListener('click', function() {
                if (track.audio) {
                    img.click();
                }
            });

            const meta = document.createElement('div');
            meta.className = 'track-meta';
            const title = document.createElement('h4');
            title.textContent = track.title;
            const sub = document.createElement('p');
            sub.textContent = 'Playlist track';
            meta.appendChild(title);
            meta.appendChild(sub);

            const duration = document.createElement('div');
            duration.className = 'track-duration';
            duration.textContent = '—';

            const actions = document.createElement('div');
            actions.className = 'track-actions';
            const playBtn = document.createElement('button');
            playBtn.className = 'btn btn-play btn-sm';
            playBtn.textContent = 'Play';
            playBtn.addEventListener('click', function() {
                if (track.audio) {
                    img.click();
                }
            });

            const heartBtn = document.createElement('button');
            heartBtn.className = 'track-heart';
            heartBtn.textContent = '♥';
            if (window.FavoritesManager && window.FavoritesManager.isInUserFavorites(track.id)) {
                heartBtn.classList.add('active');
            }
            heartBtn.addEventListener('click', function() {
                if (!window.FavoritesManager) return;
                if (window.FavoritesManager.isInUserFavorites(track.id)) {
                    window.FavoritesManager.removeFromUserFavorites(track.id);
                    heartBtn.classList.remove('active');
                } else {
                    window.FavoritesManager.addToUserFavorites({
                        id: track.id,
                        title: track.title,
                        img: track.img,
                        audio: track.audio,
                        duration: track.duration || 0,
                        artist: track.artist || ''
                    });
                    heartBtn.classList.add('active');
                }
            });

            actions.appendChild(heartBtn);
            actions.appendChild(playBtn);

            row.appendChild(indexEl);
            row.appendChild(playIcon);
            row.appendChild(img);
            row.appendChild(meta);
            row.appendChild(duration);
            row.appendChild(actions);
            detailGrid.appendChild(row);

            applyDuration(track.audio, duration, track.duration);
        });

        attachAudioHandlers(detailGrid);
        if (window.refreshTrackList) window.refreshTrackList();
    }

    function playAllFromActive() {
        if (!detailSection.dataset.activeId) {
            showNotification('Playlists', 'Open a playlist first', 'info');
            return;
        }
        const first = detailGrid.querySelector('.card-img-top[data-audio]');
        if (first) {
            first.click();
        }
    }

    async function openPlaylistModal(playlist) {
        const modal = document.getElementById('playlistModal');
        const title = document.getElementById('playlistModalTitle');
        const nameInput = document.getElementById('playlistName');
        const descInput = document.getElementById('playlistDescription');
        const trackContainer = document.getElementById('playlistTracks');

        modal.dataset.editId = playlist ? playlist.id : '';
        title.textContent = playlist ? 'Edit playlist' : 'Create playlist';
        nameInput.value = playlist ? playlist.name : '';
        descInput.value = playlist ? playlist.description : '';

        const favs = getFavoriteTracks().map(buildTrackData);
        trackContainer.innerHTML = '';
        if (!favs.length) {
            trackContainer.innerHTML = '<div class="muted">No favourite tracks yet.</div>';
        } else {
            favs.forEach(function(track) {
                const wrapper = document.createElement('label');
                wrapper.className = 'playlist-track';
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = track.id;
                if (playlist && playlist.tracks.some(t => t.id === track.id)) {
                    checkbox.checked = true;
                }
                const cover = document.createElement('img');
                cover.src = track.img.replace('frontend/src/img/', '../src/img/');
                cover.alt = track.title;
                cover.style.width = '36px';
                cover.style.height = '36px';
                cover.style.borderRadius = '6px';
                cover.style.objectFit = 'cover';
                const text = document.createElement('span');
                text.textContent = track.title;
                const previewBtn = document.createElement('button');
                previewBtn.type = 'button';
                previewBtn.className = 'btn btn-outline-secondary btn-sm';
                previewBtn.textContent = '▶';
                previewBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (track.audio) {
                        playPreview(track.audio);
                    }
                });
                wrapper.appendChild(checkbox);
                wrapper.appendChild(cover);
                wrapper.appendChild(text);
                wrapper.appendChild(previewBtn);
                trackContainer.appendChild(wrapper);
            });
        }

        modal.classList.add('active');
    }

    function closePlaylistModal() {
        document.getElementById('playlistModal').classList.remove('active');
    }

    async function savePlaylist(e) {
        e.preventDefault();
        const modal = document.getElementById('playlistModal');
        const editId = modal.dataset.editId;
        const name = document.getElementById('playlistName').value.trim();
        const description = document.getElementById('playlistDescription').value.trim();
        const trackContainer = document.getElementById('playlistTracks');
        const selectedIds = Array.from(trackContainer.querySelectorAll('input[type="checkbox"]:checked'))
            .map(input => input.value);

        if (!name) {
            showNotification('Error', 'Playlist name is required', 'error');
            return;
        }

        const favs = getFavoriteTracks().map(buildTrackData);
        const selectedTracks = favs.filter(track => selectedIds.includes(track.id));

        const token = ApiClient && ApiClient.getToken();
        if (token) {
            const trackIds = await ensureTracks(selectedTracks);
            if (editId) {
                await ApiClient.request(`/playlists/${editId}`, {
                    method: 'PUT',
                    body: JSON.stringify({ title: name, description, trackIds })
                });
            } else {
                await ApiClient.request('/playlists', {
                    method: 'POST',
                    body: JSON.stringify({ title: name, description, trackIds })
                });
            }
        } else {
            let playlists = await getPlaylists();
            if (editId) {
                playlists = playlists.map(function(item) {
                    if (item.id === editId) {
                        return { id: item.id, name, description, tracks: selectedTracks };
                    }
                    return item;
                });
            } else {
                playlists.push({
                    id: 'pl_' + Date.now(),
                    name,
                    description,
                    tracks: selectedTracks
                });
            }
            savePlaylists(playlists);
        }

        await renderPlaylists();
        closePlaylistModal();
        showNotification('Saved', 'Playlist updated', 'success');
    }

    async function deletePlaylist(id) {
        const token = ApiClient && ApiClient.getToken();
        if (token) {
            await ApiClient.request(`/playlists/${id}`, { method: 'DELETE' });
        } else {
            const playlists = (await getPlaylists()).filter(item => item.id !== id);
            savePlaylists(playlists);
        }
        await renderPlaylists();
        detailSection.style.display = 'none';
        showNotification('Deleted', 'Playlist removed', 'info');
    }

    function attachAudioHandlers(scope) {
        if (!scope) return;
        scope.addEventListener('click', function(event) {
            const img = event.target.closest('img[data-audio]');
            if (!img) return;

            const src = img.getAttribute('data-audio');
            const card = img.closest('.track-row');
            if (!src) return;

            if (window.currentAudio && window.currentAudio.src.includes(src)) {
                window.currentAudio.pause();
                window.currentAudio.currentTime = 0;
                if (card) card.classList.remove('playing');
                return;
            }

            if (window.currentAudio) {
                window.currentAudio.pause();
                window.currentAudio.currentTime = 0;
            }

            window.currentAudio = new Audio(src);
            const storedVolume = localStorage.getItem('NeRuaD_volume');
            window.currentAudio.volume = storedVolume ? parseFloat(storedVolume) / 100 : 0.7;
            window.currentAudio.play().catch(function(){});

            document.querySelectorAll('.track-row.playing').forEach(function(c){ c.classList.remove('playing'); });
            if (card) card.classList.add('playing');

            if (window.updatePlayerTrackInfo) {
                window.updatePlayerTrackInfo(card);
            }
        });
    }

    function maybeOpenFromQuery() {
        const params = new URLSearchParams(window.location.search);
        const create = params.get('create');
        const id = params.get('id');
        if (create === '1') {
            openPlaylistModal();
        }
        if (id) {
            openPlaylistDetail(id);
        }
    }

    function normalizeLocalPlaylists(playlists) {
        const favs = getFavoriteTracks().map(buildTrackData);
        return playlists.map(function(pl) {
            if (!pl.tracks || (pl.tracks.length && typeof pl.tracks[0] === 'string')) {
                const ids = pl.tracks || [];
                const mapped = favs.filter(track => ids.includes(track.id));
                return { ...pl, tracks: mapped };
            }
            return pl;
        });
    }

    function mapApiPlaylist(pl) {
        const tracks = (pl.trackIds || []).map(function(track) {
            return {
                id: track._id,
                title: track.title,
                img: track.img || track.album || '',
                audio: track.previewUrl || '',
                duration: track.duration || 0,
                artist: track.artist || '',
                album: track.album || '',
                source: track.source || 'local'
            };
        });
        return {
            id: pl._id,
            name: pl.title,
            description: pl.description,
            tracks
        };
    }

    async function ensureTracks(tracks) {
        const ids = [];
        for (const track of tracks) {
            const payload = {
                externalId: track.id,
                title: track.title,
                artist: track.artist || 'Various Artists',
                album: track.album || '',
                img: track.img || '',
                previewUrl: track.audio,
                duration: track.duration || 0,
                genre: '',
                source: track.source || 'local',
                externalUrl: ''
            };
            const created = await ApiClient.request('/tracks', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            ids.push(created._id || created.id);
        }
        return ids;
    }

    function playPreview(src) {
        if (window.currentAudio && window.currentAudio.src.includes(src)) {
            window.currentAudio.pause();
            window.currentAudio.currentTime = 0;
            return;
        }
        if (window.currentAudio) {
            window.currentAudio.pause();
            window.currentAudio.currentTime = 0;
        }
        window.currentAudio = new Audio(src);
        const storedVolume = localStorage.getItem('NeRuaD_volume');
        window.currentAudio.volume = storedVolume ? parseFloat(storedVolume) / 100 : 0.7;
        window.currentAudio.play().catch(function(){});
    }
});
