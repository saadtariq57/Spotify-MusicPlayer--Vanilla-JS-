let currentSong = new Audio();
let songs;
let currFolder;

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    
    let as = div.getElementsByTagName("a");
    songs = [];
    
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push((element.href.split(`${folder}/`)[1]));
        }
    }

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
            <li> 
                <img class="invert" src="images/music.svg" alt="Music Icon">
                <div class="info">
                    <div class="songName">${song.replaceAll("%20", " ")}</div>
                    <div style="color: grey;" class="songArtist">Saad</div>
                </div>
                <div class="playNow">
                    <span>Play Now</span>
                    <img class="invert" src="images/playNowBtn.svg" alt="Play Now Button">
                </div> 
            </li>`;

    }

    // Attach event listeners to the newly created song list items
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info .songName").innerHTML);
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "images/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track).replaceAll(".mp3", "");
    document.querySelector(".songTime").innerHTML = "00:00/00:00";
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0)
        return "00:00";
    seconds = Math.round(seconds);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    console.log(div);

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
        // console.log(e);
        // console.log(e.href);
        if(e.href.includes("/songs/")){
            let folder = (e.href.split("/").slice(-1)[0]);
            // console.log("Folder:", folder);

            //Get metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            //console.log(response);
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card ">
            <div class="play-button">
                <img src="images/play-button.png" alt="">
            </div>
            <img src="/songs/${folder}/cover.jpeg" alt="">
            <p class="playlist-title">${response.title}</p>
            <p class="playlist-desc">${response.description}</p>
        </div>`
        }
    }

    //load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        // console.log(e);
        e.addEventListener("click", async item=>{
            console.log("Fetching songs");
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}


//Main Function
async function main() {
    await getSongs("songs/atif_aslam");
    playMusic(songs[0], true);
    await displayAlbums();

    // Event Listener for play/pause
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "images/play.svg";
        }
    });

    // Time Update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar
    document.querySelector(".seekBar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // Event Listener for Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Event Listener for Previous
    previous.addEventListener("click", () => {
        let index = songs.indexOf((currentSong.src.split("/").slice(-1)[0]));
        if ((index - 1) >= 0)
            playMusic(songs[index - 1]);
    });

    // Event Listener for next
    next.addEventListener("click", () => {
        let index = songs.indexOf((currentSong.src.split("/").slice(-1)[0]));
        if ((index + 1) < songs.length)
            playMusic(songs[index + 1]);
    });

    // Event Listener for volume range
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Event Listener for mute
    const volumeRange = document.getElementById("vol-range");
    let lastVolume = currentSong.volume;

    volumeRange.value = currentSong.volume * 100;

    document.getElementById("mute").addEventListener("click", (e) => {
        if (currentSong.volume > 0) {
            lastVolume = currentSong.volume;
            currentSong.volume = 0;
            volumeRange.value = 0;
            volumeRange.disabled = true;
            mute.src = "images/volume-mute.svg";
        } else {
            currentSong.volume = lastVolume;
            volumeRange.value = lastVolume * 100;
            volumeRange.disabled = false;
            mute.src = "images/volume-high.svg";
        }
    });
}

main();
