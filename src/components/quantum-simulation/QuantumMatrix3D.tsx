
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
  const ACTIVE_TEXT_SIZE = 0.8; // Larger text size for selected words
  const TEXT_DEPTH = 0.05;
  const ACTIVE_TEXT_DEPTH = 0.2; // Deeper text for selected words
  const LAYER_SPACING = 10;

  // Enhanced contrast color calculation function
  const calculateColor = (row: number, col: number, layerFactor = 1, isActive = false) => {
    if (isActive) {
      // Bright white for active words
      return new THREE.Color(1, 1, 1);
    }
    
    const normalizedRow = row / GRID_SIZE;
    const normalizedCol = col / GRID_SIZE;
    
    // Increase base brightness for better contrast
    const r = Math.floor(normalizedCol * 220) + 35;
    const g = Math.floor(normalizedRow * 220) + 35;
    const b = Math.floor(((normalizedRow + normalizedCol) / 2) * 200) + 55;
    
    return new THREE.Color(
      Math.min(1, r / 255 * layerFactor),
      Math.min(1, g / 255 * layerFactor),
      Math.min(1, b / 255 * layerFactor)
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
    
    // Increase ambient light for better visibility
    const ambientLight = new THREE.AmbientLight(0xaaaaaa);
    scene.add(ambientLight);
    
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(1, 1, 1);
    scene.add(dirLight1);
    
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight2.position.set(-1, -1, -1);
    scene.add(dirLight2);
    
    // Changed from blue to bitcoin orange
    const pointLight = new THREE.PointLight(0xf7931a, 2, 140);
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
      // Darker background plane for better contrast
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x111122,
        transparent: true,
        opacity: 0.15,
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
          height: TEXT_DEPTH,
          curveSegments: 1
        });
        
        textGeometry.computeBoundingBox();
        const textWidth = textGeometry.boundingBox?.max.x ?? TEXT_SIZE * word.length * 0.6;
        textGeometry.translate(-textWidth / 2, 0, 0);
        
        const depthFactor = 0.7 + (layer / LAYERS_COUNT) * 0.6;
        const color = calculateColor(row, col, depthFactor);
        
        // Higher base opacity for better visibility
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
    
    // Reset all words to normal state
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
          // Create dimmer colors for non-active words
          const color = calculateColor(row, col, depthFactor);
          
          child.material.color = color;
          // Reduce base opacity for non-active words
          child.material.opacity = 0.6;
          child.userData.isActive = false;
        }
      });
    });
    
    const activePositions: THREE.Vector3[] = [];
    const activeWords: THREE.Object3D[] = [];
    
    // Identify words that need to be active across all layers
    const activeWordIndices = new Set(currentIndices);
    
    // First pass: collect all active words
    currentIndices.forEach((wordIndex, layerIndex) => {
      if (layerIndex < textGroupsRef.current.length) {
        const layerGroup = textGroupsRef.current[layerIndex];
        
        layerGroup.children.forEach(child => {
          if (child instanceof THREE.Mesh && 
              child.userData && 
              child.userData.wordIndex === wordIndex) {
            
            if (child.material instanceof THREE.MeshBasicMaterial) {
              // Set pure white for active words
              child.material.color.set(0xffffff);
              // Full opacity for active words
              child.material.opacity = 1.0;
              child.userData.isActive = true;
              
              // Store reference to the active word mesh
              activeWords.push(child);
              
              // Store position for connection lines
              const position = new THREE.Vector3();
              child.getWorldPosition(position);
              activePositions.push(position);
            }
          }
        });
      }
    });
    
    // Create highlighted versions of active words that appear through layers
    activeWords.forEach(original => {
      if (!(original instanceof THREE.Mesh)) return;
      
      // Get word data from the original mesh
      const originalMesh = original as THREE.Mesh;
      if (!originalMesh.geometry || !originalMesh.material) return;
      
      // Get the word from the mesh
      const wordIndex = originalMesh.userData?.wordIndex;
      if (wordIndex === undefined || wordIndex < 0 || wordIndex >= wordList.length) return;
      
      const word = wordList[wordIndex];
      
      // Create a new text geometry that's larger and bolder
      if (!fontRef.current) return;
      
      const boldGeometry = new TextGeometry(word, {
        font: fontRef.current,
        size: ACTIVE_TEXT_SIZE, // Larger size
        height: ACTIVE_TEXT_DEPTH, // More depth for bold appearance
        curveSegments: 3 // More curved segments for smoother appearance
      });
      
      boldGeometry.computeBoundingBox();
      const textWidth = boldGeometry.boundingBox?.max.x ?? ACTIVE_TEXT_SIZE * word.length * 0.6;
      boldGeometry.translate(-textWidth / 2, 0, 0);
      
      // Create a material that will be visible through other objects
      const boldMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff, // Pure white
        transparent: true,
        opacity: 1.0,
        depthTest: false, // This makes it visible through other objects
        side: THREE.DoubleSide
      });
      
      // Create the mesh and position it exactly where the original is
      const boldMesh = new THREE.Mesh(boldGeometry, boldMaterial);
      boldMesh.position.copy(originalMesh.position.clone());
      boldMesh.quaternion.copy(originalMesh.quaternion);
      boldMesh.scale.copy(originalMesh.scale);
      
      // Add to scene
      sceneRef.current?.add(boldMesh);
      
      // Store reference for cleanup
      if (!originalMesh.userData) originalMesh.userData = {};
      originalMesh.userData.highlightMesh = boldMesh;
    });
    
    // Create connection lines if enabled
    if (showConnections && activePositions.length > 1) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(activePositions);
      // Changed from cyan to bitcoin orange
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xf7931a, // Bitcoin orange
        transparent: true,
        opacity: 1.0,
        linewidth: 2,
        depthTest: false // Makes lines visible through other objects
      });
      
      const line = new THREE.Line(lineGeometry, lineMaterial);
      sceneRef.current.add(line);
      linesRef.current = line;
    }
  };
  
  // Clean up any highlighted words before updating
  const cleanupHighlightedWords = () => {
    if (!sceneRef.current) return;
    
    textGroupsRef.current.forEach(group => {
      group.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.userData?.highlightMesh) {
          sceneRef.current?.remove(child.userData.highlightMesh);
          delete child.userData.highlightMesh;
        }
      });
    });
  };
  
  useEffect(() => {
    if (initCompletedRef.current) {
      cleanupHighlightedWords();
      updateActiveWords();
    }
    
    return () => {
      cleanupHighlightedWords();
    };
  }, [currentIndices, showConnections]);
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full" 
      style={{ backgroundColor: '#050505' }}
    />
  );
};
