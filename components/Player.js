import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { currentTrackIdState, isPlayingState } from "../atoms/songAtom";
import useSpotify from "../hooks/useSpotify"
import useSongInfo from "../hooks/useSongInfo";
import { FastForwardIcon, HeartIcon, PauseIcon, PlayIcon, ReplyIcon, RewindIcon, SwitchHorizontalIcon, VolumeUpIcon } from "@heroicons/react/outline";
import { VolumeUpIcon as VolumeDownIcon } from "@heroicons/react/solid";
import { debounce } from "lodash";
const Player = () => {
    const spotifyApi = useSpotify();
    const { data: session, status } = useSession();
    const [currentTrackId, setCurrentTrackId] = useRecoilState(currentTrackIdState);
    const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
    const [volume, setVolume] = useState(50);
    const songInfo = useSongInfo();
    const fetchCurrentSong = () => {
        if(!songInfo){
            spotifyApi.getMyCurrentPlayingTrack().then((data)=>{
                console.log("Now Playing".data?.body?.item);
                setCurrentTrackId(data.body?.item?.id);

                spotifyApi.getMyCurrentPlaybackState().then((data)=>{
                    setIsPlaying(data.body?.is_playing);
                })
            })
        }
    }
    const handlePlayPause = () =>{
        spotifyApi.getMyCurrentPlaybackState()
        .then((data)=>{
            if(data.body.is_playing){
                spotifyApi.pause();
                setIsPlaying(false)
            }
            else{
                spotifyApi.play();
                setIsPlaying(true)
            }
        })
    }
    useEffect(() => {
        if(spotifyApi.getAccessToken() && !currentTrackId){
            fetchCurrentSong();
            setVolume(50);
        }
    }, [currentTrackId,spotifyApi,session])

    useEffect(()=>{
            if(volume > 0 && volume < 100){
                debouncedAdjustVolume(volume);
            }
    },[volume])

    const debouncedAdjustVolume = useCallback(
        debounce((volume)=>{
            spotifyApi.setVolume(volume).catch(()=>{})
        },500),[]
    )

    console.log(songInfo);
    return (
        <div className="h-24 bg-gradient-to-b from-gray-900 grid grid-cols-3 text-xs md:text-base px-2 md:px-8 text-white">
            <div className="flex items-center space-x-4">
                <img 
                className="hidden md:inline h-10 w-10"
                src={songInfo?.album.images?.[0]?.url} 
                alt="" />
                <div className="text-white">
                    <h3>{songInfo?.name}</h3>
                    <p>{songInfo?.artists?.[0]?.name}</p>
                </div>
            </div>
            <div className="flex justify-evenly items-center">
                <SwitchHorizontalIcon className="buttons"/>
                <RewindIcon className="buttons"/>
                {isPlaying ? (
                    <PauseIcon onClick={handlePlayPause} className="buttons w-10 h-10"/>
                ):(
                    <PlayIcon onClick={handlePlayPause} className="buttons w-10 h-10"/>
                )}
                <FastForwardIcon className="buttons"/>
                <ReplyIcon className="buttons"/>
                
            </div>
            <div className="flex items-center justify-end space-x-3 md:space-x-4">
                    <VolumeDownIcon 
                    onClick={()=>volume>0 && setVolume(volume-10)}
                    className="buttons"/>
                    <input 
                    value={volume}
                    onChange={(e)=>setVolume(Number(e.target.value))}
                    className="w-14 md:w-28" 
                    type="range" 
                    min={0} 
                    max={100}/>
                    <VolumeUpIcon 
                    onClick={(e)=>volume<100 &&  setVolume(volume+10)}
                    className="buttons"/>
                    <HeartIcon className="buttons"/>
            </div>
        </div>
    )
}

export default Player
