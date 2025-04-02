
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { wordList } from '@/utils/wordList';

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
  const fontRef = useRef<THREE.Font | null>(null);
  
  // Define constants
  const LAYERS_COUNT = 12;
  const GRID_SIZE = 45; // Grid size to match the 2D view's layout
  const GRID_EXTENT = 45; // Visual extent of the grid in the scene
  const TEXT_SIZE = 0.5; // Size of the text
  const LAYER_SPACING = 10; // Space between layers

  // Calculate color based on position with higher contrast
  const calculateColor = (row: number, col: number, layerFactor = 1) => {
    // Calculate normalized positions (0 to 1)
    const normalizedRow = row / GRID_SIZE;
    const normalizedCol = col / GRID_SIZE;
    
    // Create RGB components based on position with higher contrast
    const r = Math.floor(normalizedCol * 200) + 55; // Higher contrast
    const g = Math.floor(normalizedRow * 200) + 55;
    const b = Math.floor(((normalizedRow + normalizedCol) / 2) * 180) + 75;
    
    // Apply layer factor for depth with increased brightness
    return new THREE.Color(
      Math.min(1, r / 255 * layerFactor * 1.2),
      Math.min(1, g / 255 * layerFactor * 1.2),
      Math.min(1, b / 255 * layerFactor * 1.2)
    );
  };
  
  // Initialize 3D scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;
    
    // Calculate container dimensions
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const aspect = width / height;
    
    // Create orthographic camera for isometric view
    const frustumSize = 100;
    const camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );
    
    // Position camera for isometric view
    camera.position.set(80, 60, 80);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    // Create renderer with antialiasing for better visuals
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Create controls with better defaults
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;
    
    // Add stronger lighting for better visibility
    const ambientLight = new THREE.AmbientLight(0x777777); // Brighter ambient light
    scene.add(ambientLight);
    
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight1.position.set(1, 1, 1);
    scene.add(dirLight1);
    
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight2.position.set(-1, -1, -1);
    scene.add(dirLight2);
    
    // Add brighter point light
    const pointLight = new THREE.PointLight(0x00aaff, 2, 140);
    pointLight.position.set(0, 0, 60);
    scene.add(pointLight);
    
    // Force initial render before creating word layers
    renderer.render(scene, camera);
    
    // Load font first, then create word layers
    const fontLoader = new FontLoader();
    const fontUrl = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json';
    
    fontLoader.load(fontUrl, (font) => {
      fontRef.current = font;
      // Create word layers once font is loaded
      createWordLayers();
      
      // Animation loop
      animate();
      
      // Set initialization flag
      initCompletedRef.current = true;
    });
    
    // Animation loop
    const animate = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      frameIdRef.current = requestAnimationFrame(animate);
    };
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      const aspect = width / height;
      
      // Update camera
      const frustumSize = 100;
      if (cameraRef.current) {
        cameraRef.current.left = frustumSize * aspect / -2;
        cameraRef.current.right = frustumSize * aspect / 2;
        cameraRef.current.top = frustumSize / 2;
        cameraRef.current.bottom = frustumSize / -2;
        cameraRef.current.updateProjectionMatrix();
      }
      
      // Update renderer
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose geometries and materials
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
  
  // Create word layers with full text representation
  const createWordLayers = () => {
    if (!sceneRef.current || !fontRef.current) return;
    
    const scene = sceneRef.current;
    const font = fontRef.current;
    const wordCount = wordList.length; // Full BIP-39 wordlist (2048 words)
    const textGroups: THREE.Group[] = [];
    
    // Calculate grid dimensions to ensure square layout
    const gridDimension = Math.ceil(Math.sqrt(wordCount));
    
    // Distribute all words across layers
    for (let layer = 0; layer < LAYERS_COUNT; layer++) {
      // Create a group for this layer
      const layerGroup = new THREE.Group();
      
      // Position of this layer (stacked along z-axis)
      const zPosition = layer * -LAYER_SPACING;
      
      // Create a semi-transparent plane for each layer to enhance depth perception
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
      
      // Create a text for EACH word in the wordlist
      for (let i = 0; i < wordCount; i++) {
        // Calculate row and column in the grid
        const col = i % gridDimension;
        const row = Math.floor(i / gridDimension);
        
        // Calculate position to create a square grid that fills the entire viewable area
        const x = (col - gridDimension/2) * (GRID_EXTENT/gridDimension);
        const y = (gridDimension/2 - row) * (GRID_EXTENT/gridDimension);
        
        // Create text geometry for this word
        const word = wordList[i];
        const textGeometry = new TextGeometry(word, {
          font: font,
          size: TEXT_SIZE,
          height: 0.05,
          curveSegments: 1  // Lower for better performance
        });
        
        // Center the text horizontally
        textGeometry.computeBoundingBox();
        const textWidth = textGeometry.boundingBox?.max.x ?? TEXT_SIZE * word.length * 0.6;
        textGeometry.translate(-textWidth / 2, 0, 0);
        
        // Create color with layer depth factor for gradient
        const depthFactor = 0.7 + (layer / LAYERS_COUNT) * 0.6;
        const color = calculateColor(row, col, depthFactor);
        
        // Create text material
        const textMaterial = new THREE.MeshBasicMaterial({
          color: color,
          transparent: true,
          opacity: 0.9
        });
        
        // Create mesh and position
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(x, y, zPosition);
        textMesh.userData = { wordIndex: i, isActive: false };
        
        // Add to layer group
        layerGroup.add(textMesh);
      }
      
      // Add layer group to scene
      scene.add(layerGroup);
      textGroups.push(layerGroup);
    }
    
    // Store reference to text groups
    textGroupsRef.current = textGroups;
    
    // Update active words based on current indices
    updateActiveWords();
  };
  
  // Update active words based on current indices
  const updateActiveWords = () => {
    if (!sceneRef.current || !textGroupsRef.current.length || !currentIndices.length) return;
    
    // Remove previous line if exists
    if (linesRef.current && sceneRef.current) {
      sceneRef.current.remove(linesRef.current);
      linesRef.current = null;
    }
    
    // Reset all words to normal state
    textGroupsRef.current.forEach((group, layerIndex) => {
      group.children.forEach(child => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial 
            && child.userData && typeof child.userData.wordIndex === 'number') {
          
          // Skip the plane (which is the first child)
          if (child.userData.wordIndex === undefined) return;
          
          // Calculate original grid position for this word
          const gridDimension = Math.ceil(Math.sqrt(wordList.length));
          const wordIndex = child.userData.wordIndex;
          const col = wordIndex % gridDimension;
          const row = Math.floor(wordIndex / gridDimension);
          
          // Restore original color based on position
          const depthFactor = 0.7 + (layerIndex / LAYERS_COUNT) * 0.6;
          const color = calculateColor(row, col, depthFactor);
          
          child.material.color = color;
          child.material.opacity = 0.8;
          child.userData.isActive = false;
        }
      });
    });
    
    // Highlight active words and collect positions for connecting lines
    const activePositions: THREE.Vector3[] = [];
    
    currentIndices.forEach((wordIndex, layerIndex) => {
      if (layerIndex < textGroupsRef.current.length) {
        const layerGroup = textGroupsRef.current[layerIndex];
        
        // Find the mesh with the matching word index
        layerGroup.children.forEach(child => {
          if (child instanceof THREE.Mesh && 
              child.userData && 
              child.userData.wordIndex === wordIndex) {
            
            // Highlight this word
            if (child.material instanceof THREE.MeshBasicMaterial) {
              child.material.color.set(0x00ffff); // Bright cyan
              child.material.opacity = 1.0;
              child.userData.isActive = true;
              
              // Get world position for connection line
              const position = new THREE.Vector3();
              child.getWorldPosition(position);
              activePositions.push(position);
            }
          }
        });
      }
    });
    
    // Create connection lines if enabled
    if (showConnections && activePositions.length > 1) {
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(activePositions);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00ffff, // Bright cyan
        transparent: true,
        opacity: 0.8,
        linewidth: 2
      });
      
      const line = new THREE.Line(lineGeometry, lineMaterial);
      sceneRef.current.add(line);
      linesRef.current = line;
    }
  };
  
  // Update connections when currentIndices or showConnections changes
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
