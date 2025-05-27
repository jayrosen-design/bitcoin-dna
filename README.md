# Bitcoin DNA

Bitcoin DNA was developed for the **MIT Bitcoin Hackathon 2025**. It is an innovative web application that transforms Bitcoin seed phrases into unique, visually striking DNA-like patterns. Each visualization is deterministically generated from the cryptographic properties of a Bitcoin wallet, creating a unique "genetic fingerprint" that represents the wallet's underlying cryptographic data.

**Devpost:** [https://devpost.com/software/btc-dna](https://devpost.com/software/btc-dna)
**Demo:** [https://bitcoin-dna.lovable.app/](https://bitcoin-dna.lovable.app/)

---

## Animated Bitcoin DNA NFT

![Animated Bitcoin DNA NFT](https://d112y698adiu2z.cloudfront.net/photos/production/software_photos/003/355/370/datas/original.gif)

---

## Overview

Bitcoin DNA merges art, technology, and education by using biological metaphors to represent complex cryptographic concepts. The application not only creates stunning visualizations but also serves as an educational tool to bridge ideas from blockchain technology, cryptography, and digital visualization techniques.

---

## Core Features

### 1. Bitcoin DNA Visualization
- **DNA Helix Generation:** Transforms Bitcoin seed phrases into animated, DNA-like helices.
- **Deterministic Patterns:** Utilizes cryptographic hash functions (SHA-256, SHA-512) to generate consistent, unique visualizations.
- **Live Canvas Rendering:** Provides real-time animation of DNA patterns using the HTML Canvas.
- **Customizable Views:** Offers both 2D and 3D visualization options for the DNA structures.

![2D View](https://github.com/jayrosen-design/bitcoin-dna/raw/main/website-screenshots/Screenshot%202025-04-05%20191628.png)
*2D View*

![3D View 1](https://github.com/jayrosen-design/bitcoin-dna/raw/main/website-screenshots/Screenshot%202025-04-05%20191649.png)
*3D View*

![3D View 2](https://github.com/jayrosen-design/bitcoin-dna/raw/main/website-screenshots/Screenshot%202025-04-05%20191706.png)
*Another 3D View*

### 2. Wallet Interaction & Generation
- **Seed Phrase Generator:** Creates random Bitcoin seed phrases using the BIP39 standard.
- **Upload Capability:** Allows users to upload seed phrase JSON files to generate visualizations.
- **Address Display:** Shows associated Bitcoin addresses with each visualization.
- **Auto-Generation:** Features automatic wallet generation for demonstration purposes.

![Generate Bitcoin DNA 1](https://github.com/jayrosen-design/bitcoin-dna/raw/main/website-screenshots/Screenshot%202025-04-05%20191720.png)
*Generate Bitcoin DNA*

![Generate Bitcoin DNA 2](https://github.com/jayrosen-design/bitcoin-dna/raw/main/website-screenshots/Screenshot%202025-04-05%20191839.png)
*Generate Bitcoin DNA Interface*

![Table View](https://github.com/jayrosen-design/bitcoin-dna/raw/main/website-screenshots/Screenshot%202025-04-05%20191741.png)
*Table View*

![Transaction History](https://github.com/jayrosen-design/bitcoin-dna/raw/main/website-screenshots/Screenshot%202025-04-05%20191806.png)
*Transaction History*

### 3. Gallery & NFT Collection
- **NFT Gallery:** Browsable collection of 50 Bitcoin DNA NFTs.
- **OpenSea Integration:** NFTs are available on the OpenSea Sepolia testnet.
- **Pagination System:** Enables efficient Browse through multiple pages of NFT collections.
- **Lightbox Previews:** Provides interactive, full-size previews of NFT animations.

![Bitcoin DNA Gallery](https://github.com/jayrosen-design/bitcoin-dna/raw/main/website-screenshots/Screenshot%202025-04-05%20191822.png)
*Bitcoin DNA Gallery*

### 4. Matrix Simulation
- **Quantum Matrix:** Simulates a "quantum computer" attempting to crack Bitcoin seed phrases.
- **2D/3D Views:** Allows toggling between different visualization styles for the matrix simulation.
- **Real-time Generation:** Continuously generates and displays new seed phrases and wallet addresses.
- **Visual Connections:** Highlights relationships between words in the seed phrases.

---

## Technical Implementation

### Frontend Architecture
- **React & TypeScript:** Built with React 18 and TypeScript for enhanced type safety.
- **Tailwind CSS:** Uses utility classes and custom animations for styling.
- **ShadCN UI Components:** Leverages pre-built accessible UI components.
- **React Router:** Implements multi-page navigation with client-side routing.

### Animation & Visualization
- **Canvas API:** Core rendering of DNA patterns and the quantum matrix using JavaScript's Canvas API.
- **Three.js:** Provides 3D visualizations of the quantum matrix.
- **Deterministic Algorithms:** Uses seed-based random number generation for consistent visualizations.
- **ASCII Art Techniques:** Incorporates character-based patterns with brightness variations for unique visual effects.

### Cryptographic Features
- **BIP39 Implementation:** Generates standard-compliant Bitcoin seed phrases.
- **Hash Functions:** Employs cryptographic hashing to produce visualization data.
- **Taproot Addresses:** Generates Bitcoin Taproot addresses for demonstration purposes.

---

## User Experience
- **Interactive Elements:** Engaging animations, toggles, and interactive visualizations throughout.
- **Educational Content:** Offers explanations on the connections between Bitcoin and DNA.
- **Visual Feedback:** Ensures consistent loading states, toasts, and smooth visual transitions.
- **Responsive Design:** Adapts seamlessly to different screen sizes and layouts.

---

## Educational Value

Bitcoin DNA serves as an educational bridge between:
- **Cryptocurrency & Blockchain Technology**
- **Cryptographic Principles & Security**
- **Digital Visualization Techniques**
- **Biological DNA Structure Metaphors**

By translating complex cryptographic data into accessible visual formats, the project makes abstract concepts more tangible and engaging.

---

## About

![About Section](https://github.com/jayrosen-design/bitcoin-dna/raw/main/website-screenshots/Screenshot%202025-04-05%20191906.png)
*About Section*

---

## Future Potential

The project has significant room for expansion, including:
- **Additional Cryptocurrency Support:** Extending visualization capabilities beyond Bitcoin.
- **Enhanced NFT Functionality:** Integrating smart contracts for richer NFT interactions.
- **AR/VR Visualizations:** Exploring augmented or virtual reality representations of the DNA patterns.
- **Real-Time Blockchain Integration:** Connecting with live blockchain wallets for dynamic data updates.

---

Bitcoin DNA uniquely merges art, technology, and education to represent the abstract cryptographic foundations of Bitcoin. It demonstrates how applying biological metaphors to digital concepts can make complex ideas more accessible and visually engaging.
