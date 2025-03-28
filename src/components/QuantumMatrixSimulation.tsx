
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib/controls/OrbitControls';
import { FontLoader } from 'three-stdlib/loaders/FontLoader';
import { TextGeometry } from 'three-stdlib/geometries/TextGeometry';
import { wordList } from '@/utils/wordList';

// Target seed phrase (predefined solution)
const TARGET_SEED_PHRASE = [
  'solve', 'quantum', 'digital', 'canvas', 'orbit', 
  'matrix', 'code', 'virtual', 'depth', 'cube', 
  'layer', 'blockchain'
];

const QuantumMatrixSimulation: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const wordMeshesRef = useRef<THREE.Mesh[][]>([]);
  const cubeRef = useRef<THREE.Group | null>(null);
  const cubePiecesRef = useRef<THREE.Mesh[]>([]);
  const lastSolveTimeRef = useRef<number>(0);
  const randomWordsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSolvedRef = useRef<boolean>(false);
  const solveDurationRef = useRef<number>(0);

  // Calculate layer dimensions
  const totalWords = wordList.length; // Approximately 2048 words
  const numLayers = 4;
  const wordsPerLayer = Math.ceil(totalWords / numLayers);
  const gridWidth = 32;
  const gridHeight = Math.ceil(wordsPerLayer / gridWidth);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene, camera, renderer
    const initialize = () => {
      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050510);
      sceneRef.current = scene;

      // Camera
      const width = containerRef.current?.clientWidth || window.innerWidth;
      const height = containerRef.current?.clientHeight || window.innerHeight;
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
      camera.position.set(0, 80, 250);
      cameraRef.current = camera;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      containerRef.current?.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 100;
      controls.maxDistance = 500;
      controlsRef.current = controls;

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x222233, 0.5);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(50, 50, 50);
      scene.add(directionalLight);

      const blueLight = new THREE.PointLight(0x3366ff, 1, 500);
      blueLight.position.set(-100, 50, 50);
      scene.add(blueLight);

      const greenLight = new THREE.PointLight(0x33ff66, 1, 500);
      greenLight.position.set(100, -50, -50);
      scene.add(greenLight);
    };

    // Create multi-layered word grid
    const createWordGrid = () => {
      if (!sceneRef.current) return;

      const scene = sceneRef.current;
      const wordMeshes: THREE.Mesh[][] = [];

      const fontLoader = new FontLoader();
      // You'll need to host and provide the actual font URL
      const fontUrl = 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json';

      fontLoader.load(fontUrl, (font) => {
        // Create layers of words
        for (let layer = 0; layer < numLayers; layer++) {
          const layerWords: THREE.Mesh[] = [];
          const zPosition = layer * -30; // Space layers along z-axis
          const layerGroup = new THREE.Group();
          
          // Create semi-transparent plane for this layer
          const planeGeometry = new THREE.PlaneGeometry(
            gridWidth * 10 + 20, 
            gridHeight * 5 + 20
          );
          const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0x111122,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
          });
          
          const plane = new THREE.Mesh(planeGeometry, planeMaterial);
          plane.position.z = zPosition;
          layerGroup.add(plane);
          
          // Add words to this layer
          for (let i = 0; i < wordsPerLayer && layer * wordsPerLayer + i < wordList.length; i++) {
            const word = wordList[layer * wordsPerLayer + i];
            
            // Create text geometry
            const textGeometry = new TextGeometry(word, {
              font: font,
              size: 2,
              height: 0.1,
            });
            
            // Center the geometry
            textGeometry.computeBoundingBox();
            if (textGeometry.boundingBox) {
              const width = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
              textGeometry.translate(-width / 2, 0, 0);
            }
            
            // Create dim text material - Use MeshStandardMaterial instead of MeshBasicMaterial
            const textMaterial = new THREE.MeshStandardMaterial({
              color: 0x555566,
              transparent: true,
              opacity: 0.6,
              emissive: new THREE.Color(0x000000)
            });
            
            // Create mesh and position within grid
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            const col = i % gridWidth;
            const row = Math.floor(i / gridWidth);
            textMesh.position.set(
              (col - gridWidth / 2) * 10, 
              (gridHeight / 2 - row) * 5,
              zPosition
            );
            
            // Store mesh reference and add to scene
            layerWords.push(textMesh);
            layerGroup.add(textMesh);
          }
          
          scene.add(layerGroup);
          wordMeshes.push(layerWords);
        }
        
        wordMeshesRef.current = wordMeshes;
        
        // Start the random word highlighting process
        startRandomWordHighlighting();
      });
    };

    // Create Rubik's Cube
    const createRubiksCube = () => {
      if (!sceneRef.current) return;
      
      const scene = sceneRef.current;
      const cubeGroup = new THREE.Group();
      const pieces: THREE.Mesh[] = [];
      const size = 5;
      const gap = 0.1;
      const totalSize = 3 * size + 2 * gap;
      
      // Define colors for the cube faces
      const colors = [
        0xff0000, // red (right)
        0xff8800, // orange (left)
        0xffffff, // white (up)
        0xffff00, // yellow (down)
        0x00ff00, // green (front)
        0x0000ff  // blue (back)
      ];
      
      // Create 3x3x3 cube pieces
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            // Skip center piece
            if (x === 0 && y === 0 && z === 0) continue;
            
            const pieceGeometry = new THREE.BoxGeometry(size, size, size);
            const pieceMaterials = [];
            
            // Right/Left faces (x-axis)
            pieceMaterials.push(new THREE.MeshLambertMaterial({ 
              color: x === 1 ? colors[0] : 0x111111 
            }));
            pieceMaterials.push(new THREE.MeshLambertMaterial({ 
              color: x === -1 ? colors[1] : 0x111111 
            }));
            
            // Up/Down faces (y-axis)
            pieceMaterials.push(new THREE.MeshLambertMaterial({ 
              color: y === 1 ? colors[2] : 0x111111 
            }));
            pieceMaterials.push(new THREE.MeshLambertMaterial({ 
              color: y === -1 ? colors[3] : 0x111111 
            }));
            
            // Front/Back faces (z-axis)
            pieceMaterials.push(new THREE.MeshLambertMaterial({ 
              color: z === 1 ? colors[4] : 0x111111 
            }));
            pieceMaterials.push(new THREE.MeshLambertMaterial({ 
              color: z === -1 ? colors[5] : 0x111111 
            }));
            
            const pieceMesh = new THREE.Mesh(pieceGeometry, pieceMaterials);
            pieceMesh.position.set(
              x * (size + gap),
              y * (size + gap),
              z * (size + gap)
            );
            pieceMesh.userData = { x, y, z };
            
            pieces.push(pieceMesh);
            cubeGroup.add(pieceMesh);
          }
        }
      }
      
      // Position cube at the right side of the scene
      cubeGroup.position.set(80, 0, -80);
      
      scene.add(cubeGroup);
      cubeRef.current = cubeGroup;
      cubePiecesRef.current = pieces;
    };

    // Highlight random words
    const highlightRandomWords = () => {
      if (isSolvedRef.current) return;
      
      // Reset all words to dim state
      resetWordHighlights();
      
      // Select 12 random words
      const selectedIndices: number[] = [];
      const totalWordCount = wordList.length;
      
      while (selectedIndices.length < 12) {
        const randomIndex = Math.floor(Math.random() * totalWordCount);
        if (!selectedIndices.includes(randomIndex)) {
          selectedIndices.push(randomIndex);
        }
      }
      
      // Highlight the selected words
      highlightWords(selectedIndices);
    };

    // Reset all word highlights
    const resetWordHighlights = () => {
      wordMeshesRef.current.forEach(layer => {
        layer.forEach(mesh => {
          if (mesh instanceof THREE.Mesh) {
            const material = mesh.material as THREE.MeshStandardMaterial;
            material.color.set(0x555566);
            material.opacity = 0.6;
            material.emissive.set(0x000000);
          }
        });
      });
    };

    // Highlight specific words by their index in the wordList
    const highlightWords = (indices: number[]) => {
      indices.forEach(index => {
        const layerIndex = Math.floor(index / wordsPerLayer);
        const layerOffset = index % wordsPerLayer;
        
        if (layerIndex < wordMeshesRef.current.length && 
            layerOffset < wordMeshesRef.current[layerIndex].length) {
          const mesh = wordMeshesRef.current[layerIndex][layerOffset];
          
          if (mesh) {
            const material = mesh.material as THREE.MeshStandardMaterial;
            material.color.set(0x00ffff);
            material.opacity = 1.0;
            material.emissive.set(0x003333);
          }
        }
      });
    };

    // Start random word highlighting process
    const startRandomWordHighlighting = () => {
      if (randomWordsTimerRef.current) {
        clearInterval(randomWordsTimerRef.current);
      }
      
      randomWordsTimerRef.current = setInterval(() => {
        highlightRandomWords();
      }, 1000);
    };

    // Highlight target seed phrase
    const highlightTargetSeedPhrase = () => {
      isSolvedRef.current = true;
      if (randomWordsTimerRef.current) {
        clearInterval(randomWordsTimerRef.current);
      }
      
      resetWordHighlights();
      
      // Find indices of target seed phrase words
      const targetIndices = TARGET_SEED_PHRASE.map(word => {
        return wordList.findIndex(w => w === word);
      }).filter(index => index !== -1);
      
      // Highlight target words
      highlightWords(targetIndices);
      
      // Set a timer to return to random highlighting
      setTimeout(() => {
        isSolvedRef.current = false;
        startRandomWordHighlighting();
      }, 5000);
    };

    // Animate Rubik's cube faces
    const animateCubeFaces = () => {
      if (!cubeRef.current || isSolvedRef.current) return;
      
      const currentTime = Date.now();
      
      // Check if it's time to solve the cube
      if (currentTime - lastSolveTimeRef.current > 15000) { // Every 15 seconds
        solveCube();
        lastSolveTimeRef.current = currentTime;
        return;
      }
      
      // Regular slow rotation
      if (cubeRef.current) {
        cubeRef.current.rotation.x += 0.001;
        cubeRef.current.rotation.y += 0.002;
      }
    };

    // Solve the cube with animation
    const solveCube = () => {
      if (!cubeRef.current) return;
      
      isSolvedRef.current = true;
      solveDurationRef.current = 0;
      
      // First, do some rapid, random face rotations
      const rotateRandomFaces = (remainingRotations: number) => {
        if (remainingRotations <= 0) {
          // When done with random rotations, snap to solved state
          if (cubeRef.current) {
            cubeRef.current.rotation.set(0, 0, 0);
            
            // Reorganize all cube pieces to solved positions
            cubePiecesRef.current.forEach(piece => {
              const { x, y, z } = piece.userData;
              piece.position.set(
                x * (5 + 0.1),
                y * (5 + 0.1),
                z * (5 + 0.1)
              );
              piece.rotation.set(0, 0, 0);
            });
            
            // Highlight the target seed phrase
            highlightTargetSeedPhrase();
            
            // Schedule return to unsolved state
            setTimeout(() => {
              isSolvedRef.current = false;
            }, 5000);
          }
          return;
        }
        
        // Random face rotation
        const axis = ['x', 'y', 'z'][Math.floor(Math.random() * 3)];
        const direction = Math.random() > 0.5 ? 1 : -1;
        const layer = [-1, 0, 1][Math.floor(Math.random() * 3)];
        
        // Create temporary group for face rotation
        const faceGroup = new THREE.Group();
        
        if (cubeRef.current && sceneRef.current) {
          // Add pieces in the selected layer to the face group
          cubePiecesRef.current.forEach(piece => {
            if (piece.userData[axis] === layer) {
              // Store original position/rotation
              const worldPos = new THREE.Vector3();
              const worldQuat = new THREE.Quaternion();
              piece.getWorldPosition(worldPos);
              piece.getWorldQuaternion(worldQuat);
              
              // Reparent to face group
              cubeRef.current?.remove(piece);
              faceGroup.add(piece);
              
              // Restore world position/rotation
              piece.position.copy(worldPos);
              piece.quaternion.copy(worldQuat);
            }
          });
          
          // Add face group to scene
          sceneRef.current.add(faceGroup);
          
          // Animate the rotation
          const rotateStep = () => {
            faceGroup.rotateOnAxis(
              new THREE.Vector3(
                axis === 'x' ? 1 : 0,
                axis === 'y' ? 1 : 0, 
                axis === 'z' ? 1 : 0
              ),
              direction * 0.1
            );
            
            solveDurationRef.current += 1;
            
            if (solveDurationRef.current % 16 === 0) {
              // Rotation complete, reparent pieces back to cube
              faceGroup.updateMatrixWorld();
              
              while (faceGroup.children.length) {
                const piece = faceGroup.children[0] as THREE.Mesh;
                const worldPos = new THREE.Vector3();
                const worldQuat = new THREE.Quaternion();
                
                piece.getWorldPosition(worldPos);
                piece.getWorldQuaternion(worldQuat);
                
                faceGroup.remove(piece);
                cubeRef.current?.add(piece);
                
                piece.position.copy(worldPos);
                piece.quaternion.copy(worldQuat);
              }
              
              sceneRef.current?.remove(faceGroup);
              
              // Continue with next random rotation
              setTimeout(() => {
                rotateRandomFaces(remainingRotations - 1);
              }, 50);
            } else {
              requestAnimationFrame(rotateStep);
            }
          };
          
          rotateStep();
        }
      };
      
      // Start the sequence of random rotations (10 rotations)
      rotateRandomFaces(10);
    };

    // Animation loop
    const animate = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      animateCubeFaces();
      
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
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };

    // Initialize scene and start animation
    initialize();
    createWordGrid();
    createRubiksCube();
    animate();
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      if (randomWordsTimerRef.current) {
        clearInterval(randomWordsTimerRef.current);
      }
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose geometries and materials to prevent memory leaks
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

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
      style={{ 
        minHeight: '500px',
        background: 'linear-gradient(180deg, rgba(5,5,25,1) 0%, rgba(10,10,40,0.9) 100%)'
      }}
    />
  );
};

export default QuantumMatrixSimulation;
