let currentSong = new Audio();
let songs;
let currFolder;
// write a js function which convert seconds to mintues:seconds in this format
function formatTime(totalSeconds) {
  // Remove milliseconds (decimal part)
  totalSeconds = Math.floor(totalSeconds);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

//finished seconds  convert

async function getSongs(folder) {
  currFolder = folder
  let a = await fetch(`./${currFolder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp4a")) {
      // songs.push(element.href)
      // Keeps what after /songs not whole url!
      //   This url fixing is enhanced by chapgpt for windows
      // let filename = decodeURIComponent(element.pathname)
      //   .replaceAll("\\", "/")
      //   .split("/")
      //   .pop();

      // songs.push(filename);
      songs.push(element.href.split(`./${currFolder}/`)[1])
    }
  }
  // return songs;





  //Show all the songs in the playlists
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      ` 
    <li>
                                <img class="invert" src="music.svg" alt="">
                                <div class="info">
                                    <div>${song.replaceAll("%5C", " ")}</div>
                                    <div>Sams</div>
                                </div>
                                <div class="playNow">
                                    <span>Play Now</span>
                                    <img  src="play-in-playlist.svg" alt="">
                                </div>
                            </li>`;
  }

  // Attach an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li"),
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
}
const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};
async function displayAlbums() {
  let a = await fetch(`./songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a")
  let cardContainer = document.querySelector(".cardContainer")
  // manual for loop . Not using async to use eventlisteners
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    
    if(e.href.includes("/songs")){
      let folder = e.href.split("/").slice(-1)[0]
      // Get the metadata of the folder
      let a = await fetch(`./songs/${folder}/info.json`);
       let response = await a.json();
       console.log(response)
       cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play"><img src="play-in-playlist.svg" alt=""></div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
    }
  }
  // Load the playlist when the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
      e.addEventListener("click",async item=>{
        songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        playMusic(songs[0])
        
      })
    })


  
  
}

async function main() {
  // Get List of all the songs
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  // Display all the albums on the page
  displayAlbums()
  
  // Attach an event listener to play next & previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });
  // listrn for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML =
      `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });
  // Add an event listener to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });
  // add an event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  // add an event listener for close button

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  // Add even listener to prev & next
  // No need doc.quer using id direct :)
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });
  //Add an event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
      console.log("Volume set to " + e.target.value)
    currentSong.volume = e.target.value / 100;
    });

    //add event lisnterner to mute the track
    // chatGPT version
   document.querySelector(".volume > img").addEventListener("click", (e) => {
  if (currentSong.volume > 0) {
    currentSong.volume = 0
    e.target.src = "mute.svg"
    document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
  } else {
    currentSong.volume = 0.1
    e.target.src = "volume.svg"
    document.querySelector(".range").getElementsByTagName("input")[0].value = 10;

  }
})
    
}
main();

