import clickSound from "../assets/click-sound.mp3"
import pauseSound from "../assets/pauseF.mp3"
import dropDownSound from "../assets/dropDown.mp3"

const clickAudio = new Audio(clickSound)
const pauseAudio = new Audio(pauseSound)
const dropDownAudio = new Audio(dropDownSound)


clickAudio.volume = 0.5
pauseAudio.volume = 0.5
dropDownAudio.volume = 0.5


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