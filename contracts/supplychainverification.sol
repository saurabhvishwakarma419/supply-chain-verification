// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SupplyChainVerification
 * @dev Smart contract for verifying products in a supply chain
 */
contract SupplyChainVerification {
    // Structure for Product data
    struct Product {
        uint256 productId;
        string productName;
        address manufacturer;
        uint256 manufactureDate;
        string batchNumber;
        bool isVerified;
        mapping(address => bool) verifiers;
        uint256 verificationCount;
    }
    
    // Mapping from product ID to Product
    mapping(uint256 => Product) public products;
    
    // Array to keep track of product IDs
    uint256[] public productIds;
    
    // Authorized verifiers
    mapping(address => bool) public authorizedVerifiers;
    
    // Events
    event ProductRegistered(uint256 indexed productId, string productName, address manufacturer, string batchNumber);
    event ProductVerified(uint256 indexed productId, address verifier);
    event VerifierAuthorized(address verifier);
    event VerifierRevoked(address verifier);
    
    // Modifiers
    modifier onlyAuthorizedVerifier() {
        require(authorizedVerifiers[msg.sender], "Not an authorized verifier");
        _;
    }
    
    // Constructor
    constructor() {
        authorizedVerifiers[msg.sender] = true;
        emit VerifierAuthorized(msg.sender);
    }
    
    /**
     * @dev Register a new product in the supply chain
     * @param _productId Unique identifier for the product
     * @param _productName Name of the product
     * @param _batchNumber Batch number of the product
     */
    function registerProduct(
        uint256 _productId,
        string memory _productName,
        string memory _batchNumber
    ) external {
        // Ensure product ID doesn't exist
        require(products[_productId].manufactureDate == 0, "Product already exists");
        
        // Create new product
        Product storage newProduct = products[_productId];
        newProduct.productId = _productId;
        newProduct.productName = _productName;
        newProduct.manufacturer = msg.sender;
        newProduct.manufactureDate = block.timestamp;
        newProduct.batchNumber = _batchNumber;
        newProduct.isVerified = false;
        newProduct.verificationCount = 0;
        
        // Add product ID to the tracking array
        productIds.push(_productId);
        
        // Emit event
        emit ProductRegistered(_productId, _productName, msg.sender, _batchNumber);
    }
    
    /**
     * @dev Verify a product in the supply chain
     * @param _productId ID of the product to verify
     */
    function verifyProduct(uint256 _productId) external onlyAuthorizedVerifier {
        // Ensure product exists
        require(products[_productId].manufactureDate > 0, "Product does not exist");
        
        // Ensure verifier hasn't already verified this product
        require(!products[_productId].verifiers[msg.sender], "Product already verified by this verifier");
        
        // Mark product as verified by this verifier
        products[_productId].verifiers[msg.sender] = true;
        products[_productId].verificationCount++;
        
        // If verification count reaches 3, mark product as fully verified
        if (products[_productId].verificationCount >= 3) {
            products[_productId].isVerified = true;
        }
        
        // Emit event
        emit ProductVerified(_productId, msg.sender);
    }
    
    /**
     * @dev Add a new authorized verifier
     * @param _verifier Address of the verifier to authorize
     */
    function authorizeVerifier(address _verifier) external onlyAuthorizedVerifier {
        require(!authorizedVerifiers[_verifier], "Verifier already authorized");
        authorizedVerifiers[_verifier] = true;
        emit VerifierAuthorized(_verifier);
    }
    
    /**
     * @dev Check if a product is verified
     * @param _productId ID of the product to check
     * @return isVerified Whether the product is verified
     * @return verificationCount Number of verifications
     */
    function checkProductVerification(uint256 _productId) external view 
    returns (bool isVerified, uint256 verificationCount) {
        require(products[_productId].manufactureDate > 0, "Product does not exist");
        return (products[_productId].isVerified, products[_productId].verificationCount);
    }
}
