import './style.scss';

import AudioPlayer from "./AudioPlayer";


const audioPlayer = new AudioPlayer('.audioPlayer',
    [
        {url: 'songs/Imagine_Dragons_Believer_320.mp3', name: 'Believer'},
        {url: 'songs/KALEO-Way-Down-We-Go-musicfeed.ir_.mp3', name: 'Way Down'},
        {url: 'songs/song.mp3', name: 'Song'},
        {url: 'songs/Tesher - Jalebi Baby.mp3', name: 'Tesher'},
    ]
)