//======= Audio context
let audioContext
let buffers = {}

//  INIT (load + decode once)
export const initAudio = async () => {
    if (audioContext) return

    audioContext = new (window.AudioContext || window.webkitAudioContext)()

    const loadSound = async (name, url) => {
        const res = await fetch(url)
        const arrayBuffer = await res.arrayBuffer()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        buffers[name] = audioBuffer
    }

    await Promise.all([
        loadSound("click", "/sounds/click-sound.mp3"),
        loadSound("pause", "/sounds/pause.wav"),
        loadSound("dropdown", "/sounds/dropDown.mp3"),
        loadSound("delete", "/sounds/delete.mp3"),
    ])
}

//  INTERNAL PLAY FUNCTION
const play = (name, volume = 0.5) => {
    if (!audioContext || !buffers[name]) return

    const source = audioContext.createBufferSource()
    const gainNode = audioContext.createGain()

    source.buffer = buffers[name]
    gainNode.gain.value = volume

    source.connect(gainNode)
    gainNode.connect(audioContext.destination)

    source.start(0)
}

// EXPORTED PLAY FUNCTIONS (use these everywhere)
export const playClick = () => play("click")
export const playPause = () => play("pause")
export const playDropDown = () => play("dropdown")
export const playDelete = () => play("delete")


//==========================
//====================== before 1 april 2025, new Audio
// import clickSound from "../assets/click-sound.mp3"
// import pauseSound from "../assets/pause.wav"
// import dropDownSound from "../assets/dropDown.mp3"
// import deleteSound from "../assets/delete.mp3"

// const clickAudio = new Audio(clickSound)
// const pauseAudio = new Audio(pauseSound)
// const dropDownAudio = new Audio(dropDownSound)
// const deleteAudio = new Audio(deleteSound)


// clickAudio.volume = 0.5
// pauseAudio.volume = 0.5
// dropDownAudio.volume = 0.5
// deleteAudio.volume = 0.5



// export const playClick = () => {
//     clickAudio.currentTime = 0
//     clickAudio.play()
// }

// export const playPause = () => {
//     pauseAudio.currentTime = 0
//     pauseAudio.play()
// }

// export const playDropDown = () => {
//     dropDownAudio.currentTime = 0
//     dropDownAudio.play()
// }
// export const playDelete = () => {
//     deleteAudio.currentTime = 0
//     deleteAudio.play()
// }


// export const initSounds = () => {
//     clickAudio.load()
//     pauseAudio.load()
//     dropDownAudio.load()
//     deleteAudio.load()
// }
