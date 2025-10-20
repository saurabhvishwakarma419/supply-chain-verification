// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title SupplyChainVerification
 * @dev Smart contract for verifying products in a
supply chain
 */
contract SupplyChainVerification {
    // Owner (deployer)
    address public owner;

    // Structure for Product data
    struct Product {
        string productName;
        address manufacturer;
        uint256 manufactureDate;
        uint256 expiryDate;
        string batchNumber;
        bool isVerified;
        uint256 verificationCount;
        mapping(address => bool) verifiers;
    }

    // Mapping from product ID to Product
    mapping(uint256 => Product) private products;

    // List of product IDs
    uint256[] private productIds;

    // Authorized verifiers
    mapping(address => bool) public authorizedVerifiers;

    // Events
    event ProductRegistered(uint256 indexed productId, string productName, address manufacturer, string batchNumber);
    event ProductVerified(uint256 indexed productId, address verifier);
    event VerifierAuthorized(address verifier);
    event VerifierRevoked(address verifier);
    event BatchNumberUpdated(uint256 indexed productId, string newBatchNumber);
    event ExpiryDateSet(uint256 indexed productId, uint256 expiryDate);

    // Modifiers
    modifier onlyAuthorizedVerifier() {
        require(authorizedVerifiers[msg.sender], "Not an authorized verifier");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyManufacturer(uint256 _productId) {
        require(products[_productId].manufacturer == msg.sender, "Only manufacturer can perform this action");
        _;
    }

    // Constructor
    constructor() {
        owner = msg.sender;
        authorizedVerifiers[msg.sender] = true;
        emit VerifierAuthorized(msg.sender);
    }

    /**
     * @dev Register a new product
     */
    function registerProduct(
        uint256 _productId,
        string memory _productName,
        string memory _batchNumber
    ) external {
        require(products[_productId].manufactureDate == 0, "Product already exists");

        Product storage newProduct = products[_productId];
        newProduct.productName = _productName;
        newProduct.manufacturer = msg.sender;
        newProduct.manufactureDate = block.timestamp;
        newProduct.batchNumber = _batchNumber;
        newProduct.isVerified = false;
        newProduct.verificationCount = 0;
        newProduct.expiryDate = 0;

        productIds.push(_productId);

        emit ProductRegistered(_productId, _productName, msg.sender, _batchNumber);
    }

    /**
     * @dev Verify a product
     */
    function verifyProduct(uint256 _productId) external onlyAuthorizedVerifier {
        Product storage product = products[_productId];
        require(product.manufactureDate > 0, "Product does not exist");
        require(!product.verifiers[msg.sender], "Already verified");

        product.verifiers[msg.sender] = true;
        product.verificationCount++;

        if (product.verificationCount >= 3) {
            product.isVerified = true;
        }

        emit ProductVerified(_productId, msg.sender);
    }

    /**
     * @dev Authorize a verifier
     */
    function authorizeVerifier(address _verifier) external onlyOwner {
        require(!authorizedVerifiers[_verifier], "Already authorized");
        authorizedVerifiers[_verifier] = true;
        emit VerifierAuthorized(_verifier);
    }

    /**
     * @dev Revoke a verifier
     */
    function revokeVerifier(address _verifier) external onlyOwner {
        require(authorizedVerifiers[_verifier], "Verifier not authorized");
        authorizedVerifiers[_verifier] = false;
        emit VerifierRevoked(_verifier);
    }

    /**
     * @dev Update batch number (only manufacturer)
     */
    function updateBatchNumber(uint256 _productId, string memory _newBatchNumber)
        external
        onlyManufacturer(_productId)
    {
        products[_productId].batchNumber = _newBatchNumber;
        emit BatchNumberUpdated(_productId, _newBatchNumber);
    }

    /**
     * @dev Set expiry date (only manufacturer)
     */
    function setExpiryDate(uint256 _productId, uint256 _expiryTimestamp)
        external
        onlyManufacturer(_productId)
    {
        require(_expiryTimestamp > block.timestamp, "Expiry must be in the future");
        products[_productId].expiryDate = _expiryTimestamp;
        emit ExpiryDateSet(_productId, _expiryTimestamp);
    }

    /**
     * @dev Get full product details (excluding verifier mapping)
     */
    function getProductDetails(uint256 _productId)
        external
        view
        returns (
            string memory productName,
            address manufacturer,
            uint256 manufactureDate,
            uint256 expiryDate,
            string memory batchNumber,
            bool isVerified,
            uint256 verificationCount
        )
    {
        Product storage p = products[_productId];
        require(p.manufactureDate > 0, "Product not found");

        return (
            p.productName,
            p.manufacturer,
            p.manufactureDate,
            p.expiryDate,
            p.batchNumber,
            p.isVerified,
            p.verificationCount
        );
    }

    /**
     * @dev Check if a verifier verified the product
     */
    function getProductVerifierStatus(uint256 _productId, address verifier)
        external
        view
        returns (bool)
    {
        require(products[_productId].manufactureDate > 0, "Product not found");
        return products[_productId].verifiers[verifier];
    }

    /**
     * @dev Check verification status of product
     */
    function checkProductVerification(uint256 _productId)
        external
        view
        returns (bool isVerified, uint256 verificationCount)
    {
        require(products[_productId].manufactureDate > 0, "Product not found");
        Product storage p = products[_productId];
        return (p.isVerified, p.verificationCount);
    }

    /**
     * @dev Check if a product is expired
     */
    function isExpired(uint256 _productId) external view returns (bool) {
        require(products[_productId].manufactureDate > 0, "Product not found");
        uint256 expiry = products[_productId].expiryDate;
        return expiry > 0 && block.timestamp > expiry;
    }

    /**
     * @dev Get verifier count
     */
    function getVerifierCount(uint256 _productId) external view returns (uint256) {
        require(products[_productId].manufactureDate > 0, "Product not found");
        return products[_productId].verificationCount;
    }

    /**
     * @dev Get all registered product IDs
     */
    function getAllProductIds() external view returns (uint256[] memory) {
        return productIds;
    }

    /**
     * @dev Get a product summary
     */
    function getProductSummary(uint256 _productId)
        external
        view
        returns (
            string memory name,
            string memory batch,
            bool verified,
            bool expired
        )
    {
        Product storage p = products[_productId];
        require(p.manufactureDate > 0, "Product not found");

        return (
            p.productName,
            p.batchNumber,
            p.isVerified,
            p.expiryDate > 0 && block.timestamp > p.expiryDate
        );
    }

    /**
     * @dev Check verifier authorization
     */
    function getVerifierStatus(address verifier) external view returns (bool) {
        return authorizedVerifiers[verifier];
    }
}




