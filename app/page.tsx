"use client"
import React, { useState, useEffect } from 'react';
import { Shield, Wallet, Eye, EyeOff, Copy, Moon, Sun, Trash2, Plus } from 'lucide-react';
import { generateMnemonic } from 'bip39';
import { Keypair } from '@solana/web3.js';
import { Wallet as EthersWallet } from 'ethers';
import { toast } from 'sonner';

type BlockchainType = 'ethereum' | 'solana';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert";




interface WalletInfo {
  id: string;
  blockchain: BlockchainType;
  publicKey: string;
  privateKey: string;
}


function App() {
  const [mnemonic, setMnemonic] = useState<string>('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [showPrivateKeys, setShowPrivateKeys] = useState<Record<string, boolean>>({});
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });

  const handleClearWallets = () => {
    localStorage.removeItem("wallets");
    localStorage.removeItem("mnemonics");
    setWallets([]);
    setShowPrivateKeys({});
  
    toast.success("All wallets cleared.");
  };

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const generateNewMnemonic = () => {
    const newMnemonic = generateMnemonic();
    setMnemonic(newMnemonic);
    setWallets([]);
    setShowMnemonic(false);
  };

  const generateWallet = async (blockchain: BlockchainType) => {
    if (!mnemonic) {
      generateNewMnemonic();
      return;
    }

    let newWallet: WalletInfo;
    
    if (blockchain === 'solana') {
      const keypair = Keypair.generate();
      newWallet = {
        id: crypto.randomUUID(),
        blockchain,
        publicKey: keypair.publicKey.toString(),
        privateKey: Buffer.from(keypair.secretKey).toString('hex')
      };
    } else {
      const wallet = EthersWallet.createRandom();
      newWallet = {
        id: crypto.randomUUID(),
        blockchain,
        publicKey: wallet.address,
        privateKey: wallet.privateKey
      };
    }

    setWallets(prev => [...prev, newWallet]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const clearWallets = () => {
    setWallets([]);
    setMnemonic('');
    setShowMnemonic(false);
    setShowPrivateKeys({});
  };

  const togglePrivateKey = (id: string) => {
    setShowPrivateKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const baseClasses = darkMode
    ? "min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white"
    : "min-h-screen bg-gradient-to-br from-gray-100 to-white text-gray-900";

  const cardClasses = darkMode
    ? "bg-gray-800 shadow-xl"
    : "bg-white shadow-lg";

  const inputBgClasses = darkMode
    ? "bg-gray-700"
    : "bg-gray-100";

  const buttonHoverClasses = darkMode
    ? "hover:text-blue-400"
    : "hover:text-blue-600";

  return (
    <div className={baseClasses}>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Shield className="w-8 h-8 mr-2" />
            <h1 className="text-3xl font-bold">Multi-Chain Wallet Generator</h1>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${buttonHoverClasses}`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className={`${cardClasses} p-8 rounded-lg mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Secret Recovery Phrase</h2>
            <div className="flex gap-2">
              <button
                onClick={generateNewMnemonic}
                className={`px-4 py-2 ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} rounded-lg text-white flex items-center`}
              >
                <Plus size={16} className="mr-2" /> New Phrase
              </button>
              <button
                onClick={clearWallets}
                className={`px-4 py-2 ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} rounded-lg text-white flex items-center`}
              >
                <Trash2 size={16} className="mr-2" /> Clear All
              </button>
            </div>
          </div>

          {mnemonic ? (
            <div className={`${inputBgClasses} p-4 rounded-lg mb-6`}>
              {showMnemonic ? (
                <div className="relative">
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    {mnemonic.split(' ').map((word, index) => (
                      <div key={index} className={`${darkMode ? 'bg-gray-600' : 'bg-gray-200'} p-2 rounded text-center`}>
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mr-1`}>{index + 1}.</span>
                        {word}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => copyToClipboard(mnemonic)}
                    className={`absolute top-0 right-0 p-2 ${buttonHoverClasses}`}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowMnemonic(true)}
                  className={`flex items-center justify-center w-full ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                >
                  <Eye className="mr-2" /> Click to reveal recovery phrase
                </button>
              )}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => generateWallet('ethereum')}
              className="p-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-white"
            >
              <Wallet className="mr-2" /> Add Ethereum Wallet
            </button>
            <button
              onClick={() => generateWallet('solana')}
              className="p-4 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center text-white"
            >
              <Wallet className="mr-2" /> Add Solana Wallet
            </button>
          </div>
        </div>

        {wallets.map((wallet) => (
          <div key={wallet.id} className={`${cardClasses} p-6 rounded-lg mb-4`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Wallet className="mr-2" />
                {wallet.blockchain.charAt(0).toUpperCase() + wallet.blockchain.slice(1)} Wallet
              </h3>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="text-red-500 hover:cursor-pointer">
                    <Trash2 size={20} className="mr-2" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this wallet?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. This will permanently delete your wallets and keys from local storage.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="hover:cursor-pointer bg-background hover:bg-accent hover:text-accent-foreground">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearWallets} className="bg-white text-red-500 hover:cursor-pointer hover:bg-gray-200">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Public Key
                </label>
                <div className={`flex items-center ${inputBgClasses} p-3 rounded-lg`}>
                  <input
                    type="text"
                    readOnly
                    value={wallet.publicKey}
                    className="bg-transparent flex-1 outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(wallet.publicKey)}
                    className={`ml-2 p-1 ${buttonHoverClasses}`}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Private Key
                </label>
                <div className={`flex items-center ${inputBgClasses} p-3 rounded-lg`}>
                  <input
                    type={showPrivateKeys[wallet.id] ? "text" : "password"}
                    readOnly
                    value={wallet.privateKey}
                    className="bg-transparent flex-1 outline-none"
                  />
                  <button
                    onClick={() => togglePrivateKey(wallet.id)}
                    className={`ml-2 p-1 ${buttonHoverClasses}`}
                  >
                    {showPrivateKeys[wallet.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(wallet.privateKey)}
                    className={`ml-2 p-1 ${buttonHoverClasses}`}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;