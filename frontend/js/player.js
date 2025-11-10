
(function() {
    'use strict';


    const playerAlbumArt = document.getElementById('playerAlbumArt');
    const playerTrackTitle = document.getElementById('playerTrackTitle');
    const playerTrackArtist = document.getElementById('playerTrackArtist');
    const playPauseBtn = document.getElementById('playPause');
    const prevTrackBtn = document.getElementById('prevTrack');
    const nextTrackBtn = document.getElementById('nextTrack');
    const progressBar = document.getElementById('progressBar');
    const progressSlider = document.getElementById('progressSlider');
    const currentTimeEl = document.getElementById('currentTime');
    const totalTimeEl = document.getElementById('totalTime');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeFill = document.getElementById('volumeFill');
    const muteBtn = document.getElementById('muteBtn');


    let currentTrackInfo = {
        title: null,
        artist: null,
        img: null,
        audio: null,
        card: null
    };


    let trackList = [];
    let currentTrackIndex = -1;


    function getImageSrc(img) {
        if (!img) return '';

        const dataSrc = img.getAttribute('data-src');
        if (dataSrc) return dataSrc;

        return img.getAttribute('src') || '';
    }


    function updateTrackList() {
        const cards = document.querySelectorAll('.card[data-title]');
        trackList = Array.from(cards).map(card => {
            const img = card.querySelector('.card-img-top[data-audio]');
            const titleEl = card.querySelector('.card-text');
            return {
                card: card,
                title: card.getAttribute('data-title') || (titleEl ? titleEl.textContent.trim() : 'Unknown'),
                artist: 'Various Artists',
                img: getImageSrc(img),
                audio: img ? img.getAttribute('data-audio') : null
            };
        }).filter(track => track.audio);
    }


    function formatTime(seconds) {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }


    function updatePlayerUI() {
        // Hide album art if no track or no image
        if (!currentTrackInfo.img || !currentTrackInfo.title) {
            if (playerAlbumArt) {
                playerAlbumArt.style.display = 'none';
                playerAlbumArt.src = '';
            }
        } else if (currentTrackInfo.img && playerAlbumArt) {
            // Show album art with proper image
            playerAlbumArt.classList.remove('lazy-image', 'lazy-loaded');
            playerAlbumArt.removeAttribute('data-src');
            playerAlbumArt.removeData && playerAlbumArt.removeData('lazy-processed');

            const imgSrc = currentTrackInfo.img;

            const preloadImg = new Image();
            preloadImg.onload = function() {
                if (playerAlbumArt) {
                    playerAlbumArt.src = imgSrc;
                    playerAlbumArt.style.opacity = '1';
                    playerAlbumArt.style.display = 'block';
                }
            };
            preloadImg.onerror = function() {
                if (playerAlbumArt) {
                    playerAlbumArt.style.display = 'none';
                    playerAlbumArt.src = '';
                }
            };
            preloadImg.src = imgSrc;

            playerAlbumArt.src = imgSrc;
            playerAlbumArt.style.display = 'block';
        }

        if (playerTrackTitle) {
            playerTrackTitle.textContent = currentTrackInfo.title || 'No track selected';
        }

        if (playerTrackArtist) {
            playerTrackArtist.textContent = currentTrackInfo.artist || '—';
        }
    }


    function updatePlayPauseButton(isPlaying) {
        if (playPauseBtn) {
            playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
            playPauseBtn.title = isPlaying ? 'Pause' : 'Play';
        }
    }


    function updateProgress() {
        if (!window.currentAudio || !progressBar || !progressSlider) return;

        const currentTime = window.currentAudio.currentTime;
        const duration = window.currentAudio.duration;

        if (duration && isFinite(duration)) {
            const percent = (currentTime / duration) * 100;
            progressBar.style.width = percent + '%';
            progressSlider.value = percent;

            if (currentTimeEl) {
                currentTimeEl.textContent = formatTime(currentTime);
            }
            if (totalTimeEl) {
                totalTimeEl.textContent = formatTime(duration);
            }
        }
    }


    function updateVolume() {
        if (!window.currentAudio || !volumeSlider) return;

        const volume = window.currentAudio.volume * 100;
        volumeSlider.value = volume;
        if (volumeFill) {
            volumeFill.style.width = volume + '%';
        }
        updateMuteButton();
    }


    function updateVolumeFill() {
        if (!volumeSlider || !volumeFill) return;
        const volume = parseFloat(volumeSlider.value);
        volumeFill.style.width = volume + '%';
    }


    function updateMuteButton() {
        if (!window.currentAudio || !muteBtn) return;

        const isMuted = window.currentAudio.muted || window.currentAudio.volume === 0;
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
        muteBtn.title = isMuted ? 'Unmute' : 'Mute';
    }


    function findTrackIndex(audioSrc) {
        return trackList.findIndex(track => track.audio === audioSrc);
    }


    function playTrack(track) {
        if (!track || !track.audio) return;

        currentTrackInfo = {
            title: track.title,
            artist: track.artist,
            img: track.img,
            audio: track.audio,
            card: track.card
        };

        currentTrackIndex = findTrackIndex(track.audio);
        updatePlayerUI();


        if (track.card) {
            const img = track.card.querySelector('.card-img-top[data-audio]');
            if (img) {
                img.click();
            }
        }
    }


    function playPrevious() {
        if (trackList.length === 0) return;

        if (currentTrackIndex <= 0) {
            currentTrackIndex = trackList.length - 1;
        } else {
            currentTrackIndex--;
        }

        playTrack(trackList[currentTrackIndex]);
    }


    function playNext() {
        if (trackList.length === 0) return;

        if (currentTrackIndex >= trackList.length - 1) {
            currentTrackIndex = 0;
        } else {
            currentTrackIndex++;
        }

        playTrack(trackList[currentTrackIndex]);
    }


    function initPlayer() {
        updateTrackList();


        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', function() {
                if (!window.currentAudio) {

                    if (currentTrackInfo.audio && trackList.length > 0) {
                        playTrack(trackList[currentTrackIndex >= 0 ? currentTrackIndex : 0]);
                    }
                    return;
                }

                if (window.currentAudio.paused) {
                    window.currentAudio.play().catch(() => {});
                    updatePlayPauseButton(true);
                } else {
                    window.currentAudio.pause();
                    updatePlayPauseButton(false);
                }
            });
        }

        if (prevTrackBtn) {
            prevTrackBtn.addEventListener('click', playPrevious);
        }

        if (nextTrackBtn) {
            nextTrackBtn.addEventListener('click', playNext);
        }

        if (progressSlider) {
            progressSlider.addEventListener('input', function() {
                if (window.currentAudio && window.currentAudio.duration) {
                    const percent = parseFloat(this.value);
                    window.currentAudio.currentTime = (window.currentAudio.duration * percent) / 100;
                }
            });
        }

        if (volumeSlider) {
            const storedVolume = localStorage.getItem('nerd_volume');
            if (storedVolume !== null) {
                volumeSlider.value = storedVolume;
            }

            volumeSlider.addEventListener('input', function() {
                const volume = parseFloat(this.value) / 100;
                if (window.currentAudio) {
                    window.currentAudio.volume = volume;
                }
                localStorage.setItem('nerd_volume', this.value);
                updateVolumeFill();
                updateMuteButton();
            });


            updateVolumeFill();
        }

        if (muteBtn) {
            muteBtn.addEventListener('click', function() {
                if (!window.currentAudio) return;

                window.currentAudio.muted = !window.currentAudio.muted;
                updateMuteButton();
            });
        }


        setInterval(function() {
            if (window.currentAudio) {
                updateProgress();

                const isPlaying = !window.currentAudio.paused && !window.currentAudio.ended;
                updatePlayPauseButton(isPlaying);
            } else {
                if (progressBar) progressBar.style.width = '0%';
                if (progressSlider) progressSlider.value = 0;
                if (currentTimeEl) currentTimeEl.textContent = '0:00';
                updatePlayPauseButton(false);
            }
        }, 100);


        if (volumeSlider && window.currentAudio) {
            const storedVolume = localStorage.getItem('nerd_volume');
            if (storedVolume !== null) {
                window.currentAudio.volume = parseFloat(storedVolume) / 100;
            } else {
                window.currentAudio.volume = 0.7;
            }
            updateVolume();
        }
    }


    let lastAudioSrc = null;
    function watchAudioChanges() {
        setInterval(function() {
            if (window.currentAudio && window.currentAudio.src !== lastAudioSrc) {
                lastAudioSrc = window.currentAudio.src;


                const matchingTrack = trackList.find(track =>
                    window.currentAudio.src.includes(track.audio)
                );

                if (matchingTrack) {
                    currentTrackInfo = {
                        title: matchingTrack.title,
                        artist: matchingTrack.artist,
                        img: matchingTrack.img,
                        audio: matchingTrack.audio,
                        card: matchingTrack.card
                    };
                    currentTrackIndex = findTrackIndex(matchingTrack.audio);
                    updatePlayerUI();
                    updateVolume();
                }
            }
        }, 500);
    }


    window.playNextTrack = function() {
        playNext();
    };


    window.playPreviousTrack = function() {
        playPrevious();
    };


    window.updatePlayerTrackInfo = function(card) {
        if (!card) return;

        const img = card.querySelector('.card-img-top[data-audio]');
        const titleEl = card.querySelector('.card-text');

        if (img) {
            currentTrackInfo = {
                title: card.getAttribute('data-title') || (titleEl ? titleEl.textContent.trim() : 'Unknown'),
                artist: 'Various Artists',
                img: getImageSrc(img),
                audio: img.getAttribute('data-audio'),
                card: card
            };

            currentTrackIndex = findTrackIndex(currentTrackInfo.audio);
            updatePlayerUI();
            updateVolume();
        }
    };


    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initPlayer, 100);
            setTimeout(watchAudioChanges, 200);
            setTimeout(updateTrackList, 300);
        });
    } else {
        setTimeout(initPlayer, 100);
        setTimeout(watchAudioChanges, 200);
        setTimeout(updateTrackList, 300);
    }


    const originalAttachAudioHandlers = window.attachAudioHandlers;
    if (originalAttachAudioHandlers) {
        window.attachAudioHandlers = function(scope) {
            originalAttachAudioHandlers(scope);
            setTimeout(updateTrackList, 100);
        };
    }

})();

