import { MutableRefObject } from 'react';
import { Group } from 'three';

//interface state
export interface VideoState {
    isEnd: boolean,
    startPlay: boolean,
    videoId: number,
    isLastVideo: boolean,
    isPlaying: boolean
}

export interface ModelState {
    title: string
    color: string[]
    img: string
}

//interface props
export interface PropsModelView {
    index: number;
    groupRef: MutableRefObject<Group>;
    gsapType: string;
    controlRef: MutableRefObject<any>; // Adjust the type if you know what controlRef points to
    setRotationState: React.Dispatch<React.SetStateAction<number>>;
    item: ModelState;
    size: string;
}