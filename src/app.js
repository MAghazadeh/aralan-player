import './style.scss';

import AudioPlayer from "./AudioPlayer";


const audioPlayer = new AudioPlayer('.audioPlayer',
    [
        {
            url: 'songs/Way Down We Go.mp3',
            name: 'Way Down We Go',
            cover: 'images/way-down.jpg'
        },
        {
            url: 'songs/Arcade - Duncan Laurence.mp3',
            name: 'Arcade',
            cover: 'images/Arcade.jpg'
        },
        {
            url: 'songs/death-bed.mp3',
            name: 'Death Bed',
            cover: 'images/death-bed.jpg'
        },
        {
            url: 'songs/Imagine Dragons Believer.mp3',
            name: 'Imagine Dragons Believer',
            cover: 'images/Imagine-Dragons-Believer-art.jpg'
        },
    ]
)