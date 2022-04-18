//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IMasterChefV2.sol";
import "./interfaces/IUniswapV2Factory.sol";


contract MasterChefFarms {
    mapping(uint256 => address) public routerAddress;
    mapping(uint256 => address) public factoryAddress;
    mapping(uint256 => address) public masterchefAddress;
    uint256 public lastFeePercantege;
    address public owner;
    address public platformOwner;

    constructor(
        uint256[] memory _protocolIds,
        address[] memory _routers,
        address[] memory _factories,
        address[] memory _chefs,
        address _platformOwner
    ) public {
        require(
            _protocolIds.length == _routers.length &&
                _protocolIds.length == _factories.length &&
                _protocolIds.length == _chefs.length,
            "Parameters not equal length"
        );

        for (uint256 i; i < _protocolIds.length; ++i) {
            routerAddress[_protocolIds[i]] = _routers[i];
            factoryAddress[_protocolIds[i]] = _factories[i];
            masterchefAddress[_protocolIds[i]] = _chefs[i];
        }
        owner = msg.sender;
        platformOwner = _platformOwner;
    }

    function depositFunds(address _tokenAddress, uint256 _amount)
        external
        onlyOwner
    {
        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);
    }

    function withdrawFunds(address _tokenAddress, uint256 _amount)
        external
        onlyOwner
    {
        IERC20(_tokenAddress).transfer(msg.sender, _amount);
    }

    function setPlatformOwner(address _platformOnwer) external onlyPlatform {
        platformOwner = _platformOnwer;
    }

    function getAmountsOut(
        uint256 _protocolId,
        uint256 _amountIn,
        address[] calldata _path
    ) external view returns (uint256[] memory amounts) {
        amounts = IUniswapV2Router02(routerAddress[_protocolId]).getAmountsOut(
            _amountIn,
            _path
        );
        return amounts;
    }

    function swapTokenforToken(
        uint256 _protocolId,
        uint256 _amountIn,
        uint256 _amountOutMin,
        address[] calldata _path,
        address to
    ) external {
        IERC20(_path[0]).approve(routerAddress[_protocolId], 1e18);
        IUniswapV2Router02(routerAddress[_protocolId]).swapExactTokensForTokens(
                _amountIn,
                _amountOutMin,
                _path,
                to,
                block.timestamp + 600
            );
    }

    function swapETHforToken(
        uint256 _protocolId,
        uint256 _amountOutMin,
        address[] calldata _path,
        address to
    ) external payable {
        IERC20(_path[0]).approve(routerAddress[_protocolId], 10e18);
        IUniswapV2Router02(routerAddress[_protocolId]).swapETHForExactTokens{value: msg.value}(
            _amountOutMin,
            _path,
            to,
            block.timestamp + 3600
        );
    }

    function addLiquidity(
        uint256 _protocolId,
        address _tokenA,
        address _tokenB,
        uint256 _amountADesired,
        uint256 _amountBDesired,
        uint256 _amountAMin,
        uint256 _amountBMin
    ) external onlyPlatform {
        IUniswapV2Router02(routerAddress[_protocolId]).addLiquidity(
            _tokenA,
            _tokenB,
            _amountADesired,
            _amountBDesired,
            _amountAMin,
            _amountBMin,
            address(this),
            block.timestamp + 600
        );
    }

    function addLiquidityETH(
        uint256 _protocolId,
        address _token,
        uint256 _amountTokenDesired,
        uint256 _amountTokenMin,
        uint256 _amountETHMin
    ) external onlyPlatform {
        IUniswapV2Router02(routerAddress[_protocolId]).addLiquidityETH(
            _token,
            _amountTokenDesired,
            _amountTokenMin,
            _amountETHMin,
            address(this),
            block.timestamp + 600
        );
    }

    function removeLiquidity(
        uint256 _protocolId,
        address _tokenA,
        address _tokenB,
        uint256 _liquidity,
        uint256 _amountAMin,
        uint256 _amountBMin
    ) external onlyPlatform {
        IUniswapV2Router02(routerAddress[_protocolId]).removeLiquidity(
            _tokenA,
            _tokenB,
            _liquidity,
            _amountAMin,
            _amountBMin,
            address(this),
            block.timestamp + 600
        );
    }

    function removeLiquidityETH(
        uint256 _protocolId,
        address _token,
        uint256 _liquidity,
        uint256 _amountTokenMin,
        uint256 _amountETHMin
    ) external onlyPlatform {
        IUniswapV2Router02(routerAddress[_protocolId]).removeLiquidityETH(
            _token,
            _liquidity,
            _amountTokenMin,
            _amountETHMin,
            address(this),
            block.timestamp + 600
        );
    }

    function depositToFarm(
        uint256 _protocolId,
        address _lpTokenAddress,
        uint256 _poolId,
        uint256 _amount
    ) external onlyPlatform {
        IERC20(_lpTokenAddress).approve(masterchefAddress[_protocolId], 1e18);
        IMasterChefV2(masterchefAddress[_protocolId]).deposit(_poolId, _amount);
    }

    function withdrawFromFarm(
        uint256 _protocolId,
        uint256 _poolId,
        uint256 _amount
    ) external onlyPlatform {
        IMasterChefV2(masterchefAddress[_protocolId]).withdraw(_poolId, _amount);
    }

    function pendingRewards(uint256 _protocolId, uint256 _poolId)
        external
        view
        onlyPlatform
    {
        // IMasterChefV2(masterchefAddress[_protocolId]).pendingCake(
        //     _poolId,
        //     address(this)
        // );
    }
    function getWETH(uint256 _protocolId) external view returns (address weth) {
        return IUniswapV2Router02(routerAddress[_protocolId]).WETH();
    }
    function getPair(uint256 _protocolId, address tokenA, address tokenB) external view returns (address pairAddress) {
        return IUniswapV2Factory(factoryAddress[_protocolId]).getPair(tokenA, tokenB);
    }
    function add(uint256 _protocolId, uint256 _allocPoint, IBEP20 _lpToken, uint16 _depositFeeBP, bool _withUpdate) public {
        return IMasterChefV2(masterchefAddress[_protocolId]).add(_allocPoint, _lpToken, _depositFeeBP, _withUpdate);
    }
    function poolLength(uint256 _protocolId) external view returns (uint256 pools) {
        return IMasterChefV2(masterchefAddress[_protocolId]).poolLength();
    }
    //Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyPlatform() {
        require(msg.sender == platformOwner);
        _;
    }

    //Events
    event DepositedToFarm(uint256 indexed _protocolID, uint256 indexed _farmID);
    event withdrawnFromFarm(
        uint256 indexed _protocolID,
        uint256 indexed _farmID
    );
}
