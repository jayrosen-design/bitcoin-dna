
import React from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Bitcoin, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import CryptoNavigation from '@/components/CryptoNavigation';

const About = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-medium tracking-tight">
              Quantum Crypto Keybreaker
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">Home</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/about">About</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <div className="prose dark:prose-invert max-w-none">
          <h1>About Quantum Crypto Keybreaker</h1>
          
          <p>Quantum Crypto Keybreaker is an advanced quantum computing service designed for authorized security testing, cryptographic research, and educational demonstrations. Built on state-of-the-art quantum hardware and algorithms, the service explores vulnerabilities in crypto wallet security, particularly those based on seed phrases. Importantly, this app is entirely hypothetical and is presented solely for educational purposes. This lesson demonstrates how scams can be extremely convincing and why rigorous security practices are essential.</p>
          
          <h2>How It Works</h2>
          
          <h3>1. Quantum Computation & Qubits</h3>
          <p><strong>Parallel Processing:</strong> Leveraging the power of qubits, the system can simultaneously explore an enormous number of potential seed phrase combinations—far surpassing the capabilities of classical brute-force methods.</p>
          <p><strong>Superposition:</strong> Qubits allow the system to assess multiple cryptographic states concurrently, optimizing the search for vulnerabilities.</p>
          
          <h3>2. Advanced Quantum Algorithms</h3>
          <p><strong>Algorithmic Foundations:</strong> Inspired by quantum algorithms such as Shor's, the system is tailored to identify and exploit weaknesses in seed phrase generation.</p>
          <p><strong>Optimized Analysis:</strong> These algorithms efficiently evaluate the vast search space to "crack" seed phrases, demonstrating potential cryptographic vulnerabilities.</p>
          
          <h3>3. Cutting-Edge Quantum Hardware</h3>
          <p><strong>High-Performance Processing:</strong> The service utilizes state-of-the-art quantum computing technology, making it possible to process computations that are infeasible for classical systems.</p>
          <p><strong>Scalability:</strong> Designed to evolve alongside quantum hardware advancements, ensuring enhanced processing and refined analytical capabilities.</p>
          
          <h3>4. Security & Ethical Protocols</h3>
          <p><strong>Authorized Use Only:</strong> Quantum Crypto Keybreaker is intended exclusively for ethical research, vulnerability assessments, and educational demonstrations. Unauthorized use is strictly prohibited and subject to legal enforcement.</p>
          <p><strong>Compliance & Collaboration:</strong> The service adheres to industry best practices and regulatory standards, contributing positively to the evolution of blockchain security.</p>
          
          <h3>5. Data Analysis & Reporting</h3>
          <p><strong>Vulnerability Reports:</strong> After analysis, detailed reports outline discovered vulnerabilities, providing actionable insights for developers and security professionals.</p>
          <p><strong>Improvement Recommendations:</strong> These reports offer recommendations to bolster cryptographic defenses, fostering a more secure blockchain ecosystem.</p>
          
          <h2>How to Use the Service</h2>
          <div className="bg-muted p-4 rounded-md mb-4">
            <p className="font-semibold">Please Note: The following instructions are part of a hypothetical scenario created for educational purposes. This demonstration is designed to show how convincing scams can be and to educate students on the importance of verifying authenticity before taking any action.</p>
          </div>
          
          <h3>Unlock Seed Phrases</h3>
          <p>To gain access to view "cracked" seed phrases, the service simulates a payment-based unlock mechanism:</p>
          
          <h4>Deposit Requirement:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
            <div className="border p-4 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Bitcoin className="h-5 w-5 text-bitcoin" />
                <p className="font-semibold">Bitcoin:</p>
              </div>
              <p>Deposit exactly 0.10 BTC to the following Bitcoin address:</p>
              <div className="bg-muted p-2 rounded-md mt-2 overflow-auto">
                <code>3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5</code>
              </div>
            </div>
            
            <div className="border p-4 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-5 w-5 text-ethereum" />
                <p className="font-semibold">Ethereum:</p>
              </div>
              <p>Deposit exactly 4 ETH to the following Ethereum address:</p>
              <div className="bg-muted p-2 rounded-md mt-2 overflow-auto">
                <code>0x742d35Cc6634C0532925a3b844Bc454e4438f44e</code>
              </div>
            </div>
          </div>
          
          <h4>Unlock Process:</h4>
          <ol>
            <li>After making the deposit, click the "I've Sent the Payment" button.</li>
            <li>You will be prompted to copy your wallet and transaction details to verify your payment.</li>
          </ol>
          
          <h4>Verification:</h4>
          <ul>
            <li><strong>Your Wallet Address:</strong> Enter the address you sent from.</li>
            <li><strong>Transaction ID:</strong> Provide the transaction identifier from your payment.</li>
          </ul>
          
          <h4>Access Granted:</h4>
          <p>Once your transaction details are verified, you will unlock unlimited access to view the simulated "cracked" seed phrases.</p>
          
          <Separator className="my-8" />
          
          <div className="bg-destructive/10 dark:bg-destructive/20 p-4 rounded-md border border-destructive/30">
            <h3 className="text-destructive dark:text-destructive/90 mt-0">Disclaimer:</h3>
            <p className="mb-0">This service is a hypothetical demonstration and is used for educational purposes only. It is intended to teach students about potential scam tactics and the critical importance of safeguarding cryptocurrency assets. Do not attempt to use or replicate this system for any unauthorized activities.</p>
          </div>
          
          <p className="mt-8">By studying Quantum Crypto Keybreaker, students learn how seemingly compelling services can be designed to lure users into risky actions, and they gain insight into how to protect themselves against such scams.</p>
        </div>
      </main>
      <footer className="border-t py-4">
        <div className="container flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Quantum Crypto Keybreaker. This is a hypothetical educational service.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
