import clickSound from "../assets/click-sound.mp3"
import pauseSound from "../assets/pause.wav"
import dropDownSound from "../assets/dropDown.mp3"
import deleteSound from "../assets/delete.mp3"

const clickAudio = new Audio(clickSound)
const pauseAudio = new Audio(pauseSound)
const dropDownAudio = new Audio(dropDownSound)
const deleteAudio = new Audio(deleteSound)


clickAudio.volume = 0.5
pauseAudio.volume = 0.5
dropDownAudio.volume = 0.5
deleteAudio.volume = 0.5



export const playClick = () => {
    clickAudio.currentTime = 0
    clickAudio.play()
}

export const playPause = () => {
    pauseAudio.currentTime = 0
    pauseAudio.play()
}

export const playDropDown = () => {
    dropDownAudio.currentTime = 0
    dropDownAudio.play()
}
export const playDelete = () => {
    deleteAudio.currentTime = 0
    deleteAudio.play()
}
