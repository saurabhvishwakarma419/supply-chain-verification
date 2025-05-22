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
        uint256 expiryDate;
        string batchNumber;
        bool isVerified;
        mapping(address => bool) verifiers;
        uint256 verificationCount;
    }

    // Mapping from product ID to Product
    mapping(uint256 => Product) private products;

    // Array to keep track of product IDs
    uint256[] private productIds;

    // Authorized verifiers
    mapping(address => bool) public authorizedVerifiers;

    // Owner (deployer)
    address public owner;

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
     * @dev Register a new product in the supply chain
     */
    function registerProduct(
        uint256 _productId,
        string memory _productName,
        string memory _batchNumber
    ) external {
        require(products[_productId].manufactureDate == 0, "Product already exists");

        Product storage newProduct = products[_productId];
        newProduct.productId = _productId;
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
        require(products[_productId].manufactureDate > 0, "Product does not exist");
        require(!products[_productId].verifiers[msg.sender], "Already verified");

        products[_productId].verifiers[msg.sender] = true;
        products[_productId].verificationCount++;

        if (products[_productId].verificationCount >= 3) {
            products[_productId].isVerified = true;
        }

        emit ProductVerified(_productId, msg.sender);
    }

    /**
     * @dev Check if a product is verified
     */
    function checkProductVerification(uint256 _productId)
        external
        view
        returns (bool isVerified, uint256 verificationCount)
    {
        require(products[_productId].manufactureDate > 0, "Product does not exist");
        return (products[_productId].isVerified, products[_productId].verificationCount);
    }

    /**
     * @dev Add a new authorized verifier
     */
    function authorizeVerifier(address _verifier) external onlyOwner {
        require(!authorizedVerifiers[_verifier], "Already authorized");
        authorizedVerifiers[_verifier] = true;
        emit VerifierAuthorized(_verifier);
    }

    /**
     * @dev Revoke verifier
     */
    function revokeVerifier(address _verifier) external onlyOwner {
        require(authorizedVerifiers[_verifier], "Verifier not authorized");
        authorizedVerifiers[_verifier] = false;
        emit VerifierRevoked(_verifier);
    }

    /**
     * @dev Get the list of all product IDs
     */
    function getAllProductIds() external view returns (uint256[] memory) {
        return productIds;
    }

    /**
     * @dev Get product details (excluding mapping)
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
     * @dev Check if a specific verifier has verified a product
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
     * @dev Check if an address is an authorized verifier
     */
    function getVerifierStatus(address verifier) external view returns (bool) {
        return authorizedVerifiers[verifier];
    }

    /**
     * @dev Update batch number (only by manufacturer)
     */
    function updateBatchNumber(uint256 _productId, string memory _newBatchNumber)
        external
        onlyManufacturer(_productId)
    {
        products[_productId].batchNumber = _newBatchNumber;
        emit BatchNumberUpdated(_productId, _newBatchNumber);
    }

    /**
     * @dev Set expiry date (only by manufacturer)
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
     * @dev Check if product is expired
     */
    function isExpired(uint256 _productId) external view returns (bool) {
        require(products[_productId].manufactureDate > 0, "Product not found");
        uint256 expiry = products[_productId].expiryDate;
        return expiry > 0 && block.timestamp > expiry;
    }

    /**
     * @dev Get total verifier count for a product
     */
    function getVerifierCount(uint256 _productId) external view returns (uint256) {
        require(products[_productId].manufactureDate > 0, "Product not found");
        return products[_productId].verificationCount;
    }

    /**
     * @dev Get product summary (for quick display)
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
}
