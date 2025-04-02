
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
  const POINT_SIZE = 1.5; // Increased point size for better visibility
  const GRID_SIZE = 45;

  // Calculate color based on position with higher contrast
  const calculateColor = (row: number, col: number, layerFactor = 1) => {
    // Calculate normalized positions (0 to 1)
    const normalizedRow = row / GRID_SIZE;
    const normalizedCol = col / GRID_SIZE;
    
    // Create RGB components based on position similar to HTML example but with higher contrast
    const r = Math.floor(normalizedCol * 200) + 55; // Higher contrast
    const g = Math.floor(normalizedRow * 200) + 55;
    const b = Math.floor(((normalizedRow + normalizedCol) / 2) * 180) + 75;
    
    // Apply layer factor for depth with increased brightness
    return new THREE.Color(
      Math.min(1, r / 255 * layerFactor * 1.2), // Increase brightness by 20%
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
    const ambientLight = new THREE.AmbientLight(0x666666); // Brighter ambient light
    scene.add(ambientLight);
    
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.0); // Increased intensity
    dirLight1.position.set(1, 1, 1);
    scene.add(dirLight1);
    
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.8); // Increased intensity
    dirLight2.position.set(-1, -1, -1);
    scene.add(dirLight2);
    
    // Add point light
    const pointLight = new THREE.PointLight(0x00aaff, 1.5, 120); // Brighter blue light
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
  
  // Create word layers with improved distribution
  const createWordLayers = () => {
    if (!sceneRef.current) return;
    
    const scene = sceneRef.current;
    const layerCount = LAYERS_COUNT;
    const totalWords = wordList.length;
    const wordsPerLayer = Math.ceil(totalWords / layerCount);
    const pointsArray: THREE.Points[] = [];
    
    // Create layers
    for (let layer = 0; layer < layerCount; layer++) {
      // Create point geometry for this layer
      const vertices: number[] = [];
      const colors: number[] = [];
      
      // Position of this layer (stacked along z-axis)
      const zPosition = layer * -8;
      
      // Calculate a more even distribution of points across the entire layer
      for (let i = 0; i < wordsPerLayer && layer * wordsPerLayer + i < totalWords; i++) {
        // Use modulo and division for grid positioning
        const col = i % GRID_SIZE;
        const row = Math.floor(i / GRID_SIZE);
        
        // Distribute points evenly across the grid
        // Scale to fill the entire viewable area
        const x = (col - GRID_SIZE / 2) * 0.6;
        const y = (GRID_SIZE / 2 - row) * 0.6;
        const z = zPosition;
        
        vertices.push(x, y, z);
        
        // Create color with layer depth factor for gradient
        const depthFactor = 0.7 + (layer / layerCount) * 0.6; // Increased brightness
        const color = calculateColor(row, col, depthFactor);
        colors.push(color.r, color.g, color.b);
      }
      
      // Create points geometry
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      // Create points material with larger size for better visibility
      const material = new THREE.PointsMaterial({
        size: POINT_SIZE,
        vertexColors: true,
        transparent: true,
        opacity: 0.9, // Higher opacity for better visibility
        sizeAttenuation: true
      });
      
      // Create points object
      const points = new THREE.Points(geometry, material);
      pointsArray.push(points);
      scene.add(points);
      
      // Also create a semi-transparent plane for each layer
      const planeGeometry = new THREE.PlaneGeometry(GRID_SIZE * 0.6, GRID_SIZE * 0.6);
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x223344, // Slightly bluer for contrast
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
      
      // Find positions of active words
      currentIndices.forEach(index => {
        const layer = Math.floor(index / (wordList.length / LAYERS_COUNT));
        const layerOffset = index % Math.ceil(wordList.length / LAYERS_COUNT);
        
        if (pointsRef.current[layer]) {
          const geometry = pointsRef.current[layer].geometry;
          const position = new THREE.Vector3();
          
          // Get position from buffer attribute
          position.fromBufferAttribute(
            geometry.attributes.position as THREE.BufferAttribute, 
            layerOffset
          );
          
          // Transform to world space
          pointsRef.current[layer].localToWorld(position);
          positions.push(position);
        }
      });
      
      // Create connection lines with improved visibility
      if (positions.length > 1) {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(positions);
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0x00ffff, // Bright cyan
          transparent: true,
          opacity: 0.8, // Higher opacity
          linewidth: 2
        });
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        sceneRef.current.add(line);
        linesRef.current = line;
      }
    }
    
    // Highlight active points with brighter colors
    pointsRef.current.forEach((points, layer) => {
      const geometry = points.geometry;
      const colors = geometry.attributes.color.array as Float32Array;
      
      // Reset all colors
      for (let i = 0; i < colors.length; i += 3) {
        const index = layer * Math.ceil(wordList.length / LAYERS_COUNT) + i / 3;
        const row = Math.floor((i/3) / GRID_SIZE);
        const col = (i/3) % GRID_SIZE;
        const depthFactor = 0.7 + (layer / LAYERS_COUNT) * 0.6;
        const color = calculateColor(row, col, depthFactor);
        
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
      }
      
      // Highlight active indices with much brighter colors
      currentIndices.forEach(index => {
        const activeLayer = Math.floor(index / Math.ceil(wordList.length / LAYERS_COUNT));
        const layerOffset = index % Math.ceil(wordList.length / LAYERS_COUNT);
        
        if (activeLayer === layer) {
          const i = layerOffset * 3;
          // Very bright cyan for active points
          colors[i] = 0.2;     // R - a bit of red for better visibility
          colors[i + 1] = 1.0; // G - full green
          colors[i + 2] = 1.0; // B - full blue
        }
      });
      
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
