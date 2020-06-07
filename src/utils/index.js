export const nextOrderStatus = {
  pending: "active",
  active: "completed",
  completed: "delivered",
  delivered: "pending",
  cancelled: "pending",
  archived: "pending",
};

export const nextOrderStatusLabels = {
  pending: "Activate",
  active: "Complete",
  completed: "Deliver",
  delivered: "Reset",
  cancelled: "Reset",
  archived: "Reset",
};

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

export const convertToUnderScoreCase = (str) => {
  return str
    .replace(/\.?([A-Z]+)/g, (x, y) => {
      return "_" + y.toLowerCase();
    })
    .replace(/^_/, "");
};
