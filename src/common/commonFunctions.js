
function throttle(func, ms) {

    let savedArgs,
      savedThis;
  
    let timerId = null;
    function wrapper() {
      savedArgs = arguments;
      savedThis = this;
  
      if (timerId)
        clearTimeout(timerId)
  
      timerId = setTimeout(function () {
        timerId = null;
        func.apply(savedThis, savedArgs);
        savedArgs = savedThis = null;
      }, ms);
    }
  
    return wrapper;
  }