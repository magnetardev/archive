    return Module;
  });
  return initArchivePromise;
}

if (typeof exports === 'object' && typeof module === 'object'){
  module.exports = initArchive;
  module.exports.default = initArchive;
} else if (typeof define === 'function' && define['amd']) {
  define([], function() { return initArchive; });
} else if (typeof exports === 'object'){
  exports["Module"] = initArchive;
}
