console.log('Lets Write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;
function formatTime(seconds) {
    // Ensure seconds is a valid number, default to 0 if undefined, null, NaN, or less than 0
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
        seconds = 0;  // Default to 0 if invalid
    }
    seconds = Math.floor(seconds);
    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Pad with leading zeros if necessary
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    console.log(`Formatted time: ${formattedMinutes}:${formattedSeconds}`);
    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`http://127.0.0.1:5500/${folder}/`))
        }
    }

    // show all the songs in the Playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML += `
           <li>
           <img class="invert" src="music.svg" alt="">
           <div class="info">
               <div>${decodeURIComponent(song).split(",")[1]} </div>
           </div>
           <div class="playNow">
   <span>Play Now</span>
               <img class="invert" src="play.svg" alt="">
               
           </div>
          </li>`;

    }

    // Attach an Event Listener to Each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {

            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
        // This means each element of array ko alag alag kr do or mra pehla element jb uspy koi click kry to chala do

    })

}

let isFirstSong = true;  // Flag to track the first song being played

const playMusic = (track, pause = false) => {
    const songPath = Array.isArray(track) ? track[1] : track;
    currentSong.src = `/${currFolder}/` + songPath;

    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }

    // Conditionally apply split only for the first song
    if (isFirstSong) {
        // For the first song, apply split to handle the leading comma
        document.querySelector(".songInfo").innerHTML = decodeURI(track).split(',')[1];
        isFirstSong = false;  // Reset the flag after first song is handled
    } else {
        // For all other songs, don't apply split
        document.querySelector(".songInfo").innerHTML = decodeURI(track);
    }

    document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}

async function main() {

    // Get the List of all the songs
    await getsongs("songs/bwdSongs")

    // play 1st music by default 
    playMusic(songs[0], true)


    // Attach an Event Listener to Each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {

            // Extract song name and ensure it is cleaned
            let songName = e.querySelector(".info").firstElementChild.innerHTML.trim();

            // Remove any leading commas and extra spaces
            songName = songName.replace(/^\s*,\s*/, ''); // Remove leading comma with optional surrounding spaces

            console.log(songName);
            playMusic(songName);
        });
    });

    // Attach an Event Listener to previous, play, and next

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "playsongbtn.svg"
        }
    })

    // Listen For timeupdate Event (song)

    currentSong.addEventListener("timeupdate", () => {
        // jesy hi time update ho 2 chezain kro
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    // Add an event listener for close Button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })


    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("previous Worked");

        if (!songs || !Array.isArray(songs)) {
            console.error("Songs array is not available or not an array");
            return;
        }
        // Filter out empty strings and extract the current filename
        const filteredSongs = songs.map(song => song.filter(Boolean));
        const filename = currentSong.src.split("/").pop();  // Extract filename directly

        // Find the index of the current song
        const index = filteredSongs.findIndex(song => song[0] === filename);

        // Play the previous song if available
        index > 0 ? playMusic(filteredSongs[index - 1][0]) : console.log("No previous song available");
    });


    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next Worked")

        // Filter out empty strings and extract the current filename
        const filteredSongs = songs.map(song => song.filter(Boolean));
        const filename = currentSong.src.split("/").pop();  // Extract filename directly

        // Find the index of the current song
        const indexNext = filteredSongs.findIndex(song => song[0] === filename);

        // For Next Song
        indexNext < filteredSongs.length - 1 ? playMusic(filteredSongs[indexNext + 1][0]) : console.log("No next song available");
    })

    // add an Event to Volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {

        console.log("setting volume to", e.target.value, "/100")
        currentSong.volume = parseInt(e.target.value) / 100

    })
    // LOAD the playlist whenever card is Clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getsongs(`songs/${item.currentTarget.dataset.folder}`);  // Fetch and load new folder
        });
    });
}
main()


