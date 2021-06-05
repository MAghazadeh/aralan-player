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
        const barWidth = (canvas.width / bufferLength) + 4;
        function renderFreame() {
            requestAnimationFrame(renderFreame);
            let bar = 0;
            analyser.getByteFrequencyData(dataArray);
            ctx.fillStyle = '#000';

            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < bufferLength; i++) {
                const barHeight = dataArray[i] - 75;
                const randRed = barHeight + (25 * (i / bufferLength));
                ctx.fillStyle = `rgb(${randRed}, 255,255)`;
                ctx.fillRect(bar, canvas.height - barHeight, barWidth, barHeight)
                bar += barWidth + 1;
            }

        }


        renderFreame();
    }

    createPlayerElement() {
        this.audioElement = document.createElement('audio');
        const playListElem = document.createElement('div');
        playListElem.classList.add('playList');

        this.visualiserElem = document.createElement('canvas')

        this.playerElem.appendChild(this.audioElement);
        this.playerElem.appendChild(playListElem);
        this.playerElem.appendChild(this.visualiserElem);
        this.createPlayListElements(playListElem);
    }

    createPlayListElements(playListElem) {
        this.audios.forEach(audio => {
            const audioItem = document.createElement('a');
            audioItem.href = audio.url;
            audioItem.innerHTML = `<i class="fa fa-play"></i> ${audio.name}`;
            this.setupEventListener(audioItem);
            playListElem.appendChild(audioItem);
        })
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
