export default class AudioPlayer {
    constructor(selector = '.audioPlayer', audios = []) {
        this.playerElem = document.querySelector(selector);
        this.audios = audios;
        this.currentAudio = null;
        this.createPlayerElement();
        this.audioContext = null;
    }

    createVisualiser() {
        this.audioContext = new AudioContext();
        const src = this.audioContext.createMediaElementSource(this.audioElement);
        const analyser = this.audioContext.createAnalyser();
        const canvas = this.visualiserElem;
        const ctx = canvas.getContext('2d');
        src.connect(analyser);
        analyser.connect(this.audioContext.destination);
        analyser.fftSize = 128;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const barWidth = (canvas.width / bufferLength) + 6;

        function renderFreame() {
            requestAnimationFrame(renderFreame);
            let bar = 0;
            analyser.getByteFrequencyData(dataArray);
            ctx.fillStyle = '#000';

            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = dataArray[i] - 75;
                const randRed = barHeight + (25 * (i / bufferLength));
                ctx.fillStyle = `rgb(${randRed}, 100,50)`;
                ctx.fillRect(bar, canvas.height - barHeight * .9, barWidth, barHeight)
                bar += barWidth + 1;
            }
        }

        renderFreame();
    }

    createPlayerElement() {
        const containerElem = document.createElement('div');
        containerElem.classList.add('container');

        this.audioElement = document.createElement('audio');
        this.audioElement.addEventListener('timeupdate', this.updateTime.bind(this));
        this.audioElement.addEventListener('ended', this.playNext.bind(this));
        const playListElem = document.createElement('div')

        playListElem.classList.add('playList');

        this.visualiserElem = document.createElement('canvas')

        containerElem.appendChild(this.audioElement);
        containerElem.appendChild(playListElem);
        containerElem.appendChild(this.visualiserElem);

        const progressBarElem = document.createElement('div');

        progressBarElem.classList.add('progressBar');

        this.playerElem.appendChild(containerElem);
        this.playerElem.appendChild(progressBarElem);

        this.createPlayListElements(playListElem);
        this.createProgressBarElements(progressBarElem);
    }

    updateCurrentAudio(nextAudio) {

        if (!this.audioContext) {
            this.createVisualiser();
        }

        this.setPlayIcon(this.currentAudio);
        this.currentAudio = nextAudio;
        this.setPauseIcon(this.currentAudio);
        this.audioElement.src = this.currentAudio.getAttribute('href');
        this.audioElement.play();
    }

    createProgressBarElements(progressBarElem) {
        const container = document.createElement('div');
        container.classList.add('container');

        const previousBtn = document.createElement('button');
        const nextBtn = document.createElement('button');

        nextBtn.innerHTML = '<i class="fas fa-forward"></i>';
        previousBtn.innerHTML = '<i class="fas fa-backward"></i>';

        nextBtn.addEventListener('click', this.playNext.bind(this))
        previousBtn.addEventListener('click', this.playPrevious.bind(this))

        this.progressBar = document.createElement('canvas');
        this.progressBar.addEventListener('click', (e) => {
            const progressBarWidth = parseInt(window.getComputedStyle(this.progressBar).width);
            const amountComplate = (e.clientX - this.progressBar.getBoundingClientRect().left) / progressBarWidth

            this.audioElement.currentTime = (this.audioElement.duration || 0) * amountComplate;
        })

        this.timer = document.createElement('div');
        this.timer.classList.add('timer');

        container.appendChild(previousBtn);
        container.appendChild(this.timer);
        container.appendChild(nextBtn);

        progressBarElem.appendChild(container);
        progressBarElem.appendChild(this.progressBar);

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
        progressCtx.fillStyle = '#000';
        progressCtx.fillRect(0, 0, this.progressBar.width, this.progressBar.height)
        progressCtx.fillStyle = '#0f0';

        progressCtx.fillRect(0, 0, progressSize(currentTime, duration, this.progressBar.width), this.progressBar.height)
    }

    createPlayListElements(playListElem) {
        this.audioElements = this.audios.map(audio => {
            const audioItem = document.createElement('a');
            audioItem.href = audio.url;
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
                this.setPauseIcon(this.currentAudio);
                this.audioElement.play();
            } else {
                if (this.currentAudio) {
                    this.setPlayIcon(this.currentAudio);
                }
                this.currentAudio = audioItem;
                this.setPauseIcon(this.currentAudio);
                this.audioElement.src = this.currentAudio.getAttribute('href');
                this.audioElement.play();
            }
        })
    }

    setPlayIcon(elem) {
        const icon = elem.querySelector('i');
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    }

    setPauseIcon(elem) {
        const icon = elem.querySelector('i');
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    }
}
