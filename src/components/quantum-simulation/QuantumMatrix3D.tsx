import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { wordList } from '@/utils/wordList';

type Font = any;

interface QuantumMatrix3DProps {
  showConnections: boolean;
  currentPhrase: string[];
  currentIndices: number[];
}

export const QuantumMatrix3D: React.FC<QuantumMatrix3DProps> = ({ 
  showConnections, 
  currentPhrase,
  currentIndices
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const textGroupsRef = useRef<THREE.Group[]>([]);
  const linesRef = useRef<THREE.Line | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const initCompletedRef = useRef<boolean>(false);
  const fontRef = useRef<Font | null>(null);
  
  const LAYERS_COUNT = 12;
  const GRID_SIZE = 45;
  const GRID_EXTENT = 45;
  const TEXT_SIZE = 0.5;
  const LAYER_SPACING = 10;

  const calculateColor = (row: number, col: number, layerFactor = 1) => {
    const normalizedRow = row / GRID_SIZE;
    const normalizedCol = col / GRID_SIZE;
    
    const r = Math.floor(normalizedCol * 200) + 55;
    const g = Math.floor(normalizedRow * 200) + 55;
    const b = Math.floor(((normalizedRow + normalizedCol) / 2) * 180) + 75;
    
    return new THREE.Color(
      Math.min(1, r / 255 * layerFactor * 1.2),
      Math.min(1, g / 255 * layerFactor * 1.2),
      Math.min(1, b / 255 * layerFactor * 1.2)
    );
  };

  useEffect(() => {
    if (!containerRef.current) return;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const aspect = width / height;
    
    const frustumSize = 100;
    const camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );
    
    camera.position.set(80, 60, 80);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;
    
    const ambientLight = new THREE.AmbientLight(0x777777);
    scene.add(ambientLight);
    
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight1.position.set(1, 1, 1);
    scene.add(dirLight1);
    
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight2.position.set(-1, -1, -1);
    scene.add(dirLight2);
    
    const pointLight = new THREE.PointLight(0x00aaff, 2, 140);
    pointLight.position.set(0, 0, 60);
    scene.add(pointLight);
    
    renderer.render(scene, camera);
    
    const fontLoader = new FontLoader();
    const fontUrl = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json';
    
    fontLoader.load(fontUrl, (font) => {
      fontRef.current = font;
      createWordLayers();
      
      animate();
      
      initCompletedRef.current = true;
    });
    
    const animate = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      frameIdRef.current = requestAnimationFrame(animate);
    };
    
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const aspect = width / height;
      
      const frustumSize = 100;
      if (cameraRef.current) {
        cameraRef.current.left = frustumSize * aspect / -2;
        cameraRef.current.right = frustumSize * aspect / 2;
        cameraRef.current.top = frustumSize / 2;
        cameraRef.current.bottom = frustumSize / -2;
        cameraRef.current.updateProjectionMatrix();
      }
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, []);
  
  const createWordLayers = () => {
    if (!sceneRef.current || !fontRef.current) return;
    
    const scene = sceneRef.current;
    const font = fontRef.current;
    const wordCount = wordList.length;
    const textGroups: THREE.Group[] = [];
    
    const gridDimension = Math.ceil(Math.sqrt(wordCount));
    
    for (let layer = 0; layer < LAYERS_COUNT; layer++) {
      const layerGroup = new THREE.Group();
      const zPosition = layer * -LAYER_SPACING;
      
      const planeGeometry = new THREE.PlaneGeometry(GRID_EXTENT, GRID_EXTENT);
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x223344,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide
      });
      
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.position.set(0, 0, zPosition);
      layerGroup.add(plane);
      
      for (let i = 0; i < wordCount; i++) {
        const col = i % gridDimension;
        const row = Math.floor(i / gridDimension);
        
        const x = (col - gridDimension/2) * (GRID_EXTENT/gridDimension);
        const y = (gridDimension/2 - row) * (GRID_EXTENT/gridDimension);
        
        const word = wordList[i];
        const textGeometry = new TextGeometry(word, {
          font: font,
          size: TEXT_SIZE,
          height: 0.05,
          curveSegments: 1
        });
        
        textGeometry.computeBoundingBox();
        const textWidth = textGeometry.boundingBox?.max.x ?? TEXT_SIZE * word.length * 0.6;
        textGeometry.translate(-textWidth / 2, 0, 0);
        
        const depthFactor = 0.7 + (layer / LAYERS_COUNT) * 0.6;
        const color = calculateColor(row, col, depthFactor);
        
        const textMaterial = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.9
        });
        
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(x, y, zPosition);
        textMesh.userData = { wordIndex: i, isActive: false };
        
        layerGroup.add(textMesh);
      }
      
      scene.add(layerGroup);
      textGroups.push(layerGroup);
    }
    
    textGroupsRef.current = textGroups;
    
    updateActiveWords();
  };
  
  const updateActiveWords = () => {
    if (!sceneRef.current || !textGroupsRef.current.length || !currentIndices.length) return;
    
    if (linesRef.current && sceneRef.current) {
      sceneRef.current.remove(linesRef.current);
      linesRef.current = null;
    }
    
    textGroupsRef.current.forEach((group, layerIndex) => {
      group.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial 
            && child.userData && typeof child.userData.wordIndex === 'number') {
          
          if (child.userData.wordIndex === undefined) return;
          
          const gridDimension = Math.ceil(Math.sqrt(wordList.length));
          const wordIndex = child.userData.wordIndex;
          const col = wordIndex % gridDimension;
          const row = Math.floor(wordIndex / gridDimension);
          
          const depthFactor = 0.7 + (layerIndex / LAYERS_COUNT) * 0.6;
          const color = calculateColor(row, col, depthFactor);
          
          child.material.color = color;
          child.material.opacity = 0.8;
          child.userData.isActive = false;
        }
      });
    });
    
    const activePositions: THREE.Vector3[] = [];
    
    currentIndices.forEach((wordIndex, layerIndex) => {
      if (layerIndex < textGroupsRef.current.length) {
        const layerGroup = textGroupsRef.current[layerIndex];
        
        layerGroup.children.forEach(child => {
          if (child instanceof THREE.Mesh && 
              child.userData && 
              child.userData.wordIndex === wordIndex) {
            
            if (child.material instanceof THREE.MeshBasicMaterial) {
              child.material.color.set(0x00ffff);
              child.material.opacity = 1.0;
              child.userData.isActive = true;
              
              const position = new THREE.Vector3();
              child.getWorldPosition(position);
              activePositions.push(position);
            }
          }
        });
      }
    });
    
    if (showConnections && activePositions.length > 1) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(activePositions);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.8,
        linewidth: 2
      });
      
      const line = new THREE.Line(lineGeometry, lineMaterial);
      sceneRef.current.add(line);
      linesRef.current = line;
    }
  };
  
  useEffect(() => {
    if (initCompletedRef.current) {
      updateActiveWords();
    }
  }, [currentIndices, showConnections]);
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full" 
      style={{ backgroundColor: '#050505' }}
    />
  );
};
