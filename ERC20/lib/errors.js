function DomainError(message) {
    Error.call(this, message);
    this.message = message;
  }
  
  DomainError.prototype = Object.create(Error.prototype);
  DomainError.prototype.constructor = DomainError
  
  function InternalError(message) {
    Error.call(this, message);
    this.message = message;
  }
  
  InternalError.prototype = Object.create(Error.prototype);
  InternalError.prototype.constructor = InternalError;
  
  function IOError(message) {
    Error.call(this, message);
    this.message = message;
  }
  
  IOError.prototype = Object.create(Error.prototype);
  IOError.prototype.constructor = IOError;
  
  function BlockChainError(message) {
    IOError.call(this, message);
    this.message = message;
  }
  
  BlockChainError.prototype = Object.create(IOError.prototype);
  BlockChainError.prototype.constructor = BlockChainError;
  
  module.exports = {
    DomainError,
    InternalError,
    IOError,
    BlockChainError
  }