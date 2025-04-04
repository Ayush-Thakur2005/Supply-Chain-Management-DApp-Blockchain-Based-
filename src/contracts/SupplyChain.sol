// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SupplyChain {
    enum Status { Manufactured, InTransit, Delivered }
    enum PaymentStatus { Pending, Processing, Completed }

    struct Product {
        string id;
        string name;
        address manufacturer;
        address currentOwner;
        Status status;
        uint256 price;
        PaymentStatus paymentStatus;
        uint256 timestamp;
        string location;
    }

    mapping(string => Product) public products;
    mapping(address => uint256) public balances;

    event ProductCreated(string id, string name, address manufacturer, uint256 price);
    event StatusUpdated(string id, Status status, address from, address to);
    event PaymentProcessed(string id, address from, address to, uint256 amount);

    modifier onlyManufacturer(string memory _productId) {
        require(products[_productId].manufacturer == msg.sender, "Only manufacturer can perform this action");
        _;
    }

    modifier validProduct(string memory _productId) {
        require(bytes(products[_productId].id).length > 0, "Product does not exist");
        _;
    }

    function createProduct(
        string memory _id,
        string memory _name,
        uint256 _price
    ) external {
        require(bytes(products[_id].id).length == 0, "Product already exists");
        
        products[_id] = Product({
            id: _id,
            name: _name,
            manufacturer: msg.sender,
            currentOwner: msg.sender,
            status: Status.Manufactured,
            price: _price,
            paymentStatus: PaymentStatus.Pending,
            timestamp: block.timestamp,
            location: "Manufacturer"
        });

        emit ProductCreated(_id, _name, msg.sender, _price);
    }

    function updateStatus(
        string memory _productId,
        Status _status,
        address _to,
        string memory _location
    ) external validProduct(_productId) {
        Product storage product = products[_productId];
        require(product.currentOwner == msg.sender, "Only current owner can update status");
        
        product.status = _status;
        product.currentOwner = _to;
        product.location = _location;
        product.timestamp = block.timestamp;

        emit StatusUpdated(_productId, _status, msg.sender, _to);
    }

    function processPayment(
        string memory _productId
    ) external payable validProduct(_productId) {
        Product storage product = products[_productId];
        require(product.paymentStatus == PaymentStatus.Pending, "Payment already processed");
        require(msg.value >= product.price, "Insufficient payment amount");

        balances[product.manufacturer] += msg.value;
        product.paymentStatus = PaymentStatus.Completed;

        emit PaymentProcessed(_productId, msg.sender, product.manufacturer, msg.value);
    }

    function getProduct(string memory _productId) external view returns (Product memory) {
        return products[_productId];
    }

    function getBalance(address _address) external view returns (uint256) {
        return balances[_address];
    }
}