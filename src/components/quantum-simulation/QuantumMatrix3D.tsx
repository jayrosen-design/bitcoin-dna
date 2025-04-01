
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

  // Calculate color based on position - smoother gradient
  const calculateColor = (row: number, col: number, layerFactor = 1) => {
    const gridSize = 45;
    
    // Calculate normalized positions (0 to 1)
    const normalizedRow = row / gridSize;
    const normalizedCol = col / gridSize;
    
    // Create RGB components with smoother transitions
    const r = 0.5 + normalizedCol * 0.4 * layerFactor; // 0.5 to 0.9
    const g = 0.5 + normalizedRow * 0.4 * layerFactor; // 0.5 to 0.9
    const b = 0.7 + ((normalizedRow + normalizedCol) / 2) * 0.3 * layerFactor; // 0.7 to 1.0
    
    return new THREE.Color(r, g, b);
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
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Create controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x444444);
    scene.add(ambientLight);
    
    // Add directional lights
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(1, 1, 1);
    scene.add(dirLight1);
    
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight2.position.set(-1, -1, -1);
    scene.add(dirLight2);
    
    // Add point light
    const pointLight = new THREE.PointLight(0x0088ff, 1, 100);
    pointLight.position.set(0, 0, 50);
    scene.add(pointLight);
    
    // Create 12 layers with words
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
  
  // Create word layers
  const createWordLayers = () => {
    if (!sceneRef.current) return;
    
    const scene = sceneRef.current;
    const layerCount = 12;
    const totalWords = wordList.length;
    const wordsPerLayer = Math.ceil(totalWords / layerCount);
    const gridSize = 45;
    const pointsArray: THREE.Points[] = [];
    
    // Create layers
    for (let layer = 0; layer < layerCount; layer++) {
      // Create point geometry for this layer
      const vertices: number[] = [];
      const colors: number[] = [];
      
      // Position of this layer (stacked along z-axis)
      const zPosition = layer * -8;
      
      // Add words to this layer
      for (let i = 0; i < wordsPerLayer && layer * wordsPerLayer + i < totalWords; i++) {
        const col = i % gridSize;
        const row = Math.floor(i / gridSize);
        
        // Calculate point position
        const x = (col - gridSize / 2) * 0.5;
        const y = (gridSize / 2 - row) * 0.5;
        const z = zPosition;
        
        vertices.push(x, y, z);
        
        // Create color with improved gradient
        const color = calculateColor(row, col, 0.6 + layer * 0.03);
        colors.push(color.r, color.g, color.b);
      }
      
      // Create points geometry
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      
      // Create points material
      const material = new THREE.PointsMaterial({
        size: 0.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
      });
      
      // Create points object
      const points = new THREE.Points(geometry, material);
      pointsArray.push(points);
      scene.add(points);
      
      // Also create a plane for each layer
      const planeGeometry = new THREE.PlaneGeometry(gridSize * 0.5, gridSize * 0.5);
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x111122,
        transparent: true,
        opacity: 0.05,
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
        const layer = Math.floor(index / (wordList.length / 12));
        const layerOffset = index % Math.ceil(wordList.length / 12);
        
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
      
      // Create connection lines
      if (positions.length > 1) {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(positions);
        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.3,
          linewidth: 1
        });
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        sceneRef.current.add(line);
        linesRef.current = line;
      }
    }
    
    // Highlight active points
    pointsRef.current.forEach((points, layer) => {
      const geometry = points.geometry;
      const colors = geometry.attributes.color.array as Float32Array;
      
      // Reset all colors
      for (let i = 0; i < colors.length; i += 3) {
        const index = layer * Math.ceil(wordList.length / 12) + i / 3;
        const row = Math.floor((i/3) / 45);
        const col = (i/3) % 45;
        const color = calculateColor(row, col, 0.6 + layer * 0.03);
        
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
      }
      
      // Highlight active indices
      currentIndices.forEach(index => {
        const activeLayer = Math.floor(index / Math.ceil(wordList.length / 12));
        const layerOffset = index % Math.ceil(wordList.length / 12);
        
        if (activeLayer === layer) {
          const i = layerOffset * 3;
          // Bright cyan for active points
          colors[i] = 0.0;     // R
          colors[i + 1] = 1.0; // G
          colors[i + 2] = 1.0; // B
        }
      });
      
      geometry.attributes.color.needsUpdate = true;
    });
  };
  
  // Update connections when currentIndices or showConnections changes
  useEffect(() => {
    updateActivePoints();
  }, [currentIndices, showConnections]);
  
  return (
    <div ref={containerRef} className="w-full h-full" />
  );
};
