/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/clone/clone.js":
/*!*************************************!*\
  !*** ./node_modules/clone/clone.js ***!
  \*************************************/
/***/ ((module) => {

var clone = (function() {
'use strict';

function _instanceof(obj, type) {
  return type != null && obj instanceof type;
}

var nativeMap;
try {
  nativeMap = Map;
} catch(_) {
  // maybe a reference error because no `Map`. Give it a dummy value that no
  // value will ever be an instanceof.
  nativeMap = function() {};
}

var nativeSet;
try {
  nativeSet = Set;
} catch(_) {
  nativeSet = function() {};
}

var nativePromise;
try {
  nativePromise = Promise;
} catch(_) {
  nativePromise = function() {};
}

/**
 * Clones (copies) an Object using deep copying.
 *
 * This function supports circular references by default, but if you are certain
 * there are no circular references in your object, you can save some CPU time
 * by calling clone(obj, false).
 *
 * Caution: if `circular` is false and `parent` contains circular references,
 * your program may enter an infinite loop and crash.
 *
 * @param `parent` - the object to be cloned
 * @param `circular` - set to true if the object to be cloned may contain
 *    circular references. (optional - true by default)
 * @param `depth` - set to a number if the object is only to be cloned to
 *    a particular depth. (optional - defaults to Infinity)
 * @param `prototype` - sets the prototype to be used when cloning an object.
 *    (optional - defaults to parent prototype).
 * @param `includeNonEnumerable` - set to true if the non-enumerable properties
 *    should be cloned as well. Non-enumerable properties on the prototype
 *    chain will be ignored. (optional - false by default)
*/
function clone(parent, circular, depth, prototype, includeNonEnumerable) {
  if (typeof circular === 'object') {
    depth = circular.depth;
    prototype = circular.prototype;
    includeNonEnumerable = circular.includeNonEnumerable;
    circular = circular.circular;
  }
  // maintain two arrays for circular references, where corresponding parents
  // and children have the same index
  var allParents = [];
  var allChildren = [];

  var useBuffer = typeof Buffer != 'undefined';

  if (typeof circular == 'undefined')
    circular = true;

  if (typeof depth == 'undefined')
    depth = Infinity;

  // recurse this function so we don't reset allParents and allChildren
  function _clone(parent, depth) {
    // cloning null always returns null
    if (parent === null)
      return null;

    if (depth === 0)
      return parent;

    var child;
    var proto;
    if (typeof parent != 'object') {
      return parent;
    }

    if (_instanceof(parent, nativeMap)) {
      child = new nativeMap();
    } else if (_instanceof(parent, nativeSet)) {
      child = new nativeSet();
    } else if (_instanceof(parent, nativePromise)) {
      child = new nativePromise(function (resolve, reject) {
        parent.then(function(value) {
          resolve(_clone(value, depth - 1));
        }, function(err) {
          reject(_clone(err, depth - 1));
        });
      });
    } else if (clone.__isArray(parent)) {
      child = [];
    } else if (clone.__isRegExp(parent)) {
      child = new RegExp(parent.source, __getRegExpFlags(parent));
      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
    } else if (clone.__isDate(parent)) {
      child = new Date(parent.getTime());
    } else if (useBuffer && Buffer.isBuffer(parent)) {
      if (Buffer.allocUnsafe) {
        // Node.js >= 4.5.0
        child = Buffer.allocUnsafe(parent.length);
      } else {
        // Older Node.js versions
        child = new Buffer(parent.length);
      }
      parent.copy(child);
      return child;
    } else if (_instanceof(parent, Error)) {
      child = Object.create(parent);
    } else {
      if (typeof prototype == 'undefined') {
        proto = Object.getPrototypeOf(parent);
        child = Object.create(proto);
      }
      else {
        child = Object.create(prototype);
        proto = prototype;
      }
    }

    if (circular) {
      var index = allParents.indexOf(parent);

      if (index != -1) {
        return allChildren[index];
      }
      allParents.push(parent);
      allChildren.push(child);
    }

    if (_instanceof(parent, nativeMap)) {
      parent.forEach(function(value, key) {
        var keyChild = _clone(key, depth - 1);
        var valueChild = _clone(value, depth - 1);
        child.set(keyChild, valueChild);
      });
    }
    if (_instanceof(parent, nativeSet)) {
      parent.forEach(function(value) {
        var entryChild = _clone(value, depth - 1);
        child.add(entryChild);
      });
    }

    for (var i in parent) {
      var attrs;
      if (proto) {
        attrs = Object.getOwnPropertyDescriptor(proto, i);
      }

      if (attrs && attrs.set == null) {
        continue;
      }
      child[i] = _clone(parent[i], depth - 1);
    }

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(parent);
      for (var i = 0; i < symbols.length; i++) {
        // Don't need to worry about cloning a symbol because it is a primitive,
        // like a number or string.
        var symbol = symbols[i];
        var descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
        if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
          continue;
        }
        child[symbol] = _clone(parent[symbol], depth - 1);
        if (!descriptor.enumerable) {
          Object.defineProperty(child, symbol, {
            enumerable: false
          });
        }
      }
    }

    if (includeNonEnumerable) {
      var allPropertyNames = Object.getOwnPropertyNames(parent);
      for (var i = 0; i < allPropertyNames.length; i++) {
        var propertyName = allPropertyNames[i];
        var descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);
        if (descriptor && descriptor.enumerable) {
          continue;
        }
        child[propertyName] = _clone(parent[propertyName], depth - 1);
        Object.defineProperty(child, propertyName, {
          enumerable: false
        });
      }
    }

    return child;
  }

  return _clone(parent, depth);
}

/**
 * Simple flat clone using prototype, accepts only objects, usefull for property
 * override on FLAT configuration object (no nested props).
 *
 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
 * works.
 */
clone.clonePrototype = function clonePrototype(parent) {
  if (parent === null)
    return null;

  var c = function () {};
  c.prototype = parent;
  return new c();
};

// private utility functions

function __objToStr(o) {
  return Object.prototype.toString.call(o);
}
clone.__objToStr = __objToStr;

function __isDate(o) {
  return typeof o === 'object' && __objToStr(o) === '[object Date]';
}
clone.__isDate = __isDate;

function __isArray(o) {
  return typeof o === 'object' && __objToStr(o) === '[object Array]';
}
clone.__isArray = __isArray;

function __isRegExp(o) {
  return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
}
clone.__isRegExp = __isRegExp;

function __getRegExpFlags(re) {
  var flags = '';
  if (re.global) flags += 'g';
  if (re.ignoreCase) flags += 'i';
  if (re.multiline) flags += 'm';
  return flags;
}
clone.__getRegExpFlags = __getRegExpFlags;

return clone;
})();

if ( true && module.exports) {
  module.exports = clone;
}


/***/ }),

/***/ "./node_modules/currency-codes/data.js":
/*!*********************************************!*\
  !*** ./node_modules/currency-codes/data.js ***!
  \*********************************************/
/***/ ((module) => {

/*
	Follows ISO 4217, https://www.iso.org/iso-4217-currency-codes.html
	See https://www.currency-iso.org/dam/downloads/lists/list_one.xml
	Data last updated 2018-08-29
*/

module.exports = [
  {
    "code": "AED",
    "number": "784",
    "digits": 2,
    "currency": "UAE Dirham",
    "countries": [
      "United Arab Emirates (The)"
    ]
  },
  {
    "code": "AFN",
    "number": "971",
    "digits": 2,
    "currency": "Afghani",
    "countries": [
      "Afghanistan"
    ]
  },
  {
    "code": "ALL",
    "number": "008",
    "digits": 2,
    "currency": "Lek",
    "countries": [
      "Albania"
    ]
  },
  {
    "code": "AMD",
    "number": "051",
    "digits": 2,
    "currency": "Armenian Dram",
    "countries": [
      "Armenia"
    ]
  },
  {
    "code": "ANG",
    "number": "532",
    "digits": 2,
    "currency": "Netherlands Antillean Guilder",
    "countries": [
      "Curaçao",
      "Sint Maarten (Dutch Part)"
    ]
  },
  {
    "code": "AOA",
    "number": "973",
    "digits": 2,
    "currency": "Kwanza",
    "countries": [
      "Angola"
    ]
  },
  {
    "code": "ARS",
    "number": "032",
    "digits": 2,
    "currency": "Argentine Peso",
    "countries": [
      "Argentina"
    ]
  },
  {
    "code": "AUD",
    "number": "036",
    "digits": 2,
    "currency": "Australian Dollar",
    "countries": [
      "Australia",
      "Christmas Island",
      "Cocos (Keeling) Islands (The)",
      "Heard Island and Mcdonald Islands",
      "Kiribati",
      "Nauru",
      "Norfolk Island",
      "Tuvalu"
    ]
  },
  {
    "code": "AWG",
    "number": "533",
    "digits": 2,
    "currency": "Aruban Florin",
    "countries": [
      "Aruba"
    ]
  },
  {
    "code": "AZN",
    "number": "944",
    "digits": 2,
    "currency": "Azerbaijan Manat",
    "countries": [
      "Azerbaijan"
    ]
  },
  {
    "code": "BAM",
    "number": "977",
    "digits": 2,
    "currency": "Convertible Mark",
    "countries": [
      "Bosnia and Herzegovina"
    ]
  },
  {
    "code": "BBD",
    "number": "052",
    "digits": 2,
    "currency": "Barbados Dollar",
    "countries": [
      "Barbados"
    ]
  },
  {
    "code": "BDT",
    "number": "050",
    "digits": 2,
    "currency": "Taka",
    "countries": [
      "Bangladesh"
    ]
  },
  {
    "code": "BGN",
    "number": "975",
    "digits": 2,
    "currency": "Bulgarian Lev",
    "countries": [
      "Bulgaria"
    ]
  },
  {
    "code": "BHD",
    "number": "048",
    "digits": 3,
    "currency": "Bahraini Dinar",
    "countries": [
      "Bahrain"
    ]
  },
  {
    "code": "BIF",
    "number": "108",
    "digits": 0,
    "currency": "Burundi Franc",
    "countries": [
      "Burundi"
    ]
  },
  {
    "code": "BMD",
    "number": "060",
    "digits": 2,
    "currency": "Bermudian Dollar",
    "countries": [
      "Bermuda"
    ]
  },
  {
    "code": "BND",
    "number": "096",
    "digits": 2,
    "currency": "Brunei Dollar",
    "countries": [
      "Brunei Darussalam"
    ]
  },
  {
    "code": "BOB",
    "number": "068",
    "digits": 2,
    "currency": "Boliviano",
    "countries": [
      "Bolivia (Plurinational State Of)"
    ]
  },
  {
    "code": "BOV",
    "number": "984",
    "digits": 2,
    "currency": "Mvdol",
    "countries": [
      "Bolivia (Plurinational State Of)"
    ]
  },
  {
    "code": "BRL",
    "number": "986",
    "digits": 2,
    "currency": "Brazilian Real",
    "countries": [
      "Brazil"
    ]
  },
  {
    "code": "BSD",
    "number": "044",
    "digits": 2,
    "currency": "Bahamian Dollar",
    "countries": [
      "Bahamas (The)"
    ]
  },
  {
    "code": "BTN",
    "number": "064",
    "digits": 2,
    "currency": "Ngultrum",
    "countries": [
      "Bhutan"
    ]
  },
  {
    "code": "BWP",
    "number": "072",
    "digits": 2,
    "currency": "Pula",
    "countries": [
      "Botswana"
    ]
  },
  {
    "code": "BYN",
    "number": "933",
    "digits": 2,
    "currency": "Belarusian Ruble",
    "countries": [
      "Belarus"
    ]
  },
  {
    "code": "BZD",
    "number": "084",
    "digits": 2,
    "currency": "Belize Dollar",
    "countries": [
      "Belize"
    ]
  },
  {
    "code": "CAD",
    "number": "124",
    "digits": 2,
    "currency": "Canadian Dollar",
    "countries": [
      "Canada"
    ]
  },
  {
    "code": "CDF",
    "number": "976",
    "digits": 2,
    "currency": "Congolese Franc",
    "countries": [
      "Congo (The Democratic Republic of The)"
    ]
  },
  {
    "code": "CHE",
    "number": "947",
    "digits": 2,
    "currency": "WIR Euro",
    "countries": [
      "Switzerland"
    ]
  },
  {
    "code": "CHF",
    "number": "756",
    "digits": 2,
    "currency": "Swiss Franc",
    "countries": [
      "Liechtenstein",
      "Switzerland"
    ]
  },
  {
    "code": "CHW",
    "number": "948",
    "digits": 2,
    "currency": "WIR Franc",
    "countries": [
      "Switzerland"
    ]
  },
  {
    "code": "CLF",
    "number": "990",
    "digits": 4,
    "currency": "Unidad de Fomento",
    "countries": [
      "Chile"
    ]
  },
  {
    "code": "CLP",
    "number": "152",
    "digits": 0,
    "currency": "Chilean Peso",
    "countries": [
      "Chile"
    ]
  },
  {
    "code": "CNY",
    "number": "156",
    "digits": 2,
    "currency": "Yuan Renminbi",
    "countries": [
      "China"
    ]
  },
  {
    "code": "COP",
    "number": "170",
    "digits": 2,
    "currency": "Colombian Peso",
    "countries": [
      "Colombia"
    ]
  },
  {
    "code": "COU",
    "number": "970",
    "digits": 2,
    "currency": "Unidad de Valor Real",
    "countries": [
      "Colombia"
    ]
  },
  {
    "code": "CRC",
    "number": "188",
    "digits": 2,
    "currency": "Costa Rican Colon",
    "countries": [
      "Costa Rica"
    ]
  },
  {
    "code": "CUC",
    "number": "931",
    "digits": 2,
    "currency": "Peso Convertible",
    "countries": [
      "Cuba"
    ]
  },
  {
    "code": "CUP",
    "number": "192",
    "digits": 2,
    "currency": "Cuban Peso",
    "countries": [
      "Cuba"
    ]
  },
  {
    "code": "CVE",
    "number": "132",
    "digits": 2,
    "currency": "Cabo Verde Escudo",
    "countries": [
      "Cabo Verde"
    ]
  },
  {
    "code": "CZK",
    "number": "203",
    "digits": 2,
    "currency": "Czech Koruna",
    "countries": [
      "Czechia"
    ]
  },
  {
    "code": "DJF",
    "number": "262",
    "digits": 0,
    "currency": "Djibouti Franc",
    "countries": [
      "Djibouti"
    ]
  },
  {
    "code": "DKK",
    "number": "208",
    "digits": 2,
    "currency": "Danish Krone",
    "countries": [
      "Denmark",
      "Faroe Islands (The)",
      "Greenland"
    ]
  },
  {
    "code": "DOP",
    "number": "214",
    "digits": 2,
    "currency": "Dominican Peso",
    "countries": [
      "Dominican Republic (The)"
    ]
  },
  {
    "code": "DZD",
    "number": "012",
    "digits": 2,
    "currency": "Algerian Dinar",
    "countries": [
      "Algeria"
    ]
  },
  {
    "code": "EGP",
    "number": "818",
    "digits": 2,
    "currency": "Egyptian Pound",
    "countries": [
      "Egypt"
    ]
  },
  {
    "code": "ERN",
    "number": "232",
    "digits": 2,
    "currency": "Nakfa",
    "countries": [
      "Eritrea"
    ]
  },
  {
    "code": "ETB",
    "number": "230",
    "digits": 2,
    "currency": "Ethiopian Birr",
    "countries": [
      "Ethiopia"
    ]
  },
  {
    "code": "EUR",
    "number": "978",
    "digits": 2,
    "currency": "Euro",
    "countries": [
      "Åland Islands",
      "Andorra",
      "Austria",
      "Belgium",
      "Cyprus",
      "Estonia",
      "European Union",
      "Finland",
      "France",
      "French Guiana",
      "French Southern Territories (The)",
      "Germany",
      "Greece",
      "Guadeloupe",
      "Holy See (The)",
      "Ireland",
      "Italy",
      "Latvia",
      "Lithuania",
      "Luxembourg",
      "Malta",
      "Martinique",
      "Mayotte",
      "Monaco",
      "Montenegro",
      "Netherlands (The)",
      "Portugal",
      "Réunion",
      "Saint Barthélemy",
      "Saint Martin (French Part)",
      "Saint Pierre and Miquelon",
      "San Marino",
      "Slovakia",
      "Slovenia",
      "Spain"
    ]
  },
  {
    "code": "FJD",
    "number": "242",
    "digits": 2,
    "currency": "Fiji Dollar",
    "countries": [
      "Fiji"
    ]
  },
  {
    "code": "FKP",
    "number": "238",
    "digits": 2,
    "currency": "Falkland Islands Pound",
    "countries": [
      "Falkland Islands (The) [Malvinas]"
    ]
  },
  {
    "code": "GBP",
    "number": "826",
    "digits": 2,
    "currency": "Pound Sterling",
    "countries": [
      "Guernsey",
      "Isle of Man",
      "Jersey",
      "United Kingdom of Great Britain and Northern Ireland (The)"
    ]
  },
  {
    "code": "GEL",
    "number": "981",
    "digits": 2,
    "currency": "Lari",
    "countries": [
      "Georgia"
    ]
  },
  {
    "code": "GHS",
    "number": "936",
    "digits": 2,
    "currency": "Ghana Cedi",
    "countries": [
      "Ghana"
    ]
  },
  {
    "code": "GIP",
    "number": "292",
    "digits": 2,
    "currency": "Gibraltar Pound",
    "countries": [
      "Gibraltar"
    ]
  },
  {
    "code": "GMD",
    "number": "270",
    "digits": 2,
    "currency": "Dalasi",
    "countries": [
      "Gambia (The)"
    ]
  },
  {
    "code": "GNF",
    "number": "324",
    "digits": 0,
    "currency": "Guinean Franc",
    "countries": [
      "Guinea"
    ]
  },
  {
    "code": "GTQ",
    "number": "320",
    "digits": 2,
    "currency": "Quetzal",
    "countries": [
      "Guatemala"
    ]
  },
  {
    "code": "GYD",
    "number": "328",
    "digits": 2,
    "currency": "Guyana Dollar",
    "countries": [
      "Guyana"
    ]
  },
  {
    "code": "HKD",
    "number": "344",
    "digits": 2,
    "currency": "Hong Kong Dollar",
    "countries": [
      "Hong Kong"
    ]
  },
  {
    "code": "HNL",
    "number": "340",
    "digits": 2,
    "currency": "Lempira",
    "countries": [
      "Honduras"
    ]
  },
  {
    "code": "HRK",
    "number": "191",
    "digits": 2,
    "currency": "Kuna",
    "countries": [
      "Croatia"
    ]
  },
  {
    "code": "HTG",
    "number": "332",
    "digits": 2,
    "currency": "Gourde",
    "countries": [
      "Haiti"
    ]
  },
  {
    "code": "HUF",
    "number": "348",
    "digits": 2,
    "currency": "Forint",
    "countries": [
      "Hungary"
    ]
  },
  {
    "code": "IDR",
    "number": "360",
    "digits": 2,
    "currency": "Rupiah",
    "countries": [
      "Indonesia"
    ]
  },
  {
    "code": "ILS",
    "number": "376",
    "digits": 2,
    "currency": "New Israeli Sheqel",
    "countries": [
      "Israel"
    ]
  },
  {
    "code": "INR",
    "number": "356",
    "digits": 2,
    "currency": "Indian Rupee",
    "countries": [
      "Bhutan",
      "India"
    ]
  },
  {
    "code": "IQD",
    "number": "368",
    "digits": 3,
    "currency": "Iraqi Dinar",
    "countries": [
      "Iraq"
    ]
  },
  {
    "code": "IRR",
    "number": "364",
    "digits": 2,
    "currency": "Iranian Rial",
    "countries": [
      "Iran (Islamic Republic Of)"
    ]
  },
  {
    "code": "ISK",
    "number": "352",
    "digits": 0,
    "currency": "Iceland Krona",
    "countries": [
      "Iceland"
    ]
  },
  {
    "code": "JMD",
    "number": "388",
    "digits": 2,
    "currency": "Jamaican Dollar",
    "countries": [
      "Jamaica"
    ]
  },
  {
    "code": "JOD",
    "number": "400",
    "digits": 3,
    "currency": "Jordanian Dinar",
    "countries": [
      "Jordan"
    ]
  },
  {
    "code": "JPY",
    "number": "392",
    "digits": 0,
    "currency": "Yen",
    "countries": [
      "Japan"
    ]
  },
  {
    "code": "KES",
    "number": "404",
    "digits": 2,
    "currency": "Kenyan Shilling",
    "countries": [
      "Kenya"
    ]
  },
  {
    "code": "KGS",
    "number": "417",
    "digits": 2,
    "currency": "Som",
    "countries": [
      "Kyrgyzstan"
    ]
  },
  {
    "code": "KHR",
    "number": "116",
    "digits": 2,
    "currency": "Riel",
    "countries": [
      "Cambodia"
    ]
  },
  {
    "code": "KMF",
    "number": "174",
    "digits": 0,
    "currency": "Comorian Franc ",
    "countries": [
      "Comoros (The)"
    ]
  },
  {
    "code": "KPW",
    "number": "408",
    "digits": 2,
    "currency": "North Korean Won",
    "countries": [
      "Korea (The Democratic People’s Republic Of)"
    ]
  },
  {
    "code": "KRW",
    "number": "410",
    "digits": 0,
    "currency": "Won",
    "countries": [
      "Korea (The Republic Of)"
    ]
  },
  {
    "code": "KWD",
    "number": "414",
    "digits": 3,
    "currency": "Kuwaiti Dinar",
    "countries": [
      "Kuwait"
    ]
  },
  {
    "code": "KYD",
    "number": "136",
    "digits": 2,
    "currency": "Cayman Islands Dollar",
    "countries": [
      "Cayman Islands (The)"
    ]
  },
  {
    "code": "KZT",
    "number": "398",
    "digits": 2,
    "currency": "Tenge",
    "countries": [
      "Kazakhstan"
    ]
  },
  {
    "code": "LAK",
    "number": "418",
    "digits": 2,
    "currency": "Lao Kip",
    "countries": [
      "Lao People’s Democratic Republic (The)"
    ]
  },
  {
    "code": "LBP",
    "number": "422",
    "digits": 2,
    "currency": "Lebanese Pound",
    "countries": [
      "Lebanon"
    ]
  },
  {
    "code": "LKR",
    "number": "144",
    "digits": 2,
    "currency": "Sri Lanka Rupee",
    "countries": [
      "Sri Lanka"
    ]
  },
  {
    "code": "LRD",
    "number": "430",
    "digits": 2,
    "currency": "Liberian Dollar",
    "countries": [
      "Liberia"
    ]
  },
  {
    "code": "LSL",
    "number": "426",
    "digits": 2,
    "currency": "Loti",
    "countries": [
      "Lesotho"
    ]
  },
  {
    "code": "LYD",
    "number": "434",
    "digits": 3,
    "currency": "Libyan Dinar",
    "countries": [
      "Libya"
    ]
  },
  {
    "code": "MAD",
    "number": "504",
    "digits": 2,
    "currency": "Moroccan Dirham",
    "countries": [
      "Morocco",
      "Western Sahara"
    ]
  },
  {
    "code": "MDL",
    "number": "498",
    "digits": 2,
    "currency": "Moldovan Leu",
    "countries": [
      "Moldova (The Republic Of)"
    ]
  },
  {
    "code": "MGA",
    "number": "969",
    "digits": 2,
    "currency": "Malagasy Ariary",
    "countries": [
      "Madagascar"
    ]
  },
  {
    "code": "MKD",
    "number": "807",
    "digits": 2,
    "currency": "Denar",
    "countries": [
      "Macedonia (The Former Yugoslav Republic Of)"
    ]
  },
  {
    "code": "MMK",
    "number": "104",
    "digits": 2,
    "currency": "Kyat",
    "countries": [
      "Myanmar"
    ]
  },
  {
    "code": "MNT",
    "number": "496",
    "digits": 2,
    "currency": "Tugrik",
    "countries": [
      "Mongolia"
    ]
  },
  {
    "code": "MOP",
    "number": "446",
    "digits": 2,
    "currency": "Pataca",
    "countries": [
      "Macao"
    ]
  },
  {
    "code": "MRU",
    "number": "929",
    "digits": 2,
    "currency": "Ouguiya",
    "countries": [
      "Mauritania"
    ]
  },
  {
    "code": "MUR",
    "number": "480",
    "digits": 2,
    "currency": "Mauritius Rupee",
    "countries": [
      "Mauritius"
    ]
  },
  {
    "code": "MVR",
    "number": "462",
    "digits": 2,
    "currency": "Rufiyaa",
    "countries": [
      "Maldives"
    ]
  },
  {
    "code": "MWK",
    "number": "454",
    "digits": 2,
    "currency": "Malawi Kwacha",
    "countries": [
      "Malawi"
    ]
  },
  {
    "code": "MXN",
    "number": "484",
    "digits": 2,
    "currency": "Mexican Peso",
    "countries": [
      "Mexico"
    ]
  },
  {
    "code": "MXV",
    "number": "979",
    "digits": 2,
    "currency": "Mexican Unidad de Inversion (UDI)",
    "countries": [
      "Mexico"
    ]
  },
  {
    "code": "MYR",
    "number": "458",
    "digits": 2,
    "currency": "Malaysian Ringgit",
    "countries": [
      "Malaysia"
    ]
  },
  {
    "code": "MZN",
    "number": "943",
    "digits": 2,
    "currency": "Mozambique Metical",
    "countries": [
      "Mozambique"
    ]
  },
  {
    "code": "NAD",
    "number": "516",
    "digits": 2,
    "currency": "Namibia Dollar",
    "countries": [
      "Namibia"
    ]
  },
  {
    "code": "NGN",
    "number": "566",
    "digits": 2,
    "currency": "Naira",
    "countries": [
      "Nigeria"
    ]
  },
  {
    "code": "NIO",
    "number": "558",
    "digits": 2,
    "currency": "Cordoba Oro",
    "countries": [
      "Nicaragua"
    ]
  },
  {
    "code": "NOK",
    "number": "578",
    "digits": 2,
    "currency": "Norwegian Krone",
    "countries": [
      "Bouvet Island",
      "Norway",
      "Svalbard and Jan Mayen"
    ]
  },
  {
    "code": "NPR",
    "number": "524",
    "digits": 2,
    "currency": "Nepalese Rupee",
    "countries": [
      "Nepal"
    ]
  },
  {
    "code": "NZD",
    "number": "554",
    "digits": 2,
    "currency": "New Zealand Dollar",
    "countries": [
      "Cook Islands (The)",
      "New Zealand",
      "Niue",
      "Pitcairn",
      "Tokelau"
    ]
  },
  {
    "code": "OMR",
    "number": "512",
    "digits": 3,
    "currency": "Rial Omani",
    "countries": [
      "Oman"
    ]
  },
  {
    "code": "PAB",
    "number": "590",
    "digits": 2,
    "currency": "Balboa",
    "countries": [
      "Panama"
    ]
  },
  {
    "code": "PEN",
    "number": "604",
    "digits": 2,
    "currency": "Sol",
    "countries": [
      "Peru"
    ]
  },
  {
    "code": "PGK",
    "number": "598",
    "digits": 2,
    "currency": "Kina",
    "countries": [
      "Papua New Guinea"
    ]
  },
  {
    "code": "PHP",
    "number": "608",
    "digits": 2,
    "currency": "Philippine Peso",
    "countries": [
      "Philippines (The)"
    ]
  },
  {
    "code": "PKR",
    "number": "586",
    "digits": 2,
    "currency": "Pakistan Rupee",
    "countries": [
      "Pakistan"
    ]
  },
  {
    "code": "PLN",
    "number": "985",
    "digits": 2,
    "currency": "Zloty",
    "countries": [
      "Poland"
    ]
  },
  {
    "code": "PYG",
    "number": "600",
    "digits": 0,
    "currency": "Guarani",
    "countries": [
      "Paraguay"
    ]
  },
  {
    "code": "QAR",
    "number": "634",
    "digits": 2,
    "currency": "Qatari Rial",
    "countries": [
      "Qatar"
    ]
  },
  {
    "code": "RON",
    "number": "946",
    "digits": 2,
    "currency": "Romanian Leu",
    "countries": [
      "Romania"
    ]
  },
  {
    "code": "RSD",
    "number": "941",
    "digits": 2,
    "currency": "Serbian Dinar",
    "countries": [
      "Serbia"
    ]
  },
  {
    "code": "RUB",
    "number": "643",
    "digits": 2,
    "currency": "Russian Ruble",
    "countries": [
      "Russian Federation (The)"
    ]
  },
  {
    "code": "RWF",
    "number": "646",
    "digits": 0,
    "currency": "Rwanda Franc",
    "countries": [
      "Rwanda"
    ]
  },
  {
    "code": "SAR",
    "number": "682",
    "digits": 2,
    "currency": "Saudi Riyal",
    "countries": [
      "Saudi Arabia"
    ]
  },
  {
    "code": "SBD",
    "number": "090",
    "digits": 2,
    "currency": "Solomon Islands Dollar",
    "countries": [
      "Solomon Islands"
    ]
  },
  {
    "code": "SCR",
    "number": "690",
    "digits": 2,
    "currency": "Seychelles Rupee",
    "countries": [
      "Seychelles"
    ]
  },
  {
    "code": "SDG",
    "number": "938",
    "digits": 2,
    "currency": "Sudanese Pound",
    "countries": [
      "Sudan (The)"
    ]
  },
  {
    "code": "SEK",
    "number": "752",
    "digits": 2,
    "currency": "Swedish Krona",
    "countries": [
      "Sweden"
    ]
  },
  {
    "code": "SGD",
    "number": "702",
    "digits": 2,
    "currency": "Singapore Dollar",
    "countries": [
      "Singapore"
    ]
  },
  {
    "code": "SHP",
    "number": "654",
    "digits": 2,
    "currency": "Saint Helena Pound",
    "countries": [
      "Saint Helena, Ascension and Tristan Da Cunha"
    ]
  },
  {
    "code": "SLL",
    "number": "694",
    "digits": 2,
    "currency": "Leone",
    "countries": [
      "Sierra Leone"
    ]
  },
  {
    "code": "SOS",
    "number": "706",
    "digits": 2,
    "currency": "Somali Shilling",
    "countries": [
      "Somalia"
    ]
  },
  {
    "code": "SRD",
    "number": "968",
    "digits": 2,
    "currency": "Surinam Dollar",
    "countries": [
      "Suriname"
    ]
  },
  {
    "code": "SSP",
    "number": "728",
    "digits": 2,
    "currency": "South Sudanese Pound",
    "countries": [
      "South Sudan"
    ]
  },
  {
    "code": "STN",
    "number": "930",
    "digits": 2,
    "currency": "Dobra",
    "countries": [
      "Sao Tome and Principe"
    ]
  },
  {
    "code": "SVC",
    "number": "222",
    "digits": 2,
    "currency": "El Salvador Colon",
    "countries": [
      "El Salvador"
    ]
  },
  {
    "code": "SYP",
    "number": "760",
    "digits": 2,
    "currency": "Syrian Pound",
    "countries": [
      "Syrian Arab Republic"
    ]
  },
  {
    "code": "SZL",
    "number": "748",
    "digits": 2,
    "currency": "Lilangeni",
    "countries": [
      "Eswatini"
    ]
  },
  {
    "code": "THB",
    "number": "764",
    "digits": 2,
    "currency": "Baht",
    "countries": [
      "Thailand"
    ]
  },
  {
    "code": "TJS",
    "number": "972",
    "digits": 2,
    "currency": "Somoni",
    "countries": [
      "Tajikistan"
    ]
  },
  {
    "code": "TMT",
    "number": "934",
    "digits": 2,
    "currency": "Turkmenistan New Manat",
    "countries": [
      "Turkmenistan"
    ]
  },
  {
    "code": "TND",
    "number": "788",
    "digits": 3,
    "currency": "Tunisian Dinar",
    "countries": [
      "Tunisia"
    ]
  },
  {
    "code": "TOP",
    "number": "776",
    "digits": 2,
    "currency": "Pa’anga",
    "countries": [
      "Tonga"
    ]
  },
  {
    "code": "TRY",
    "number": "949",
    "digits": 2,
    "currency": "Turkish Lira",
    "countries": [
      "Turkey"
    ]
  },
  {
    "code": "TTD",
    "number": "780",
    "digits": 2,
    "currency": "Trinidad and Tobago Dollar",
    "countries": [
      "Trinidad and Tobago"
    ]
  },
  {
    "code": "TWD",
    "number": "901",
    "digits": 2,
    "currency": "New Taiwan Dollar",
    "countries": [
      "Taiwan (Province of China)"
    ]
  },
  {
    "code": "TZS",
    "number": "834",
    "digits": 2,
    "currency": "Tanzanian Shilling",
    "countries": [
      "Tanzania, United Republic Of"
    ]
  },
  {
    "code": "UAH",
    "number": "980",
    "digits": 2,
    "currency": "Hryvnia",
    "countries": [
      "Ukraine"
    ]
  },
  {
    "code": "UGX",
    "number": "800",
    "digits": 0,
    "currency": "Uganda Shilling",
    "countries": [
      "Uganda"
    ]
  },
  {
    "code": "USD",
    "number": "840",
    "digits": 2,
    "currency": "US Dollar",
    "countries": [
      "American Samoa",
      "Bonaire, Sint Eustatius and Saba",
      "British Indian Ocean Territory (The)",
      "Ecuador",
      "El Salvador",
      "Guam",
      "Haiti",
      "Marshall Islands (The)",
      "Micronesia (Federated States Of)",
      "Northern Mariana Islands (The)",
      "Palau",
      "Panama",
      "Puerto Rico",
      "Timor-Leste",
      "Turks and Caicos Islands (The)",
      "United States Minor Outlying Islands (The)",
      "United States of America (The)",
      "Virgin Islands (British)",
      "Virgin Islands (U.S.)"
    ]
  },
  {
    "code": "USN",
    "number": "997",
    "digits": 2,
    "currency": "US Dollar (Next day)",
    "countries": [
      "United States of America (The)"
    ]
  },
  {
    "code": "UYI",
    "number": "940",
    "digits": 0,
    "currency": "Uruguay Peso en Unidades Indexadas (UI)",
    "countries": [
      "Uruguay"
    ]
  },
  {
    "code": "UYU",
    "number": "858",
    "digits": 2,
    "currency": "Peso Uruguayo",
    "countries": [
      "Uruguay"
    ]
  },
  {
    "code": "UYW",
    "number": "927",
    "digits": 4,
    "currency": "Unidad Previsional",
    "countries": [
      "Uruguay"
    ]
  },
  {
    "code": "UZS",
    "number": "860",
    "digits": 2,
    "currency": "Uzbekistan Sum",
    "countries": [
      "Uzbekistan"
    ]
  },
  {
    "code": "VES",
    "number": "928",
    "digits": 2,
    "currency": "Bolívar Soberano",
    "countries": [
      "Venezuela (Bolivarian Republic Of)"
    ]
  },
  {
    "code": "VND",
    "number": "704",
    "digits": 0,
    "currency": "Dong",
    "countries": [
      "Viet Nam"
    ]
  },
  {
    "code": "VUV",
    "number": "548",
    "digits": 0,
    "currency": "Vatu",
    "countries": [
      "Vanuatu"
    ]
  },
  {
    "code": "WST",
    "number": "882",
    "digits": 2,
    "currency": "Tala",
    "countries": [
      "Samoa"
    ]
  },
  {
    "code": "XAF",
    "number": "950",
    "digits": 0,
    "currency": "CFA Franc BEAC",
    "countries": [
      "Cameroon",
      "Central African Republic (The)",
      "Chad",
      "Congo (The)",
      "Equatorial Guinea",
      "Gabon"
    ]
  },
  {
    "code": "XAG",
    "number": "961",
    "digits": 0,
    "currency": "Silver",
    "countries": [
      "Zz11_silver"
    ]
  },
  {
    "code": "XAU",
    "number": "959",
    "digits": 0,
    "currency": "Gold",
    "countries": [
      "Zz08_gold"
    ]
  },
  {
    "code": "XBA",
    "number": "955",
    "digits": 0,
    "currency": "Bond Markets Unit European Composite Unit (EURCO)",
    "countries": [
      "Zz01_bond Markets Unit European_eurco"
    ]
  },
  {
    "code": "XBB",
    "number": "956",
    "digits": 0,
    "currency": "Bond Markets Unit European Monetary Unit (E.M.U.-6)",
    "countries": [
      "Zz02_bond Markets Unit European_emu-6"
    ]
  },
  {
    "code": "XBC",
    "number": "957",
    "digits": 0,
    "currency": "Bond Markets Unit European Unit of Account 9 (E.U.A.-9)",
    "countries": [
      "Zz03_bond Markets Unit European_eua-9"
    ]
  },
  {
    "code": "XBD",
    "number": "958",
    "digits": 0,
    "currency": "Bond Markets Unit European Unit of Account 17 (E.U.A.-17)",
    "countries": [
      "Zz04_bond Markets Unit European_eua-17"
    ]
  },
  {
    "code": "XCD",
    "number": "951",
    "digits": 2,
    "currency": "East Caribbean Dollar",
    "countries": [
      "Anguilla",
      "Antigua and Barbuda",
      "Dominica",
      "Grenada",
      "Montserrat",
      "Saint Kitts and Nevis",
      "Saint Lucia",
      "Saint Vincent and the Grenadines"
    ]
  },
  {
    "code": "XDR",
    "number": "960",
    "digits": 0,
    "currency": "SDR (Special Drawing Right)",
    "countries": [
      "International Monetary Fund (Imf) "
    ]
  },
  {
    "code": "XOF",
    "number": "952",
    "digits": 0,
    "currency": "CFA Franc BCEAO",
    "countries": [
      "Benin",
      "Burkina Faso",
      "Côte d'Ivoire",
      "Guinea-Bissau",
      "Mali",
      "Niger (The)",
      "Senegal",
      "Togo"
    ]
  },
  {
    "code": "XPD",
    "number": "964",
    "digits": 0,
    "currency": "Palladium",
    "countries": [
      "Zz09_palladium"
    ]
  },
  {
    "code": "XPF",
    "number": "953",
    "digits": 0,
    "currency": "CFP Franc",
    "countries": [
      "French Polynesia",
      "New Caledonia",
      "Wallis and Futuna"
    ]
  },
  {
    "code": "XPT",
    "number": "962",
    "digits": 0,
    "currency": "Platinum",
    "countries": [
      "Zz10_platinum"
    ]
  },
  {
    "code": "XSU",
    "number": "994",
    "digits": 0,
    "currency": "Sucre",
    "countries": [
      "Sistema Unitario De Compensacion Regional De Pagos \"Sucre\""
    ]
  },
  {
    "code": "XTS",
    "number": "963",
    "digits": 0,
    "currency": "Codes specifically reserved for testing purposes",
    "countries": [
      "Zz06_testing_code"
    ]
  },
  {
    "code": "XUA",
    "number": "965",
    "digits": 0,
    "currency": "ADB Unit of Account",
    "countries": [
      "Member Countries of the African Development Bank Group"
    ]
  },
  {
    "code": "XXX",
    "number": "999",
    "digits": 0,
    "currency": "The codes assigned for transactions where no currency is involved",
    "countries": [
      "Zz07_no_currency"
    ]
  },
  {
    "code": "YER",
    "number": "886",
    "digits": 2,
    "currency": "Yemeni Rial",
    "countries": [
      "Yemen"
    ]
  },
  {
    "code": "ZAR",
    "number": "710",
    "digits": 2,
    "currency": "Rand",
    "countries": [
      "Lesotho",
      "Namibia",
      "South Africa"
    ]
  },
  {
    "code": "ZMW",
    "number": "967",
    "digits": 2,
    "currency": "Zambian Kwacha",
    "countries": [
      "Zambia"
    ]
  },
  {
    "code": "ZWL",
    "number": "932",
    "digits": 2,
    "currency": "Zimbabwe Dollar",
    "countries": [
      "Zimbabwe"
    ]
  }
];

/***/ }),

/***/ "./node_modules/currency-codes/index.js":
/*!**********************************************!*\
  !*** ./node_modules/currency-codes/index.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var first = __webpack_require__(/*! first-match */ "./node_modules/first-match/index.js");
var nub = __webpack_require__(/*! nub */ "./node_modules/nub/index.js");
var data = __webpack_require__(/*! ./data */ "./node_modules/currency-codes/data.js");
var publishDate = __webpack_require__(/*! ./iso-4217-publish-date */ "./node_modules/currency-codes/iso-4217-publish-date.js");

var code = function(code) {
  code = code.toUpperCase();

  return first(data, function(c) {
    return c.code === code;
  });
};
var country = function(country) {
  country = country.toLowerCase();

  return data.filter(function(c) {
    return (c.countries.map(function(c) { return c.toLowerCase(); } ) || []).indexOf(country) > -1;
  });
};
var number = function(number) {
  return first(data, function(c) {
    return c.number === String(number);
  });
};
var codes = function() {
  return data.map(function(c) {
    return c.code;
  });
};
var numbers = function() {
  var items = data.map(function(c) {
    return c.number;
  });

  // handle cases where number is undefined (e.g. XFU and XBT)
  return items.filter(function(n) {
    if (n) {
      return n;
    }
  });
};
var countries = function() {
  var m = data
    .filter(function(c) {
      return c.countries;
    })
    .map(function(c) {
      return c.countries;
    });
  return nub(Array.prototype.concat.apply([], m));
};

exports.code = code;
exports.country = country;
exports.number = number;
exports.codes = codes;
exports.numbers = numbers;
exports.countries = countries;
exports.publishDate = publishDate;
exports.data = data;


/***/ }),

/***/ "./node_modules/currency-codes/iso-4217-publish-date.js":
/*!**************************************************************!*\
  !*** ./node_modules/currency-codes/iso-4217-publish-date.js ***!
  \**************************************************************/
/***/ ((module) => {

/*
	Follows ISO 4217, https://www.iso.org/iso-4217-currency-codes.html
	See https://www.currency-iso.org/dam/downloads/lists/list_one.xml
	Data last updated 2018-08-29
*/

module.exports = "2018-08-29";

/***/ }),

/***/ "./node_modules/events/events.js":
/*!***************************************!*\
  !*** ./node_modules/events/events.js ***!
  \***************************************/
/***/ ((module) => {

"use strict";
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}


/***/ }),

/***/ "./node_modules/first-match/index.js":
/*!*******************************************!*\
  !*** ./node_modules/first-match/index.js ***!
  \*******************************************/
/***/ ((module) => {

function truthy(d) {
  return d
};

function first(array, callback, context) {
  var callback = callback || truthy
    , context = context || array
    , value

  for (var i = 0, l = array.length; i < l; i += 1) {
    if (value = callback.call(context, array[i], i)) return array[i]
  }
};

module.exports = first

/***/ }),

/***/ "./node_modules/node-cache/index.js":
/*!******************************************!*\
  !*** ./node_modules/node-cache/index.js ***!
  \******************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

/*
 * node-cache 5.1.2 ( 2020-07-01 )
 * https://github.com/node-cache/node-cache
 *
 * Released under the MIT license
 * https://github.com/node-cache/node-cache/blob/master/LICENSE
 *
 * Maintained by  (  )
*/
(function() {
  var exports;

  exports = module.exports = __webpack_require__(/*! ./lib/node_cache */ "./node_modules/node-cache/lib/node_cache.js");

  exports.version = '5.1.2';

}).call(this);


/***/ }),

/***/ "./node_modules/node-cache/lib/node_cache.js":
/*!***************************************************!*\
  !*** ./node_modules/node-cache/lib/node_cache.js ***!
  \***************************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

/*
 * node-cache 5.1.2 ( 2020-07-01 )
 * https://github.com/node-cache/node-cache
 *
 * Released under the MIT license
 * https://github.com/node-cache/node-cache/blob/master/LICENSE
 *
 * Maintained by  (  )
*/
(function() {
  var EventEmitter, NodeCache, clone,
    splice = [].splice,
    boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } },
    indexOf = [].indexOf;

  clone = __webpack_require__(/*! clone */ "./node_modules/clone/clone.js");

  EventEmitter = (__webpack_require__(/*! events */ "./node_modules/events/events.js").EventEmitter);

  // generate superclass
  module.exports = NodeCache = (function() {
    class NodeCache extends EventEmitter {
      constructor(options = {}) {
        super();
        // ## get

        // get a cached key and change the stats

        // **Parameters:**

        // * `key` ( String | Number ): cache key

        // **Example:**

        //	myCache.get "myKey", ( err, val )

        this.get = this.get.bind(this);
        // ## mget

        // get multiple cached keys at once and change the stats

        // **Parameters:**

        // * `keys` ( String|Number[] ): an array of keys

        // **Example:**

        //	myCache.mget [ "foo", "bar" ]

        this.mget = this.mget.bind(this);
        // ## set

        // set a cached key and change the stats

        // **Parameters:**

        // * `key` ( String | Number ): cache key
        // * `value` ( Any ): A element to cache. If the option `option.forceString` is `true` the module trys to translate it to a serialized JSON
        // * `[ ttl ]` ( Number | String ): ( optional ) The time to live in seconds.

        // **Example:**

        //	myCache.set "myKey", "my_String Value"

        //	myCache.set "myKey", "my_String Value", 10

        this.set = this.set.bind(this);
        
        // ## mset

        // set multiple keys at once

        // **Parameters:**

        // * `keyValueSet` ( Object[] ): an array of object which includes key,value and ttl

        // **Example:**

        //	myCache.mset(
        //		[
        //			{
        //				key: "myKey",
        //				val: "myValue",
        //				ttl: [ttl in seconds]
        //			}
        //		])

        this.mset = this.mset.bind(this);
        // ## del

        // remove keys

        // **Parameters:**

        // * `keys` ( String | Number | String|Number[] ): cache key to delete or a array of cache keys

        // **Return**

        // ( Number ): Number of deleted keys

        // **Example:**

        //	myCache.del( "myKey" )

        this.del = this.del.bind(this);
        // ## take

        // get the cached value and remove the key from the cache.
        // Equivalent to calling `get(key)` + `del(key)`.
        // Useful for implementing `single use` mechanism such as OTP, where once a value is read it will become obsolete.

        // **Parameters:**

        // * `key` ( String | Number ): cache key

        // **Example:**

        //	myCache.take "myKey", ( err, val )

        this.take = this.take.bind(this);
        // ## ttl

        // reset or redefine the ttl of a key. `ttl` = 0 means infinite lifetime.
        // If `ttl` is not passed the default ttl is used.
        // If `ttl` < 0 the key will be deleted.

        // **Parameters:**

        // * `key` ( String | Number ): cache key to reset the ttl value
        // * `ttl` ( Number ): ( optional -> options.stdTTL || 0 ) The time to live in seconds

        // **Return**

        // ( Boolen ): key found and ttl set

        // **Example:**

        //	myCache.ttl( "myKey" ) // will set ttl to default ttl

        //	myCache.ttl( "myKey", 1000 )

        this.ttl = this.ttl.bind(this);
        // ## getTtl

        // receive the ttl of a key.

        // **Parameters:**

        // * `key` ( String | Number ): cache key to check the ttl value

        // **Return**

        // ( Number|undefined ): The timestamp in ms when the key will expire, 0 if it will never expire or undefined if it not exists

        // **Example:**

        //	myCache.getTtl( "myKey" )

        this.getTtl = this.getTtl.bind(this);
        // ## keys

        // list all keys within this cache

        // **Return**

        // ( Array ): An array of all keys

        // **Example:**

        //     _keys = myCache.keys()

        //     # [ "foo", "bar", "fizz", "buzz", "anotherKeys" ]

        this.keys = this.keys.bind(this);
        // ## has

        // Check if a key is cached

        // **Parameters:**

        // * `key` ( String | Number ): cache key to check the ttl value

        // **Return**

        // ( Boolean ): A boolean that indicates if the key is cached

        // **Example:**

        //     _exists = myCache.has('myKey')

        //     # true

        this.has = this.has.bind(this);
        // ## getStats

        // get the stats

        // **Parameters:**

        // -

        // **Return**

        // ( Object ): Stats data

        // **Example:**

        //     myCache.getStats()
        //     # {
        //     # hits: 0,
        //     # misses: 0,
        //     # keys: 0,
        //     # ksize: 0,
        //     # vsize: 0
        //     # }

        this.getStats = this.getStats.bind(this);
        // ## flushAll

        // flush the whole data and reset the stats

        // **Example:**

        //     myCache.flushAll()

        //     myCache.getStats()
        //     # {
        //     # hits: 0,
        //     # misses: 0,
        //     # keys: 0,
        //     # ksize: 0,
        //     # vsize: 0
        //     # }

        this.flushAll = this.flushAll.bind(this);
        
        // ## flushStats

        // flush the stats and reset all counters to 0

        // **Example:**

        //     myCache.flushStats()

        //     myCache.getStats()
        //     # {
        //     # hits: 0,
        //     # misses: 0,
        //     # keys: 0,
        //     # ksize: 0,
        //     # vsize: 0
        //     # }

        this.flushStats = this.flushStats.bind(this);
        // ## close

        // This will clear the interval timeout which is set on checkperiod option.

        // **Example:**

        //     myCache.close()

        this.close = this.close.bind(this);
        // ## _checkData

        // internal housekeeping method.
        // Check all the cached data and delete the invalid values
        this._checkData = this._checkData.bind(this);
        // ## _check

        // internal method the check the value. If it's not valid any more delete it
        this._check = this._check.bind(this);
        // ## _isInvalidKey

        // internal method to check if the type of a key is either `number` or `string`
        this._isInvalidKey = this._isInvalidKey.bind(this);
        // ## _wrap

        // internal method to wrap a value in an object with some metadata
        this._wrap = this._wrap.bind(this);
        // ## _getValLength

        // internal method to calculate the value length
        this._getValLength = this._getValLength.bind(this);
        // ## _error

        // internal method to handle an error message
        this._error = this._error.bind(this);
        // ## _initErrors

        // internal method to generate error message templates
        this._initErrors = this._initErrors.bind(this);
        this.options = options;
        this._initErrors();
        // container for cached data
        this.data = {};
        // module options
        this.options = Object.assign({
          // convert all elements to string
          forceString: false,
          // used standard size for calculating value size
          objectValueSize: 80,
          promiseValueSize: 80,
          arrayValueSize: 40,
          // standard time to live in seconds. 0 = infinity;
          stdTTL: 0,
          // time in seconds to check all data and delete expired keys
          checkperiod: 600,
          // en/disable cloning of variables. If `true` you'll get a copy of the cached variable. If `false` you'll save and get just the reference
          useClones: true,
          // whether values should be deleted automatically at expiration
          deleteOnExpire: true,
          // enable legacy callbacks
          enableLegacyCallbacks: false,
          // max amount of keys that are being stored
          maxKeys: -1
        }, this.options);
        // generate functions with callbacks (legacy)
        if (this.options.enableLegacyCallbacks) {
          console.warn("WARNING! node-cache legacy callback support will drop in v6.x");
          ["get", "mget", "set", "del", "ttl", "getTtl", "keys", "has"].forEach((methodKey) => {
            var oldMethod;
            // reference real function
            oldMethod = this[methodKey];
            this[methodKey] = function(...args) {
              var cb, err, ref, res;
              ref = args, [...args] = ref, [cb] = splice.call(args, -1);
              // return a callback if cb is defined and a function
              if (typeof cb === "function") {
                try {
                  res = oldMethod(...args);
                  cb(null, res);
                } catch (error1) {
                  err = error1;
                  cb(err);
                }
              } else {
                return oldMethod(...args, cb);
              }
            };
          });
        }
        // statistics container
        this.stats = {
          hits: 0,
          misses: 0,
          keys: 0,
          ksize: 0,
          vsize: 0
        };
        // pre allocate valid keytypes array
        this.validKeyTypes = ["string", "number"];
        // initalize checking period
        this._checkData();
        return;
      }

      get(key) {
        var _ret, err;
        boundMethodCheck(this, NodeCache);
        // handle invalid key types
        if ((err = this._isInvalidKey(key)) != null) {
          throw err;
        }
        // get data and incremet stats
        if ((this.data[key] != null) && this._check(key, this.data[key])) {
          this.stats.hits++;
          _ret = this._unwrap(this.data[key]);
          // return data
          return _ret;
        } else {
          // if not found return undefined
          this.stats.misses++;
          return void 0;
        }
      }

      mget(keys) {
        var _err, err, i, key, len, oRet;
        boundMethodCheck(this, NodeCache);
        // convert a string to an array of one key
        if (!Array.isArray(keys)) {
          _err = this._error("EKEYSTYPE");
          throw _err;
        }
        // define return
        oRet = {};
        for (i = 0, len = keys.length; i < len; i++) {
          key = keys[i];
          // handle invalid key types
          if ((err = this._isInvalidKey(key)) != null) {
            throw err;
          }
          // get data and increment stats
          if ((this.data[key] != null) && this._check(key, this.data[key])) {
            this.stats.hits++;
            oRet[key] = this._unwrap(this.data[key]);
          } else {
            // if not found return a error
            this.stats.misses++;
          }
        }
        // return all found keys
        return oRet;
      }

      set(key, value, ttl) {
        var _err, err, existent;
        boundMethodCheck(this, NodeCache);
        // check if cache is overflowing
        if (this.options.maxKeys > -1 && this.stats.keys >= this.options.maxKeys) {
          _err = this._error("ECACHEFULL");
          throw _err;
        }
        // force the data to string
        if (this.options.forceString && !typeof value === "string") {
          value = JSON.stringify(value);
        }
        // set default ttl if not passed
        if (ttl == null) {
          ttl = this.options.stdTTL;
        }
        // handle invalid key types
        if ((err = this._isInvalidKey(key)) != null) {
          throw err;
        }
        // internal helper variables
        existent = false;
        // remove existing data from stats
        if (this.data[key]) {
          existent = true;
          this.stats.vsize -= this._getValLength(this._unwrap(this.data[key], false));
        }
        // set the value
        this.data[key] = this._wrap(value, ttl);
        this.stats.vsize += this._getValLength(value);
        // only add the keys and key-size if the key is new
        if (!existent) {
          this.stats.ksize += this._getKeyLength(key);
          this.stats.keys++;
        }
        this.emit("set", key, value);
        // return true
        return true;
      }

      mset(keyValueSet) {
        var _err, err, i, j, key, keyValuePair, len, len1, ttl, val;
        boundMethodCheck(this, NodeCache);
        // check if cache is overflowing
        if (this.options.maxKeys > -1 && this.stats.keys + keyValueSet.length >= this.options.maxKeys) {
          _err = this._error("ECACHEFULL");
          throw _err;
        }

// loop over keyValueSet to validate key and ttl
        for (i = 0, len = keyValueSet.length; i < len; i++) {
          keyValuePair = keyValueSet[i];
          ({key, val, ttl} = keyValuePair);
          // check if there is ttl and it's a number
          if (ttl && typeof ttl !== "number") {
            _err = this._error("ETTLTYPE");
            throw _err;
          }
          // handle invalid key types
          if ((err = this._isInvalidKey(key)) != null) {
            throw err;
          }
        }
        for (j = 0, len1 = keyValueSet.length; j < len1; j++) {
          keyValuePair = keyValueSet[j];
          ({key, val, ttl} = keyValuePair);
          this.set(key, val, ttl);
        }
        return true;
      }

      del(keys) {
        var delCount, err, i, key, len, oldVal;
        boundMethodCheck(this, NodeCache);
        // convert keys to an array of itself
        if (!Array.isArray(keys)) {
          keys = [keys];
        }
        delCount = 0;
        for (i = 0, len = keys.length; i < len; i++) {
          key = keys[i];
          // handle invalid key types
          if ((err = this._isInvalidKey(key)) != null) {
            throw err;
          }
          // only delete if existent
          if (this.data[key] != null) {
            // calc the stats
            this.stats.vsize -= this._getValLength(this._unwrap(this.data[key], false));
            this.stats.ksize -= this._getKeyLength(key);
            this.stats.keys--;
            delCount++;
            // delete the value
            oldVal = this.data[key];
            delete this.data[key];
            // return true
            this.emit("del", key, oldVal.v);
          }
        }
        return delCount;
      }

      take(key) {
        var _ret;
        boundMethodCheck(this, NodeCache);
        _ret = this.get(key);
        if ((_ret != null)) {
          this.del(key);
        }
        return _ret;
      }

      ttl(key, ttl) {
        var err;
        boundMethodCheck(this, NodeCache);
        ttl || (ttl = this.options.stdTTL);
        if (!key) {
          return false;
        }
        // handle invalid key types
        if ((err = this._isInvalidKey(key)) != null) {
          throw err;
        }
        // check for existent data and update the ttl value
        if ((this.data[key] != null) && this._check(key, this.data[key])) {
          // if ttl < 0 delete the key. otherwise reset the value
          if (ttl >= 0) {
            this.data[key] = this._wrap(this.data[key].v, ttl, false);
          } else {
            this.del(key);
          }
          return true;
        } else {
          // return false if key has not been found
          return false;
        }
      }

      getTtl(key) {
        var _ttl, err;
        boundMethodCheck(this, NodeCache);
        if (!key) {
          return void 0;
        }
        // handle invalid key types
        if ((err = this._isInvalidKey(key)) != null) {
          throw err;
        }
        // check for existant data and update the ttl value
        if ((this.data[key] != null) && this._check(key, this.data[key])) {
          _ttl = this.data[key].t;
          return _ttl;
        } else {
          // return undefined if key has not been found
          return void 0;
        }
      }

      keys() {
        var _keys;
        boundMethodCheck(this, NodeCache);
        _keys = Object.keys(this.data);
        return _keys;
      }

      has(key) {
        var _exists;
        boundMethodCheck(this, NodeCache);
        _exists = (this.data[key] != null) && this._check(key, this.data[key]);
        return _exists;
      }

      getStats() {
        boundMethodCheck(this, NodeCache);
        return this.stats;
      }

      flushAll(_startPeriod = true) {
        boundMethodCheck(this, NodeCache);
        // parameter just for testing

        // set data empty
        this.data = {};
        // reset stats
        this.stats = {
          hits: 0,
          misses: 0,
          keys: 0,
          ksize: 0,
          vsize: 0
        };
        // reset check period
        this._killCheckPeriod();
        this._checkData(_startPeriod);
        this.emit("flush");
      }

      flushStats() {
        boundMethodCheck(this, NodeCache);
        // reset stats
        this.stats = {
          hits: 0,
          misses: 0,
          keys: 0,
          ksize: 0,
          vsize: 0
        };
        this.emit("flush_stats");
      }

      close() {
        boundMethodCheck(this, NodeCache);
        this._killCheckPeriod();
      }

      _checkData(startPeriod = true) {
        var key, ref, value;
        boundMethodCheck(this, NodeCache);
        ref = this.data;
        // run the housekeeping method
        for (key in ref) {
          value = ref[key];
          this._check(key, value);
        }
        if (startPeriod && this.options.checkperiod > 0) {
          this.checkTimeout = setTimeout(this._checkData, this.options.checkperiod * 1000, startPeriod);
          if ((this.checkTimeout != null) && (this.checkTimeout.unref != null)) {
            this.checkTimeout.unref();
          }
        }
      }

      // ## _killCheckPeriod

      // stop the checkdata period. Only needed to abort the script in testing mode.
      _killCheckPeriod() {
        if (this.checkTimeout != null) {
          return clearTimeout(this.checkTimeout);
        }
      }

      _check(key, data) {
        var _retval;
        boundMethodCheck(this, NodeCache);
        _retval = true;
        // data is invalid if the ttl is too old and is not 0
        // console.log data.t < Date.now(), data.t, Date.now()
        if (data.t !== 0 && data.t < Date.now()) {
          if (this.options.deleteOnExpire) {
            _retval = false;
            this.del(key);
          }
          this.emit("expired", key, this._unwrap(data));
        }
        return _retval;
      }

      _isInvalidKey(key) {
        var ref;
        boundMethodCheck(this, NodeCache);
        if (ref = typeof key, indexOf.call(this.validKeyTypes, ref) < 0) {
          return this._error("EKEYTYPE", {
            type: typeof key
          });
        }
      }

      _wrap(value, ttl, asClone = true) {
        var livetime, now, oReturn, ttlMultiplicator;
        boundMethodCheck(this, NodeCache);
        if (!this.options.useClones) {
          asClone = false;
        }
        // define the time to live
        now = Date.now();
        livetime = 0;
        ttlMultiplicator = 1000;
        // use given ttl
        if (ttl === 0) {
          livetime = 0;
        } else if (ttl) {
          livetime = now + (ttl * ttlMultiplicator);
        } else {
          // use standard ttl
          if (this.options.stdTTL === 0) {
            livetime = this.options.stdTTL;
          } else {
            livetime = now + (this.options.stdTTL * ttlMultiplicator);
          }
        }
        // return the wrapped value
        return oReturn = {
          t: livetime,
          v: asClone ? clone(value) : value
        };
      }

      // ## _unwrap

      // internal method to extract get the value out of the wrapped value
      _unwrap(value, asClone = true) {
        if (!this.options.useClones) {
          asClone = false;
        }
        if (value.v != null) {
          if (asClone) {
            return clone(value.v);
          } else {
            return value.v;
          }
        }
        return null;
      }

      // ## _getKeyLength

      // internal method the calculate the key length
      _getKeyLength(key) {
        return key.toString().length;
      }

      _getValLength(value) {
        boundMethodCheck(this, NodeCache);
        if (typeof value === "string") {
          // if the value is a String get the real length
          return value.length;
        } else if (this.options.forceString) {
          // force string if it's defined and not passed
          return JSON.stringify(value).length;
        } else if (Array.isArray(value)) {
          // if the data is an Array multiply each element with a defined default length
          return this.options.arrayValueSize * value.length;
        } else if (typeof value === "number") {
          return 8;
        } else if (typeof (value != null ? value.then : void 0) === "function") {
          // if the data is a Promise, use defined default
          // (can't calculate actual/resolved value size synchronously)
          return this.options.promiseValueSize;
        } else if (typeof Buffer !== "undefined" && Buffer !== null ? Buffer.isBuffer(value) : void 0) {
          return value.length;
        } else if ((value != null) && typeof value === "object") {
          // if the data is an Object multiply each element with a defined default length
          return this.options.objectValueSize * Object.keys(value).length;
        } else if (typeof value === "boolean") {
          return 8;
        } else {
          // default fallback
          return 0;
        }
      }

      _error(type, data = {}) {
        var error;
        boundMethodCheck(this, NodeCache);
        // generate the error object
        error = new Error();
        error.name = type;
        error.errorcode = type;
        error.message = this.ERRORS[type] != null ? this.ERRORS[type](data) : "-";
        error.data = data;
        // return the error object
        return error;
      }

      _initErrors() {
        var _errMsg, _errT, ref;
        boundMethodCheck(this, NodeCache);
        this.ERRORS = {};
        ref = this._ERRORS;
        for (_errT in ref) {
          _errMsg = ref[_errT];
          this.ERRORS[_errT] = this.createErrorMessage(_errMsg);
        }
      }

      createErrorMessage(errMsg) {
        return function(args) {
          return errMsg.replace("__key", args.type);
        };
      }

    };

    NodeCache.prototype._ERRORS = {
      "ENOTFOUND": "Key `__key` not found",
      "ECACHEFULL": "Cache max keys amount exceeded",
      "EKEYTYPE": "The key argument has to be of type `string` or `number`. Found: `__key`",
      "EKEYSTYPE": "The keys argument has to be an array.",
      "ETTLTYPE": "The ttl argument has to be a number."
    };

    return NodeCache;

  }).call(this);

}).call(this);


/***/ }),

/***/ "./node_modules/nub/index.js":
/*!***********************************!*\
  !*** ./node_modules/nub/index.js ***!
  \***********************************/
/***/ ((module) => {

var nub = module.exports = function (xs, cmp) {
    if (typeof xs === 'function' || cmp) {
        return nub.by(xs, cmp);
    }
    
    var keys = {
        'object' : [],
        'function' : [],
        'string' : {},
        'number' : {},
        'boolean' : {},
        'undefined' : {}
    };
    
    var res = [];
    
    for (var i = 0; i < xs.length; i++) {
        var x = xs[i];
        var recs = x === '__proto__'
            ? keys.objects
            : keys[typeof x] || keys.objects
        ;
        
        if (Array.isArray(recs)) {
            if (recs.indexOf(x) < 0) {
                recs.push(x);
                res.push(x);
            }
        }
        else if (!Object.hasOwnProperty.call(recs, x)) {
            recs[x] = true;
            res.push(x);
        }
    }
    
    return res;
};

nub.by = function (xs, cmp) {
    if (typeof xs === 'function') {
        var cmp_ = cmp;
        cmp = xs;
        xs = cmp_;
    }
    
    var res = [];
    
    for (var i = 0; i < xs.length; i++) {
        var x = xs[i];
        
        var found = false;
        for (var j = 0; j < res.length; j++) {
            var y = res[j];
            if (cmp.call(res, x, y)) {
                found = true;
                break;
            }
        }
        
        if (!found) res.push(x);
    }
    
    return res;
};


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!***************************!*\
  !*** ./src/index_mono.js ***!
  \***************************/
const NodeCache = __webpack_require__(/*! node-cache */ "./node_modules/node-cache/index.js");
const cc = __webpack_require__(/*! currency-codes */ "./node_modules/currency-codes/index.js");
// console.log(cc);

const selectFrom = document.getElementById('selectFrom');
const selectTo = document.getElementById('selectTo');
const inputFrom = document.getElementById('inputFrom')
const inputTo = document.getElementById('inputTo');
const myCache = new NodeCache({ stdTTL: 100, checkperiod: 120 });

async function getCurrency() {
    let value = myCache.get("values");
    if (!value) {
        console.log('cache not found');
        let response = await fetch('https://api.monobank.ua/bank/currency');
        let data = await response.json();
        myCache.set("values", data, 600);
        return data;
    }
    else {
        console.log('cache found');
        return value;
    }

}

async function getCur() {
    const data = await getCurrency()
    console.log({ data });

    let options = data.map(item => {
        if (item.rateBuy != undefined) {
            return `<option value="${item.currencyCodeA}">${item.rateBuy}</option>`;
        } else {
            return `<option value="${item.currencyCodeA}">${item.rateCross}</option>`;
        }
    });
    
    for (let value of Object.values(data)) {
        console.log(cc.number(value.currencyCodeA));
    }

    selectFrom.innerHTML = options.join("\n");
    selectTo.innerHTML = options.join("\n");
    console.log(selectFrom)
    // console.log(selectTo)

    inputFrom.addEventListener('change', () => convert(data));
    selectFrom.addEventListener('change', () => convert(data));
    selectTo.addEventListener('change', () => convert(data));
    
};

getCur();

function convert(data) {
    let selectFromValue = data.find((element) => {
        return (element.currencyCodeA == selectFrom.value);
    });

    let selectToValue = data.find((element) => {
        return (element.currencyCodeA == cselectTo.value)
    });
    let crossCur = selectFromValue.rateBuy / selectToValue.rateBuy;
    inputTo.value = (crossCur * inputFrom.value).toFixed(2);

};


})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7QUFBQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxTQUFTO0FBQ1QsT0FBTztBQUNQLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxzQkFBc0Isb0JBQW9CO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxzQkFBc0IsNkJBQTZCO0FBQ25EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLENBQUM7O0FBRUQsSUFBSSxLQUEwQjtBQUM5QjtBQUNBOzs7Ozs7Ozs7OztBQ2hRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7Ozs7O0FDbnJEQSxZQUFZLG1CQUFPLENBQUMsd0RBQWE7QUFDakMsVUFBVSxtQkFBTyxDQUFDLHdDQUFLO0FBQ3ZCLFdBQVcsbUJBQU8sQ0FBQyxxREFBUTtBQUMzQixrQkFBa0IsbUJBQU8sQ0FBQyx1RkFBeUI7O0FBRW5EO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwwQ0FBMEMsMEJBQTBCO0FBQ3BFLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQSxZQUFZO0FBQ1osZUFBZTtBQUNmLGNBQWM7QUFDZCxhQUFhO0FBQ2IsZUFBZTtBQUNmLGlCQUFpQjtBQUNqQixtQkFBbUI7QUFDbkIsWUFBWTs7Ozs7Ozs7Ozs7QUMzRFo7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7Ozs7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVhOztBQUViO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQjs7QUFFbkI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxrQkFBa0Isc0JBQXNCO0FBQ3hDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWU7QUFDZjs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBLG9CQUFvQixTQUFTO0FBQzdCO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7O0FBRUEsa0NBQWtDLFFBQVE7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixpQkFBaUI7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQSx1Q0FBdUMsUUFBUTtBQUMvQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esa0JBQWtCLE9BQU87QUFDekI7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUyx5QkFBeUI7QUFDbEM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxrQkFBa0IsZ0JBQWdCO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsOERBQThELFlBQVk7QUFDMUU7QUFDQSw4REFBOEQsWUFBWTtBQUMxRTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLFlBQVk7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxJQUFJO0FBQ0o7QUFDQTtBQUNBOzs7Ozs7Ozs7OztBQ2hmQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsb0NBQW9DLE9BQU87QUFDM0M7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxZQUFZLDJHQUE0Qzs7QUFFeEQ7O0FBRUEsQ0FBQzs7Ozs7Ozs7Ozs7QUNoQkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseURBQXlELDBDQUEwQyxxRUFBcUU7QUFDeEs7O0FBRUEsVUFBVSxtQkFBTyxDQUFDLDRDQUFPOztBQUV6QixpQkFBaUIsbUZBQThCOztBQUUvQztBQUNBO0FBQ0E7QUFDQSw4QkFBOEI7QUFDOUI7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUMsU0FBUztBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4Q0FBOEMsU0FBUztBQUN2RDtBQUNBLFlBQVksZUFBZTtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtDQUErQyxVQUFVO0FBQ3pEO0FBQ0EsWUFBWSxlQUFlO0FBQzNCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUMsU0FBUztBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw0QkFBNEI7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLEdBQUc7O0FBRUgsQ0FBQzs7Ozs7Ozs7Ozs7QUNqeUJEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckIscUJBQXFCO0FBQ3JCLHNCQUFzQjtBQUN0QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLGVBQWU7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsZUFBZTtBQUNuQztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0JBQWdCO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztVQy9EQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7Ozs7Ozs7QUN0QkEsa0JBQWtCLG1CQUFPLENBQUMsc0RBQVk7QUFDdEMsV0FBVyxtQkFBTyxDQUFDLDhEQUFnQjtBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQ0FBZ0MsK0JBQStCO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLE1BQU07QUFDeEI7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLG1CQUFtQixJQUFJLGFBQWE7QUFDekUsVUFBVTtBQUNWLHFDQUFxQyxtQkFBbUIsSUFBSSxlQUFlO0FBQzNFO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL29ubGluZV9jb252ZXJ0ZXIvLi9ub2RlX21vZHVsZXMvY2xvbmUvY2xvbmUuanMiLCJ3ZWJwYWNrOi8vb25saW5lX2NvbnZlcnRlci8uL25vZGVfbW9kdWxlcy9jdXJyZW5jeS1jb2Rlcy9kYXRhLmpzIiwid2VicGFjazovL29ubGluZV9jb252ZXJ0ZXIvLi9ub2RlX21vZHVsZXMvY3VycmVuY3ktY29kZXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vb25saW5lX2NvbnZlcnRlci8uL25vZGVfbW9kdWxlcy9jdXJyZW5jeS1jb2Rlcy9pc28tNDIxNy1wdWJsaXNoLWRhdGUuanMiLCJ3ZWJwYWNrOi8vb25saW5lX2NvbnZlcnRlci8uL25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwid2VicGFjazovL29ubGluZV9jb252ZXJ0ZXIvLi9ub2RlX21vZHVsZXMvZmlyc3QtbWF0Y2gvaW5kZXguanMiLCJ3ZWJwYWNrOi8vb25saW5lX2NvbnZlcnRlci8uL25vZGVfbW9kdWxlcy9ub2RlLWNhY2hlL2luZGV4LmpzIiwid2VicGFjazovL29ubGluZV9jb252ZXJ0ZXIvLi9ub2RlX21vZHVsZXMvbm9kZS1jYWNoZS9saWIvbm9kZV9jYWNoZS5qcyIsIndlYnBhY2s6Ly9vbmxpbmVfY29udmVydGVyLy4vbm9kZV9tb2R1bGVzL251Yi9pbmRleC5qcyIsIndlYnBhY2s6Ly9vbmxpbmVfY29udmVydGVyL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL29ubGluZV9jb252ZXJ0ZXIvLi9zcmMvaW5kZXhfbW9uby5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgY2xvbmUgPSAoZnVuY3Rpb24oKSB7XG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIF9pbnN0YW5jZW9mKG9iaiwgdHlwZSkge1xuICByZXR1cm4gdHlwZSAhPSBudWxsICYmIG9iaiBpbnN0YW5jZW9mIHR5cGU7XG59XG5cbnZhciBuYXRpdmVNYXA7XG50cnkge1xuICBuYXRpdmVNYXAgPSBNYXA7XG59IGNhdGNoKF8pIHtcbiAgLy8gbWF5YmUgYSByZWZlcmVuY2UgZXJyb3IgYmVjYXVzZSBubyBgTWFwYC4gR2l2ZSBpdCBhIGR1bW15IHZhbHVlIHRoYXQgbm9cbiAgLy8gdmFsdWUgd2lsbCBldmVyIGJlIGFuIGluc3RhbmNlb2YuXG4gIG5hdGl2ZU1hcCA9IGZ1bmN0aW9uKCkge307XG59XG5cbnZhciBuYXRpdmVTZXQ7XG50cnkge1xuICBuYXRpdmVTZXQgPSBTZXQ7XG59IGNhdGNoKF8pIHtcbiAgbmF0aXZlU2V0ID0gZnVuY3Rpb24oKSB7fTtcbn1cblxudmFyIG5hdGl2ZVByb21pc2U7XG50cnkge1xuICBuYXRpdmVQcm9taXNlID0gUHJvbWlzZTtcbn0gY2F0Y2goXykge1xuICBuYXRpdmVQcm9taXNlID0gZnVuY3Rpb24oKSB7fTtcbn1cblxuLyoqXG4gKiBDbG9uZXMgKGNvcGllcykgYW4gT2JqZWN0IHVzaW5nIGRlZXAgY29weWluZy5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHN1cHBvcnRzIGNpcmN1bGFyIHJlZmVyZW5jZXMgYnkgZGVmYXVsdCwgYnV0IGlmIHlvdSBhcmUgY2VydGFpblxuICogdGhlcmUgYXJlIG5vIGNpcmN1bGFyIHJlZmVyZW5jZXMgaW4geW91ciBvYmplY3QsIHlvdSBjYW4gc2F2ZSBzb21lIENQVSB0aW1lXG4gKiBieSBjYWxsaW5nIGNsb25lKG9iaiwgZmFsc2UpLlxuICpcbiAqIENhdXRpb246IGlmIGBjaXJjdWxhcmAgaXMgZmFsc2UgYW5kIGBwYXJlbnRgIGNvbnRhaW5zIGNpcmN1bGFyIHJlZmVyZW5jZXMsXG4gKiB5b3VyIHByb2dyYW0gbWF5IGVudGVyIGFuIGluZmluaXRlIGxvb3AgYW5kIGNyYXNoLlxuICpcbiAqIEBwYXJhbSBgcGFyZW50YCAtIHRoZSBvYmplY3QgdG8gYmUgY2xvbmVkXG4gKiBAcGFyYW0gYGNpcmN1bGFyYCAtIHNldCB0byB0cnVlIGlmIHRoZSBvYmplY3QgdG8gYmUgY2xvbmVkIG1heSBjb250YWluXG4gKiAgICBjaXJjdWxhciByZWZlcmVuY2VzLiAob3B0aW9uYWwgLSB0cnVlIGJ5IGRlZmF1bHQpXG4gKiBAcGFyYW0gYGRlcHRoYCAtIHNldCB0byBhIG51bWJlciBpZiB0aGUgb2JqZWN0IGlzIG9ubHkgdG8gYmUgY2xvbmVkIHRvXG4gKiAgICBhIHBhcnRpY3VsYXIgZGVwdGguIChvcHRpb25hbCAtIGRlZmF1bHRzIHRvIEluZmluaXR5KVxuICogQHBhcmFtIGBwcm90b3R5cGVgIC0gc2V0cyB0aGUgcHJvdG90eXBlIHRvIGJlIHVzZWQgd2hlbiBjbG9uaW5nIGFuIG9iamVjdC5cbiAqICAgIChvcHRpb25hbCAtIGRlZmF1bHRzIHRvIHBhcmVudCBwcm90b3R5cGUpLlxuICogQHBhcmFtIGBpbmNsdWRlTm9uRW51bWVyYWJsZWAgLSBzZXQgdG8gdHJ1ZSBpZiB0aGUgbm9uLWVudW1lcmFibGUgcHJvcGVydGllc1xuICogICAgc2hvdWxkIGJlIGNsb25lZCBhcyB3ZWxsLiBOb24tZW51bWVyYWJsZSBwcm9wZXJ0aWVzIG9uIHRoZSBwcm90b3R5cGVcbiAqICAgIGNoYWluIHdpbGwgYmUgaWdub3JlZC4gKG9wdGlvbmFsIC0gZmFsc2UgYnkgZGVmYXVsdClcbiovXG5mdW5jdGlvbiBjbG9uZShwYXJlbnQsIGNpcmN1bGFyLCBkZXB0aCwgcHJvdG90eXBlLCBpbmNsdWRlTm9uRW51bWVyYWJsZSkge1xuICBpZiAodHlwZW9mIGNpcmN1bGFyID09PSAnb2JqZWN0Jykge1xuICAgIGRlcHRoID0gY2lyY3VsYXIuZGVwdGg7XG4gICAgcHJvdG90eXBlID0gY2lyY3VsYXIucHJvdG90eXBlO1xuICAgIGluY2x1ZGVOb25FbnVtZXJhYmxlID0gY2lyY3VsYXIuaW5jbHVkZU5vbkVudW1lcmFibGU7XG4gICAgY2lyY3VsYXIgPSBjaXJjdWxhci5jaXJjdWxhcjtcbiAgfVxuICAvLyBtYWludGFpbiB0d28gYXJyYXlzIGZvciBjaXJjdWxhciByZWZlcmVuY2VzLCB3aGVyZSBjb3JyZXNwb25kaW5nIHBhcmVudHNcbiAgLy8gYW5kIGNoaWxkcmVuIGhhdmUgdGhlIHNhbWUgaW5kZXhcbiAgdmFyIGFsbFBhcmVudHMgPSBbXTtcbiAgdmFyIGFsbENoaWxkcmVuID0gW107XG5cbiAgdmFyIHVzZUJ1ZmZlciA9IHR5cGVvZiBCdWZmZXIgIT0gJ3VuZGVmaW5lZCc7XG5cbiAgaWYgKHR5cGVvZiBjaXJjdWxhciA9PSAndW5kZWZpbmVkJylcbiAgICBjaXJjdWxhciA9IHRydWU7XG5cbiAgaWYgKHR5cGVvZiBkZXB0aCA9PSAndW5kZWZpbmVkJylcbiAgICBkZXB0aCA9IEluZmluaXR5O1xuXG4gIC8vIHJlY3Vyc2UgdGhpcyBmdW5jdGlvbiBzbyB3ZSBkb24ndCByZXNldCBhbGxQYXJlbnRzIGFuZCBhbGxDaGlsZHJlblxuICBmdW5jdGlvbiBfY2xvbmUocGFyZW50LCBkZXB0aCkge1xuICAgIC8vIGNsb25pbmcgbnVsbCBhbHdheXMgcmV0dXJucyBudWxsXG4gICAgaWYgKHBhcmVudCA9PT0gbnVsbClcbiAgICAgIHJldHVybiBudWxsO1xuXG4gICAgaWYgKGRlcHRoID09PSAwKVxuICAgICAgcmV0dXJuIHBhcmVudDtcblxuICAgIHZhciBjaGlsZDtcbiAgICB2YXIgcHJvdG87XG4gICAgaWYgKHR5cGVvZiBwYXJlbnQgIT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBwYXJlbnQ7XG4gICAgfVxuXG4gICAgaWYgKF9pbnN0YW5jZW9mKHBhcmVudCwgbmF0aXZlTWFwKSkge1xuICAgICAgY2hpbGQgPSBuZXcgbmF0aXZlTWFwKCk7XG4gICAgfSBlbHNlIGlmIChfaW5zdGFuY2VvZihwYXJlbnQsIG5hdGl2ZVNldCkpIHtcbiAgICAgIGNoaWxkID0gbmV3IG5hdGl2ZVNldCgpO1xuICAgIH0gZWxzZSBpZiAoX2luc3RhbmNlb2YocGFyZW50LCBuYXRpdmVQcm9taXNlKSkge1xuICAgICAgY2hpbGQgPSBuZXcgbmF0aXZlUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHBhcmVudC50aGVuKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgcmVzb2x2ZShfY2xvbmUodmFsdWUsIGRlcHRoIC0gMSkpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICByZWplY3QoX2Nsb25lKGVyciwgZGVwdGggLSAxKSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChjbG9uZS5fX2lzQXJyYXkocGFyZW50KSkge1xuICAgICAgY2hpbGQgPSBbXTtcbiAgICB9IGVsc2UgaWYgKGNsb25lLl9faXNSZWdFeHAocGFyZW50KSkge1xuICAgICAgY2hpbGQgPSBuZXcgUmVnRXhwKHBhcmVudC5zb3VyY2UsIF9fZ2V0UmVnRXhwRmxhZ3MocGFyZW50KSk7XG4gICAgICBpZiAocGFyZW50Lmxhc3RJbmRleCkgY2hpbGQubGFzdEluZGV4ID0gcGFyZW50Lmxhc3RJbmRleDtcbiAgICB9IGVsc2UgaWYgKGNsb25lLl9faXNEYXRlKHBhcmVudCkpIHtcbiAgICAgIGNoaWxkID0gbmV3IERhdGUocGFyZW50LmdldFRpbWUoKSk7XG4gICAgfSBlbHNlIGlmICh1c2VCdWZmZXIgJiYgQnVmZmVyLmlzQnVmZmVyKHBhcmVudCkpIHtcbiAgICAgIGlmIChCdWZmZXIuYWxsb2NVbnNhZmUpIHtcbiAgICAgICAgLy8gTm9kZS5qcyA+PSA0LjUuMFxuICAgICAgICBjaGlsZCA9IEJ1ZmZlci5hbGxvY1Vuc2FmZShwYXJlbnQubGVuZ3RoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE9sZGVyIE5vZGUuanMgdmVyc2lvbnNcbiAgICAgICAgY2hpbGQgPSBuZXcgQnVmZmVyKHBhcmVudC5sZW5ndGgpO1xuICAgICAgfVxuICAgICAgcGFyZW50LmNvcHkoY2hpbGQpO1xuICAgICAgcmV0dXJuIGNoaWxkO1xuICAgIH0gZWxzZSBpZiAoX2luc3RhbmNlb2YocGFyZW50LCBFcnJvcikpIHtcbiAgICAgIGNoaWxkID0gT2JqZWN0LmNyZWF0ZShwYXJlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIHByb3RvdHlwZSA9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwYXJlbnQpO1xuICAgICAgICBjaGlsZCA9IE9iamVjdC5jcmVhdGUocHJvdG8pO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNoaWxkID0gT2JqZWN0LmNyZWF0ZShwcm90b3R5cGUpO1xuICAgICAgICBwcm90byA9IHByb3RvdHlwZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY2lyY3VsYXIpIHtcbiAgICAgIHZhciBpbmRleCA9IGFsbFBhcmVudHMuaW5kZXhPZihwYXJlbnQpO1xuXG4gICAgICBpZiAoaW5kZXggIT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIGFsbENoaWxkcmVuW2luZGV4XTtcbiAgICAgIH1cbiAgICAgIGFsbFBhcmVudHMucHVzaChwYXJlbnQpO1xuICAgICAgYWxsQ2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgfVxuXG4gICAgaWYgKF9pbnN0YW5jZW9mKHBhcmVudCwgbmF0aXZlTWFwKSkge1xuICAgICAgcGFyZW50LmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICB2YXIga2V5Q2hpbGQgPSBfY2xvbmUoa2V5LCBkZXB0aCAtIDEpO1xuICAgICAgICB2YXIgdmFsdWVDaGlsZCA9IF9jbG9uZSh2YWx1ZSwgZGVwdGggLSAxKTtcbiAgICAgICAgY2hpbGQuc2V0KGtleUNoaWxkLCB2YWx1ZUNoaWxkKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoX2luc3RhbmNlb2YocGFyZW50LCBuYXRpdmVTZXQpKSB7XG4gICAgICBwYXJlbnQuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICB2YXIgZW50cnlDaGlsZCA9IF9jbG9uZSh2YWx1ZSwgZGVwdGggLSAxKTtcbiAgICAgICAgY2hpbGQuYWRkKGVudHJ5Q2hpbGQpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIgaSBpbiBwYXJlbnQpIHtcbiAgICAgIHZhciBhdHRycztcbiAgICAgIGlmIChwcm90bykge1xuICAgICAgICBhdHRycyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocHJvdG8sIGkpO1xuICAgICAgfVxuXG4gICAgICBpZiAoYXR0cnMgJiYgYXR0cnMuc2V0ID09IG51bGwpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjaGlsZFtpXSA9IF9jbG9uZShwYXJlbnRbaV0sIGRlcHRoIC0gMSk7XG4gICAgfVxuXG4gICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcbiAgICAgIHZhciBzeW1ib2xzID0gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhwYXJlbnQpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzeW1ib2xzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIERvbid0IG5lZWQgdG8gd29ycnkgYWJvdXQgY2xvbmluZyBhIHN5bWJvbCBiZWNhdXNlIGl0IGlzIGEgcHJpbWl0aXZlLFxuICAgICAgICAvLyBsaWtlIGEgbnVtYmVyIG9yIHN0cmluZy5cbiAgICAgICAgdmFyIHN5bWJvbCA9IHN5bWJvbHNbaV07XG4gICAgICAgIHZhciBkZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihwYXJlbnQsIHN5bWJvbCk7XG4gICAgICAgIGlmIChkZXNjcmlwdG9yICYmICFkZXNjcmlwdG9yLmVudW1lcmFibGUgJiYgIWluY2x1ZGVOb25FbnVtZXJhYmxlKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2hpbGRbc3ltYm9sXSA9IF9jbG9uZShwYXJlbnRbc3ltYm9sXSwgZGVwdGggLSAxKTtcbiAgICAgICAgaWYgKCFkZXNjcmlwdG9yLmVudW1lcmFibGUpIHtcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2hpbGQsIHN5bWJvbCwge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChpbmNsdWRlTm9uRW51bWVyYWJsZSkge1xuICAgICAgdmFyIGFsbFByb3BlcnR5TmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhwYXJlbnQpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbGxQcm9wZXJ0eU5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBwcm9wZXJ0eU5hbWUgPSBhbGxQcm9wZXJ0eU5hbWVzW2ldO1xuICAgICAgICB2YXIgZGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IocGFyZW50LCBwcm9wZXJ0eU5hbWUpO1xuICAgICAgICBpZiAoZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLmVudW1lcmFibGUpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjaGlsZFtwcm9wZXJ0eU5hbWVdID0gX2Nsb25lKHBhcmVudFtwcm9wZXJ0eU5hbWVdLCBkZXB0aCAtIDEpO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2hpbGQsIHByb3BlcnR5TmFtZSwge1xuICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBjaGlsZDtcbiAgfVxuXG4gIHJldHVybiBfY2xvbmUocGFyZW50LCBkZXB0aCk7XG59XG5cbi8qKlxuICogU2ltcGxlIGZsYXQgY2xvbmUgdXNpbmcgcHJvdG90eXBlLCBhY2NlcHRzIG9ubHkgb2JqZWN0cywgdXNlZnVsbCBmb3IgcHJvcGVydHlcbiAqIG92ZXJyaWRlIG9uIEZMQVQgY29uZmlndXJhdGlvbiBvYmplY3QgKG5vIG5lc3RlZCBwcm9wcykuXG4gKlxuICogVVNFIFdJVEggQ0FVVElPTiEgVGhpcyBtYXkgbm90IGJlaGF2ZSBhcyB5b3Ugd2lzaCBpZiB5b3UgZG8gbm90IGtub3cgaG93IHRoaXNcbiAqIHdvcmtzLlxuICovXG5jbG9uZS5jbG9uZVByb3RvdHlwZSA9IGZ1bmN0aW9uIGNsb25lUHJvdG90eXBlKHBhcmVudCkge1xuICBpZiAocGFyZW50ID09PSBudWxsKVxuICAgIHJldHVybiBudWxsO1xuXG4gIHZhciBjID0gZnVuY3Rpb24gKCkge307XG4gIGMucHJvdG90eXBlID0gcGFyZW50O1xuICByZXR1cm4gbmV3IGMoKTtcbn07XG5cbi8vIHByaXZhdGUgdXRpbGl0eSBmdW5jdGlvbnNcblxuZnVuY3Rpb24gX19vYmpUb1N0cihvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5jbG9uZS5fX29ialRvU3RyID0gX19vYmpUb1N0cjtcblxuZnVuY3Rpb24gX19pc0RhdGUobykge1xuICByZXR1cm4gdHlwZW9mIG8gPT09ICdvYmplY3QnICYmIF9fb2JqVG9TdHIobykgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmNsb25lLl9faXNEYXRlID0gX19pc0RhdGU7XG5cbmZ1bmN0aW9uIF9faXNBcnJheShvKSB7XG4gIHJldHVybiB0eXBlb2YgbyA9PT0gJ29iamVjdCcgJiYgX19vYmpUb1N0cihvKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn1cbmNsb25lLl9faXNBcnJheSA9IF9faXNBcnJheTtcblxuZnVuY3Rpb24gX19pc1JlZ0V4cChvKSB7XG4gIHJldHVybiB0eXBlb2YgbyA9PT0gJ29iamVjdCcgJiYgX19vYmpUb1N0cihvKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5jbG9uZS5fX2lzUmVnRXhwID0gX19pc1JlZ0V4cDtcblxuZnVuY3Rpb24gX19nZXRSZWdFeHBGbGFncyhyZSkge1xuICB2YXIgZmxhZ3MgPSAnJztcbiAgaWYgKHJlLmdsb2JhbCkgZmxhZ3MgKz0gJ2cnO1xuICBpZiAocmUuaWdub3JlQ2FzZSkgZmxhZ3MgKz0gJ2knO1xuICBpZiAocmUubXVsdGlsaW5lKSBmbGFncyArPSAnbSc7XG4gIHJldHVybiBmbGFncztcbn1cbmNsb25lLl9fZ2V0UmVnRXhwRmxhZ3MgPSBfX2dldFJlZ0V4cEZsYWdzO1xuXG5yZXR1cm4gY2xvbmU7XG59KSgpO1xuXG5pZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBjbG9uZTtcbn1cbiIsIi8qXG5cdEZvbGxvd3MgSVNPIDQyMTcsIGh0dHBzOi8vd3d3Lmlzby5vcmcvaXNvLTQyMTctY3VycmVuY3ktY29kZXMuaHRtbFxuXHRTZWUgaHR0cHM6Ly93d3cuY3VycmVuY3ktaXNvLm9yZy9kYW0vZG93bmxvYWRzL2xpc3RzL2xpc3Rfb25lLnhtbFxuXHREYXRhIGxhc3QgdXBkYXRlZCAyMDE4LTA4LTI5XG4qL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFtcbiAge1xuICAgIFwiY29kZVwiOiBcIkFFRFwiLFxuICAgIFwibnVtYmVyXCI6IFwiNzg0XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiVUFFIERpcmhhbVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiVW5pdGVkIEFyYWIgRW1pcmF0ZXMgKFRoZSlcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkFGTlwiLFxuICAgIFwibnVtYmVyXCI6IFwiOTcxXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiQWZnaGFuaVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiQWZnaGFuaXN0YW5cIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkFMTFwiLFxuICAgIFwibnVtYmVyXCI6IFwiMDA4XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiTGVrXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJBbGJhbmlhXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJBTURcIixcbiAgICBcIm51bWJlclwiOiBcIjA1MVwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkFybWVuaWFuIERyYW1cIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkFybWVuaWFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkFOR1wiLFxuICAgIFwibnVtYmVyXCI6IFwiNTMyXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiTmV0aGVybGFuZHMgQW50aWxsZWFuIEd1aWxkZXJcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkN1cmHDp2FvXCIsXG4gICAgICBcIlNpbnQgTWFhcnRlbiAoRHV0Y2ggUGFydClcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkFPQVwiLFxuICAgIFwibnVtYmVyXCI6IFwiOTczXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiS3dhbnphXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJBbmdvbGFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkFSU1wiLFxuICAgIFwibnVtYmVyXCI6IFwiMDMyXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiQXJnZW50aW5lIFBlc29cIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkFyZ2VudGluYVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiQVVEXCIsXG4gICAgXCJudW1iZXJcIjogXCIwMzZcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJBdXN0cmFsaWFuIERvbGxhclwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiQXVzdHJhbGlhXCIsXG4gICAgICBcIkNocmlzdG1hcyBJc2xhbmRcIixcbiAgICAgIFwiQ29jb3MgKEtlZWxpbmcpIElzbGFuZHMgKFRoZSlcIixcbiAgICAgIFwiSGVhcmQgSXNsYW5kIGFuZCBNY2RvbmFsZCBJc2xhbmRzXCIsXG4gICAgICBcIktpcmliYXRpXCIsXG4gICAgICBcIk5hdXJ1XCIsXG4gICAgICBcIk5vcmZvbGsgSXNsYW5kXCIsXG4gICAgICBcIlR1dmFsdVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiQVdHXCIsXG4gICAgXCJudW1iZXJcIjogXCI1MzNcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJBcnViYW4gRmxvcmluXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJBcnViYVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiQVpOXCIsXG4gICAgXCJudW1iZXJcIjogXCI5NDRcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJBemVyYmFpamFuIE1hbmF0XCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJBemVyYmFpamFuXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJCQU1cIixcbiAgICBcIm51bWJlclwiOiBcIjk3N1wiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkNvbnZlcnRpYmxlIE1hcmtcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkJvc25pYSBhbmQgSGVyemVnb3ZpbmFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkJCRFwiLFxuICAgIFwibnVtYmVyXCI6IFwiMDUyXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiQmFyYmFkb3MgRG9sbGFyXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJCYXJiYWRvc1wiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiQkRUXCIsXG4gICAgXCJudW1iZXJcIjogXCIwNTBcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJUYWthXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJCYW5nbGFkZXNoXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJCR05cIixcbiAgICBcIm51bWJlclwiOiBcIjk3NVwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkJ1bGdhcmlhbiBMZXZcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkJ1bGdhcmlhXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJCSERcIixcbiAgICBcIm51bWJlclwiOiBcIjA0OFwiLFxuICAgIFwiZGlnaXRzXCI6IDMsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkJhaHJhaW5pIERpbmFyXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJCYWhyYWluXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJCSUZcIixcbiAgICBcIm51bWJlclwiOiBcIjEwOFwiLFxuICAgIFwiZGlnaXRzXCI6IDAsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkJ1cnVuZGkgRnJhbmNcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkJ1cnVuZGlcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkJNRFwiLFxuICAgIFwibnVtYmVyXCI6IFwiMDYwXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiQmVybXVkaWFuIERvbGxhclwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiQmVybXVkYVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiQk5EXCIsXG4gICAgXCJudW1iZXJcIjogXCIwOTZcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJCcnVuZWkgRG9sbGFyXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJCcnVuZWkgRGFydXNzYWxhbVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiQk9CXCIsXG4gICAgXCJudW1iZXJcIjogXCIwNjhcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJCb2xpdmlhbm9cIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkJvbGl2aWEgKFBsdXJpbmF0aW9uYWwgU3RhdGUgT2YpXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJCT1ZcIixcbiAgICBcIm51bWJlclwiOiBcIjk4NFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIk12ZG9sXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJCb2xpdmlhIChQbHVyaW5hdGlvbmFsIFN0YXRlIE9mKVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiQlJMXCIsXG4gICAgXCJudW1iZXJcIjogXCI5ODZcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJCcmF6aWxpYW4gUmVhbFwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiQnJhemlsXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJCU0RcIixcbiAgICBcIm51bWJlclwiOiBcIjA0NFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkJhaGFtaWFuIERvbGxhclwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiQmFoYW1hcyAoVGhlKVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiQlROXCIsXG4gICAgXCJudW1iZXJcIjogXCIwNjRcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJOZ3VsdHJ1bVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiQmh1dGFuXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJCV1BcIixcbiAgICBcIm51bWJlclwiOiBcIjA3MlwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIlB1bGFcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkJvdHN3YW5hXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJCWU5cIixcbiAgICBcIm51bWJlclwiOiBcIjkzM1wiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkJlbGFydXNpYW4gUnVibGVcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkJlbGFydXNcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkJaRFwiLFxuICAgIFwibnVtYmVyXCI6IFwiMDg0XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiQmVsaXplIERvbGxhclwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiQmVsaXplXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJDQURcIixcbiAgICBcIm51bWJlclwiOiBcIjEyNFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkNhbmFkaWFuIERvbGxhclwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiQ2FuYWRhXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJDREZcIixcbiAgICBcIm51bWJlclwiOiBcIjk3NlwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkNvbmdvbGVzZSBGcmFuY1wiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiQ29uZ28gKFRoZSBEZW1vY3JhdGljIFJlcHVibGljIG9mIFRoZSlcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkNIRVwiLFxuICAgIFwibnVtYmVyXCI6IFwiOTQ3XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiV0lSIEV1cm9cIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIlN3aXR6ZXJsYW5kXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJDSEZcIixcbiAgICBcIm51bWJlclwiOiBcIjc1NlwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIlN3aXNzIEZyYW5jXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJMaWVjaHRlbnN0ZWluXCIsXG4gICAgICBcIlN3aXR6ZXJsYW5kXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJDSFdcIixcbiAgICBcIm51bWJlclwiOiBcIjk0OFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIldJUiBGcmFuY1wiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiU3dpdHplcmxhbmRcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkNMRlwiLFxuICAgIFwibnVtYmVyXCI6IFwiOTkwXCIsXG4gICAgXCJkaWdpdHNcIjogNCxcbiAgICBcImN1cnJlbmN5XCI6IFwiVW5pZGFkIGRlIEZvbWVudG9cIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkNoaWxlXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJDTFBcIixcbiAgICBcIm51bWJlclwiOiBcIjE1MlwiLFxuICAgIFwiZGlnaXRzXCI6IDAsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkNoaWxlYW4gUGVzb1wiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiQ2hpbGVcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkNOWVwiLFxuICAgIFwibnVtYmVyXCI6IFwiMTU2XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiWXVhbiBSZW5taW5iaVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiQ2hpbmFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkNPUFwiLFxuICAgIFwibnVtYmVyXCI6IFwiMTcwXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiQ29sb21iaWFuIFBlc29cIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkNvbG9tYmlhXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJDT1VcIixcbiAgICBcIm51bWJlclwiOiBcIjk3MFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIlVuaWRhZCBkZSBWYWxvciBSZWFsXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJDb2xvbWJpYVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiQ1JDXCIsXG4gICAgXCJudW1iZXJcIjogXCIxODhcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJDb3N0YSBSaWNhbiBDb2xvblwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiQ29zdGEgUmljYVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiQ1VDXCIsXG4gICAgXCJudW1iZXJcIjogXCI5MzFcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJQZXNvIENvbnZlcnRpYmxlXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJDdWJhXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJDVVBcIixcbiAgICBcIm51bWJlclwiOiBcIjE5MlwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkN1YmFuIFBlc29cIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkN1YmFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkNWRVwiLFxuICAgIFwibnVtYmVyXCI6IFwiMTMyXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiQ2FibyBWZXJkZSBFc2N1ZG9cIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkNhYm8gVmVyZGVcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkNaS1wiLFxuICAgIFwibnVtYmVyXCI6IFwiMjAzXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiQ3plY2ggS29ydW5hXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJDemVjaGlhXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJESkZcIixcbiAgICBcIm51bWJlclwiOiBcIjI2MlwiLFxuICAgIFwiZGlnaXRzXCI6IDAsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkRqaWJvdXRpIEZyYW5jXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJEamlib3V0aVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiREtLXCIsXG4gICAgXCJudW1iZXJcIjogXCIyMDhcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJEYW5pc2ggS3JvbmVcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkRlbm1hcmtcIixcbiAgICAgIFwiRmFyb2UgSXNsYW5kcyAoVGhlKVwiLFxuICAgICAgXCJHcmVlbmxhbmRcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkRPUFwiLFxuICAgIFwibnVtYmVyXCI6IFwiMjE0XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiRG9taW5pY2FuIFBlc29cIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkRvbWluaWNhbiBSZXB1YmxpYyAoVGhlKVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiRFpEXCIsXG4gICAgXCJudW1iZXJcIjogXCIwMTJcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJBbGdlcmlhbiBEaW5hclwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiQWxnZXJpYVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiRUdQXCIsXG4gICAgXCJudW1iZXJcIjogXCI4MThcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJFZ3lwdGlhbiBQb3VuZFwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiRWd5cHRcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkVSTlwiLFxuICAgIFwibnVtYmVyXCI6IFwiMjMyXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiTmFrZmFcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkVyaXRyZWFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkVUQlwiLFxuICAgIFwibnVtYmVyXCI6IFwiMjMwXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiRXRoaW9waWFuIEJpcnJcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkV0aGlvcGlhXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJFVVJcIixcbiAgICBcIm51bWJlclwiOiBcIjk3OFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkV1cm9cIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIsOFbGFuZCBJc2xhbmRzXCIsXG4gICAgICBcIkFuZG9ycmFcIixcbiAgICAgIFwiQXVzdHJpYVwiLFxuICAgICAgXCJCZWxnaXVtXCIsXG4gICAgICBcIkN5cHJ1c1wiLFxuICAgICAgXCJFc3RvbmlhXCIsXG4gICAgICBcIkV1cm9wZWFuIFVuaW9uXCIsXG4gICAgICBcIkZpbmxhbmRcIixcbiAgICAgIFwiRnJhbmNlXCIsXG4gICAgICBcIkZyZW5jaCBHdWlhbmFcIixcbiAgICAgIFwiRnJlbmNoIFNvdXRoZXJuIFRlcnJpdG9yaWVzIChUaGUpXCIsXG4gICAgICBcIkdlcm1hbnlcIixcbiAgICAgIFwiR3JlZWNlXCIsXG4gICAgICBcIkd1YWRlbG91cGVcIixcbiAgICAgIFwiSG9seSBTZWUgKFRoZSlcIixcbiAgICAgIFwiSXJlbGFuZFwiLFxuICAgICAgXCJJdGFseVwiLFxuICAgICAgXCJMYXR2aWFcIixcbiAgICAgIFwiTGl0aHVhbmlhXCIsXG4gICAgICBcIkx1eGVtYm91cmdcIixcbiAgICAgIFwiTWFsdGFcIixcbiAgICAgIFwiTWFydGluaXF1ZVwiLFxuICAgICAgXCJNYXlvdHRlXCIsXG4gICAgICBcIk1vbmFjb1wiLFxuICAgICAgXCJNb250ZW5lZ3JvXCIsXG4gICAgICBcIk5ldGhlcmxhbmRzIChUaGUpXCIsXG4gICAgICBcIlBvcnR1Z2FsXCIsXG4gICAgICBcIlLDqXVuaW9uXCIsXG4gICAgICBcIlNhaW50IEJhcnRow6lsZW15XCIsXG4gICAgICBcIlNhaW50IE1hcnRpbiAoRnJlbmNoIFBhcnQpXCIsXG4gICAgICBcIlNhaW50IFBpZXJyZSBhbmQgTWlxdWVsb25cIixcbiAgICAgIFwiU2FuIE1hcmlub1wiLFxuICAgICAgXCJTbG92YWtpYVwiLFxuICAgICAgXCJTbG92ZW5pYVwiLFxuICAgICAgXCJTcGFpblwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiRkpEXCIsXG4gICAgXCJudW1iZXJcIjogXCIyNDJcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJGaWppIERvbGxhclwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiRmlqaVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiRktQXCIsXG4gICAgXCJudW1iZXJcIjogXCIyMzhcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJGYWxrbGFuZCBJc2xhbmRzIFBvdW5kXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJGYWxrbGFuZCBJc2xhbmRzIChUaGUpIFtNYWx2aW5hc11cIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkdCUFwiLFxuICAgIFwibnVtYmVyXCI6IFwiODI2XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiUG91bmQgU3RlcmxpbmdcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkd1ZXJuc2V5XCIsXG4gICAgICBcIklzbGUgb2YgTWFuXCIsXG4gICAgICBcIkplcnNleVwiLFxuICAgICAgXCJVbml0ZWQgS2luZ2RvbSBvZiBHcmVhdCBCcml0YWluIGFuZCBOb3J0aGVybiBJcmVsYW5kIChUaGUpXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJHRUxcIixcbiAgICBcIm51bWJlclwiOiBcIjk4MVwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkxhcmlcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkdlb3JnaWFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkdIU1wiLFxuICAgIFwibnVtYmVyXCI6IFwiOTM2XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiR2hhbmEgQ2VkaVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiR2hhbmFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkdJUFwiLFxuICAgIFwibnVtYmVyXCI6IFwiMjkyXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiR2licmFsdGFyIFBvdW5kXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJHaWJyYWx0YXJcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkdNRFwiLFxuICAgIFwibnVtYmVyXCI6IFwiMjcwXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiRGFsYXNpXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJHYW1iaWEgKFRoZSlcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkdORlwiLFxuICAgIFwibnVtYmVyXCI6IFwiMzI0XCIsXG4gICAgXCJkaWdpdHNcIjogMCxcbiAgICBcImN1cnJlbmN5XCI6IFwiR3VpbmVhbiBGcmFuY1wiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiR3VpbmVhXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJHVFFcIixcbiAgICBcIm51bWJlclwiOiBcIjMyMFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIlF1ZXR6YWxcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkd1YXRlbWFsYVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiR1lEXCIsXG4gICAgXCJudW1iZXJcIjogXCIzMjhcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJHdXlhbmEgRG9sbGFyXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJHdXlhbmFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkhLRFwiLFxuICAgIFwibnVtYmVyXCI6IFwiMzQ0XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiSG9uZyBLb25nIERvbGxhclwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiSG9uZyBLb25nXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJITkxcIixcbiAgICBcIm51bWJlclwiOiBcIjM0MFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkxlbXBpcmFcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkhvbmR1cmFzXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJIUktcIixcbiAgICBcIm51bWJlclwiOiBcIjE5MVwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkt1bmFcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkNyb2F0aWFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIkhUR1wiLFxuICAgIFwibnVtYmVyXCI6IFwiMzMyXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiR291cmRlXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJIYWl0aVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiSFVGXCIsXG4gICAgXCJudW1iZXJcIjogXCIzNDhcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJGb3JpbnRcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkh1bmdhcnlcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIklEUlwiLFxuICAgIFwibnVtYmVyXCI6IFwiMzYwXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiUnVwaWFoXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJJbmRvbmVzaWFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIklMU1wiLFxuICAgIFwibnVtYmVyXCI6IFwiMzc2XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiTmV3IElzcmFlbGkgU2hlcWVsXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJJc3JhZWxcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIklOUlwiLFxuICAgIFwibnVtYmVyXCI6IFwiMzU2XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiSW5kaWFuIFJ1cGVlXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJCaHV0YW5cIixcbiAgICAgIFwiSW5kaWFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIklRRFwiLFxuICAgIFwibnVtYmVyXCI6IFwiMzY4XCIsXG4gICAgXCJkaWdpdHNcIjogMyxcbiAgICBcImN1cnJlbmN5XCI6IFwiSXJhcWkgRGluYXJcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIklyYXFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIklSUlwiLFxuICAgIFwibnVtYmVyXCI6IFwiMzY0XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiSXJhbmlhbiBSaWFsXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJJcmFuIChJc2xhbWljIFJlcHVibGljIE9mKVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiSVNLXCIsXG4gICAgXCJudW1iZXJcIjogXCIzNTJcIixcbiAgICBcImRpZ2l0c1wiOiAwLFxuICAgIFwiY3VycmVuY3lcIjogXCJJY2VsYW5kIEtyb25hXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJJY2VsYW5kXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJKTURcIixcbiAgICBcIm51bWJlclwiOiBcIjM4OFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkphbWFpY2FuIERvbGxhclwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiSmFtYWljYVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiSk9EXCIsXG4gICAgXCJudW1iZXJcIjogXCI0MDBcIixcbiAgICBcImRpZ2l0c1wiOiAzLFxuICAgIFwiY3VycmVuY3lcIjogXCJKb3JkYW5pYW4gRGluYXJcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkpvcmRhblwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiSlBZXCIsXG4gICAgXCJudW1iZXJcIjogXCIzOTJcIixcbiAgICBcImRpZ2l0c1wiOiAwLFxuICAgIFwiY3VycmVuY3lcIjogXCJZZW5cIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkphcGFuXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJLRVNcIixcbiAgICBcIm51bWJlclwiOiBcIjQwNFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIktlbnlhbiBTaGlsbGluZ1wiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiS2VueWFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIktHU1wiLFxuICAgIFwibnVtYmVyXCI6IFwiNDE3XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiU29tXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJLeXJneXpzdGFuXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJLSFJcIixcbiAgICBcIm51bWJlclwiOiBcIjExNlwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIlJpZWxcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkNhbWJvZGlhXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJLTUZcIixcbiAgICBcIm51bWJlclwiOiBcIjE3NFwiLFxuICAgIFwiZGlnaXRzXCI6IDAsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkNvbW9yaWFuIEZyYW5jIFwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiQ29tb3JvcyAoVGhlKVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiS1BXXCIsXG4gICAgXCJudW1iZXJcIjogXCI0MDhcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJOb3J0aCBLb3JlYW4gV29uXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJLb3JlYSAoVGhlIERlbW9jcmF0aWMgUGVvcGxl4oCZcyBSZXB1YmxpYyBPZilcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIktSV1wiLFxuICAgIFwibnVtYmVyXCI6IFwiNDEwXCIsXG4gICAgXCJkaWdpdHNcIjogMCxcbiAgICBcImN1cnJlbmN5XCI6IFwiV29uXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJLb3JlYSAoVGhlIFJlcHVibGljIE9mKVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiS1dEXCIsXG4gICAgXCJudW1iZXJcIjogXCI0MTRcIixcbiAgICBcImRpZ2l0c1wiOiAzLFxuICAgIFwiY3VycmVuY3lcIjogXCJLdXdhaXRpIERpbmFyXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJLdXdhaXRcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIktZRFwiLFxuICAgIFwibnVtYmVyXCI6IFwiMTM2XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiQ2F5bWFuIElzbGFuZHMgRG9sbGFyXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJDYXltYW4gSXNsYW5kcyAoVGhlKVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiS1pUXCIsXG4gICAgXCJudW1iZXJcIjogXCIzOThcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJUZW5nZVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiS2F6YWtoc3RhblwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiTEFLXCIsXG4gICAgXCJudW1iZXJcIjogXCI0MThcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJMYW8gS2lwXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJMYW8gUGVvcGxl4oCZcyBEZW1vY3JhdGljIFJlcHVibGljIChUaGUpXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJMQlBcIixcbiAgICBcIm51bWJlclwiOiBcIjQyMlwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkxlYmFuZXNlIFBvdW5kXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJMZWJhbm9uXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJMS1JcIixcbiAgICBcIm51bWJlclwiOiBcIjE0NFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIlNyaSBMYW5rYSBSdXBlZVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiU3JpIExhbmthXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJMUkRcIixcbiAgICBcIm51bWJlclwiOiBcIjQzMFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkxpYmVyaWFuIERvbGxhclwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiTGliZXJpYVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiTFNMXCIsXG4gICAgXCJudW1iZXJcIjogXCI0MjZcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJMb3RpXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJMZXNvdGhvXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJMWURcIixcbiAgICBcIm51bWJlclwiOiBcIjQzNFwiLFxuICAgIFwiZGlnaXRzXCI6IDMsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkxpYnlhbiBEaW5hclwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiTGlieWFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIk1BRFwiLFxuICAgIFwibnVtYmVyXCI6IFwiNTA0XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiTW9yb2NjYW4gRGlyaGFtXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJNb3JvY2NvXCIsXG4gICAgICBcIldlc3Rlcm4gU2FoYXJhXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJNRExcIixcbiAgICBcIm51bWJlclwiOiBcIjQ5OFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIk1vbGRvdmFuIExldVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiTW9sZG92YSAoVGhlIFJlcHVibGljIE9mKVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiTUdBXCIsXG4gICAgXCJudW1iZXJcIjogXCI5NjlcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJNYWxhZ2FzeSBBcmlhcnlcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIk1hZGFnYXNjYXJcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIk1LRFwiLFxuICAgIFwibnVtYmVyXCI6IFwiODA3XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiRGVuYXJcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIk1hY2Vkb25pYSAoVGhlIEZvcm1lciBZdWdvc2xhdiBSZXB1YmxpYyBPZilcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIk1NS1wiLFxuICAgIFwibnVtYmVyXCI6IFwiMTA0XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiS3lhdFwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiTXlhbm1hclwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiTU5UXCIsXG4gICAgXCJudW1iZXJcIjogXCI0OTZcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJUdWdyaWtcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIk1vbmdvbGlhXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJNT1BcIixcbiAgICBcIm51bWJlclwiOiBcIjQ0NlwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIlBhdGFjYVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiTWFjYW9cIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIk1SVVwiLFxuICAgIFwibnVtYmVyXCI6IFwiOTI5XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiT3VndWl5YVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiTWF1cml0YW5pYVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiTVVSXCIsXG4gICAgXCJudW1iZXJcIjogXCI0ODBcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJNYXVyaXRpdXMgUnVwZWVcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIk1hdXJpdGl1c1wiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiTVZSXCIsXG4gICAgXCJudW1iZXJcIjogXCI0NjJcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJSdWZpeWFhXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJNYWxkaXZlc1wiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiTVdLXCIsXG4gICAgXCJudW1iZXJcIjogXCI0NTRcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJNYWxhd2kgS3dhY2hhXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJNYWxhd2lcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIk1YTlwiLFxuICAgIFwibnVtYmVyXCI6IFwiNDg0XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiTWV4aWNhbiBQZXNvXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJNZXhpY29cIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIk1YVlwiLFxuICAgIFwibnVtYmVyXCI6IFwiOTc5XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiTWV4aWNhbiBVbmlkYWQgZGUgSW52ZXJzaW9uIChVREkpXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJNZXhpY29cIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIk1ZUlwiLFxuICAgIFwibnVtYmVyXCI6IFwiNDU4XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiTWFsYXlzaWFuIFJpbmdnaXRcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIk1hbGF5c2lhXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJNWk5cIixcbiAgICBcIm51bWJlclwiOiBcIjk0M1wiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIk1vemFtYmlxdWUgTWV0aWNhbFwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiTW96YW1iaXF1ZVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiTkFEXCIsXG4gICAgXCJudW1iZXJcIjogXCI1MTZcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJOYW1pYmlhIERvbGxhclwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiTmFtaWJpYVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiTkdOXCIsXG4gICAgXCJudW1iZXJcIjogXCI1NjZcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJOYWlyYVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiTmlnZXJpYVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiTklPXCIsXG4gICAgXCJudW1iZXJcIjogXCI1NThcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJDb3Jkb2JhIE9yb1wiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiTmljYXJhZ3VhXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJOT0tcIixcbiAgICBcIm51bWJlclwiOiBcIjU3OFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIk5vcndlZ2lhbiBLcm9uZVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiQm91dmV0IElzbGFuZFwiLFxuICAgICAgXCJOb3J3YXlcIixcbiAgICAgIFwiU3ZhbGJhcmQgYW5kIEphbiBNYXllblwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiTlBSXCIsXG4gICAgXCJudW1iZXJcIjogXCI1MjRcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJOZXBhbGVzZSBSdXBlZVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiTmVwYWxcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIk5aRFwiLFxuICAgIFwibnVtYmVyXCI6IFwiNTU0XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiTmV3IFplYWxhbmQgRG9sbGFyXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJDb29rIElzbGFuZHMgKFRoZSlcIixcbiAgICAgIFwiTmV3IFplYWxhbmRcIixcbiAgICAgIFwiTml1ZVwiLFxuICAgICAgXCJQaXRjYWlyblwiLFxuICAgICAgXCJUb2tlbGF1XCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJPTVJcIixcbiAgICBcIm51bWJlclwiOiBcIjUxMlwiLFxuICAgIFwiZGlnaXRzXCI6IDMsXG4gICAgXCJjdXJyZW5jeVwiOiBcIlJpYWwgT21hbmlcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIk9tYW5cIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlBBQlwiLFxuICAgIFwibnVtYmVyXCI6IFwiNTkwXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiQmFsYm9hXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJQYW5hbWFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlBFTlwiLFxuICAgIFwibnVtYmVyXCI6IFwiNjA0XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiU29sXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJQZXJ1XCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJQR0tcIixcbiAgICBcIm51bWJlclwiOiBcIjU5OFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIktpbmFcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIlBhcHVhIE5ldyBHdWluZWFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlBIUFwiLFxuICAgIFwibnVtYmVyXCI6IFwiNjA4XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiUGhpbGlwcGluZSBQZXNvXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJQaGlsaXBwaW5lcyAoVGhlKVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiUEtSXCIsXG4gICAgXCJudW1iZXJcIjogXCI1ODZcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJQYWtpc3RhbiBSdXBlZVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiUGFraXN0YW5cIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlBMTlwiLFxuICAgIFwibnVtYmVyXCI6IFwiOTg1XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiWmxvdHlcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIlBvbGFuZFwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiUFlHXCIsXG4gICAgXCJudW1iZXJcIjogXCI2MDBcIixcbiAgICBcImRpZ2l0c1wiOiAwLFxuICAgIFwiY3VycmVuY3lcIjogXCJHdWFyYW5pXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJQYXJhZ3VheVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiUUFSXCIsXG4gICAgXCJudW1iZXJcIjogXCI2MzRcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJRYXRhcmkgUmlhbFwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiUWF0YXJcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlJPTlwiLFxuICAgIFwibnVtYmVyXCI6IFwiOTQ2XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiUm9tYW5pYW4gTGV1XCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJSb21hbmlhXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJSU0RcIixcbiAgICBcIm51bWJlclwiOiBcIjk0MVwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIlNlcmJpYW4gRGluYXJcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIlNlcmJpYVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiUlVCXCIsXG4gICAgXCJudW1iZXJcIjogXCI2NDNcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJSdXNzaWFuIFJ1YmxlXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJSdXNzaWFuIEZlZGVyYXRpb24gKFRoZSlcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlJXRlwiLFxuICAgIFwibnVtYmVyXCI6IFwiNjQ2XCIsXG4gICAgXCJkaWdpdHNcIjogMCxcbiAgICBcImN1cnJlbmN5XCI6IFwiUndhbmRhIEZyYW5jXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJSd2FuZGFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlNBUlwiLFxuICAgIFwibnVtYmVyXCI6IFwiNjgyXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiU2F1ZGkgUml5YWxcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIlNhdWRpIEFyYWJpYVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiU0JEXCIsXG4gICAgXCJudW1iZXJcIjogXCIwOTBcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJTb2xvbW9uIElzbGFuZHMgRG9sbGFyXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJTb2xvbW9uIElzbGFuZHNcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlNDUlwiLFxuICAgIFwibnVtYmVyXCI6IFwiNjkwXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiU2V5Y2hlbGxlcyBSdXBlZVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiU2V5Y2hlbGxlc1wiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiU0RHXCIsXG4gICAgXCJudW1iZXJcIjogXCI5MzhcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJTdWRhbmVzZSBQb3VuZFwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiU3VkYW4gKFRoZSlcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlNFS1wiLFxuICAgIFwibnVtYmVyXCI6IFwiNzUyXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiU3dlZGlzaCBLcm9uYVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiU3dlZGVuXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJTR0RcIixcbiAgICBcIm51bWJlclwiOiBcIjcwMlwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIlNpbmdhcG9yZSBEb2xsYXJcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIlNpbmdhcG9yZVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiU0hQXCIsXG4gICAgXCJudW1iZXJcIjogXCI2NTRcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJTYWludCBIZWxlbmEgUG91bmRcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIlNhaW50IEhlbGVuYSwgQXNjZW5zaW9uIGFuZCBUcmlzdGFuIERhIEN1bmhhXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJTTExcIixcbiAgICBcIm51bWJlclwiOiBcIjY5NFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkxlb25lXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJTaWVycmEgTGVvbmVcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlNPU1wiLFxuICAgIFwibnVtYmVyXCI6IFwiNzA2XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiU29tYWxpIFNoaWxsaW5nXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJTb21hbGlhXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJTUkRcIixcbiAgICBcIm51bWJlclwiOiBcIjk2OFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIlN1cmluYW0gRG9sbGFyXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJTdXJpbmFtZVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiU1NQXCIsXG4gICAgXCJudW1iZXJcIjogXCI3MjhcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJTb3V0aCBTdWRhbmVzZSBQb3VuZFwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiU291dGggU3VkYW5cIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlNUTlwiLFxuICAgIFwibnVtYmVyXCI6IFwiOTMwXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiRG9icmFcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIlNhbyBUb21lIGFuZCBQcmluY2lwZVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiU1ZDXCIsXG4gICAgXCJudW1iZXJcIjogXCIyMjJcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJFbCBTYWx2YWRvciBDb2xvblwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiRWwgU2FsdmFkb3JcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlNZUFwiLFxuICAgIFwibnVtYmVyXCI6IFwiNzYwXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiU3lyaWFuIFBvdW5kXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJTeXJpYW4gQXJhYiBSZXB1YmxpY1wiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiU1pMXCIsXG4gICAgXCJudW1iZXJcIjogXCI3NDhcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJMaWxhbmdlbmlcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkVzd2F0aW5pXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJUSEJcIixcbiAgICBcIm51bWJlclwiOiBcIjc2NFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkJhaHRcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIlRoYWlsYW5kXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJUSlNcIixcbiAgICBcIm51bWJlclwiOiBcIjk3MlwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIlNvbW9uaVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiVGFqaWtpc3RhblwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiVE1UXCIsXG4gICAgXCJudW1iZXJcIjogXCI5MzRcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJUdXJrbWVuaXN0YW4gTmV3IE1hbmF0XCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJUdXJrbWVuaXN0YW5cIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlRORFwiLFxuICAgIFwibnVtYmVyXCI6IFwiNzg4XCIsXG4gICAgXCJkaWdpdHNcIjogMyxcbiAgICBcImN1cnJlbmN5XCI6IFwiVHVuaXNpYW4gRGluYXJcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIlR1bmlzaWFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlRPUFwiLFxuICAgIFwibnVtYmVyXCI6IFwiNzc2XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiUGHigJlhbmdhXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJUb25nYVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiVFJZXCIsXG4gICAgXCJudW1iZXJcIjogXCI5NDlcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJUdXJraXNoIExpcmFcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIlR1cmtleVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiVFREXCIsXG4gICAgXCJudW1iZXJcIjogXCI3ODBcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJUcmluaWRhZCBhbmQgVG9iYWdvIERvbGxhclwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiVHJpbmlkYWQgYW5kIFRvYmFnb1wiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiVFdEXCIsXG4gICAgXCJudW1iZXJcIjogXCI5MDFcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJOZXcgVGFpd2FuIERvbGxhclwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiVGFpd2FuIChQcm92aW5jZSBvZiBDaGluYSlcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlRaU1wiLFxuICAgIFwibnVtYmVyXCI6IFwiODM0XCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiVGFuemFuaWFuIFNoaWxsaW5nXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJUYW56YW5pYSwgVW5pdGVkIFJlcHVibGljIE9mXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJVQUhcIixcbiAgICBcIm51bWJlclwiOiBcIjk4MFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkhyeXZuaWFcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIlVrcmFpbmVcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlVHWFwiLFxuICAgIFwibnVtYmVyXCI6IFwiODAwXCIsXG4gICAgXCJkaWdpdHNcIjogMCxcbiAgICBcImN1cnJlbmN5XCI6IFwiVWdhbmRhIFNoaWxsaW5nXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJVZ2FuZGFcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlVTRFwiLFxuICAgIFwibnVtYmVyXCI6IFwiODQwXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiVVMgRG9sbGFyXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJBbWVyaWNhbiBTYW1vYVwiLFxuICAgICAgXCJCb25haXJlLCBTaW50IEV1c3RhdGl1cyBhbmQgU2FiYVwiLFxuICAgICAgXCJCcml0aXNoIEluZGlhbiBPY2VhbiBUZXJyaXRvcnkgKFRoZSlcIixcbiAgICAgIFwiRWN1YWRvclwiLFxuICAgICAgXCJFbCBTYWx2YWRvclwiLFxuICAgICAgXCJHdWFtXCIsXG4gICAgICBcIkhhaXRpXCIsXG4gICAgICBcIk1hcnNoYWxsIElzbGFuZHMgKFRoZSlcIixcbiAgICAgIFwiTWljcm9uZXNpYSAoRmVkZXJhdGVkIFN0YXRlcyBPZilcIixcbiAgICAgIFwiTm9ydGhlcm4gTWFyaWFuYSBJc2xhbmRzIChUaGUpXCIsXG4gICAgICBcIlBhbGF1XCIsXG4gICAgICBcIlBhbmFtYVwiLFxuICAgICAgXCJQdWVydG8gUmljb1wiLFxuICAgICAgXCJUaW1vci1MZXN0ZVwiLFxuICAgICAgXCJUdXJrcyBhbmQgQ2FpY29zIElzbGFuZHMgKFRoZSlcIixcbiAgICAgIFwiVW5pdGVkIFN0YXRlcyBNaW5vciBPdXRseWluZyBJc2xhbmRzIChUaGUpXCIsXG4gICAgICBcIlVuaXRlZCBTdGF0ZXMgb2YgQW1lcmljYSAoVGhlKVwiLFxuICAgICAgXCJWaXJnaW4gSXNsYW5kcyAoQnJpdGlzaClcIixcbiAgICAgIFwiVmlyZ2luIElzbGFuZHMgKFUuUy4pXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJVU05cIixcbiAgICBcIm51bWJlclwiOiBcIjk5N1wiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIlVTIERvbGxhciAoTmV4dCBkYXkpXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJVbml0ZWQgU3RhdGVzIG9mIEFtZXJpY2EgKFRoZSlcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlVZSVwiLFxuICAgIFwibnVtYmVyXCI6IFwiOTQwXCIsXG4gICAgXCJkaWdpdHNcIjogMCxcbiAgICBcImN1cnJlbmN5XCI6IFwiVXJ1Z3VheSBQZXNvIGVuIFVuaWRhZGVzIEluZGV4YWRhcyAoVUkpXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJVcnVndWF5XCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJVWVVcIixcbiAgICBcIm51bWJlclwiOiBcIjg1OFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIlBlc28gVXJ1Z3VheW9cIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIlVydWd1YXlcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlVZV1wiLFxuICAgIFwibnVtYmVyXCI6IFwiOTI3XCIsXG4gICAgXCJkaWdpdHNcIjogNCxcbiAgICBcImN1cnJlbmN5XCI6IFwiVW5pZGFkIFByZXZpc2lvbmFsXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJVcnVndWF5XCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJVWlNcIixcbiAgICBcIm51bWJlclwiOiBcIjg2MFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIlV6YmVraXN0YW4gU3VtXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJVemJla2lzdGFuXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJWRVNcIixcbiAgICBcIm51bWJlclwiOiBcIjkyOFwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkJvbMOtdmFyIFNvYmVyYW5vXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJWZW5lenVlbGEgKEJvbGl2YXJpYW4gUmVwdWJsaWMgT2YpXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJWTkRcIixcbiAgICBcIm51bWJlclwiOiBcIjcwNFwiLFxuICAgIFwiZGlnaXRzXCI6IDAsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkRvbmdcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIlZpZXQgTmFtXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJWVVZcIixcbiAgICBcIm51bWJlclwiOiBcIjU0OFwiLFxuICAgIFwiZGlnaXRzXCI6IDAsXG4gICAgXCJjdXJyZW5jeVwiOiBcIlZhdHVcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIlZhbnVhdHVcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIldTVFwiLFxuICAgIFwibnVtYmVyXCI6IFwiODgyXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiVGFsYVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiU2Ftb2FcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlhBRlwiLFxuICAgIFwibnVtYmVyXCI6IFwiOTUwXCIsXG4gICAgXCJkaWdpdHNcIjogMCxcbiAgICBcImN1cnJlbmN5XCI6IFwiQ0ZBIEZyYW5jIEJFQUNcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkNhbWVyb29uXCIsXG4gICAgICBcIkNlbnRyYWwgQWZyaWNhbiBSZXB1YmxpYyAoVGhlKVwiLFxuICAgICAgXCJDaGFkXCIsXG4gICAgICBcIkNvbmdvIChUaGUpXCIsXG4gICAgICBcIkVxdWF0b3JpYWwgR3VpbmVhXCIsXG4gICAgICBcIkdhYm9uXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJYQUdcIixcbiAgICBcIm51bWJlclwiOiBcIjk2MVwiLFxuICAgIFwiZGlnaXRzXCI6IDAsXG4gICAgXCJjdXJyZW5jeVwiOiBcIlNpbHZlclwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiWnoxMV9zaWx2ZXJcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlhBVVwiLFxuICAgIFwibnVtYmVyXCI6IFwiOTU5XCIsXG4gICAgXCJkaWdpdHNcIjogMCxcbiAgICBcImN1cnJlbmN5XCI6IFwiR29sZFwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiWnowOF9nb2xkXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJYQkFcIixcbiAgICBcIm51bWJlclwiOiBcIjk1NVwiLFxuICAgIFwiZGlnaXRzXCI6IDAsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkJvbmQgTWFya2V0cyBVbml0IEV1cm9wZWFuIENvbXBvc2l0ZSBVbml0IChFVVJDTylcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIlp6MDFfYm9uZCBNYXJrZXRzIFVuaXQgRXVyb3BlYW5fZXVyY29cIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlhCQlwiLFxuICAgIFwibnVtYmVyXCI6IFwiOTU2XCIsXG4gICAgXCJkaWdpdHNcIjogMCxcbiAgICBcImN1cnJlbmN5XCI6IFwiQm9uZCBNYXJrZXRzIFVuaXQgRXVyb3BlYW4gTW9uZXRhcnkgVW5pdCAoRS5NLlUuLTYpXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJaejAyX2JvbmQgTWFya2V0cyBVbml0IEV1cm9wZWFuX2VtdS02XCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJYQkNcIixcbiAgICBcIm51bWJlclwiOiBcIjk1N1wiLFxuICAgIFwiZGlnaXRzXCI6IDAsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkJvbmQgTWFya2V0cyBVbml0IEV1cm9wZWFuIFVuaXQgb2YgQWNjb3VudCA5IChFLlUuQS4tOSlcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIlp6MDNfYm9uZCBNYXJrZXRzIFVuaXQgRXVyb3BlYW5fZXVhLTlcIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlhCRFwiLFxuICAgIFwibnVtYmVyXCI6IFwiOTU4XCIsXG4gICAgXCJkaWdpdHNcIjogMCxcbiAgICBcImN1cnJlbmN5XCI6IFwiQm9uZCBNYXJrZXRzIFVuaXQgRXVyb3BlYW4gVW5pdCBvZiBBY2NvdW50IDE3IChFLlUuQS4tMTcpXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJaejA0X2JvbmQgTWFya2V0cyBVbml0IEV1cm9wZWFuX2V1YS0xN1wiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiWENEXCIsXG4gICAgXCJudW1iZXJcIjogXCI5NTFcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJFYXN0IENhcmliYmVhbiBEb2xsYXJcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkFuZ3VpbGxhXCIsXG4gICAgICBcIkFudGlndWEgYW5kIEJhcmJ1ZGFcIixcbiAgICAgIFwiRG9taW5pY2FcIixcbiAgICAgIFwiR3JlbmFkYVwiLFxuICAgICAgXCJNb250c2VycmF0XCIsXG4gICAgICBcIlNhaW50IEtpdHRzIGFuZCBOZXZpc1wiLFxuICAgICAgXCJTYWludCBMdWNpYVwiLFxuICAgICAgXCJTYWludCBWaW5jZW50IGFuZCB0aGUgR3JlbmFkaW5lc1wiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiWERSXCIsXG4gICAgXCJudW1iZXJcIjogXCI5NjBcIixcbiAgICBcImRpZ2l0c1wiOiAwLFxuICAgIFwiY3VycmVuY3lcIjogXCJTRFIgKFNwZWNpYWwgRHJhd2luZyBSaWdodClcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkludGVybmF0aW9uYWwgTW9uZXRhcnkgRnVuZCAoSW1mKcKgXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJYT0ZcIixcbiAgICBcIm51bWJlclwiOiBcIjk1MlwiLFxuICAgIFwiZGlnaXRzXCI6IDAsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkNGQSBGcmFuYyBCQ0VBT1wiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiQmVuaW5cIixcbiAgICAgIFwiQnVya2luYSBGYXNvXCIsXG4gICAgICBcIkPDtHRlIGQnSXZvaXJlXCIsXG4gICAgICBcIkd1aW5lYS1CaXNzYXVcIixcbiAgICAgIFwiTWFsaVwiLFxuICAgICAgXCJOaWdlciAoVGhlKVwiLFxuICAgICAgXCJTZW5lZ2FsXCIsXG4gICAgICBcIlRvZ29cIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlhQRFwiLFxuICAgIFwibnVtYmVyXCI6IFwiOTY0XCIsXG4gICAgXCJkaWdpdHNcIjogMCxcbiAgICBcImN1cnJlbmN5XCI6IFwiUGFsbGFkaXVtXCIsXG4gICAgXCJjb3VudHJpZXNcIjogW1xuICAgICAgXCJaejA5X3BhbGxhZGl1bVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiWFBGXCIsXG4gICAgXCJudW1iZXJcIjogXCI5NTNcIixcbiAgICBcImRpZ2l0c1wiOiAwLFxuICAgIFwiY3VycmVuY3lcIjogXCJDRlAgRnJhbmNcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIkZyZW5jaCBQb2x5bmVzaWFcIixcbiAgICAgIFwiTmV3IENhbGVkb25pYVwiLFxuICAgICAgXCJXYWxsaXMgYW5kIEZ1dHVuYVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiWFBUXCIsXG4gICAgXCJudW1iZXJcIjogXCI5NjJcIixcbiAgICBcImRpZ2l0c1wiOiAwLFxuICAgIFwiY3VycmVuY3lcIjogXCJQbGF0aW51bVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiWnoxMF9wbGF0aW51bVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiWFNVXCIsXG4gICAgXCJudW1iZXJcIjogXCI5OTRcIixcbiAgICBcImRpZ2l0c1wiOiAwLFxuICAgIFwiY3VycmVuY3lcIjogXCJTdWNyZVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiU2lzdGVtYSBVbml0YXJpbyBEZSBDb21wZW5zYWNpb24gUmVnaW9uYWwgRGUgUGFnb3MgXFxcIlN1Y3JlXFxcIlwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiWFRTXCIsXG4gICAgXCJudW1iZXJcIjogXCI5NjNcIixcbiAgICBcImRpZ2l0c1wiOiAwLFxuICAgIFwiY3VycmVuY3lcIjogXCJDb2RlcyBzcGVjaWZpY2FsbHkgcmVzZXJ2ZWQgZm9yIHRlc3RpbmcgcHVycG9zZXNcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIlp6MDZfdGVzdGluZ19jb2RlXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJYVUFcIixcbiAgICBcIm51bWJlclwiOiBcIjk2NVwiLFxuICAgIFwiZGlnaXRzXCI6IDAsXG4gICAgXCJjdXJyZW5jeVwiOiBcIkFEQiBVbml0IG9mIEFjY291bnRcIixcbiAgICBcImNvdW50cmllc1wiOiBbXG4gICAgICBcIk1lbWJlciBDb3VudHJpZXMgb2YgdGhlIEFmcmljYW4gRGV2ZWxvcG1lbnQgQmFuayBHcm91cFwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiWFhYXCIsXG4gICAgXCJudW1iZXJcIjogXCI5OTlcIixcbiAgICBcImRpZ2l0c1wiOiAwLFxuICAgIFwiY3VycmVuY3lcIjogXCJUaGUgY29kZXMgYXNzaWduZWQgZm9yIHRyYW5zYWN0aW9ucyB3aGVyZSBubyBjdXJyZW5jeSBpcyBpbnZvbHZlZFwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiWnowN19ub19jdXJyZW5jeVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiWUVSXCIsXG4gICAgXCJudW1iZXJcIjogXCI4ODZcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJZZW1lbmkgUmlhbFwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiWWVtZW5cIlxuICAgIF1cbiAgfSxcbiAge1xuICAgIFwiY29kZVwiOiBcIlpBUlwiLFxuICAgIFwibnVtYmVyXCI6IFwiNzEwXCIsXG4gICAgXCJkaWdpdHNcIjogMixcbiAgICBcImN1cnJlbmN5XCI6IFwiUmFuZFwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiTGVzb3Rob1wiLFxuICAgICAgXCJOYW1pYmlhXCIsXG4gICAgICBcIlNvdXRoIEFmcmljYVwiXG4gICAgXVxuICB9LFxuICB7XG4gICAgXCJjb2RlXCI6IFwiWk1XXCIsXG4gICAgXCJudW1iZXJcIjogXCI5NjdcIixcbiAgICBcImRpZ2l0c1wiOiAyLFxuICAgIFwiY3VycmVuY3lcIjogXCJaYW1iaWFuIEt3YWNoYVwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiWmFtYmlhXCJcbiAgICBdXG4gIH0sXG4gIHtcbiAgICBcImNvZGVcIjogXCJaV0xcIixcbiAgICBcIm51bWJlclwiOiBcIjkzMlwiLFxuICAgIFwiZGlnaXRzXCI6IDIsXG4gICAgXCJjdXJyZW5jeVwiOiBcIlppbWJhYndlIERvbGxhclwiLFxuICAgIFwiY291bnRyaWVzXCI6IFtcbiAgICAgIFwiWmltYmFid2VcIlxuICAgIF1cbiAgfVxuXTsiLCJ2YXIgZmlyc3QgPSByZXF1aXJlKCdmaXJzdC1tYXRjaCcpO1xudmFyIG51YiA9IHJlcXVpcmUoJ251YicpO1xudmFyIGRhdGEgPSByZXF1aXJlKCcuL2RhdGEnKTtcbnZhciBwdWJsaXNoRGF0ZSA9IHJlcXVpcmUoJy4vaXNvLTQyMTctcHVibGlzaC1kYXRlJyk7XG5cbnZhciBjb2RlID0gZnVuY3Rpb24oY29kZSkge1xuICBjb2RlID0gY29kZS50b1VwcGVyQ2FzZSgpO1xuXG4gIHJldHVybiBmaXJzdChkYXRhLCBmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIGMuY29kZSA9PT0gY29kZTtcbiAgfSk7XG59O1xudmFyIGNvdW50cnkgPSBmdW5jdGlvbihjb3VudHJ5KSB7XG4gIGNvdW50cnkgPSBjb3VudHJ5LnRvTG93ZXJDYXNlKCk7XG5cbiAgcmV0dXJuIGRhdGEuZmlsdGVyKGZ1bmN0aW9uKGMpIHtcbiAgICByZXR1cm4gKGMuY291bnRyaWVzLm1hcChmdW5jdGlvbihjKSB7IHJldHVybiBjLnRvTG93ZXJDYXNlKCk7IH0gKSB8fCBbXSkuaW5kZXhPZihjb3VudHJ5KSA+IC0xO1xuICB9KTtcbn07XG52YXIgbnVtYmVyID0gZnVuY3Rpb24obnVtYmVyKSB7XG4gIHJldHVybiBmaXJzdChkYXRhLCBmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIGMubnVtYmVyID09PSBTdHJpbmcobnVtYmVyKTtcbiAgfSk7XG59O1xudmFyIGNvZGVzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBkYXRhLm1hcChmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIGMuY29kZTtcbiAgfSk7XG59O1xudmFyIG51bWJlcnMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGl0ZW1zID0gZGF0YS5tYXAoZnVuY3Rpb24oYykge1xuICAgIHJldHVybiBjLm51bWJlcjtcbiAgfSk7XG5cbiAgLy8gaGFuZGxlIGNhc2VzIHdoZXJlIG51bWJlciBpcyB1bmRlZmluZWQgKGUuZy4gWEZVIGFuZCBYQlQpXG4gIHJldHVybiBpdGVtcy5maWx0ZXIoZnVuY3Rpb24obikge1xuICAgIGlmIChuKSB7XG4gICAgICByZXR1cm4gbjtcbiAgICB9XG4gIH0pO1xufTtcbnZhciBjb3VudHJpZXMgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG0gPSBkYXRhXG4gICAgLmZpbHRlcihmdW5jdGlvbihjKSB7XG4gICAgICByZXR1cm4gYy5jb3VudHJpZXM7XG4gICAgfSlcbiAgICAubWFwKGZ1bmN0aW9uKGMpIHtcbiAgICAgIHJldHVybiBjLmNvdW50cmllcztcbiAgICB9KTtcbiAgcmV0dXJuIG51YihBcnJheS5wcm90b3R5cGUuY29uY2F0LmFwcGx5KFtdLCBtKSk7XG59O1xuXG5leHBvcnRzLmNvZGUgPSBjb2RlO1xuZXhwb3J0cy5jb3VudHJ5ID0gY291bnRyeTtcbmV4cG9ydHMubnVtYmVyID0gbnVtYmVyO1xuZXhwb3J0cy5jb2RlcyA9IGNvZGVzO1xuZXhwb3J0cy5udW1iZXJzID0gbnVtYmVycztcbmV4cG9ydHMuY291bnRyaWVzID0gY291bnRyaWVzO1xuZXhwb3J0cy5wdWJsaXNoRGF0ZSA9IHB1Ymxpc2hEYXRlO1xuZXhwb3J0cy5kYXRhID0gZGF0YTtcbiIsIi8qXG5cdEZvbGxvd3MgSVNPIDQyMTcsIGh0dHBzOi8vd3d3Lmlzby5vcmcvaXNvLTQyMTctY3VycmVuY3ktY29kZXMuaHRtbFxuXHRTZWUgaHR0cHM6Ly93d3cuY3VycmVuY3ktaXNvLm9yZy9kYW0vZG93bmxvYWRzL2xpc3RzL2xpc3Rfb25lLnhtbFxuXHREYXRhIGxhc3QgdXBkYXRlZCAyMDE4LTA4LTI5XG4qL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFwiMjAxOC0wOC0yOVwiOyIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSID0gdHlwZW9mIFJlZmxlY3QgPT09ICdvYmplY3QnID8gUmVmbGVjdCA6IG51bGxcbnZhciBSZWZsZWN0QXBwbHkgPSBSICYmIHR5cGVvZiBSLmFwcGx5ID09PSAnZnVuY3Rpb24nXG4gID8gUi5hcHBseVxuICA6IGZ1bmN0aW9uIFJlZmxlY3RBcHBseSh0YXJnZXQsIHJlY2VpdmVyLCBhcmdzKSB7XG4gICAgcmV0dXJuIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKHRhcmdldCwgcmVjZWl2ZXIsIGFyZ3MpO1xuICB9XG5cbnZhciBSZWZsZWN0T3duS2V5c1xuaWYgKFIgJiYgdHlwZW9mIFIub3duS2V5cyA9PT0gJ2Z1bmN0aW9uJykge1xuICBSZWZsZWN0T3duS2V5cyA9IFIub3duS2V5c1xufSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG4gIFJlZmxlY3RPd25LZXlzID0gZnVuY3Rpb24gUmVmbGVjdE93bktleXModGFyZ2V0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRhcmdldClcbiAgICAgIC5jb25jYXQoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyh0YXJnZXQpKTtcbiAgfTtcbn0gZWxzZSB7XG4gIFJlZmxlY3RPd25LZXlzID0gZnVuY3Rpb24gUmVmbGVjdE93bktleXModGFyZ2V0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRhcmdldCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIFByb2Nlc3NFbWl0V2FybmluZyh3YXJuaW5nKSB7XG4gIGlmIChjb25zb2xlICYmIGNvbnNvbGUud2FybikgY29uc29sZS53YXJuKHdhcm5pbmcpO1xufVxuXG52YXIgTnVtYmVySXNOYU4gPSBOdW1iZXIuaXNOYU4gfHwgZnVuY3Rpb24gTnVtYmVySXNOYU4odmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9PSB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICBFdmVudEVtaXR0ZXIuaW5pdC5jYWxsKHRoaXMpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5tb2R1bGUuZXhwb3J0cy5vbmNlID0gb25jZTtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHNDb3VudCA9IDA7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbnZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbmZ1bmN0aW9uIGNoZWNrTGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIEZ1bmN0aW9uLiBSZWNlaXZlZCB0eXBlICcgKyB0eXBlb2YgbGlzdGVuZXIpO1xuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShFdmVudEVtaXR0ZXIsICdkZWZhdWx0TWF4TGlzdGVuZXJzJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkZWZhdWx0TWF4TGlzdGVuZXJzO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uKGFyZykge1xuICAgIGlmICh0eXBlb2YgYXJnICE9PSAnbnVtYmVyJyB8fCBhcmcgPCAwIHx8IE51bWJlcklzTmFOKGFyZykpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgb2YgXCJkZWZhdWx0TWF4TGlzdGVuZXJzXCIgaXMgb3V0IG9mIHJhbmdlLiBJdCBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIG51bWJlci4gUmVjZWl2ZWQgJyArIGFyZyArICcuJyk7XG4gICAgfVxuICAgIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSBhcmc7XG4gIH1cbn0pO1xuXG5FdmVudEVtaXR0ZXIuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gIGlmICh0aGlzLl9ldmVudHMgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgdGhpcy5fZXZlbnRzID09PSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykuX2V2ZW50cykge1xuICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICB9XG5cbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn07XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycyhuKSB7XG4gIGlmICh0eXBlb2YgbiAhPT0gJ251bWJlcicgfHwgbiA8IDAgfHwgTnVtYmVySXNOYU4obikpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVGhlIHZhbHVlIG9mIFwiblwiIGlzIG91dCBvZiByYW5nZS4gSXQgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBudW1iZXIuIFJlY2VpdmVkICcgKyBuICsgJy4nKTtcbiAgfVxuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIF9nZXRNYXhMaXN0ZW5lcnModGhhdCkge1xuICBpZiAodGhhdC5fbWF4TGlzdGVuZXJzID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICByZXR1cm4gdGhhdC5fbWF4TGlzdGVuZXJzO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmdldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIGdldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuIF9nZXRNYXhMaXN0ZW5lcnModGhpcyk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUpIHtcbiAgdmFyIGFyZ3MgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICB2YXIgZG9FcnJvciA9ICh0eXBlID09PSAnZXJyb3InKTtcblxuICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICBpZiAoZXZlbnRzICE9PSB1bmRlZmluZWQpXG4gICAgZG9FcnJvciA9IChkb0Vycm9yICYmIGV2ZW50cy5lcnJvciA9PT0gdW5kZWZpbmVkKTtcbiAgZWxzZSBpZiAoIWRvRXJyb3IpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKGRvRXJyb3IpIHtcbiAgICB2YXIgZXI7XG4gICAgaWYgKGFyZ3MubGVuZ3RoID4gMClcbiAgICAgIGVyID0gYXJnc1swXTtcbiAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgLy8gTm90ZTogVGhlIGNvbW1lbnRzIG9uIHRoZSBgdGhyb3dgIGxpbmVzIGFyZSBpbnRlbnRpb25hbCwgdGhleSBzaG93XG4gICAgICAvLyB1cCBpbiBOb2RlJ3Mgb3V0cHV0IGlmIHRoaXMgcmVzdWx0cyBpbiBhbiB1bmhhbmRsZWQgZXhjZXB0aW9uLlxuICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgfVxuICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmhhbmRsZWQgZXJyb3IuJyArIChlciA/ICcgKCcgKyBlci5tZXNzYWdlICsgJyknIDogJycpKTtcbiAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgIHRocm93IGVycjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgfVxuXG4gIHZhciBoYW5kbGVyID0gZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChoYW5kbGVyID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIFJlZmxlY3RBcHBseShoYW5kbGVyLCB0aGlzLCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgUmVmbGVjdEFwcGx5KGxpc3RlbmVyc1tpXSwgdGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmZ1bmN0aW9uIF9hZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBwcmVwZW5kKSB7XG4gIHZhciBtO1xuICB2YXIgZXZlbnRzO1xuICB2YXIgZXhpc3Rpbmc7XG5cbiAgY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG5cbiAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gIGlmIChldmVudHMgPT09IHVuZGVmaW5lZCkge1xuICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB0YXJnZXQuX2V2ZW50c0NvdW50ID0gMDtcbiAgfSBlbHNlIHtcbiAgICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAgIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgICBpZiAoZXZlbnRzLm5ld0xpc3RlbmVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRhcmdldC5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA/IGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gICAgICAvLyBSZS1hc3NpZ24gYGV2ZW50c2AgYmVjYXVzZSBhIG5ld0xpc3RlbmVyIGhhbmRsZXIgY291bGQgaGF2ZSBjYXVzZWQgdGhlXG4gICAgICAvLyB0aGlzLl9ldmVudHMgdG8gYmUgYXNzaWduZWQgdG8gYSBuZXcgb2JqZWN0XG4gICAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgICB9XG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV07XG4gIH1cblxuICBpZiAoZXhpc3RpbmcgPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gICAgKyt0YXJnZXQuX2V2ZW50c0NvdW50O1xuICB9IGVsc2Uge1xuICAgIGlmICh0eXBlb2YgZXhpc3RpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPVxuICAgICAgICBwcmVwZW5kID8gW2xpc3RlbmVyLCBleGlzdGluZ10gOiBbZXhpc3RpbmcsIGxpc3RlbmVyXTtcbiAgICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB9IGVsc2UgaWYgKHByZXBlbmQpIHtcbiAgICAgIGV4aXN0aW5nLnVuc2hpZnQobGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleGlzdGluZy5wdXNoKGxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICAgIG0gPSBfZ2V0TWF4TGlzdGVuZXJzKHRhcmdldCk7XG4gICAgaWYgKG0gPiAwICYmIGV4aXN0aW5nLmxlbmd0aCA+IG0gJiYgIWV4aXN0aW5nLndhcm5lZCkge1xuICAgICAgZXhpc3Rpbmcud2FybmVkID0gdHJ1ZTtcbiAgICAgIC8vIE5vIGVycm9yIGNvZGUgZm9yIHRoaXMgc2luY2UgaXQgaXMgYSBXYXJuaW5nXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVzdHJpY3RlZC1zeW50YXhcbiAgICAgIHZhciB3ID0gbmV3IEVycm9yKCdQb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5IGxlYWsgZGV0ZWN0ZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZy5sZW5ndGggKyAnICcgKyBTdHJpbmcodHlwZSkgKyAnIGxpc3RlbmVycyAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FkZGVkLiBVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ2luY3JlYXNlIGxpbWl0Jyk7XG4gICAgICB3Lm5hbWUgPSAnTWF4TGlzdGVuZXJzRXhjZWVkZWRXYXJuaW5nJztcbiAgICAgIHcuZW1pdHRlciA9IHRhcmdldDtcbiAgICAgIHcudHlwZSA9IHR5cGU7XG4gICAgICB3LmNvdW50ID0gZXhpc3RpbmcubGVuZ3RoO1xuICAgICAgUHJvY2Vzc0VtaXRXYXJuaW5nKHcpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiBhZGRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLCB0eXBlLCBsaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfTtcblxuZnVuY3Rpb24gb25jZVdyYXBwZXIoKSB7XG4gIGlmICghdGhpcy5maXJlZCkge1xuICAgIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHRoaXMudHlwZSwgdGhpcy53cmFwRm4pO1xuICAgIHRoaXMuZmlyZWQgPSB0cnVlO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCk7XG4gICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuYXBwbHkodGhpcy50YXJnZXQsIGFyZ3VtZW50cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX29uY2VXcmFwKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIHN0YXRlID0geyBmaXJlZDogZmFsc2UsIHdyYXBGbjogdW5kZWZpbmVkLCB0YXJnZXQ6IHRhcmdldCwgdHlwZTogdHlwZSwgbGlzdGVuZXI6IGxpc3RlbmVyIH07XG4gIHZhciB3cmFwcGVkID0gb25jZVdyYXBwZXIuYmluZChzdGF0ZSk7XG4gIHdyYXBwZWQubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgc3RhdGUud3JhcEZuID0gd3JhcHBlZDtcbiAgcmV0dXJuIHdyYXBwZWQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UodHlwZSwgbGlzdGVuZXIpIHtcbiAgY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG4gIHRoaXMub24odHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kT25jZUxpc3RlbmVyID1cbiAgICBmdW5jdGlvbiBwcmVwZW5kT25jZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgIHRoaXMucHJlcGVuZExpc3RlbmVyKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuLy8gRW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmIGFuZCBvbmx5IGlmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgbGlzdCwgZXZlbnRzLCBwb3NpdGlvbiwgaSwgb3JpZ2luYWxMaXN0ZW5lcjtcblxuICAgICAgY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmIChldmVudHMgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGxpc3QgPSBldmVudHNbdHlwZV07XG4gICAgICBpZiAobGlzdCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8IGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0Lmxpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbGlzdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwb3NpdGlvbiA9IC0xO1xuXG4gICAgICAgIGZvciAoaSA9IGxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHwgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsTGlzdGVuZXIgPSBsaXN0W2ldLmxpc3RlbmVyO1xuICAgICAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgICBpZiAocG9zaXRpb24gPT09IDApXG4gICAgICAgICAgbGlzdC5zaGlmdCgpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBzcGxpY2VPbmUobGlzdCwgcG9zaXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKVxuICAgICAgICAgIGV2ZW50c1t0eXBlXSA9IGxpc3RbMF07XG5cbiAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lciAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBvcmlnaW5hbExpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKHR5cGUpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMsIGV2ZW50cywgaTtcblxuICAgICAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICAgICAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnRzW3R5cGVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGVsZXRlIGV2ZW50c1t0eXBlXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGV2ZW50cyk7XG4gICAgICAgIHZhciBrZXk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBsaXN0ZW5lcnMgPSBldmVudHNbdHlwZV07XG5cbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgICAgIH0gZWxzZSBpZiAobGlzdGVuZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gTElGTyBvcmRlclxuICAgICAgICBmb3IgKGkgPSBsaXN0ZW5lcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuZnVuY3Rpb24gX2xpc3RlbmVycyh0YXJnZXQsIHR5cGUsIHVud3JhcCkge1xuICB2YXIgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG5cbiAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBbXTtcblxuICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcbiAgaWYgKGV2bGlzdGVuZXIgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gW107XG5cbiAgaWYgKHR5cGVvZiBldmxpc3RlbmVyID09PSAnZnVuY3Rpb24nKVxuICAgIHJldHVybiB1bndyYXAgPyBbZXZsaXN0ZW5lci5saXN0ZW5lciB8fCBldmxpc3RlbmVyXSA6IFtldmxpc3RlbmVyXTtcblxuICByZXR1cm4gdW53cmFwID9cbiAgICB1bndyYXBMaXN0ZW5lcnMoZXZsaXN0ZW5lcikgOiBhcnJheUNsb25lKGV2bGlzdGVuZXIsIGV2bGlzdGVuZXIubGVuZ3RoKTtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCB0cnVlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmF3TGlzdGVuZXJzID0gZnVuY3Rpb24gcmF3TGlzdGVuZXJzKHR5cGUpIHtcbiAgcmV0dXJuIF9saXN0ZW5lcnModGhpcywgdHlwZSwgZmFsc2UpO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5saXN0ZW5lckNvdW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbGlzdGVuZXJDb3VudC5jYWxsKGVtaXR0ZXIsIHR5cGUpO1xuICB9XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBsaXN0ZW5lckNvdW50O1xuZnVuY3Rpb24gbGlzdGVuZXJDb3VudCh0eXBlKSB7XG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHM7XG5cbiAgaWYgKGV2ZW50cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG5cbiAgICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSBpZiAoZXZsaXN0ZW5lciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIDA7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXZlbnROYW1lcyA9IGZ1bmN0aW9uIGV2ZW50TmFtZXMoKSB7XG4gIHJldHVybiB0aGlzLl9ldmVudHNDb3VudCA+IDAgPyBSZWZsZWN0T3duS2V5cyh0aGlzLl9ldmVudHMpIDogW107XG59O1xuXG5mdW5jdGlvbiBhcnJheUNsb25lKGFyciwgbikge1xuICB2YXIgY29weSA9IG5ldyBBcnJheShuKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpXG4gICAgY29weVtpXSA9IGFycltpXTtcbiAgcmV0dXJuIGNvcHk7XG59XG5cbmZ1bmN0aW9uIHNwbGljZU9uZShsaXN0LCBpbmRleCkge1xuICBmb3IgKDsgaW5kZXggKyAxIDwgbGlzdC5sZW5ndGg7IGluZGV4KyspXG4gICAgbGlzdFtpbmRleF0gPSBsaXN0W2luZGV4ICsgMV07XG4gIGxpc3QucG9wKCk7XG59XG5cbmZ1bmN0aW9uIHVud3JhcExpc3RlbmVycyhhcnIpIHtcbiAgdmFyIHJldCA9IG5ldyBBcnJheShhcnIubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXQubGVuZ3RoOyArK2kpIHtcbiAgICByZXRbaV0gPSBhcnJbaV0ubGlzdGVuZXIgfHwgYXJyW2ldO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIG9uY2UoZW1pdHRlciwgbmFtZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGZ1bmN0aW9uIGVycm9yTGlzdGVuZXIoZXJyKSB7XG4gICAgICBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKG5hbWUsIHJlc29sdmVyKTtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc29sdmVyKCkge1xuICAgICAgaWYgKHR5cGVvZiBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgZXJyb3JMaXN0ZW5lcik7XG4gICAgICB9XG4gICAgICByZXNvbHZlKFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgfTtcblxuICAgIGV2ZW50VGFyZ2V0QWdub3N0aWNBZGRMaXN0ZW5lcihlbWl0dGVyLCBuYW1lLCByZXNvbHZlciwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIGlmIChuYW1lICE9PSAnZXJyb3InKSB7XG4gICAgICBhZGRFcnJvckhhbmRsZXJJZkV2ZW50RW1pdHRlcihlbWl0dGVyLCBlcnJvckxpc3RlbmVyLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkRXJyb3JIYW5kbGVySWZFdmVudEVtaXR0ZXIoZW1pdHRlciwgaGFuZGxlciwgZmxhZ3MpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZXZlbnRUYXJnZXRBZ25vc3RpY0FkZExpc3RlbmVyKGVtaXR0ZXIsICdlcnJvcicsIGhhbmRsZXIsIGZsYWdzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBldmVudFRhcmdldEFnbm9zdGljQWRkTGlzdGVuZXIoZW1pdHRlciwgbmFtZSwgbGlzdGVuZXIsIGZsYWdzKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5vbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmIChmbGFncy5vbmNlKSB7XG4gICAgICBlbWl0dGVyLm9uY2UobmFtZSwgbGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbWl0dGVyLm9uKG5hbWUsIGxpc3RlbmVyKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIGVtaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIEV2ZW50VGFyZ2V0IGRvZXMgbm90IGhhdmUgYGVycm9yYCBldmVudCBzZW1hbnRpY3MgbGlrZSBOb2RlXG4gICAgLy8gRXZlbnRFbWl0dGVycywgd2UgZG8gbm90IGxpc3RlbiBmb3IgYGVycm9yYCBldmVudHMgaGVyZS5cbiAgICBlbWl0dGVyLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZnVuY3Rpb24gd3JhcExpc3RlbmVyKGFyZykge1xuICAgICAgLy8gSUUgZG9lcyBub3QgaGF2ZSBidWlsdGluIGB7IG9uY2U6IHRydWUgfWAgc3VwcG9ydCBzbyB3ZVxuICAgICAgLy8gaGF2ZSB0byBkbyBpdCBtYW51YWxseS5cbiAgICAgIGlmIChmbGFncy5vbmNlKSB7XG4gICAgICAgIGVtaXR0ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCB3cmFwTGlzdGVuZXIpO1xuICAgICAgfVxuICAgICAgbGlzdGVuZXIoYXJnKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgXCJlbWl0dGVyXCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIEV2ZW50RW1pdHRlci4gUmVjZWl2ZWQgdHlwZSAnICsgdHlwZW9mIGVtaXR0ZXIpO1xuICB9XG59XG4iLCJmdW5jdGlvbiB0cnV0aHkoZCkge1xuICByZXR1cm4gZFxufTtcblxuZnVuY3Rpb24gZmlyc3QoYXJyYXksIGNhbGxiYWNrLCBjb250ZXh0KSB7XG4gIHZhciBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IHRydXRoeVxuICAgICwgY29udGV4dCA9IGNvbnRleHQgfHwgYXJyYXlcbiAgICAsIHZhbHVlXG5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcnJheS5sZW5ndGg7IGkgPCBsOyBpICs9IDEpIHtcbiAgICBpZiAodmFsdWUgPSBjYWxsYmFjay5jYWxsKGNvbnRleHQsIGFycmF5W2ldLCBpKSkgcmV0dXJuIGFycmF5W2ldXG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZmlyc3QiLCIvKlxuICogbm9kZS1jYWNoZSA1LjEuMiAoIDIwMjAtMDctMDEgKVxuICogaHR0cHM6Ly9naXRodWIuY29tL25vZGUtY2FjaGUvbm9kZS1jYWNoZVxuICpcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICogaHR0cHM6Ly9naXRodWIuY29tL25vZGUtY2FjaGUvbm9kZS1jYWNoZS9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKlxuICogTWFpbnRhaW5lZCBieSAgKCAgKVxuKi9cbihmdW5jdGlvbigpIHtcbiAgdmFyIGV4cG9ydHM7XG5cbiAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvbm9kZV9jYWNoZScpO1xuXG4gIGV4cG9ydHMudmVyc2lvbiA9ICc1LjEuMic7XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIvKlxuICogbm9kZS1jYWNoZSA1LjEuMiAoIDIwMjAtMDctMDEgKVxuICogaHR0cHM6Ly9naXRodWIuY29tL25vZGUtY2FjaGUvbm9kZS1jYWNoZVxuICpcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICogaHR0cHM6Ly9naXRodWIuY29tL25vZGUtY2FjaGUvbm9kZS1jYWNoZS9ibG9iL21hc3Rlci9MSUNFTlNFXG4gKlxuICogTWFpbnRhaW5lZCBieSAgKCAgKVxuKi9cbihmdW5jdGlvbigpIHtcbiAgdmFyIEV2ZW50RW1pdHRlciwgTm9kZUNhY2hlLCBjbG9uZSxcbiAgICBzcGxpY2UgPSBbXS5zcGxpY2UsXG4gICAgYm91bmRNZXRob2RDaGVjayA9IGZ1bmN0aW9uKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgRXJyb3IoJ0JvdW5kIGluc3RhbmNlIG1ldGhvZCBhY2Nlc3NlZCBiZWZvcmUgYmluZGluZycpOyB9IH0sXG4gICAgaW5kZXhPZiA9IFtdLmluZGV4T2Y7XG5cbiAgY2xvbmUgPSByZXF1aXJlKFwiY2xvbmVcIik7XG5cbiAgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xuXG4gIC8vIGdlbmVyYXRlIHN1cGVyY2xhc3NcbiAgbW9kdWxlLmV4cG9ydHMgPSBOb2RlQ2FjaGUgPSAoZnVuY3Rpb24oKSB7XG4gICAgY2xhc3MgTm9kZUNhY2hlIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgICAgIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICAvLyAjIyBnZXRcblxuICAgICAgICAvLyBnZXQgYSBjYWNoZWQga2V5IGFuZCBjaGFuZ2UgdGhlIHN0YXRzXG5cbiAgICAgICAgLy8gKipQYXJhbWV0ZXJzOioqXG5cbiAgICAgICAgLy8gKiBga2V5YCAoIFN0cmluZyB8IE51bWJlciApOiBjYWNoZSBrZXlcblxuICAgICAgICAvLyAqKkV4YW1wbGU6KipcblxuICAgICAgICAvL1x0bXlDYWNoZS5nZXQgXCJteUtleVwiLCAoIGVyciwgdmFsIClcblxuICAgICAgICB0aGlzLmdldCA9IHRoaXMuZ2V0LmJpbmQodGhpcyk7XG4gICAgICAgIC8vICMjIG1nZXRcblxuICAgICAgICAvLyBnZXQgbXVsdGlwbGUgY2FjaGVkIGtleXMgYXQgb25jZSBhbmQgY2hhbmdlIHRoZSBzdGF0c1xuXG4gICAgICAgIC8vICoqUGFyYW1ldGVyczoqKlxuXG4gICAgICAgIC8vICogYGtleXNgICggU3RyaW5nfE51bWJlcltdICk6IGFuIGFycmF5IG9mIGtleXNcblxuICAgICAgICAvLyAqKkV4YW1wbGU6KipcblxuICAgICAgICAvL1x0bXlDYWNoZS5tZ2V0IFsgXCJmb29cIiwgXCJiYXJcIiBdXG5cbiAgICAgICAgdGhpcy5tZ2V0ID0gdGhpcy5tZ2V0LmJpbmQodGhpcyk7XG4gICAgICAgIC8vICMjIHNldFxuXG4gICAgICAgIC8vIHNldCBhIGNhY2hlZCBrZXkgYW5kIGNoYW5nZSB0aGUgc3RhdHNcblxuICAgICAgICAvLyAqKlBhcmFtZXRlcnM6KipcblxuICAgICAgICAvLyAqIGBrZXlgICggU3RyaW5nIHwgTnVtYmVyICk6IGNhY2hlIGtleVxuICAgICAgICAvLyAqIGB2YWx1ZWAgKCBBbnkgKTogQSBlbGVtZW50IHRvIGNhY2hlLiBJZiB0aGUgb3B0aW9uIGBvcHRpb24uZm9yY2VTdHJpbmdgIGlzIGB0cnVlYCB0aGUgbW9kdWxlIHRyeXMgdG8gdHJhbnNsYXRlIGl0IHRvIGEgc2VyaWFsaXplZCBKU09OXG4gICAgICAgIC8vICogYFsgdHRsIF1gICggTnVtYmVyIHwgU3RyaW5nICk6ICggb3B0aW9uYWwgKSBUaGUgdGltZSB0byBsaXZlIGluIHNlY29uZHMuXG5cbiAgICAgICAgLy8gKipFeGFtcGxlOioqXG5cbiAgICAgICAgLy9cdG15Q2FjaGUuc2V0IFwibXlLZXlcIiwgXCJteV9TdHJpbmcgVmFsdWVcIlxuXG4gICAgICAgIC8vXHRteUNhY2hlLnNldCBcIm15S2V5XCIsIFwibXlfU3RyaW5nIFZhbHVlXCIsIDEwXG5cbiAgICAgICAgdGhpcy5zZXQgPSB0aGlzLnNldC5iaW5kKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgLy8gIyMgbXNldFxuXG4gICAgICAgIC8vIHNldCBtdWx0aXBsZSBrZXlzIGF0IG9uY2VcblxuICAgICAgICAvLyAqKlBhcmFtZXRlcnM6KipcblxuICAgICAgICAvLyAqIGBrZXlWYWx1ZVNldGAgKCBPYmplY3RbXSApOiBhbiBhcnJheSBvZiBvYmplY3Qgd2hpY2ggaW5jbHVkZXMga2V5LHZhbHVlIGFuZCB0dGxcblxuICAgICAgICAvLyAqKkV4YW1wbGU6KipcblxuICAgICAgICAvL1x0bXlDYWNoZS5tc2V0KFxuICAgICAgICAvL1x0XHRbXG4gICAgICAgIC8vXHRcdFx0e1xuICAgICAgICAvL1x0XHRcdFx0a2V5OiBcIm15S2V5XCIsXG4gICAgICAgIC8vXHRcdFx0XHR2YWw6IFwibXlWYWx1ZVwiLFxuICAgICAgICAvL1x0XHRcdFx0dHRsOiBbdHRsIGluIHNlY29uZHNdXG4gICAgICAgIC8vXHRcdFx0fVxuICAgICAgICAvL1x0XHRdKVxuXG4gICAgICAgIHRoaXMubXNldCA9IHRoaXMubXNldC5iaW5kKHRoaXMpO1xuICAgICAgICAvLyAjIyBkZWxcblxuICAgICAgICAvLyByZW1vdmUga2V5c1xuXG4gICAgICAgIC8vICoqUGFyYW1ldGVyczoqKlxuXG4gICAgICAgIC8vICogYGtleXNgICggU3RyaW5nIHzCoE51bWJlciB8IFN0cmluZ3xOdW1iZXJbXSApOiBjYWNoZSBrZXkgdG8gZGVsZXRlIG9yIGEgYXJyYXkgb2YgY2FjaGUga2V5c1xuXG4gICAgICAgIC8vICoqUmV0dXJuKipcblxuICAgICAgICAvLyAoIE51bWJlciApOiBOdW1iZXIgb2YgZGVsZXRlZCBrZXlzXG5cbiAgICAgICAgLy8gKipFeGFtcGxlOioqXG5cbiAgICAgICAgLy9cdG15Q2FjaGUuZGVsKCBcIm15S2V5XCIgKVxuXG4gICAgICAgIHRoaXMuZGVsID0gdGhpcy5kZWwuYmluZCh0aGlzKTtcbiAgICAgICAgLy8gIyMgdGFrZVxuXG4gICAgICAgIC8vIGdldCB0aGUgY2FjaGVkIHZhbHVlIGFuZCByZW1vdmUgdGhlIGtleSBmcm9tIHRoZSBjYWNoZS5cbiAgICAgICAgLy8gRXF1aXZhbGVudCB0byBjYWxsaW5nIGBnZXQoa2V5KWAgKyBgZGVsKGtleSlgLlxuICAgICAgICAvLyBVc2VmdWwgZm9yIGltcGxlbWVudGluZyBgc2luZ2xlIHVzZWAgbWVjaGFuaXNtIHN1Y2ggYXMgT1RQLCB3aGVyZSBvbmNlIGEgdmFsdWUgaXMgcmVhZCBpdCB3aWxsIGJlY29tZSBvYnNvbGV0ZS5cblxuICAgICAgICAvLyAqKlBhcmFtZXRlcnM6KipcblxuICAgICAgICAvLyAqIGBrZXlgICggU3RyaW5nIHwgTnVtYmVyICk6IGNhY2hlIGtleVxuXG4gICAgICAgIC8vICoqRXhhbXBsZToqKlxuXG4gICAgICAgIC8vXHRteUNhY2hlLnRha2UgXCJteUtleVwiLCAoIGVyciwgdmFsIClcblxuICAgICAgICB0aGlzLnRha2UgPSB0aGlzLnRha2UuYmluZCh0aGlzKTtcbiAgICAgICAgLy8gIyMgdHRsXG5cbiAgICAgICAgLy8gcmVzZXQgb3IgcmVkZWZpbmUgdGhlIHR0bCBvZiBhIGtleS4gYHR0bGAgPSAwIG1lYW5zIGluZmluaXRlIGxpZmV0aW1lLlxuICAgICAgICAvLyBJZiBgdHRsYCBpcyBub3QgcGFzc2VkIHRoZSBkZWZhdWx0IHR0bCBpcyB1c2VkLlxuICAgICAgICAvLyBJZiBgdHRsYCA8IDAgdGhlIGtleSB3aWxsIGJlIGRlbGV0ZWQuXG5cbiAgICAgICAgLy8gKipQYXJhbWV0ZXJzOioqXG5cbiAgICAgICAgLy8gKiBga2V5YCAoIFN0cmluZyB8IE51bWJlciApOiBjYWNoZSBrZXkgdG8gcmVzZXQgdGhlIHR0bCB2YWx1ZVxuICAgICAgICAvLyAqIGB0dGxgICggTnVtYmVyICk6ICggb3B0aW9uYWwgLT4gb3B0aW9ucy5zdGRUVEwgfHwgMCApIFRoZSB0aW1lIHRvIGxpdmUgaW4gc2Vjb25kc1xuXG4gICAgICAgIC8vICoqUmV0dXJuKipcblxuICAgICAgICAvLyAoIEJvb2xlbiApOiBrZXkgZm91bmQgYW5kIHR0bCBzZXRcblxuICAgICAgICAvLyAqKkV4YW1wbGU6KipcblxuICAgICAgICAvL1x0bXlDYWNoZS50dGwoIFwibXlLZXlcIiApIC8vIHdpbGwgc2V0IHR0bCB0byBkZWZhdWx0IHR0bFxuXG4gICAgICAgIC8vXHRteUNhY2hlLnR0bCggXCJteUtleVwiLCAxMDAwIClcblxuICAgICAgICB0aGlzLnR0bCA9IHRoaXMudHRsLmJpbmQodGhpcyk7XG4gICAgICAgIC8vICMjIGdldFR0bFxuXG4gICAgICAgIC8vIHJlY2VpdmUgdGhlIHR0bCBvZiBhIGtleS5cblxuICAgICAgICAvLyAqKlBhcmFtZXRlcnM6KipcblxuICAgICAgICAvLyAqIGBrZXlgICggU3RyaW5nIHwgTnVtYmVyICk6IGNhY2hlIGtleSB0byBjaGVjayB0aGUgdHRsIHZhbHVlXG5cbiAgICAgICAgLy8gKipSZXR1cm4qKlxuXG4gICAgICAgIC8vICggTnVtYmVyfHVuZGVmaW5lZCApOiBUaGUgdGltZXN0YW1wIGluIG1zIHdoZW4gdGhlIGtleSB3aWxsIGV4cGlyZSwgMCBpZiBpdCB3aWxsIG5ldmVyIGV4cGlyZSBvciB1bmRlZmluZWQgaWYgaXQgbm90IGV4aXN0c1xuXG4gICAgICAgIC8vICoqRXhhbXBsZToqKlxuXG4gICAgICAgIC8vXHRteUNhY2hlLmdldFR0bCggXCJteUtleVwiIClcblxuICAgICAgICB0aGlzLmdldFR0bCA9IHRoaXMuZ2V0VHRsLmJpbmQodGhpcyk7XG4gICAgICAgIC8vICMjIGtleXNcblxuICAgICAgICAvLyBsaXN0IGFsbCBrZXlzIHdpdGhpbiB0aGlzIGNhY2hlXG5cbiAgICAgICAgLy8gKipSZXR1cm4qKlxuXG4gICAgICAgIC8vICggQXJyYXkgKTogQW4gYXJyYXkgb2YgYWxsIGtleXNcblxuICAgICAgICAvLyAqKkV4YW1wbGU6KipcblxuICAgICAgICAvLyAgICAgX2tleXMgPSBteUNhY2hlLmtleXMoKVxuXG4gICAgICAgIC8vICAgICAjIFsgXCJmb29cIiwgXCJiYXJcIiwgXCJmaXp6XCIsIFwiYnV6elwiLCBcImFub3RoZXJLZXlzXCIgXVxuXG4gICAgICAgIHRoaXMua2V5cyA9IHRoaXMua2V5cy5iaW5kKHRoaXMpO1xuICAgICAgICAvLyAjIyBoYXNcblxuICAgICAgICAvLyBDaGVjayBpZiBhIGtleSBpcyBjYWNoZWRcblxuICAgICAgICAvLyAqKlBhcmFtZXRlcnM6KipcblxuICAgICAgICAvLyAqIGBrZXlgICggU3RyaW5nIHwgTnVtYmVyICk6IGNhY2hlIGtleSB0byBjaGVjayB0aGUgdHRsIHZhbHVlXG5cbiAgICAgICAgLy8gKipSZXR1cm4qKlxuXG4gICAgICAgIC8vICggQm9vbGVhbiApOiBBIGJvb2xlYW4gdGhhdCBpbmRpY2F0ZXMgaWYgdGhlIGtleSBpcyBjYWNoZWRcblxuICAgICAgICAvLyAqKkV4YW1wbGU6KipcblxuICAgICAgICAvLyAgICAgX2V4aXN0cyA9IG15Q2FjaGUuaGFzKCdteUtleScpXG5cbiAgICAgICAgLy8gICAgICMgdHJ1ZVxuXG4gICAgICAgIHRoaXMuaGFzID0gdGhpcy5oYXMuYmluZCh0aGlzKTtcbiAgICAgICAgLy8gIyMgZ2V0U3RhdHNcblxuICAgICAgICAvLyBnZXQgdGhlIHN0YXRzXG5cbiAgICAgICAgLy8gKipQYXJhbWV0ZXJzOioqXG5cbiAgICAgICAgLy8gLVxuXG4gICAgICAgIC8vICoqUmV0dXJuKipcblxuICAgICAgICAvLyAoIE9iamVjdCApOiBTdGF0cyBkYXRhXG5cbiAgICAgICAgLy8gKipFeGFtcGxlOioqXG5cbiAgICAgICAgLy8gICAgIG15Q2FjaGUuZ2V0U3RhdHMoKVxuICAgICAgICAvLyAgICAgIyB7XG4gICAgICAgIC8vICAgICAjIGhpdHM6IDAsXG4gICAgICAgIC8vICAgICAjIG1pc3NlczogMCxcbiAgICAgICAgLy8gICAgICMga2V5czogMCxcbiAgICAgICAgLy8gICAgICMga3NpemU6IDAsXG4gICAgICAgIC8vICAgICAjIHZzaXplOiAwXG4gICAgICAgIC8vICAgICAjIH1cblxuICAgICAgICB0aGlzLmdldFN0YXRzID0gdGhpcy5nZXRTdGF0cy5iaW5kKHRoaXMpO1xuICAgICAgICAvLyAjIyBmbHVzaEFsbFxuXG4gICAgICAgIC8vIGZsdXNoIHRoZSB3aG9sZSBkYXRhIGFuZCByZXNldCB0aGUgc3RhdHNcblxuICAgICAgICAvLyAqKkV4YW1wbGU6KipcblxuICAgICAgICAvLyAgICAgbXlDYWNoZS5mbHVzaEFsbCgpXG5cbiAgICAgICAgLy8gICAgIG15Q2FjaGUuZ2V0U3RhdHMoKVxuICAgICAgICAvLyAgICAgIyB7XG4gICAgICAgIC8vICAgICAjIGhpdHM6IDAsXG4gICAgICAgIC8vICAgICAjIG1pc3NlczogMCxcbiAgICAgICAgLy8gICAgICMga2V5czogMCxcbiAgICAgICAgLy8gICAgICMga3NpemU6IDAsXG4gICAgICAgIC8vICAgICAjIHZzaXplOiAwXG4gICAgICAgIC8vICAgICAjIH1cblxuICAgICAgICB0aGlzLmZsdXNoQWxsID0gdGhpcy5mbHVzaEFsbC5iaW5kKHRoaXMpO1xuICAgICAgICBcbiAgICAgICAgLy8gIyMgZmx1c2hTdGF0c1xuXG4gICAgICAgIC8vIGZsdXNoIHRoZSBzdGF0cyBhbmQgcmVzZXQgYWxsIGNvdW50ZXJzIHRvIDBcblxuICAgICAgICAvLyAqKkV4YW1wbGU6KipcblxuICAgICAgICAvLyAgICAgbXlDYWNoZS5mbHVzaFN0YXRzKClcblxuICAgICAgICAvLyAgICAgbXlDYWNoZS5nZXRTdGF0cygpXG4gICAgICAgIC8vICAgICAjIHtcbiAgICAgICAgLy8gICAgICMgaGl0czogMCxcbiAgICAgICAgLy8gICAgICMgbWlzc2VzOiAwLFxuICAgICAgICAvLyAgICAgIyBrZXlzOiAwLFxuICAgICAgICAvLyAgICAgIyBrc2l6ZTogMCxcbiAgICAgICAgLy8gICAgICMgdnNpemU6IDBcbiAgICAgICAgLy8gICAgICMgfVxuXG4gICAgICAgIHRoaXMuZmx1c2hTdGF0cyA9IHRoaXMuZmx1c2hTdGF0cy5iaW5kKHRoaXMpO1xuICAgICAgICAvLyAjIyBjbG9zZVxuXG4gICAgICAgIC8vIFRoaXMgd2lsbCBjbGVhciB0aGUgaW50ZXJ2YWwgdGltZW91dCB3aGljaCBpcyBzZXQgb24gY2hlY2twZXJpb2Qgb3B0aW9uLlxuXG4gICAgICAgIC8vICoqRXhhbXBsZToqKlxuXG4gICAgICAgIC8vICAgICBteUNhY2hlLmNsb3NlKClcblxuICAgICAgICB0aGlzLmNsb3NlID0gdGhpcy5jbG9zZS5iaW5kKHRoaXMpO1xuICAgICAgICAvLyAjIyBfY2hlY2tEYXRhXG5cbiAgICAgICAgLy8gaW50ZXJuYWwgaG91c2VrZWVwaW5nIG1ldGhvZC5cbiAgICAgICAgLy8gQ2hlY2sgYWxsIHRoZSBjYWNoZWQgZGF0YSBhbmQgZGVsZXRlIHRoZSBpbnZhbGlkIHZhbHVlc1xuICAgICAgICB0aGlzLl9jaGVja0RhdGEgPSB0aGlzLl9jaGVja0RhdGEuYmluZCh0aGlzKTtcbiAgICAgICAgLy8gIyMgX2NoZWNrXG5cbiAgICAgICAgLy8gaW50ZXJuYWwgbWV0aG9kIHRoZSBjaGVjayB0aGUgdmFsdWUuIElmIGl0J3Mgbm90IHZhbGlkIGFueSBtb3JlIGRlbGV0ZSBpdFxuICAgICAgICB0aGlzLl9jaGVjayA9IHRoaXMuX2NoZWNrLmJpbmQodGhpcyk7XG4gICAgICAgIC8vICMjIF9pc0ludmFsaWRLZXlcblxuICAgICAgICAvLyBpbnRlcm5hbCBtZXRob2QgdG8gY2hlY2sgaWYgdGhlIHR5cGUgb2YgYSBrZXkgaXMgZWl0aGVyIGBudW1iZXJgIG9yIGBzdHJpbmdgXG4gICAgICAgIHRoaXMuX2lzSW52YWxpZEtleSA9IHRoaXMuX2lzSW52YWxpZEtleS5iaW5kKHRoaXMpO1xuICAgICAgICAvLyAjIyBfd3JhcFxuXG4gICAgICAgIC8vIGludGVybmFsIG1ldGhvZCB0byB3cmFwIGEgdmFsdWUgaW4gYW4gb2JqZWN0IHdpdGggc29tZSBtZXRhZGF0YVxuICAgICAgICB0aGlzLl93cmFwID0gdGhpcy5fd3JhcC5iaW5kKHRoaXMpO1xuICAgICAgICAvLyAjIyBfZ2V0VmFsTGVuZ3RoXG5cbiAgICAgICAgLy8gaW50ZXJuYWwgbWV0aG9kIHRvIGNhbGN1bGF0ZSB0aGUgdmFsdWUgbGVuZ3RoXG4gICAgICAgIHRoaXMuX2dldFZhbExlbmd0aCA9IHRoaXMuX2dldFZhbExlbmd0aC5iaW5kKHRoaXMpO1xuICAgICAgICAvLyAjIyBfZXJyb3JcblxuICAgICAgICAvLyBpbnRlcm5hbCBtZXRob2QgdG8gaGFuZGxlIGFuIGVycm9yIG1lc3NhZ2VcbiAgICAgICAgdGhpcy5fZXJyb3IgPSB0aGlzLl9lcnJvci5iaW5kKHRoaXMpO1xuICAgICAgICAvLyAjIyBfaW5pdEVycm9yc1xuXG4gICAgICAgIC8vIGludGVybmFsIG1ldGhvZCB0byBnZW5lcmF0ZSBlcnJvciBtZXNzYWdlIHRlbXBsYXRlc1xuICAgICAgICB0aGlzLl9pbml0RXJyb3JzID0gdGhpcy5faW5pdEVycm9ycy5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICB0aGlzLl9pbml0RXJyb3JzKCk7XG4gICAgICAgIC8vIGNvbnRhaW5lciBmb3IgY2FjaGVkIGRhdGFcbiAgICAgICAgdGhpcy5kYXRhID0ge307XG4gICAgICAgIC8vIG1vZHVsZSBvcHRpb25zXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgIC8vIGNvbnZlcnQgYWxsIGVsZW1lbnRzIHRvIHN0cmluZ1xuICAgICAgICAgIGZvcmNlU3RyaW5nOiBmYWxzZSxcbiAgICAgICAgICAvLyB1c2VkIHN0YW5kYXJkIHNpemUgZm9yIGNhbGN1bGF0aW5nIHZhbHVlIHNpemVcbiAgICAgICAgICBvYmplY3RWYWx1ZVNpemU6IDgwLFxuICAgICAgICAgIHByb21pc2VWYWx1ZVNpemU6IDgwLFxuICAgICAgICAgIGFycmF5VmFsdWVTaXplOiA0MCxcbiAgICAgICAgICAvLyBzdGFuZGFyZCB0aW1lIHRvIGxpdmUgaW4gc2Vjb25kcy4gMCA9IGluZmluaXR5O1xuICAgICAgICAgIHN0ZFRUTDogMCxcbiAgICAgICAgICAvLyB0aW1lIGluIHNlY29uZHMgdG8gY2hlY2sgYWxsIGRhdGEgYW5kIGRlbGV0ZSBleHBpcmVkIGtleXNcbiAgICAgICAgICBjaGVja3BlcmlvZDogNjAwLFxuICAgICAgICAgIC8vIGVuL2Rpc2FibGUgY2xvbmluZyBvZiB2YXJpYWJsZXMuIElmIGB0cnVlYCB5b3UnbGwgZ2V0IGEgY29weSBvZiB0aGUgY2FjaGVkIHZhcmlhYmxlLiBJZiBgZmFsc2VgIHlvdSdsbCBzYXZlIGFuZCBnZXQganVzdCB0aGUgcmVmZXJlbmNlXG4gICAgICAgICAgdXNlQ2xvbmVzOiB0cnVlLFxuICAgICAgICAgIC8vIHdoZXRoZXIgdmFsdWVzIHNob3VsZCBiZSBkZWxldGVkIGF1dG9tYXRpY2FsbHkgYXQgZXhwaXJhdGlvblxuICAgICAgICAgIGRlbGV0ZU9uRXhwaXJlOiB0cnVlLFxuICAgICAgICAgIC8vIGVuYWJsZSBsZWdhY3kgY2FsbGJhY2tzXG4gICAgICAgICAgZW5hYmxlTGVnYWN5Q2FsbGJhY2tzOiBmYWxzZSxcbiAgICAgICAgICAvLyBtYXggYW1vdW50IG9mIGtleXMgdGhhdCBhcmUgYmVpbmcgc3RvcmVkXG4gICAgICAgICAgbWF4S2V5czogLTFcbiAgICAgICAgfSwgdGhpcy5vcHRpb25zKTtcbiAgICAgICAgLy8gZ2VuZXJhdGUgZnVuY3Rpb25zIHdpdGggY2FsbGJhY2tzIChsZWdhY3kpXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZW5hYmxlTGVnYWN5Q2FsbGJhY2tzKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwiV0FSTklORyEgbm9kZS1jYWNoZSBsZWdhY3kgY2FsbGJhY2sgc3VwcG9ydCB3aWxsIGRyb3AgaW4gdjYueFwiKTtcbiAgICAgICAgICBbXCJnZXRcIiwgXCJtZ2V0XCIsIFwic2V0XCIsIFwiZGVsXCIsIFwidHRsXCIsIFwiZ2V0VHRsXCIsIFwia2V5c1wiLCBcImhhc1wiXS5mb3JFYWNoKChtZXRob2RLZXkpID0+IHtcbiAgICAgICAgICAgIHZhciBvbGRNZXRob2Q7XG4gICAgICAgICAgICAvLyByZWZlcmVuY2UgcmVhbCBmdW5jdGlvblxuICAgICAgICAgICAgb2xkTWV0aG9kID0gdGhpc1ttZXRob2RLZXldO1xuICAgICAgICAgICAgdGhpc1ttZXRob2RLZXldID0gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgICAgICB2YXIgY2IsIGVyciwgcmVmLCByZXM7XG4gICAgICAgICAgICAgIHJlZiA9IGFyZ3MsIFsuLi5hcmdzXSA9IHJlZiwgW2NiXSA9IHNwbGljZS5jYWxsKGFyZ3MsIC0xKTtcbiAgICAgICAgICAgICAgLy8gcmV0dXJuIGEgY2FsbGJhY2sgaWYgY2IgaXMgZGVmaW5lZCBhbmQgYSBmdW5jdGlvblxuICAgICAgICAgICAgICBpZiAodHlwZW9mIGNiID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgcmVzID0gb2xkTWV0aG9kKC4uLmFyZ3MpO1xuICAgICAgICAgICAgICAgICAgY2IobnVsbCwgcmVzKTtcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcjEpIHtcbiAgICAgICAgICAgICAgICAgIGVyciA9IGVycm9yMTtcbiAgICAgICAgICAgICAgICAgIGNiKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBvbGRNZXRob2QoLi4uYXJncywgY2IpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIHN0YXRpc3RpY3MgY29udGFpbmVyXG4gICAgICAgIHRoaXMuc3RhdHMgPSB7XG4gICAgICAgICAgaGl0czogMCxcbiAgICAgICAgICBtaXNzZXM6IDAsXG4gICAgICAgICAga2V5czogMCxcbiAgICAgICAgICBrc2l6ZTogMCxcbiAgICAgICAgICB2c2l6ZTogMFxuICAgICAgICB9O1xuICAgICAgICAvLyBwcmUgYWxsb2NhdGUgdmFsaWQga2V5dHlwZXMgYXJyYXlcbiAgICAgICAgdGhpcy52YWxpZEtleVR5cGVzID0gW1wic3RyaW5nXCIsIFwibnVtYmVyXCJdO1xuICAgICAgICAvLyBpbml0YWxpemUgY2hlY2tpbmcgcGVyaW9kXG4gICAgICAgIHRoaXMuX2NoZWNrRGF0YSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGdldChrZXkpIHtcbiAgICAgICAgdmFyIF9yZXQsIGVycjtcbiAgICAgICAgYm91bmRNZXRob2RDaGVjayh0aGlzLCBOb2RlQ2FjaGUpO1xuICAgICAgICAvLyBoYW5kbGUgaW52YWxpZCBrZXkgdHlwZXNcbiAgICAgICAgaWYgKChlcnIgPSB0aGlzLl9pc0ludmFsaWRLZXkoa2V5KSkgIT0gbnVsbCkge1xuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICAvLyBnZXQgZGF0YSBhbmQgaW5jcmVtZXQgc3RhdHNcbiAgICAgICAgaWYgKCh0aGlzLmRhdGFba2V5XSAhPSBudWxsKSAmJiB0aGlzLl9jaGVjayhrZXksIHRoaXMuZGF0YVtrZXldKSkge1xuICAgICAgICAgIHRoaXMuc3RhdHMuaGl0cysrO1xuICAgICAgICAgIF9yZXQgPSB0aGlzLl91bndyYXAodGhpcy5kYXRhW2tleV0pO1xuICAgICAgICAgIC8vIHJldHVybiBkYXRhXG4gICAgICAgICAgcmV0dXJuIF9yZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gaWYgbm90IGZvdW5kIHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgICB0aGlzLnN0YXRzLm1pc3NlcysrO1xuICAgICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgbWdldChrZXlzKSB7XG4gICAgICAgIHZhciBfZXJyLCBlcnIsIGksIGtleSwgbGVuLCBvUmV0O1xuICAgICAgICBib3VuZE1ldGhvZENoZWNrKHRoaXMsIE5vZGVDYWNoZSk7XG4gICAgICAgIC8vIGNvbnZlcnQgYSBzdHJpbmcgdG8gYW4gYXJyYXkgb2Ygb25lIGtleVxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoa2V5cykpIHtcbiAgICAgICAgICBfZXJyID0gdGhpcy5fZXJyb3IoXCJFS0VZU1RZUEVcIik7XG4gICAgICAgICAgdGhyb3cgX2VycjtcbiAgICAgICAgfVxuICAgICAgICAvLyBkZWZpbmUgcmV0dXJuXG4gICAgICAgIG9SZXQgPSB7fTtcbiAgICAgICAgZm9yIChpID0gMCwgbGVuID0ga2V5cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgLy8gaGFuZGxlIGludmFsaWQga2V5IHR5cGVzXG4gICAgICAgICAgaWYgKChlcnIgPSB0aGlzLl9pc0ludmFsaWRLZXkoa2V5KSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBnZXQgZGF0YSBhbmQgaW5jcmVtZW50IHN0YXRzXG4gICAgICAgICAgaWYgKCh0aGlzLmRhdGFba2V5XSAhPSBudWxsKSAmJiB0aGlzLl9jaGVjayhrZXksIHRoaXMuZGF0YVtrZXldKSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0cy5oaXRzKys7XG4gICAgICAgICAgICBvUmV0W2tleV0gPSB0aGlzLl91bndyYXAodGhpcy5kYXRhW2tleV0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpZiBub3QgZm91bmQgcmV0dXJuIGEgZXJyb3JcbiAgICAgICAgICAgIHRoaXMuc3RhdHMubWlzc2VzKys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIHJldHVybiBhbGwgZm91bmQga2V5c1xuICAgICAgICByZXR1cm4gb1JldDtcbiAgICAgIH1cblxuICAgICAgc2V0KGtleSwgdmFsdWUsIHR0bCkge1xuICAgICAgICB2YXIgX2VyciwgZXJyLCBleGlzdGVudDtcbiAgICAgICAgYm91bmRNZXRob2RDaGVjayh0aGlzLCBOb2RlQ2FjaGUpO1xuICAgICAgICAvLyBjaGVjayBpZiBjYWNoZSBpcyBvdmVyZmxvd2luZ1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLm1heEtleXMgPiAtMSAmJiB0aGlzLnN0YXRzLmtleXMgPj0gdGhpcy5vcHRpb25zLm1heEtleXMpIHtcbiAgICAgICAgICBfZXJyID0gdGhpcy5fZXJyb3IoXCJFQ0FDSEVGVUxMXCIpO1xuICAgICAgICAgIHRocm93IF9lcnI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZm9yY2UgdGhlIGRhdGEgdG8gc3RyaW5nXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZm9yY2VTdHJpbmcgJiYgIXR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgIHZhbHVlID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHNldCBkZWZhdWx0IHR0bCBpZiBub3QgcGFzc2VkXG4gICAgICAgIGlmICh0dGwgPT0gbnVsbCkge1xuICAgICAgICAgIHR0bCA9IHRoaXMub3B0aW9ucy5zdGRUVEw7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaGFuZGxlIGludmFsaWQga2V5IHR5cGVzXG4gICAgICAgIGlmICgoZXJyID0gdGhpcy5faXNJbnZhbGlkS2V5KGtleSkpICE9IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaW50ZXJuYWwgaGVscGVyIHZhcmlhYmxlc1xuICAgICAgICBleGlzdGVudCA9IGZhbHNlO1xuICAgICAgICAvLyByZW1vdmUgZXhpc3RpbmcgZGF0YSBmcm9tIHN0YXRzXG4gICAgICAgIGlmICh0aGlzLmRhdGFba2V5XSkge1xuICAgICAgICAgIGV4aXN0ZW50ID0gdHJ1ZTtcbiAgICAgICAgICB0aGlzLnN0YXRzLnZzaXplIC09IHRoaXMuX2dldFZhbExlbmd0aCh0aGlzLl91bndyYXAodGhpcy5kYXRhW2tleV0sIGZhbHNlKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gc2V0IHRoZSB2YWx1ZVxuICAgICAgICB0aGlzLmRhdGFba2V5XSA9IHRoaXMuX3dyYXAodmFsdWUsIHR0bCk7XG4gICAgICAgIHRoaXMuc3RhdHMudnNpemUgKz0gdGhpcy5fZ2V0VmFsTGVuZ3RoKHZhbHVlKTtcbiAgICAgICAgLy8gb25seSBhZGQgdGhlIGtleXMgYW5kIGtleS1zaXplIGlmIHRoZSBrZXkgaXMgbmV3XG4gICAgICAgIGlmICghZXhpc3RlbnQpIHtcbiAgICAgICAgICB0aGlzLnN0YXRzLmtzaXplICs9IHRoaXMuX2dldEtleUxlbmd0aChrZXkpO1xuICAgICAgICAgIHRoaXMuc3RhdHMua2V5cysrO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZW1pdChcInNldFwiLCBrZXksIHZhbHVlKTtcbiAgICAgICAgLy8gcmV0dXJuIHRydWVcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG5cbiAgICAgIG1zZXQoa2V5VmFsdWVTZXQpIHtcbiAgICAgICAgdmFyIF9lcnIsIGVyciwgaSwgaiwga2V5LCBrZXlWYWx1ZVBhaXIsIGxlbiwgbGVuMSwgdHRsLCB2YWw7XG4gICAgICAgIGJvdW5kTWV0aG9kQ2hlY2sodGhpcywgTm9kZUNhY2hlKTtcbiAgICAgICAgLy8gY2hlY2sgaWYgY2FjaGUgaXMgb3ZlcmZsb3dpbmdcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5tYXhLZXlzID4gLTEgJiYgdGhpcy5zdGF0cy5rZXlzICsga2V5VmFsdWVTZXQubGVuZ3RoID49IHRoaXMub3B0aW9ucy5tYXhLZXlzKSB7XG4gICAgICAgICAgX2VyciA9IHRoaXMuX2Vycm9yKFwiRUNBQ0hFRlVMTFwiKTtcbiAgICAgICAgICB0aHJvdyBfZXJyO1xuICAgICAgICB9XG5cbi8vIGxvb3Agb3ZlciBrZXlWYWx1ZVNldCB0byB2YWxpZGF0ZSBrZXkgYW5kIHR0bFxuICAgICAgICBmb3IgKGkgPSAwLCBsZW4gPSBrZXlWYWx1ZVNldC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIGtleVZhbHVlUGFpciA9IGtleVZhbHVlU2V0W2ldO1xuICAgICAgICAgICh7a2V5LCB2YWwsIHR0bH0gPSBrZXlWYWx1ZVBhaXIpO1xuICAgICAgICAgIC8vIGNoZWNrIGlmIHRoZXJlIGlzIHR0bCBhbmQgaXQncyBhIG51bWJlclxuICAgICAgICAgIGlmICh0dGwgJiYgdHlwZW9mIHR0bCAhPT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgX2VyciA9IHRoaXMuX2Vycm9yKFwiRVRUTFRZUEVcIik7XG4gICAgICAgICAgICB0aHJvdyBfZXJyO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBoYW5kbGUgaW52YWxpZCBrZXkgdHlwZXNcbiAgICAgICAgICBpZiAoKGVyciA9IHRoaXMuX2lzSW52YWxpZEtleShrZXkpKSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAoaiA9IDAsIGxlbjEgPSBrZXlWYWx1ZVNldC5sZW5ndGg7IGogPCBsZW4xOyBqKyspIHtcbiAgICAgICAgICBrZXlWYWx1ZVBhaXIgPSBrZXlWYWx1ZVNldFtqXTtcbiAgICAgICAgICAoe2tleSwgdmFsLCB0dGx9ID0ga2V5VmFsdWVQYWlyKTtcbiAgICAgICAgICB0aGlzLnNldChrZXksIHZhbCwgdHRsKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgZGVsKGtleXMpIHtcbiAgICAgICAgdmFyIGRlbENvdW50LCBlcnIsIGksIGtleSwgbGVuLCBvbGRWYWw7XG4gICAgICAgIGJvdW5kTWV0aG9kQ2hlY2sodGhpcywgTm9kZUNhY2hlKTtcbiAgICAgICAgLy8gY29udmVydCBrZXlzIHRvIGFuIGFycmF5IG9mIGl0c2VsZlxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoa2V5cykpIHtcbiAgICAgICAgICBrZXlzID0gW2tleXNdO1xuICAgICAgICB9XG4gICAgICAgIGRlbENvdW50ID0gMDtcbiAgICAgICAgZm9yIChpID0gMCwgbGVuID0ga2V5cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgLy8gaGFuZGxlIGludmFsaWQga2V5IHR5cGVzXG4gICAgICAgICAgaWYgKChlcnIgPSB0aGlzLl9pc0ludmFsaWRLZXkoa2V5KSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBvbmx5IGRlbGV0ZSBpZiBleGlzdGVudFxuICAgICAgICAgIGlmICh0aGlzLmRhdGFba2V5XSAhPSBudWxsKSB7XG4gICAgICAgICAgICAvLyBjYWxjIHRoZSBzdGF0c1xuICAgICAgICAgICAgdGhpcy5zdGF0cy52c2l6ZSAtPSB0aGlzLl9nZXRWYWxMZW5ndGgodGhpcy5fdW53cmFwKHRoaXMuZGF0YVtrZXldLCBmYWxzZSkpO1xuICAgICAgICAgICAgdGhpcy5zdGF0cy5rc2l6ZSAtPSB0aGlzLl9nZXRLZXlMZW5ndGgoa2V5KTtcbiAgICAgICAgICAgIHRoaXMuc3RhdHMua2V5cy0tO1xuICAgICAgICAgICAgZGVsQ291bnQrKztcbiAgICAgICAgICAgIC8vIGRlbGV0ZSB0aGUgdmFsdWVcbiAgICAgICAgICAgIG9sZFZhbCA9IHRoaXMuZGF0YVtrZXldO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuZGF0YVtrZXldO1xuICAgICAgICAgICAgLy8gcmV0dXJuIHRydWVcbiAgICAgICAgICAgIHRoaXMuZW1pdChcImRlbFwiLCBrZXksIG9sZFZhbC52KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRlbENvdW50O1xuICAgICAgfVxuXG4gICAgICB0YWtlKGtleSkge1xuICAgICAgICB2YXIgX3JldDtcbiAgICAgICAgYm91bmRNZXRob2RDaGVjayh0aGlzLCBOb2RlQ2FjaGUpO1xuICAgICAgICBfcmV0ID0gdGhpcy5nZXQoa2V5KTtcbiAgICAgICAgaWYgKChfcmV0ICE9IG51bGwpKSB7XG4gICAgICAgICAgdGhpcy5kZWwoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3JldDtcbiAgICAgIH1cblxuICAgICAgdHRsKGtleSwgdHRsKSB7XG4gICAgICAgIHZhciBlcnI7XG4gICAgICAgIGJvdW5kTWV0aG9kQ2hlY2sodGhpcywgTm9kZUNhY2hlKTtcbiAgICAgICAgdHRsIHx8ICh0dGwgPSB0aGlzLm9wdGlvbnMuc3RkVFRMKTtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaGFuZGxlIGludmFsaWQga2V5IHR5cGVzXG4gICAgICAgIGlmICgoZXJyID0gdGhpcy5faXNJbnZhbGlkS2V5KGtleSkpICE9IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY2hlY2sgZm9yIGV4aXN0ZW50IGRhdGEgYW5kIHVwZGF0ZSB0aGUgdHRsIHZhbHVlXG4gICAgICAgIGlmICgodGhpcy5kYXRhW2tleV0gIT0gbnVsbCkgJiYgdGhpcy5fY2hlY2soa2V5LCB0aGlzLmRhdGFba2V5XSkpIHtcbiAgICAgICAgICAvLyBpZiB0dGwgPCAwIGRlbGV0ZSB0aGUga2V5LiBvdGhlcndpc2UgcmVzZXQgdGhlIHZhbHVlXG4gICAgICAgICAgaWYgKHR0bCA+PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFba2V5XSA9IHRoaXMuX3dyYXAodGhpcy5kYXRhW2tleV0udiwgdHRsLCBmYWxzZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGVsKGtleSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHJldHVybiBmYWxzZSBpZiBrZXkgaGFzIG5vdCBiZWVuIGZvdW5kXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGdldFR0bChrZXkpIHtcbiAgICAgICAgdmFyIF90dGwsIGVycjtcbiAgICAgICAgYm91bmRNZXRob2RDaGVjayh0aGlzLCBOb2RlQ2FjaGUpO1xuICAgICAgICBpZiAoIWtleSkge1xuICAgICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaGFuZGxlIGludmFsaWQga2V5IHR5cGVzXG4gICAgICAgIGlmICgoZXJyID0gdGhpcy5faXNJbnZhbGlkS2V5KGtleSkpICE9IG51bGwpIHtcbiAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY2hlY2sgZm9yIGV4aXN0YW50IGRhdGEgYW5kIHVwZGF0ZSB0aGUgdHRsIHZhbHVlXG4gICAgICAgIGlmICgodGhpcy5kYXRhW2tleV0gIT0gbnVsbCkgJiYgdGhpcy5fY2hlY2soa2V5LCB0aGlzLmRhdGFba2V5XSkpIHtcbiAgICAgICAgICBfdHRsID0gdGhpcy5kYXRhW2tleV0udDtcbiAgICAgICAgICByZXR1cm4gX3R0bDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyByZXR1cm4gdW5kZWZpbmVkIGlmIGtleSBoYXMgbm90IGJlZW4gZm91bmRcbiAgICAgICAgICByZXR1cm4gdm9pZCAwO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGtleXMoKSB7XG4gICAgICAgIHZhciBfa2V5cztcbiAgICAgICAgYm91bmRNZXRob2RDaGVjayh0aGlzLCBOb2RlQ2FjaGUpO1xuICAgICAgICBfa2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuZGF0YSk7XG4gICAgICAgIHJldHVybiBfa2V5cztcbiAgICAgIH1cblxuICAgICAgaGFzKGtleSkge1xuICAgICAgICB2YXIgX2V4aXN0cztcbiAgICAgICAgYm91bmRNZXRob2RDaGVjayh0aGlzLCBOb2RlQ2FjaGUpO1xuICAgICAgICBfZXhpc3RzID0gKHRoaXMuZGF0YVtrZXldICE9IG51bGwpICYmIHRoaXMuX2NoZWNrKGtleSwgdGhpcy5kYXRhW2tleV0pO1xuICAgICAgICByZXR1cm4gX2V4aXN0cztcbiAgICAgIH1cblxuICAgICAgZ2V0U3RhdHMoKSB7XG4gICAgICAgIGJvdW5kTWV0aG9kQ2hlY2sodGhpcywgTm9kZUNhY2hlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdHM7XG4gICAgICB9XG5cbiAgICAgIGZsdXNoQWxsKF9zdGFydFBlcmlvZCA9IHRydWUpIHtcbiAgICAgICAgYm91bmRNZXRob2RDaGVjayh0aGlzLCBOb2RlQ2FjaGUpO1xuICAgICAgICAvLyBwYXJhbWV0ZXIganVzdCBmb3IgdGVzdGluZ1xuXG4gICAgICAgIC8vIHNldCBkYXRhIGVtcHR5XG4gICAgICAgIHRoaXMuZGF0YSA9IHt9O1xuICAgICAgICAvLyByZXNldCBzdGF0c1xuICAgICAgICB0aGlzLnN0YXRzID0ge1xuICAgICAgICAgIGhpdHM6IDAsXG4gICAgICAgICAgbWlzc2VzOiAwLFxuICAgICAgICAgIGtleXM6IDAsXG4gICAgICAgICAga3NpemU6IDAsXG4gICAgICAgICAgdnNpemU6IDBcbiAgICAgICAgfTtcbiAgICAgICAgLy8gcmVzZXQgY2hlY2sgcGVyaW9kXG4gICAgICAgIHRoaXMuX2tpbGxDaGVja1BlcmlvZCgpO1xuICAgICAgICB0aGlzLl9jaGVja0RhdGEoX3N0YXJ0UGVyaW9kKTtcbiAgICAgICAgdGhpcy5lbWl0KFwiZmx1c2hcIik7XG4gICAgICB9XG5cbiAgICAgIGZsdXNoU3RhdHMoKSB7XG4gICAgICAgIGJvdW5kTWV0aG9kQ2hlY2sodGhpcywgTm9kZUNhY2hlKTtcbiAgICAgICAgLy8gcmVzZXQgc3RhdHNcbiAgICAgICAgdGhpcy5zdGF0cyA9IHtcbiAgICAgICAgICBoaXRzOiAwLFxuICAgICAgICAgIG1pc3NlczogMCxcbiAgICAgICAgICBrZXlzOiAwLFxuICAgICAgICAgIGtzaXplOiAwLFxuICAgICAgICAgIHZzaXplOiAwXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZW1pdChcImZsdXNoX3N0YXRzXCIpO1xuICAgICAgfVxuXG4gICAgICBjbG9zZSgpIHtcbiAgICAgICAgYm91bmRNZXRob2RDaGVjayh0aGlzLCBOb2RlQ2FjaGUpO1xuICAgICAgICB0aGlzLl9raWxsQ2hlY2tQZXJpb2QoKTtcbiAgICAgIH1cblxuICAgICAgX2NoZWNrRGF0YShzdGFydFBlcmlvZCA9IHRydWUpIHtcbiAgICAgICAgdmFyIGtleSwgcmVmLCB2YWx1ZTtcbiAgICAgICAgYm91bmRNZXRob2RDaGVjayh0aGlzLCBOb2RlQ2FjaGUpO1xuICAgICAgICByZWYgPSB0aGlzLmRhdGE7XG4gICAgICAgIC8vIHJ1biB0aGUgaG91c2VrZWVwaW5nIG1ldGhvZFxuICAgICAgICBmb3IgKGtleSBpbiByZWYpIHtcbiAgICAgICAgICB2YWx1ZSA9IHJlZltrZXldO1xuICAgICAgICAgIHRoaXMuX2NoZWNrKGtleSwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGFydFBlcmlvZCAmJiB0aGlzLm9wdGlvbnMuY2hlY2twZXJpb2QgPiAwKSB7XG4gICAgICAgICAgdGhpcy5jaGVja1RpbWVvdXQgPSBzZXRUaW1lb3V0KHRoaXMuX2NoZWNrRGF0YSwgdGhpcy5vcHRpb25zLmNoZWNrcGVyaW9kICogMTAwMCwgc3RhcnRQZXJpb2QpO1xuICAgICAgICAgIGlmICgodGhpcy5jaGVja1RpbWVvdXQgIT0gbnVsbCkgJiYgKHRoaXMuY2hlY2tUaW1lb3V0LnVucmVmICE9IG51bGwpKSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrVGltZW91dC51bnJlZigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyAjIyBfa2lsbENoZWNrUGVyaW9kXG5cbiAgICAgIC8vIHN0b3AgdGhlIGNoZWNrZGF0YSBwZXJpb2QuIE9ubHkgbmVlZGVkIHRvIGFib3J0IHRoZSBzY3JpcHQgaW4gdGVzdGluZyBtb2RlLlxuICAgICAgX2tpbGxDaGVja1BlcmlvZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tUaW1lb3V0ICE9IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KHRoaXMuY2hlY2tUaW1lb3V0KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBfY2hlY2soa2V5LCBkYXRhKSB7XG4gICAgICAgIHZhciBfcmV0dmFsO1xuICAgICAgICBib3VuZE1ldGhvZENoZWNrKHRoaXMsIE5vZGVDYWNoZSk7XG4gICAgICAgIF9yZXR2YWwgPSB0cnVlO1xuICAgICAgICAvLyBkYXRhIGlzIGludmFsaWQgaWYgdGhlIHR0bCBpcyB0b28gb2xkIGFuZCBpcyBub3QgMFxuICAgICAgICAvLyBjb25zb2xlLmxvZyBkYXRhLnQgPCBEYXRlLm5vdygpLCBkYXRhLnQsIERhdGUubm93KClcbiAgICAgICAgaWYgKGRhdGEudCAhPT0gMCAmJiBkYXRhLnQgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWxldGVPbkV4cGlyZSkge1xuICAgICAgICAgICAgX3JldHZhbCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5kZWwoa2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5lbWl0KFwiZXhwaXJlZFwiLCBrZXksIHRoaXMuX3Vud3JhcChkYXRhKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZXR2YWw7XG4gICAgICB9XG5cbiAgICAgIF9pc0ludmFsaWRLZXkoa2V5KSB7XG4gICAgICAgIHZhciByZWY7XG4gICAgICAgIGJvdW5kTWV0aG9kQ2hlY2sodGhpcywgTm9kZUNhY2hlKTtcbiAgICAgICAgaWYgKHJlZiA9IHR5cGVvZiBrZXksIGluZGV4T2YuY2FsbCh0aGlzLnZhbGlkS2V5VHlwZXMsIHJlZikgPCAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX2Vycm9yKFwiRUtFWVRZUEVcIiwge1xuICAgICAgICAgICAgdHlwZTogdHlwZW9mIGtleVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIF93cmFwKHZhbHVlLCB0dGwsIGFzQ2xvbmUgPSB0cnVlKSB7XG4gICAgICAgIHZhciBsaXZldGltZSwgbm93LCBvUmV0dXJuLCB0dGxNdWx0aXBsaWNhdG9yO1xuICAgICAgICBib3VuZE1ldGhvZENoZWNrKHRoaXMsIE5vZGVDYWNoZSk7XG4gICAgICAgIGlmICghdGhpcy5vcHRpb25zLnVzZUNsb25lcykge1xuICAgICAgICAgIGFzQ2xvbmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBkZWZpbmUgdGhlIHRpbWUgdG8gbGl2ZVxuICAgICAgICBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICBsaXZldGltZSA9IDA7XG4gICAgICAgIHR0bE11bHRpcGxpY2F0b3IgPSAxMDAwO1xuICAgICAgICAvLyB1c2UgZ2l2ZW4gdHRsXG4gICAgICAgIGlmICh0dGwgPT09IDApIHtcbiAgICAgICAgICBsaXZldGltZSA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAodHRsKSB7XG4gICAgICAgICAgbGl2ZXRpbWUgPSBub3cgKyAodHRsICogdHRsTXVsdGlwbGljYXRvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gdXNlIHN0YW5kYXJkIHR0bFxuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3RkVFRMID09PSAwKSB7XG4gICAgICAgICAgICBsaXZldGltZSA9IHRoaXMub3B0aW9ucy5zdGRUVEw7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxpdmV0aW1lID0gbm93ICsgKHRoaXMub3B0aW9ucy5zdGRUVEwgKiB0dGxNdWx0aXBsaWNhdG9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gcmV0dXJuIHRoZSB3cmFwcGVkIHZhbHVlXG4gICAgICAgIHJldHVybiBvUmV0dXJuID0ge1xuICAgICAgICAgIHQ6IGxpdmV0aW1lLFxuICAgICAgICAgIHY6IGFzQ2xvbmUgPyBjbG9uZSh2YWx1ZSkgOiB2YWx1ZVxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICAvLyAjIyBfdW53cmFwXG5cbiAgICAgIC8vIGludGVybmFsIG1ldGhvZCB0byBleHRyYWN0IGdldCB0aGUgdmFsdWUgb3V0IG9mIHRoZSB3cmFwcGVkIHZhbHVlXG4gICAgICBfdW53cmFwKHZhbHVlLCBhc0Nsb25lID0gdHJ1ZSkge1xuICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy51c2VDbG9uZXMpIHtcbiAgICAgICAgICBhc0Nsb25lID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbHVlLnYgIT0gbnVsbCkge1xuICAgICAgICAgIGlmIChhc0Nsb25lKSB7XG4gICAgICAgICAgICByZXR1cm4gY2xvbmUodmFsdWUudik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZS52O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gIyMgX2dldEtleUxlbmd0aFxuXG4gICAgICAvLyBpbnRlcm5hbCBtZXRob2QgdGhlIGNhbGN1bGF0ZSB0aGUga2V5IGxlbmd0aFxuICAgICAgX2dldEtleUxlbmd0aChrZXkpIHtcbiAgICAgICAgcmV0dXJuIGtleS50b1N0cmluZygpLmxlbmd0aDtcbiAgICAgIH1cblxuICAgICAgX2dldFZhbExlbmd0aCh2YWx1ZSkge1xuICAgICAgICBib3VuZE1ldGhvZENoZWNrKHRoaXMsIE5vZGVDYWNoZSk7XG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAvLyBpZiB0aGUgdmFsdWUgaXMgYSBTdHJpbmcgZ2V0IHRoZSByZWFsIGxlbmd0aFxuICAgICAgICAgIHJldHVybiB2YWx1ZS5sZW5ndGg7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmZvcmNlU3RyaW5nKSB7XG4gICAgICAgICAgLy8gZm9yY2Ugc3RyaW5nIGlmIGl0J3MgZGVmaW5lZCBhbmQgbm90IHBhc3NlZFxuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSkubGVuZ3RoO1xuICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgLy8gaWYgdGhlIGRhdGEgaXMgYW4gQXJyYXkgbXVsdGlwbHkgZWFjaCBlbGVtZW50IHdpdGggYSBkZWZpbmVkIGRlZmF1bHQgbGVuZ3RoXG4gICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5hcnJheVZhbHVlU2l6ZSAqIHZhbHVlLmxlbmd0aDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICByZXR1cm4gODtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgKHZhbHVlICE9IG51bGwgPyB2YWx1ZS50aGVuIDogdm9pZCAwKSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgLy8gaWYgdGhlIGRhdGEgaXMgYSBQcm9taXNlLCB1c2UgZGVmaW5lZCBkZWZhdWx0XG4gICAgICAgICAgLy8gKGNhbid0IGNhbGN1bGF0ZSBhY3R1YWwvcmVzb2x2ZWQgdmFsdWUgc2l6ZSBzeW5jaHJvbm91c2x5KVxuICAgICAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMucHJvbWlzZVZhbHVlU2l6ZTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgQnVmZmVyICE9PSBcInVuZGVmaW5lZFwiICYmIEJ1ZmZlciAhPT0gbnVsbCA/IEJ1ZmZlci5pc0J1ZmZlcih2YWx1ZSkgOiB2b2lkIDApIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWUubGVuZ3RoO1xuICAgICAgICB9IGVsc2UgaWYgKCh2YWx1ZSAhPSBudWxsKSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAvLyBpZiB0aGUgZGF0YSBpcyBhbiBPYmplY3QgbXVsdGlwbHkgZWFjaCBlbGVtZW50IHdpdGggYSBkZWZpbmVkIGRlZmF1bHQgbGVuZ3RoXG4gICAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5vYmplY3RWYWx1ZVNpemUgKiBPYmplY3Qua2V5cyh2YWx1ZSkubGVuZ3RoO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJib29sZWFuXCIpIHtcbiAgICAgICAgICByZXR1cm4gODtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBkZWZhdWx0IGZhbGxiYWNrXG4gICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgX2Vycm9yKHR5cGUsIGRhdGEgPSB7fSkge1xuICAgICAgICB2YXIgZXJyb3I7XG4gICAgICAgIGJvdW5kTWV0aG9kQ2hlY2sodGhpcywgTm9kZUNhY2hlKTtcbiAgICAgICAgLy8gZ2VuZXJhdGUgdGhlIGVycm9yIG9iamVjdFxuICAgICAgICBlcnJvciA9IG5ldyBFcnJvcigpO1xuICAgICAgICBlcnJvci5uYW1lID0gdHlwZTtcbiAgICAgICAgZXJyb3IuZXJyb3Jjb2RlID0gdHlwZTtcbiAgICAgICAgZXJyb3IubWVzc2FnZSA9IHRoaXMuRVJST1JTW3R5cGVdICE9IG51bGwgPyB0aGlzLkVSUk9SU1t0eXBlXShkYXRhKSA6IFwiLVwiO1xuICAgICAgICBlcnJvci5kYXRhID0gZGF0YTtcbiAgICAgICAgLy8gcmV0dXJuIHRoZSBlcnJvciBvYmplY3RcbiAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgICAgfVxuXG4gICAgICBfaW5pdEVycm9ycygpIHtcbiAgICAgICAgdmFyIF9lcnJNc2csIF9lcnJULCByZWY7XG4gICAgICAgIGJvdW5kTWV0aG9kQ2hlY2sodGhpcywgTm9kZUNhY2hlKTtcbiAgICAgICAgdGhpcy5FUlJPUlMgPSB7fTtcbiAgICAgICAgcmVmID0gdGhpcy5fRVJST1JTO1xuICAgICAgICBmb3IgKF9lcnJUIGluIHJlZikge1xuICAgICAgICAgIF9lcnJNc2cgPSByZWZbX2VyclRdO1xuICAgICAgICAgIHRoaXMuRVJST1JTW19lcnJUXSA9IHRoaXMuY3JlYXRlRXJyb3JNZXNzYWdlKF9lcnJNc2cpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNyZWF0ZUVycm9yTWVzc2FnZShlcnJNc2cpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICByZXR1cm4gZXJyTXNnLnJlcGxhY2UoXCJfX2tleVwiLCBhcmdzLnR5cGUpO1xuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgfTtcblxuICAgIE5vZGVDYWNoZS5wcm90b3R5cGUuX0VSUk9SUyA9IHtcbiAgICAgIFwiRU5PVEZPVU5EXCI6IFwiS2V5IGBfX2tleWAgbm90IGZvdW5kXCIsXG4gICAgICBcIkVDQUNIRUZVTExcIjogXCJDYWNoZSBtYXgga2V5cyBhbW91bnQgZXhjZWVkZWRcIixcbiAgICAgIFwiRUtFWVRZUEVcIjogXCJUaGUga2V5IGFyZ3VtZW50IGhhcyB0byBiZSBvZiB0eXBlIGBzdHJpbmdgIG9yIGBudW1iZXJgLiBGb3VuZDogYF9fa2V5YFwiLFxuICAgICAgXCJFS0VZU1RZUEVcIjogXCJUaGUga2V5cyBhcmd1bWVudCBoYXMgdG8gYmUgYW4gYXJyYXkuXCIsXG4gICAgICBcIkVUVExUWVBFXCI6IFwiVGhlIHR0bCBhcmd1bWVudCBoYXMgdG8gYmUgYSBudW1iZXIuXCJcbiAgICB9O1xuXG4gICAgcmV0dXJuIE5vZGVDYWNoZTtcblxuICB9KS5jYWxsKHRoaXMpO1xuXG59KS5jYWxsKHRoaXMpO1xuIiwidmFyIG51YiA9IG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHhzLCBjbXApIHtcbiAgICBpZiAodHlwZW9mIHhzID09PSAnZnVuY3Rpb24nIHx8IGNtcCkge1xuICAgICAgICByZXR1cm4gbnViLmJ5KHhzLCBjbXApO1xuICAgIH1cbiAgICBcbiAgICB2YXIga2V5cyA9IHtcbiAgICAgICAgJ29iamVjdCcgOiBbXSxcbiAgICAgICAgJ2Z1bmN0aW9uJyA6IFtdLFxuICAgICAgICAnc3RyaW5nJyA6IHt9LFxuICAgICAgICAnbnVtYmVyJyA6IHt9LFxuICAgICAgICAnYm9vbGVhbicgOiB7fSxcbiAgICAgICAgJ3VuZGVmaW5lZCcgOiB7fVxuICAgIH07XG4gICAgXG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHggPSB4c1tpXTtcbiAgICAgICAgdmFyIHJlY3MgPSB4ID09PSAnX19wcm90b19fJ1xuICAgICAgICAgICAgPyBrZXlzLm9iamVjdHNcbiAgICAgICAgICAgIDoga2V5c1t0eXBlb2YgeF0gfHwga2V5cy5vYmplY3RzXG4gICAgICAgIDtcbiAgICAgICAgXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHJlY3MpKSB7XG4gICAgICAgICAgICBpZiAocmVjcy5pbmRleE9mKHgpIDwgMCkge1xuICAgICAgICAgICAgICAgIHJlY3MucHVzaCh4KTtcbiAgICAgICAgICAgICAgICByZXMucHVzaCh4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICghT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocmVjcywgeCkpIHtcbiAgICAgICAgICAgIHJlY3NbeF0gPSB0cnVlO1xuICAgICAgICAgICAgcmVzLnB1c2goeCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHJlcztcbn07XG5cbm51Yi5ieSA9IGZ1bmN0aW9uICh4cywgY21wKSB7XG4gICAgaWYgKHR5cGVvZiB4cyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB2YXIgY21wXyA9IGNtcDtcbiAgICAgICAgY21wID0geHM7XG4gICAgICAgIHhzID0gY21wXztcbiAgICB9XG4gICAgXG4gICAgdmFyIHJlcyA9IFtdO1xuICAgIFxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHggPSB4c1tpXTtcbiAgICAgICAgXG4gICAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHJlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgdmFyIHkgPSByZXNbal07XG4gICAgICAgICAgICBpZiAoY21wLmNhbGwocmVzLCB4LCB5KSkge1xuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKCFmb3VuZCkgcmVzLnB1c2goeCk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiByZXM7XG59O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsImNvbnN0IE5vZGVDYWNoZSA9IHJlcXVpcmUoXCJub2RlLWNhY2hlXCIpO1xyXG5jb25zdCBjYyA9IHJlcXVpcmUoJ2N1cnJlbmN5LWNvZGVzJyk7XHJcbi8vIGNvbnNvbGUubG9nKGNjKTtcclxuXHJcbmNvbnN0IHNlbGVjdEZyb20gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2VsZWN0RnJvbScpO1xyXG5jb25zdCBzZWxlY3RUbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzZWxlY3RUbycpO1xyXG5jb25zdCBpbnB1dEZyb20gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnaW5wdXRGcm9tJylcclxuY29uc3QgaW5wdXRUbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdpbnB1dFRvJyk7XHJcbmNvbnN0IG15Q2FjaGUgPSBuZXcgTm9kZUNhY2hlKHsgc3RkVFRMOiAxMDAsIGNoZWNrcGVyaW9kOiAxMjAgfSk7XHJcblxyXG5hc3luYyBmdW5jdGlvbiBnZXRDdXJyZW5jeSgpIHtcclxuICAgIGxldCB2YWx1ZSA9IG15Q2FjaGUuZ2V0KFwidmFsdWVzXCIpO1xyXG4gICAgaWYgKCF2YWx1ZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdjYWNoZSBub3QgZm91bmQnKTtcclxuICAgICAgICBsZXQgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCgnaHR0cHM6Ly9hcGkubW9ub2JhbmsudWEvYmFuay9jdXJyZW5jeScpO1xyXG4gICAgICAgIGxldCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG4gICAgICAgIG15Q2FjaGUuc2V0KFwidmFsdWVzXCIsIGRhdGEsIDYwMCk7XHJcbiAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnY2FjaGUgZm91bmQnKTtcclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcblxyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBnZXRDdXIoKSB7XHJcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgZ2V0Q3VycmVuY3koKVxyXG4gICAgY29uc29sZS5sb2coeyBkYXRhIH0pO1xyXG5cclxuICAgIGxldCBvcHRpb25zID0gZGF0YS5tYXAoaXRlbSA9PiB7XHJcbiAgICAgICAgaWYgKGl0ZW0ucmF0ZUJ1eSAhPSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGA8b3B0aW9uIHZhbHVlPVwiJHtpdGVtLmN1cnJlbmN5Q29kZUF9XCI+JHtpdGVtLnJhdGVCdXl9PC9vcHRpb24+YDtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gYDxvcHRpb24gdmFsdWU9XCIke2l0ZW0uY3VycmVuY3lDb2RlQX1cIj4ke2l0ZW0ucmF0ZUNyb3NzfTwvb3B0aW9uPmA7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBcclxuICAgIGZvciAobGV0IHZhbHVlIG9mIE9iamVjdC52YWx1ZXMoZGF0YSkpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhjYy5udW1iZXIodmFsdWUuY3VycmVuY3lDb2RlQSkpO1xyXG4gICAgfVxyXG5cclxuICAgIHNlbGVjdEZyb20uaW5uZXJIVE1MID0gb3B0aW9ucy5qb2luKFwiXFxuXCIpO1xyXG4gICAgc2VsZWN0VG8uaW5uZXJIVE1MID0gb3B0aW9ucy5qb2luKFwiXFxuXCIpO1xyXG4gICAgY29uc29sZS5sb2coc2VsZWN0RnJvbSlcclxuICAgIC8vIGNvbnNvbGUubG9nKHNlbGVjdFRvKVxyXG5cclxuICAgIGlucHV0RnJvbS5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiBjb252ZXJ0KGRhdGEpKTtcclxuICAgIHNlbGVjdEZyb20uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKCkgPT4gY29udmVydChkYXRhKSk7XHJcbiAgICBzZWxlY3RUby5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoKSA9PiBjb252ZXJ0KGRhdGEpKTtcclxuICAgIFxyXG59O1xyXG5cclxuZ2V0Q3VyKCk7XHJcblxyXG5mdW5jdGlvbiBjb252ZXJ0KGRhdGEpIHtcclxuICAgIGxldCBzZWxlY3RGcm9tVmFsdWUgPSBkYXRhLmZpbmQoKGVsZW1lbnQpID0+IHtcclxuICAgICAgICByZXR1cm4gKGVsZW1lbnQuY3VycmVuY3lDb2RlQSA9PSBzZWxlY3RGcm9tLnZhbHVlKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGxldCBzZWxlY3RUb1ZhbHVlID0gZGF0YS5maW5kKChlbGVtZW50KSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIChlbGVtZW50LmN1cnJlbmN5Q29kZUEgPT0gY3NlbGVjdFRvLnZhbHVlKVxyXG4gICAgfSk7XHJcbiAgICBsZXQgY3Jvc3NDdXIgPSBzZWxlY3RGcm9tVmFsdWUucmF0ZUJ1eSAvIHNlbGVjdFRvVmFsdWUucmF0ZUJ1eTtcclxuICAgIGlucHV0VG8udmFsdWUgPSAoY3Jvc3NDdXIgKiBpbnB1dEZyb20udmFsdWUpLnRvRml4ZWQoMik7XHJcblxyXG59O1xyXG5cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9