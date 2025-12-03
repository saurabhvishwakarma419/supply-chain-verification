// FILE: src/config/blockchain.js
// Blockchain connection configuration (Ethereum/Solana)
// ============================================================================

const { ethers } = require('ethers');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const config = require('./env');
const logger = require('../utils/logger');
const contractABI = require('../contracts/SupplyChain.json');

/**
 * Ethereum/Polygon Blockchain Configuration
 */
class EthereumBlockchain {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.contract = null;
  }

  async initialize() {
    try {
      // Connect to blockchain network
      this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
      
      // Create wallet from private key
      this.wallet = new ethers.Wallet(config.blockchain.privateKey, this.provider);
      
      // Initialize smart contract
      this.contract = new ethers.Contract(
        config.blockchain.contractAddress,
        contractABI.abi,
        this.wallet
      );
      
      // Test connection
      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(this.wallet.address);
      
      logger.info('Ethereum blockchain connected successfully', {
        network: network.name,
        chainId: network.chainId,
        walletAddress: this.wallet.address,
        balance: ethers.formatEther(balance),
      });
      
    } catch (error) {
      logger.error('Ethereum blockchain initialization failed:', error);
      throw error;
    }
  }

  /**
   * Write data to blockchain
   */
  async writeTransaction(functionName, ...args) {
    try {
      const tx = await this.contract[functionName](...args, {
        gasLimit: config.blockchain.gasLimit,
      });
      
      logger.info(`Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      
      logger.info(`Transaction confirmed in block ${receipt.blockNumber}`);
      
      return {
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'success' : 'failed',
      };
      
    } catch (error) {
      logger.error(`Blockchain write error (${functionName}):`, error);
      throw error;
    }
  }

  /**
   * Read data from blockchain
   */
  async readTransaction(functionName, ...args) {
    try {
      const result = await this.contract[functionName](...args);
      return result;
    } catch (error) {
      logger.error(`Blockchain read error (${functionName}):`, error);
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txHash) {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      return {
        transaction: tx,
        receipt: receipt,
      };
    } catch (error) {
      logger.error('Error fetching transaction:', error);
      throw error;
    }
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(functionName, ...args) {
    try {
      const gasEstimate = await this.contract[functionName].estimateGas(...args);
      return gasEstimate.toString();
    } catch (error) {
      logger.error('Gas estimation error:', error);
      throw error;
    }
  }
}

/**
 * Solana Blockchain Configuration
 */
class SolanaBlockchain {
  constructor() {
    this.connection = null;
    this.wallet = null;
  }

  async initialize() {
    try {
      // Connect to Solana cluster
      this.connection = new Connection(config.blockchain.rpcUrl, 'confirmed');
      
      // Create wallet from private key (base58 encoded)
      const secretKey = Uint8Array.from(Buffer.from(config.blockchain.privateKey, 'base64'));
      this.wallet = Keypair.fromSecretKey(secretKey);
      
      // Test connection
      const balance = await this.connection.getBalance(this.wallet.publicKey);
      const version = await this.connection.getVersion();
      
      logger.info('Solana blockchain connected successfully', {
        cluster: config.blockchain.rpcUrl,
        version: version['solana-core'],
        walletAddress: this.wallet.publicKey.toString(),
        balance: balance / 1e9, // Convert lamports to SOL
      });
      
    } catch (error) {
      logger.error('Solana blockchain initialization failed:', error);
      throw error;
    }
  }

  /**
   * Send transaction to Solana
   */
  async sendTransaction(transaction) {
    try {
      const signature = await this.connection.sendTransaction(transaction, [this.wallet]);
      
      logger.info(`Transaction sent: ${signature}`);
      
      const confirmation = await this.connection.confirmTransaction(signature);
      
      logger.info('Transaction confirmed');
      
      return {
        signature,
        confirmation,
      };
      
    } catch (error) {
      logger.error('Solana transaction error:', error);
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(signature) {
    try {
      const tx = await this.connection.getTransaction(signature);
      return tx;
    } catch (error) {
      logger.error('Error fetching Solana transaction:', error);
      throw error;
    }
  }
}

/**
 * Blockchain factory - returns appropriate blockchain instance
 */
const getBlockchain = () => {
  if (config.blockchain.network === 'solana') {
    return new SolanaBlockchain();
  } else {
    return new EthereumBlockchain();
  }
};

// Initialize blockchain connection
let blockchainInstance = null;

const initializeBlockchain = async () => {
  try {
    blockchainInstance = getBlockchain();
    await blockchainInstance.initialize();
    return blockchainInstance;
  } catch (error) {
    logger.error('Failed to initialize blockchain:', error);
    throw error;
  }
};

const getBlockchainInstance = () => {
  if (!blockchainInstance) {
    throw new Error('Blockchain not initialized. Call initializeBlockchain() first.');
  }
  return blockchainInstance;
};

module.exports = {
  initializeBlockchain,
  getBlockchainInstance,
  EthereumBlockchain,
  SolanaBlockchain,
};
