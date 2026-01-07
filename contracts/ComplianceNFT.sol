// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title ComplianceNFT
 * @notice Soul-bound (non-transferable) NFT minted after successful compliance audit
 * @dev Optional bonus feature - visually impressive for demo
 */
contract ComplianceNFT {
    /// @notice NFT metadata structure
    struct ComplianceToken {
        bytes32 txId;           // Associated transaction ID
        uint8 auditType;        // Type of audit (0=KYC, 1=AML, 2=YIELD)
        uint256 timestamp;      // When compliance was verified
        address verifier;       // Auditor who verified
        bool exists;            // Token exists flag
    }

    /// @notice Token ID counter
    uint256 private _tokenIdCounter;

    /// @notice Mapping from token ID to compliance data
    mapping(uint256 => ComplianceToken) public tokens;

    /// @notice Mapping from owner to token IDs
    mapping(address => uint256[]) public ownerTokens;

    /// @notice Mapping from token ID to owner
    mapping(uint256 => address) public tokenOwner;

    /// @notice Contract owner (can mint)
    address public owner;

    /// @notice Emitted when a compliance NFT is minted
    event ComplianceNFTMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        bytes32 indexed txId,
        uint8 auditType,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Mint a compliance NFT to a recipient
     * @param recipient Address to receive the NFT
     * @param txId Transaction ID that passed compliance
     * @param auditType Type of audit (0=KYC, 1=AML, 2=YIELD)
     * @param verifier Address of the auditor who verified
     * @return tokenId The ID of the minted token
     */
    function mint(
        address recipient,
        bytes32 txId,
        uint8 auditType,
        address verifier
    ) external onlyOwner returns (uint256) {
        require(recipient != address(0), "Invalid recipient");
        require(auditType <= 2, "Invalid audit type");

        uint256 tokenId = _tokenIdCounter++;

        tokens[tokenId] = ComplianceToken({
            txId: txId,
            auditType: auditType,
            timestamp: block.timestamp,
            verifier: verifier,
            exists: true
        });

        tokenOwner[tokenId] = recipient;
        ownerTokens[recipient].push(tokenId);

        emit ComplianceNFTMinted(tokenId, recipient, txId, auditType, block.timestamp);

        return tokenId;
    }

    /**
     * @notice Get token metadata
     * @param tokenId Token ID to query
     * @return Compliance token data
     */
    function getToken(uint256 tokenId) external view returns (ComplianceToken memory) {
        require(tokens[tokenId].exists, "Token does not exist");
        return tokens[tokenId];
    }

    /**
     * @notice Get all tokens owned by an address
     * @param owner Address to query
     * @return Array of token IDs
     */
    function getTokensByOwner(address owner) external view returns (uint256[] memory) {
        return ownerTokens[owner];
    }

    /**
     * @notice Get total supply of minted tokens
     * @return Total count
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @notice Check if an address owns a token
     * @param owner Address to check
     * @param tokenId Token ID to check
     * @return True if owner owns the token
     */
    function ownsToken(address owner, uint256 tokenId) external view returns (bool) {
        return tokenOwner[tokenId] == owner && tokens[tokenId].exists;
    }

    /**
     * @notice Soul-bound: Transfer is disabled
     * @dev This function always reverts to prevent transfers
     */
    function transfer(address, uint256) external pure {
        revert("Soul-bound: transfers disabled");
    }

    /**
     * @notice Soul-bound: Transfer is disabled
     * @dev This function always reverts to prevent transfers
     */
    function transferFrom(address, address, uint256) external pure {
        revert("Soul-bound: transfers disabled");
    }
}
