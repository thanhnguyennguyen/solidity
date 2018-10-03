// solium-disable linebreak-style
pragma solidity ^0.4.24;
import "../tokens/ERC20/ERC20.sol";


// mock class using ERC20
contract ERC20Mock is ERC20 {

    constructor(address initialAccount, string _name, string _symbol, uint256 initialBalance) public {
        name = _name;
        symbol = _symbol;
        _mint(initialAccount, initialBalance);
    }

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public {
        _burn(account, amount);
    }

    function burnFrom(address account, uint256 amount) public {
        _burnFrom(account, amount);
    }

}