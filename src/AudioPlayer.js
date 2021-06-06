export default class AudioPlayer {
    constructor(selector = '.audioPlayer', audios = []) {
        this.playerElem = document.querySelector(selector);
        this.audios = audios;
        this.currentAudio = null;
        this.createPlayerElement();
        this.audioContext = null;
    }

    createPlayerElement() {
        const containerElem = document.createElement('div');
        containerElem.classList.add('container');

        this.audioElement = document.createElement('audio');
        this.setupAudioElementEvents();

        const playListElem = document.createElement('div');

        playListElem.classList.add('playList');

        this.visualiserElem = document.createElement('canvas');
        this.visualiserElem.classList.add('visualiser')


        this.audioNameElem = document.createElement('h1');
        this.audioNameElem.classList.add('title')
        this.audioNameElem.innerText = 'Aralan Valley';

        this.timer = document.createElement('div');
        this.timer.innerText = '00:00 / 00:00';
        this.timer.classList.add('timer');

        containerElem.appendChild(this.audioNameElem);
        containerElem.appendChild(this.timer);
        containerElem.appendChild(this.visualiserElem);
        containerElem.appendChild(playListElem);
        containerElem.appendChild(this.audioElement);

        const progressBarElem = document.createElement('div');
        progressBarElem.classList.add('progressBar');

        const controlsContainer = document.createElement('div');
        controlsContainer.classList.add('controls');

        this.playerElem.appendChild(containerElem);
        this.playerElem.appendChild(progressBarElem);
        this.playerElem.appendChild(controlsContainer);

        this.createPlayListElements(playListElem);
        this.createProgressBarElements(progressBarElem);
        this.createControls(controlsContainer)
    }

    createVisualiser() {
        this.audioContext = new AudioContext();
        const src = this.audioContext.createMediaElementSource(this.audioElement);
        const analyser = this.audioContext.createAnalyser();
        const canvas = this.visualiserElem;
        const ctx = canvas.getContext('2d');
        src.connect(analyser);
        analyser.connect(this.audioContext.destination);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const barWidth = (canvas.width / bufferLength) + 2;

        const renderFreame = () => {
            requestAnimationFrame(renderFreame);
            const dataAverage = dataArray.reduce((a, b) => a + b) / dataArray.length;
            const scaleNum = 1 + dataAverage * .6 / 255; //1 to 1.6
            this.audioNameElem.style.transform = `scale(${scaleNum})`;
            this.visualiserRender(canvas, ctx, dataArray, barWidth, analyser, bufferLength, dataAverage);
        }

        renderFreame();
    }

    visualiserRender(canvas, ctx, dataArray, barWidth, analyser, bufferLength) {
        let bar = 0;
        analyser.getByteFrequencyData(dataArray);
        ctx.fillStyle = '#4F448900';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < bufferLength; i++) {
            ctx.beginPath();
            const barHeight = dataArray[i] * canvas.height / 512;
            ctx.fillStyle = `rgb(255,255,255)`;
            ctx.fillRect(bar, 0, barWidth, barHeight)
            bar += barWidth + 2;
        }
    }

    createProgressBarElements(progressBarElem) {
        const container = document.createElement('div');
        container.classList.add('container');

        this.createControls(container);

        this.progressBar = document.createElement('canvas');
        this.progressBar.addEventListener('click', (e) => {
            const progressBarWidth = parseInt(window.getComputedStyle(this.progressBar).width);
            const amountComplate = (e.clientX - this.progressBar.getBoundingClientRect().left) / progressBarWidth
            this.audioElement.currentTime = (this.audioElement.duration || 0) * amountComplate;
        });
        progressBarElem.appendChild(this.progressBar);

    }

    createControls(controlsContainer) {
        this.playPauseBtn = document.createElement('button');
        const previousBtn = document.createElement('button');
        const nextBtn = document.createElement('button');

        this.playPauseBtn.classList.add('playPause');
        this.playPauseBtn.addEventListener('click', () => {
            if (this.audioElement.paused) {
                this.play();
            } else {
                this.pause();
            }
        });

        this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        nextBtn.innerHTML = '<i class="fas fa-forward"></i>';
        previousBtn.innerHTML = '<i class="fas fa-backward"></i>';

        nextBtn.addEventListener('click', this.playNext.bind(this))
        previousBtn.addEventListener('click', this.playPrevious.bind(this))
        controlsContainer.appendChild(previousBtn);
        controlsContainer.appendChild(this.playPauseBtn);
        controlsContainer.appendChild(nextBtn);
    }

    createPlayListElements(playListElem) {
        this.audioElements = this.audios.map(audio => {
            const audioItem = document.createElement('a');
            audioItem.href = audio.url;
            audioItem.audioName = audio.name;
            audioItem.coverImage = audio.cover;
            audioItem.innerHTML = `<i class="fa fa-play"></i> ${audio.name}`;
            this.setupEventListener(audioItem);
            playListElem.appendChild(audioItem);
            return audioItem;
        });

        this.currentAudio = this.audioElements[0];
    }

    setupEventListener(audioItem) {
        audioItem.addEventListener('click', e => {
            e.preventDefault();
            if (!this.audioContext) {
                this.createVisualiser();
            }
            const isCurrentAudio = audioItem.getAttribute('href') === (this.currentAudio && this.currentAudio.getAttribute('href'));

            if (isCurrentAudio && !this.audioElement.paused) {
                this.setPlayIcon(this.currentAudio);
                this.audioElement.pause();
            } else if (isCurrentAudio && this.audioElement.paused) {
                this.audioElement.src = this.currentAudio.getAttribute('href');
                this.setAudioInfo(audioItem);
                this.setPauseIcon(this.currentAudio);
                this.play();
            } else {
                if (this.currentAudio) {
                    this.setPlayIcon(this.currentAudio);
                }
                this.currentAudio = audioItem;

                this.setAudioInfo(audioItem);

                this.audioElement.src = this.currentAudio.getAttribute('href');
                this.setPauseIcon(this.currentAudio);
                this.play();
            }
        })
    }

    setupAudioElementEvents() {
        if (!this.audioElement) {
            return;
        }
        this.audioElement.addEventListener('timeupdate', this.updateTime.bind(this));
        this.audioElement.addEventListener('ended', this.playNext.bind(this));

        this.audioElement.addEventListener('play', () => {
            const playPauseIcon = this.playPauseBtn.querySelector('i');
            playPauseIcon.classList.remove('fa-play');
            playPauseIcon.classList.add('fa-pause');
        });
        this.audioElement.addEventListener('pause', () => {
            const playPauseIcon = this.playPauseBtn.querySelector('i');

            playPauseIcon.classList.remove('fa-pause');
            playPauseIcon.classList.add('fa-play');
        })
    }

    async updateCurrentAudio(nextAudio) {

        if (!this.audioContext) {
            this.createVisualiser();
        }

        this.setPlayIcon(this.currentAudio);
        this.currentAudio = nextAudio;
        this.setPauseIcon(this.currentAudio);
        this.audioElement.src = this.currentAudio.getAttribute('href');
        await this.audioElement.play();
        this.setAudioInfo(this.currentAudio);
    }

    async play() {
        if (this.audioElement.paused && this.audioElement.src) {
            await this.audioElement.play();
        }
    }

    pause() {
        if (!this.audioElement.paused) {
            this.audioElement.pause();
        }
    }

    playNext() {
        const index = this.audioElements.findIndex(
            audioItem => audioItem.getAttribute('href') === this.currentAudio.getAttribute('href')
        );
        const nextAudio = index >= this.audioElements.length - 1 ? this.audioElements[0] : this.audioElements[index + 1];
        this.updateCurrentAudio(nextAudio)
    }

    playPrevious() {
        const index = this.audioElements.findIndex(
            audioItem => audioItem.getAttribute('href') === this.currentAudio.getAttribute('href')
        );
        const nextAudio = index <= 0 ? this.audioElements[this.audioElements.length - 1] : this.audioElements[index - 1];
        this.updateCurrentAudio(nextAudio)
    }

    updateTime() {
        const parsTime = time => {
            const secounds = String(Math.floor(time % 60) || 0).padStart(2, '0')
            const minutes = String(Math.floor(time / 60) || 0).padStart(2, '0')

            return `${minutes}:${secounds}`;
        }
        const {currentTime, duration} = this.audioElement;
        this.timer.innerHTML = `${parsTime(currentTime)} / ${parsTime(duration)}`

        this.updateProgressBar();
    }

    updateProgressBar() {
        const progressSize = (current, overall, width) => (current / overall) * width;
        const {currentTime, duration} = this.audioElement;

        const progressCtx = this.progressBar.getContext('2d');
        progressCtx.clearRect(0, 0, this.progressBar.width, this.progressBar.height);
        progressCtx.fillStyle = '#00000044';
        progressCtx.fillRect(0, 0, this.progressBar.width, this.progressBar.height)
        progressCtx.fillStyle = '#fff';

        progressCtx.fillRect(0, 0, progressSize(currentTime, duration, this.progressBar.width), this.progressBar.height)
    }

    setAudioInfo(audioItem) {
        this.audioNameElem.innerText = audioItem.audioName;
        this.audioNameElem.style.backgroundImage = `url(${audioItem.coverImage || 'images/default.jpg'})`;
        this.playerElem.style.backgroundImage = `url(${audioItem.coverImage || 'images/default.jpg'})`;
        document.body.style.backgroundImage = `url(${audioItem.coverImage || 'images/default.jpg'})`;

    }

    setPlayIcon(elem) {
        const icon = elem.querySelector('i');
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');

        const playPauseIcon = this.playPauseBtn.querySelector('i');
        playPauseIcon.classList.remove('fa-pause');
        playPauseIcon.classList.add('fa-play');

    }

    setPauseIcon(elem) {
        const icon = elem.querySelector('i');
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    }
}