import React, { useEffect, useRef, useState } from 'react'
import { hightlightsSlides } from '@/constants/index'
import { VideoState } from '@/lib/interface';
import gsap from 'gsap';
import { ScrollTrigger } from "gsap/all";
gsap.registerPlugin(ScrollTrigger);
import { pauseImg, playImg, replayImg } from '@/utils';
import { useGSAP } from '@gsap/react'

const VideoCarousel: React.FC = () => {
    const videoRef = useRef<(HTMLVideoElement | null)[]>([]);
    const videoSpanRef = useRef<(HTMLSpanElement | null)[]>([])
    const videoDivRef = useRef<(HTMLSpanElement | null)[]>([])

    const [video, setVideo] = useState<VideoState>({
        isEnd: false,
        startPlay: false,
        videoId: 0,
        isLastVideo: false,
        isPlaying: false
    })

    const [loadedData, setLoadedData] = useState<Event[]>([]);

    const { isEnd, isLastVideo, videoId, startPlay, isPlaying } = video

    useGSAP(() => {
        // slider animation to move the video out of the screen and bring the next video in
        gsap.to("#slider", {
            transform: `translateX(${-100 * videoId}%)`,
            duration: 2,
            ease: "power2.inOut", // show visualizer https://gsap.com/docs/v3/Eases
        });

        // video animation to play the video when it is in the view
        gsap.to('#video', {
            scrollTrigger: {
                trigger: '#video',
                toggleActions: 'restart none none none'
            },
            onComplete: () => {
                setVideo((pre) => ({ ...pre, startPlay: true, isPlaying: true }))
            }
        })
    }, [isEnd, videoId])

    const handleLoadedMetaData = (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        setLoadedData(prevData => [...prevData, event.nativeEvent]);
    };

    useEffect(() => {
        const videoElement = videoRef.current[videoId];
        if (videoElement) {
            if (!isPlaying) {
                videoElement.pause();
            } else {
                if (startPlay) {
                    videoElement.play();
                }
            }
        }
    }, [startPlay, videoId, isPlaying, loadedData])

    useEffect(() => {
        let currentProgress = 0
        const span = videoSpanRef.current

        if (span[videoId]) {
            // animation to move the indicator
            const anim = gsap.to(span[videoId], {
                onUpdate: () => {
                    // get the progress of the video
                    const progress = Math.ceil(anim.progress() * 100)

                    if (progress != currentProgress) {
                        // set the width of the progress bar
                        currentProgress = progress
                        gsap.to(videoDivRef.current[videoId], {
                            width: window.innerWidth < 760 ? '10vw' : window.innerWidth < 1200 ? '10vw' : '4vw'
                        })

                        // set the background color of the progress bar
                        gsap.to(span[videoId], {
                            width: `${currentProgress}%`,
                            backgroundColor: "white",
                        })
                    }
                },
                onComplete: () => {
                    if (isPlaying) {
                        gsap.to(videoDivRef.current[videoId], {
                            width: '12px'
                        })
                        gsap.to(span[videoId], {
                            backgroundColor: '#afafaf'
                        })
                    }
                }
            })

            if (videoId === 0) {
                anim.restart()
            }

            // update the progress bar
            const animUpdate = () => {
                const videoElement = videoRef.current[videoId];
                if (videoElement) {
                    const progress = videoElement.currentTime / hightlightsSlides[videoId].videoDuration;
                    anim.progress(progress);
                }
            }

            if (isPlaying) {
                // ticker to update the progress bar
                gsap.ticker.add(animUpdate);
            } else {
                // remove the ticker when the video is paused (progress bar is stopped)
                gsap.ticker.remove(animUpdate);
            }
        }
    }, [videoId, startPlay])

    const handleProcess = (type: string, i: number = 0) => {
        switch (type) {
            case 'video-end':
                setVideo((pre) => ({ ...pre, isEnd: true, videoId: i + 1 }))
                break;
            case 'video-last':
                setVideo((pre) => ({ ...pre, isLastVideo: true }))
                break
            case 'video-reset':
                setVideo((pre) => ({ ...pre, isLastVideo: false, videoId: 0 }))
                break
            case 'play':
                setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }))
                break
            case 'pause':
                setVideo((pre) => ({ ...pre, isPlaying: !pre.isPlaying }))
                break
            default:
                return video;
        }
    }

    return (
        <>
            <div className='flex items-center'>
                {hightlightsSlides.map((list, i, array) =>
                    <div key={list.id} id='slider' className='sm:pr-20 pr-10'>
                        <div className='video-carousel_container'>
                            <div className='w-full h-full flex-center rounded-3xl overflow-hidden bg-black'>
                                <video id='video' playsInline={true} preload='auto' muted className={`${list.id === 2 && 'translate-x-44'} pointer-events-none`} ref={(el) => (videoRef.current[i] = el)} onPlay={() => { setVideo((prevVideo) => ({ ...prevVideo, isPlaying: true })) }} onEnded={() =>
                                    i !== array.length - 1
                                        ? handleProcess("video-end", i)
                                        : handleProcess("video-last")
                                }

                                    onLoadedMetadata={(e) => handleLoadedMetaData(e)}>
                                    <source src={list.video} type='video/mp4' />
                                </video>
                            </div>
                            <div className='absolute top-12 left-[5%] z-10'>
                                {
                                    list.textLists.map((text) =>
                                        <p key={text} className='md:text-2xl text-xl font-medium'>{text}</p>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className='realtive flex-center mt-10'>
                <div className='flex-center py-5 px-7 bg-gray-300  backdrop-blur rounded-full'>
                    {
                        videoRef.current.map((_, i) => <span key={i} ref={(el) => videoDivRef.current[i] = el} className='mx-2 w-3 h-3 bg-gray-200 rounded-full relative cursor-pointer'>
                            <span ref={(el) => videoSpanRef.current[i] = el} className='absolute h-full w-full rounded-full'></span>
                        </span>)
                    }
                </div>
                <button className='control-btn'>
                    <img src={isLastVideo ? replayImg : !isPlaying ? playImg : pauseImg} alt={isLastVideo ? 'replay' : !isPlaying ? 'play' : 'pause'} onClick={isLastVideo ? () => handleProcess('video-reset') : !isPlaying ? () => handleProcess('play') : () => handleProcess('pause')} />
                </button>
            </div>
        </>
    )
}

export default VideoCarousel