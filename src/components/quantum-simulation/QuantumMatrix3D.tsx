
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
  const pointsRef = useRef<THREE.Points[]>([]);
  const linesRef = useRef<THREE.Line | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const initCompletedRef = useRef<boolean>(false);
  
  // Define constants
  const LAYERS_COUNT = 12;
  const POINT_SIZE = 1.5; // Point size for visibility
  const GRID_SIZE = 45; // Grid size to match the 2D view's layout

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
    
    // Create word layers
    createWordLayers();
    
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
    
    // Start animation
    animate();
    
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
    
    // Set initialization flag
    initCompletedRef.current = true;
    
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
  
  // Create word layers with full grid distribution
  const createWordLayers = () => {
    if (!sceneRef.current) return;
    
    const scene = sceneRef.current;
    const wordCount = wordList.length; // Full BIP-39 wordlist (2048 words)
    const pointsArray: THREE.Points[] = [];
    
    // Calculate grid dimensions to ensure square layout
    const gridDimension = Math.ceil(Math.sqrt(wordCount));
    
    // Distribute all words across layers
    for (let layer = 0; layer < LAYERS_COUNT; layer++) {
      // Create point geometry for this layer
      const vertices: number[] = [];
      const colors: number[] = [];
      
      // Position of this layer (stacked along z-axis)
      const zPosition = layer * -8;
      
      // Create a point for EACH word in the wordlist - full 2048 word distribution
      for (let i = 0; i < wordCount; i++) {
        // Calculate row and column in the grid
        const col = i % gridDimension;
        const row = Math.floor(i / gridDimension);
        
        // Calculate position to create a square grid that fills the entire viewable area
        // Scale the grid to be visible within the camera frustum
        const gridExtent = 45; // Larger grid extent for bigger distribution
        const x = (col - gridDimension/2) * (gridExtent/gridDimension);
        const y = (gridDimension/2 - row) * (gridExtent/gridDimension);
        
        // Add point to vertices array
        vertices.push(x, y, zPosition);
        
        // Create color with layer depth factor for gradient
        const depthFactor = 0.7 + (layer / LAYERS_COUNT) * 0.6;
        const color = calculateColor(row, col, depthFactor);
        colors.push(color.r, color.g, color.b);
      }
      
      // Create points geometry with all words
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      // Create points material with larger size for better visibility
      const material = new THREE.PointsMaterial({
        size: POINT_SIZE,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true
      });
      
      // Create points object
      const points = new THREE.Points(geometry, material);
      pointsArray.push(points);
      scene.add(points);
      
      // Create a semi-transparent plane for each layer to enhance depth perception
      const planeGeometry = new THREE.PlaneGeometry(gridExtent, gridExtent);
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x223344,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide
      });
      
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.position.set(0, 0, zPosition);
      scene.add(plane);
    }
    
    pointsRef.current = pointsArray;
    
    // Update active points based on current indices
    updateActivePoints();
  };
  
  // Update active points based on current indices
  const updateActivePoints = () => {
    if (!sceneRef.current || !currentIndices.length) return;
    
    // Remove previous line if exists
    if (linesRef.current && sceneRef.current) {
      sceneRef.current.remove(linesRef.current);
      linesRef.current = null;
    }
    
    // Create lines between active points if showConnections is true
    if (showConnections) {
      const positions: THREE.Vector3[] = [];
      
      // Find positions of active words in each layer
      currentIndices.forEach((wordIndex, layerIndex) => {
        if (layerIndex < LAYERS_COUNT && pointsRef.current[layerIndex]) {
          const geometry = pointsRef.current[layerIndex].geometry;
          const position = new THREE.Vector3();
          
          // Get position from buffer attribute
          position.fromBufferAttribute(
            geometry.attributes.position as THREE.BufferAttribute, 
            wordIndex
          );
          
          // Transform to world space
          pointsRef.current[layerIndex].localToWorld(position);
          positions.push(position);
        }
      });
      
      // Create connection lines with improved visibility
      if (positions.length > 1) {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(positions);
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
    }
    
    // Highlight active points in each layer with brighter colors
    pointsRef.current.forEach((points, layerIndex) => {
      const geometry = points.geometry;
      const colors = geometry.attributes.color.array as Float32Array;
      const positions = geometry.attributes.position.array as Float32Array;
      
      // Reset all colors to their original state
      for (let i = 0; i < wordList.length; i++) {
        const baseIndex = i * 3;
        
        // Calculate original grid position for this point
        const gridDimension = Math.ceil(Math.sqrt(wordList.length));
        const col = i % gridDimension;
        const row = Math.floor(i / gridDimension);
        
        // Restore original color based on position
        const depthFactor = 0.7 + (layerIndex / LAYERS_COUNT) * 0.6;
        const color = calculateColor(row, col, depthFactor);
        
        colors[baseIndex] = color.r;
        colors[baseIndex + 1] = color.g;
        colors[baseIndex + 2] = color.b;
      }
      
      // Now highlight the specific active word in this layer
      if (layerIndex < currentIndices.length) {
        const activeWordIndex = currentIndices[layerIndex];
        const baseIndex = activeWordIndex * 3;
        
        // Very bright cyan for active point
        colors[baseIndex] = 0.2;     // R - a bit of red for better visibility
        colors[baseIndex + 1] = 1.0; // G - full green
        colors[baseIndex + 2] = 1.0; // B - full blue
      }
      
      // Update the attribute
      geometry.attributes.color.needsUpdate = true;
    });
  };
  
  // Update connections when currentIndices or showConnections changes
  useEffect(() => {
    if (initCompletedRef.current) {
      updateActivePoints();
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
