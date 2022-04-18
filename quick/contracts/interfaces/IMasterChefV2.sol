//SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
import "../libs/IBEP20.sol";
interface IMasterChefV2 {
    function poolLength() external view returns (uint256 pools);

    // function pendingCake(uint256 _pid, address _user)
    //     external
    //     view
    //     returns (uint256);
    function add(uint256 _allocPoint, IBEP20 _lpToken, uint16 _depositFeeBP, bool _withUpdate) external;

    function deposit(uint256 _pid, uint256 _amount) external;

    function withdraw(uint256 _pid, uint256 _amount) external;
    
    // function enterStaking(uint256 _amount) external;

    // function leaveStaking(uint256 _amount) external;

    function emergencyWithdraw(uint256 _pid) external;
}
