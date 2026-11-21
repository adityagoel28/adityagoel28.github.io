import { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Preload, useGLTF } from '@react-three/drei';
import CanvasLoader from '../Loader';

const Profile = ({ isMobile }) => {
  const profile = useGLTF('./avatar/avatar.glb', true);

  const ref = useRef();
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = Math.sin(time * 2) * 0.2;
    }
  });

  return (
    <mesh ref={ref}>
      <hemisphereLight intensity={0.15} groundColor="black"/>
      <pointLight intensity={1} />
      <spotLight
        position={[-20, 50, 10]} 
        angle={0.12} penumbra = {1}
        intensity = {1} castShadow
        shadow-mapSize-width = {1024}/>
      <primitive
        object={profile.scene}
        scale = {isMobile ? 2.3 : 3.6}
        position = {isMobile ? [-3.8, -3.8, -2]: [-2, -3.5, -7.2]}
        rotation = {isMobile ? [0.12, 1.26, -0.1]: [0.12, 1.1, -0.1]}
        />
    </mesh>
  )
}

const ProfileCanvas = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 500px)');
    setIsMobile(mediaQuery.matches);
    const handler = e => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full absolute inset-0">
      <Canvas
        frameloop={isHeroVisible ? 'always' : 'never'}
        shadows
        camera={{ position: [20, 3, 5], fov: 25 }}
        style={{ position: 'relative', zIndex: 0 }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <OrbitControls
            enableZoom={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
          <Profile isMobile={isMobile} />
        </Suspense>

        <Preload all />
      </Canvas>
    </div>
  )
}

useGLTF.preload('./avatar/avatar.glb', true);

export default ProfileCanvas;