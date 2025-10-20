document.addEventListener('DOMContentLoaded', function () {
    var storageKey = 'nerd_favourites';
    function readFavs() {
        try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch (e) { return []; }
    }
    function writeFavs(list) {
        localStorage.setItem(storageKey, JSON.stringify(list));
    }
    function addToFav(item) {
        var favs = readFavs();
        var exists = favs.some(function (x) { return x.id === item.id; });
        if (!exists) {
            favs.push(item);
            writeFavs(favs);
        }
    }

    var addButtons = document.querySelectorAll('.add-fav');
    addButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var id = btn.getAttribute('data-id');
            var title = btn.getAttribute('data-title');
            var img = btn.getAttribute('data-img');
            addToFav({ id: id, title: title, img: img });
            btn.textContent = 'Added';
            btn.disabled = true;
        });
    });

    var input = document.getElementById('searchInput');
    var btn = document.getElementById('searchBtn');
    
    function applySearch() {
        var q = (input.value || '').toLowerCase().trim();
        var cards = document.querySelectorAll('.card[data-title]');
        cards.forEach(function (card) {
            var title = card.getAttribute('data-title').toLowerCase();
            card.style.display = title.indexOf(q) !== -1 ? '' : 'none';
        });
    }
    
    if (btn && input) {
        btn.addEventListener('click', applySearch);
        input.addEventListener('keyup', function (e) { if (e.key === 'Enter') applySearch(); });
    }

    var ratings = document.querySelectorAll('.rating');
    ratings.forEach(function (block) {
        var stars = block.querySelectorAll('.star');
        stars.forEach(function (star) {
            star.addEventListener('click', function () {
                var value = parseInt(star.getAttribute('data-value'), 10);
                block.setAttribute('data-rating', String(value));
                stars.forEach(function (s) {
                    var v = parseInt(s.getAttribute('data-value'), 10);
                    s.classList.toggle('active', v <= value);
                });
            });
        });
    });

    var currentAudio = null;
    function stopCurrent() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
    }
    var imgs = document.querySelectorAll('.card-img-top[data-audio]');
    imgs.forEach(function (img) {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function () {
          var src = img.getAttribute('data-audio');
          var card = img.closest('.card');
      
          if (currentAudio && currentAudio.src.includes(src)) {
            stopCurrent();
            if (card) card.classList.remove('playing');
            return;
          }
          stopCurrent();
          currentAudio = new Audio(src);
          var playPromise = currentAudio.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function(){});
          }
          document.querySelectorAll('.card.playing').forEach(function(c){ c.classList.remove('playing'); });
          if (card) card.classList.add('playing');
          currentAudio.addEventListener('ended', function(){ if (card) card.classList.remove('playing'); });
        });
      });
    });

    var translations = {
        en: {
            load_more: 'Load more',
            lang_toggle: 'RU',
            home: 'Home',
            favourites: 'Favourites',
            login: 'Login',
            signup: 'Sign Up',
            welcome_title: 'Welcome to NeRd!',
            welcome_sub: 'Your place for music',
            section_title: 'New Popular Music For You!',
            section_sub: 'Suggestions just for you based on your preferences.',
            search_placeholder: 'Search music'
        },
        ru: {
            load_more: 'Загрузить ещё',
            lang_toggle: 'EN',
            home: 'Главная',
            favourites: 'Избранное',
            login: 'Войти',
            signup: 'Регистрация',
            welcome_title: 'Добро пожаловать в NeRd!',
            welcome_sub: 'Твое место для музыки',
            section_title: 'Популярная музыка для тебя',
            section_sub: 'Рекомендации на основе твоих предпочтений.',
            search_placeholder: 'Поиск музыки'
        }
    };
    var lang = localStorage.getItem('nerd_lang') || 'en';
    function getDictByLang(code) {
        switch (code) {
            case 'ru':
                return translations.ru;
            case 'en':
            default:
                return translations.en;
        }
    }
    function applyI18n() {
        var dict = getDictByLang(lang);
        document.querySelectorAll('[data-i18n]').forEach(function(el){
            var k = el.getAttribute('data-i18n');
            if (dict[k]) el.textContent = dict[k];
        });
        var si = document.getElementById('searchInput');
        if (si && dict.search_placeholder) si.setAttribute('placeholder', dict.search_placeholder);
    }
    applyI18n();
    var langBtn = document.getElementById('langToggle');
    if (langBtn) {
        langBtn.addEventListener('click', function(){
            lang = lang === 'en' ? 'ru' : 'en';
            localStorage.setItem('nerd_lang', lang);
            applyI18n();
        });
    }

    var navLinks = document.querySelectorAll('.navbar .nav-link');
    navLinks.forEach(function(link, index){
        link.addEventListener('keydown', function(e){
            if (e.key === 'ArrowRight' || e.key === 'Right') {
                e.preventDefault();
                var next = navLinks[(index + 1) % navLinks.length];
                if (next) next.focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
                e.preventDefault();
                var prev = navLinks[(index - 1 + navLinks.length) % navLinks.length];
                if (prev) prev.focus();
            }
        });
    });

    function attachAudioHandlers(scope) {
        var imgsScoped = (scope || document).querySelectorAll('.card-img-top[data-audio]');
        imgsScoped.forEach(function (img) {
            img.style.cursor = 'pointer';
            img.addEventListener('click', function () {
                var src = img.getAttribute('data-audio');
                var card = img.closest('.card');
                if (currentAudio && currentAudio.src.includes(src)) {
                    stopCurrent();
                    if (card) card.classList.remove('playing');
                    return;
                }
                stopCurrent();
                currentAudio = new Audio(src);
                currentAudio.play();
                document.querySelectorAll('.card.playing').forEach(function(c){ c.classList.remove('playing'); });
                if (card) card.classList.add('playing');
                currentAudio.addEventListener('ended', function(){ if (card) card.classList.remove('playing'); });
            });
        });
    }
    attachAudioHandlers(document);

    function renderMore(items) {
        var container = document.getElementById('moreContainer');
        if (!container) return;
        items.forEach(function(item){
            var col = document.createElement('div');
            col.className = 'col';
            col.innerHTML =
                '<div class="card h-100 bg-dark border-secondary text-light" data-title="'+item.title+'">'
                + '<img src="'+item.img+'" class="card-img-top" data-audio="'+item.audio+'" alt="'+item.title+'">'
                + '<div class="card-body d-flex flex-column">'
                + '<p class="card-text mb-2">'+item.title+'</p>'
                + '<button class="btn btn-warning mt-auto add-fav" data-id="'+item.id+'" data-title="'+item.title+'" data-img="'+item.img+'">Add to Favourites</button>'
                + '</div></div>';
            container.appendChild(col);
        });
        var newBtns = container.querySelectorAll('.add-fav');
        newBtns.forEach(function(btn){
            if (btn._favBound) return; btn._favBound = true;
            btn.addEventListener('click', function(){
                var id = btn.getAttribute('data-id');
                var title = btn.getAttribute('data-title');
                var img = btn.getAttribute('data-img');
                addToFav({ id: id, title: title, img: img });
                btn.textContent = 'Added';
                btn.disabled = true;
            });
        });
        attachAudioHandlers(document.getElementById('moreContainer'));
    }

    var loadBtn = document.getElementById('loadMore');
    if (loadBtn) {
        var loaded = false;
        loadBtn.addEventListener('click', function(){
            if (loaded) return;
            var url = './frontend/src/more-playlists.json?ts=' + Date.now();
            fetch(url, { cache: 'no-store' })
                .then(function(r){ if(!r.ok) throw new Error('status '+r.status); return r.json(); })
                .then(function(items){
                    if (!Array.isArray(items) || items.length === 0) throw new Error('empty');
                    renderMore(items);
                    loaded = true;
                    loadBtn.disabled = true;
                })
                .catch(function(err){
                    alert('Не удалось загрузить данные. Открой через локальный сервер или GitHub Pages.');
                    console.log('Load failed', err);
                });
        });
    }
