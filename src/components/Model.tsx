import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import React, { useState, useRef, useEffect } from 'react'
import ModelView from './ModelView'
import { yellowImg } from '@/utils'
import { ModelState } from '@/lib/interface'

import * as THREE from 'three';
import { Canvas } from '@react-three/fiber'
import { View } from '@react-three/drei'
import { models, sizes } from '@/constants'
import { animateWithGsap, animateWithGsapTimeline } from '@/utils/animation'

const Model: React.FC = () => {
    const [size, setSize] = useState<string>('small')
    const [model, setModel] = useState<ModelState>({
        title: 'iPhone 15 Pro in Natural Titanium',
        color: ['#8F8A81', '#FFE7B9', '#6F6C64'],
        img: yellowImg
    })
    const [rootElement, setRootElement] = useState<HTMLElement | null>(null);

    const headingRef = useRef<HTMLHeadingElement | null>(null);

    // camera control for the model view
    const cameraControlSmall = useRef();
    const cameraControlLarge = useRef();


    // model
    const small = useRef(new THREE.Group());
    const large = useRef(new THREE.Group());

    // rotation
    const [smallRotation, setSmallRotation] = useState(0);
    const [largeRotation, setLargeRotation] = useState(0);

    useEffect(() => {
        const root = document.getElementById('root');
        if (root) {
            setRootElement(root);
        }
    }, []);

    const tl = gsap.timeline()

    useEffect(() => {
        if (size === 'large') {
            animateWithGsapTimeline(tl, small, smallRotation, '#view1', '#view2', {
                transform: window.innerWidth > 1440 ? 'translateX(-200%)' : 'translateX(-100%)',
                duration: 2
            })
        }
        if (size === 'small') {
            animateWithGsapTimeline(tl, large, largeRotation, '#view2', '#view1', {
                transform: 'translateX(0)',
                duration: 2
            })
        }
    }, [size])

    useGSAP(() => {
        if (headingRef.current) {
            animateWithGsap(headingRef.current, {
                y: 0,
                opacity: 1,
                duration: 1,
            })
        }
    }, [rootElement]);

    if (!rootElement) {
        return null; // Or you can return a loader/spinner until the element is available
    }

    return (
        <section className='common-padding'>
            <div className='screen-max-width'>
                <h1 ref={headingRef} id='heading' className='section-heading'>
                    Take a closer look.
                </h1>
                <div className='flex flex-col items-center mt-5'>
                    <div className='w-full h-[75vh] md:h-[90vh] overflow-hidden relative'>
                        <ModelView index={1} groupRef={small} gsapType="view1" controlRef={cameraControlSmall} setRotationState={setSmallRotation} item={model} size={size} />
                        <ModelView index={2} groupRef={large} gsapType="view2" controlRef={cameraControlLarge} setRotationState={setLargeRotation} item={model} size={size} />

                        <Canvas className='w-full h-full' style={{ position: 'fixed', top: 0, bottom: 0, left: 0, right: 0, overflow: 'hidden' }} eventSource={rootElement}>
                            <View.Port />
                        </Canvas>
                    </div>
                    <div className='mx-auto w-full'>
                        <p className='text-sm font-light text-center mb-5'>{model.title}</p>
                        <div className='flex-center'>
                            <ul className='color-container'>
                                {models.map((item, i) => <li key={i} className='w-6 h-6 rounded-full mx-2 cursor-pointer' style={{ backgroundColor: item.color[0] }} onClick={() => setModel(item)}></li>)}
                            </ul>
                            <button className='size-btn-container'>{sizes.map(({ label, value }) => <span key={label} className='size-btn' style={{ backgroundColor: size === value ? 'white' : 'transparent', color: size === value ? 'black' : 'white' }} onClick={() => setSize(value)}>{label}</span>)}</button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Model