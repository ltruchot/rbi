(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("application", function(exports, require, module) {
var AppView, BankAmountsCollection, BankOperationsCollection, BanksCollection, DataManager, RegularOperationsCollection, UserConfiguration;

AppView = require('views/app');

BanksCollection = require('collections/banks');

BankOperationsCollection = require('collections/bank_operations');

BankAmountsCollection = require('collections/bank_amounts');

RegularOperationsCollection = require('collections/regular_operations');

UserConfiguration = require('models/user_configuration');

DataManager = require('lib/data_manager');

module.exports = {
  initialize: function() {
    var Router;
    L.Icon.Default.imagePath = 'images/leaflet';
    window.app = this;
    window.collections = {};
    window.views = {};
    window.rbiActiveData = {};
    window.rbiActiveData.userConfiguration = new UserConfiguration({});
    window.rbiActiveData.olderOperationDate = moment(new Date());
    window.rbiActiveData.budgetByAccount = {};
    window.rbiActiveData.accountNumber = null;
    window.rbiActiveData.bankAccount = null;
    window.rbiActiveData.currentOperations = null;
    window.rbiActiveData.allOperationsById = null;
    window.rbiDataManager = new DataManager();
    window.rbiColors = {
      border_color: "#efefef",
      grid_color: "#ddd",
      default_black: "#666",
      green: "#8ecf67",
      yellow: "#fac567",
      orange: "#F08C56",
      blue: "#87ceeb",
      red: "#f74e4d",
      teal: "#28D8CA",
      grey: "#999999"
    };
    window.rbiIcons = {
      plus: {
        encoded: "&#57602;",
        decoded: ""
      },
      minus: {
        encoded: "&#57601;",
        decoded: ""
      },
      positiveEvolution: {
        encoded: "&#57641;",
        decoded: ""
      },
      negativeEvolution: {
        encoded: "&#57643;",
        decoded: ""
      },
      search: {
        encoded: "&#57471;",
        decoded: ""
      },
      variableCost: {
        encoded: "&#57393;",
        decoded: ""
      },
      config: {
        encoded: "&#57486;",
        decoded: ""
      },
      deleteItem: {
        encoded: "&#57512;",
        decoded: ""
      },
      map: {
        encoded: "&#57538;",
        decoded: ""
      },
      marker: L.icon({
        iconUrl: 'images/leaflet/marker-icon-mini.png',
        iconRetinaUrl: 'images/leaflet/marker-icon-mini.png',
        iconSize: [12, 20],
        iconAnchor: [6, 20],
        popupAnchor: [0, -10],
        shadowUrl: 'images/leaflet/marker-shadow-mini.png',
        shadowRetinaUrl: 'images/leaflet/marker-shadow-mini.png',
        shadowSize: [20, 20],
        shadowAnchor: [10, 20]
      })
    };
    window.collections.banks = new BanksCollection();
    window.collections.operations = new BankOperationsCollection();
    window.collections.amounts = new BankAmountsCollection();
    window.collections.regularOperations = new RegularOperationsCollection();
    /*
            views
    */

    window.views.appView = new AppView();
    window.views.appView.render();
    window.activeObjects = {};
    _.extend(window.activeObjects, Backbone.Events);
    Router = require('router');
    this.router = new Router();
    if (typeof Object.freeze === 'function') {
      return Object.freeze(this);
    }
  }
};

});

;require.register("collections/bank_accounts", function(exports, require, module) {
var BankAccount, BankAccounts,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BankAccount = require('../models/bank_account');

module.exports = BankAccounts = (function(_super) {
  __extends(BankAccounts, _super);

  BankAccounts.prototype.model = BankAccount;

  BankAccounts.prototype.url = "bankaccounts";

  function BankAccounts(bank) {
    this.bank = bank;
    this.url = "banks/getAccounts/" + this.bank.get("id");
    BankAccounts.__super__.constructor.call(this);
  }

  BankAccounts.prototype.getSum = function() {
    var account, sum, _i, _len, _ref;
    sum = 0;
    _ref = this.models;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      account = _ref[_i];
      sum += Number(account.get("amount"));
    }
    return sum;
  };

  return BankAccounts;

})(Backbone.Collection);

});

;require.register("collections/bank_alerts", function(exports, require, module) {
var BankAlert, BankAlerts, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BankAlert = require('../models/bank_alert');

module.exports = BankAlerts = (function(_super) {
  __extends(BankAlerts, _super);

  function BankAlerts() {
    _ref = BankAlerts.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BankAlerts.prototype.model = BankAlert;

  BankAlerts.prototype.url = "bankalerts";

  return BankAlerts;

})(Backbone.Collection);

});

;require.register("collections/bank_amounts", function(exports, require, module) {
var BankAmount, BankAmounts, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BankAmount = require('../models/bank_amount');

module.exports = BankAmounts = (function(_super) {
  __extends(BankAmounts, _super);

  function BankAmounts() {
    _ref = BankAmounts.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BankAmounts.prototype.model = BankAmount;

  BankAmounts.prototype.url = "bankaccounts";

  BankAmounts.prototype.setAccount = function(account) {
    this.account = account;
    return this.url = "bankaccounts/getLastYearAmounts/" + this.account.get("id");
  };

  return BankAmounts;

})(Backbone.Collection);

});

;require.register("collections/bank_operations", function(exports, require, module) {
var BankOperation, BankOperations, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BankOperation = require('../models/bank_operation');

module.exports = BankOperations = (function(_super) {
  __extends(BankOperations, _super);

  function BankOperations() {
    _ref = BankOperations.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BankOperations.prototype.model = BankOperation;

  BankOperations.prototype.url = "bankoperations";

  BankOperations.prototype.order = "asc";

  BankOperations.prototype.orderBy = "date";

  BankOperations.prototype.setAccount = function(account) {
    this.account = account;
    return this.url = "bankaccounts/getOperations/" + this.account.get("id");
  };

  BankOperations.prototype.setComparator = function(type) {
    var _this = this;
    if (type === "date") {
      return this.comparator = function(o1, o2) {
        var d1, d2, sort, t1, t2;
        d1 = new Date(o1.get("date")).getTime();
        d2 = new Date(o2.get("date")).getTime();
        t1 = o1.get("title");
        t2 = o2.get("title");
        sort = _this.order === "asc" ? -1 : 1;
        if (d1 === d2) {
          if (t1 > t2) {
            return sort;
          }
          if (t1 < t2) {
            return -sort;
          }
          return 0;
        } else if (d1 > d2) {
          return sort;
        } else {
          return -sort;
        }
      };
    } else {
      this.orderBy = type;
      return this.comparator = function(o1, o2) {
        var sort, t1, t2;
        t1 = o1.get(this.orderBy);
        t2 = o2.get(this.orderBy);
        sort = this.order === "asc" ? -1 : 1;
        if (t1 === t2) {
          return 0;
        } else if (t1 > t2) {
          return sort;
        } else {
          return -sort;
        }
      };
    }
  };

  BankOperations.prototype.toggleSort = function(order) {
    if (this.orderBy === order) {
      return this.order = this.order === "asc" ? "desc" : "asc";
    } else {
      return this.orderBy = order;
    }
  };

  return BankOperations;

})(Backbone.Collection);

});

;require.register("collections/banks", function(exports, require, module) {
var Bank, Banks, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Bank = require('../models/bank');

module.exports = Banks = (function(_super) {
  __extends(Banks, _super);

  function Banks() {
    _ref = Banks.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Banks.prototype.model = Bank;

  Banks.prototype.url = "banks";

  Banks.prototype.getSum = function() {
    var bank, sum, _i, _len, _ref1;
    sum = 0;
    _ref1 = this.models;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      bank = _ref1[_i];
      sum += Number(bank.get("amount"));
    }
    return sum;
  };

  return Banks;

})(Backbone.Collection);

});

;require.register("collections/receipts", function(exports, require, module) {
var Receipt, Receipts, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Receipt = require('../models/receipt');

module.exports = Receipts = (function(_super) {
  __extends(Receipts, _super);

  function Receipts() {
    _ref = Receipts.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Receipts.prototype.model = Receipt;

  Receipts.prototype.url = 'receipts';

  return Receipts;

})(Backbone.Collection);

});

;require.register("collections/regular_operations", function(exports, require, module) {
var RegularOperation, RegularOperations, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

RegularOperation = require('../models/regular_operation');

module.exports = RegularOperations = (function(_super) {
  __extends(RegularOperations, _super);

  function RegularOperations() {
    _ref = RegularOperations.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  RegularOperations.prototype.model = RegularOperation;

  RegularOperations.prototype.url = "rbifixedcost";

  RegularOperations.prototype.setAccount = function(accountNumber) {
    this.accountNumber = accountNumber;
    return this.url = "rbifixedcost/getRegularOperationsByAccountNumber/" + this.accountNumber;
  };

  return RegularOperations;

})(Backbone.Collection);

});

;require.register("collections/sections", function(exports, require, module) {
var Section, Sections, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Section = require("../models/section");

module.exports = Sections = (function(_super) {
  __extends(Sections, _super);

  function Sections() {
    _ref = Sections.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Sections.prototype.initialize = function(models, options) {
    this.receiptId = options.receiptId;
  };

  Sections.prototype.url = function() {
    return "receipts/" + this.receiptId + "/sections";
  };

  Sections.prototype.model = Section;

  return Sections;

})(Backbone.Collection);

});

;require.register("initialize", function(exports, require, module) {
var app;

app = require('application');

$(function() {
  require('lib/app_helpers');
  return app.initialize();
});

});

;require.register("lib/app_helpers", function(exports, require, module) {
(function() {
  return (function() {
    var console, dummy, method, methods, _results;
    console = window.console = window.console || {};
    method = void 0;
    dummy = function() {};
    methods = 'assert,count,debug,dir,dirxml,error,exception,\
                   group,groupCollapsed,groupEnd,info,log,markTimeline,\
                   profile,profileEnd,time,timeEnd,trace,warn'.split(',');
    _results = [];
    while (method = methods.pop()) {
      _results.push(console[method] = console[method] || dummy);
    }
    return _results;
  })();
})();

Number.prototype.formatMoney = function(decPlaces, thouSeparator, decSeparator, currency, solid) {
  var finalN, i, j, n, sign;
  n = this;
  decPlaces = (isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces);
  decSeparator = (decSeparator === undefined ? "." : decSeparator);
  thouSeparator = (thouSeparator === undefined ? "," : thouSeparator);
  sign = (n < 0 ? "-" : "");
  i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "";
  j = ((j = i.length) > 3 ? j % 3 : 0);
  finalN = sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
  if (currency != null) {
    finalN += currency;
  }
  if (solid != null) {
    finalN = finalN.replace(' ', '&nbsp;');
  }
  return finalN;
};

Number.prototype.money = function() {
  return this.formatMoney(2, " ", ",", "&euro;", true);
};

Date.prototype.dateString = function() {
  var addZeros, myDate;
  addZeros = function(num) {
    if (Number(num) < 10) {
      return "0" + num;
    } else {
      return num;
    }
  };
  myDate = this;
  return addZeros(myDate.getDate() + 1) + "/" + addZeros(myDate.getMonth() + 1) + "/" + myDate.getFullYear();
};

Date.prototype.timeString = function() {
  var addZeros, myDate;
  addZeros = function(num) {
    if (Number(num) < 10) {
      return "0" + num;
    } else {
      return num;
    }
  };
  myDate = this;
  return addZeros(myDate.getHours()) + ":" + addZeros(myDate.getMinutes());
};

});

;require.register("lib/base_view", function(exports, require, module) {
var BaseView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = BaseView = (function(_super) {
  __extends(BaseView, _super);

  function BaseView() {
    _ref = BaseView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BaseView.prototype.template = function() {};

  BaseView.prototype.initialize = function() {};

  BaseView.prototype.getRenderData = function() {
    return {
      model: this.model
    };
  };

  BaseView.prototype.render = function() {
    this.beforeRender();
    this.$el.html(this.template(this.getRenderData()));
    this.afterRender();
    return this;
  };

  BaseView.prototype.beforeRender = function() {};

  BaseView.prototype.afterRender = function() {};

  BaseView.prototype.destroy = function() {
    this.undelegateEvents();
    this.$el.removeData().unbind();
    this.remove();
    return Backbone.View.prototype.remove.call(this);
  };

  return BaseView;

})(Backbone.View);

});

;require.register("lib/data_manager", function(exports, require, module) {
var DataManager;

module.exports = DataManager = (function() {
  function DataManager() {}

  DataManager.prototype.loadLastYearAmounts = function(account, callback) {
    var that;
    that = this;
    window.collections.amounts.reset();
    window.collections.amounts.setAccount(account);
    return window.collections.amounts.fetch({
      success: function(amounts) {
        that.setupLastYearAmountsFlot(amounts, account);
        $(window).resize(function() {
          return that.setupLastYearAmountsFlot(amounts, account);
        });
        if (callback != null) {
          return callback();
        }
      },
      error: function() {
        return console.log("Error during amounts of last year fetching process");
      }
    });
  };

  DataManager.prototype.setupLastYearAmountsFlot = function(amounts, account) {
    var currentDate, dayCounter2, dayRatio, daysPerMonth, flotReadyAmounts, formattedAmounts, lastAmount, maxAmount, minAmount, numberOfDays, plot, sixMonthAgo, that, threeMonthAgo;
    that = this;
    formattedAmounts = [];
    flotReadyAmounts = [];
    daysPerMonth = {
      twelve: 365,
      six: 365 / 2,
      three: 365 / 4
    };
    numberOfDays = daysPerMonth.three;
    threeMonthAgo = new Date();
    threeMonthAgo = threeMonthAgo.setMonth(threeMonthAgo.getMonth() - 3);
    sixMonthAgo = new Date();
    sixMonthAgo = sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
    dayRatio = 4;
    amounts.each(function(amount) {
      var amountDate, currentDate1, dayCounter1;
      if (window.rbiActiveData.olderOperationDate > moment(amount.get('date'))) {
        window.rbiActiveData.olderOperationDate = moment(amount.get('date'));
      }
      currentDate1 = new Date();
      currentDate1.setHours(12, 0, 0, 0);
      amountDate = new Date(amount.get('date'));
      amountDate.setHours(12, 0, 0, 0);
      dayCounter1 = 0;
      while ((amountDate.getTime() !== currentDate1.getTime()) && (dayCounter1 < 365)) {
        currentDate1.setDate(currentDate1.getDate() - 1);
        dayCounter1++;
      }
      if (dayCounter1 < 364) {
        formattedAmounts[currentDate1.getTime()] = amount.get('amount');
      }
      if (currentDate1.getTime() < threeMonthAgo) {
        return numberOfDays = daysPerMonth.six;
      } else if (currentDate1.getTime() < sixMonthAgo) {
        return numberOfDays = daysPerMonth.twelve;
      }
    });
    currentDate = new Date();
    currentDate.setHours(12, 0, 0, 0);
    minAmount = minAmount = maxAmount = parseFloat(account.get('amount'));
    dayCounter2 = 0;
    while (dayCounter2 < numberOfDays) {
      if (formattedAmounts[currentDate.getTime()]) {
        lastAmount = parseFloat(formattedAmounts[currentDate.getTime()]);
      }
      flotReadyAmounts.push([currentDate.getTime(), lastAmount]);
      currentDate.setDate(currentDate.getDate() - 1);
      if (lastAmount < minAmount) {
        minAmount = lastAmount;
      }
      if (lastAmount > maxAmount) {
        maxAmount = lastAmount;
      }
      dayCounter2++;
    }
    $("#max-amount").html(maxAmount.money());
    $("#min-amount").html(minAmount.money());
    minAmount = minAmount - 500;
    maxAmount = maxAmount + 500;
    flotReadyAmounts.reverse();
    $('#amount-stats').empty();
    return plot = $.plot("#amount-stats", [
      {
        data: flotReadyAmounts
      }
    ], {
      series: {
        lines: {
          show: true,
          lineWidth: 2
        },
        points: {
          show: false
        }
      },
      grid: {
        hoverable: true,
        clickable: true,
        borderWidth: 1,
        tickColor: $border_color,
        borderColor: '#eeeeee'
      },
      colors: [window.rbiColors.blue],
      shadowSize: 0,
      yaxis: {
        min: minAmount,
        max: maxAmount
      },
      xaxis: {
        mode: "time",
        minTickSize: [1, "month"],
        monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
      },
      tooltip: true,
      tooltipOpts: {
        content: '%y.2&euro;<br /> %x',
        xDateFormat: '%d/%m/%y'
      }
    });
  };

  return DataManager;

})();

});

;require.register("lib/view_collection", function(exports, require, module) {
var BaseView, ViewCollection, _ref,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('lib/base_view');

module.exports = ViewCollection = (function(_super) {
  __extends(ViewCollection, _super);

  function ViewCollection() {
    this.removeItem = __bind(this.removeItem, this);
    this.addItem = __bind(this.addItem, this);
    _ref = ViewCollection.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ViewCollection.prototype.itemview = null;

  ViewCollection.prototype.views = {};

  ViewCollection.prototype.template = function() {
    return '';
  };

  ViewCollection.prototype.itemViewOptions = function() {};

  ViewCollection.prototype.collectionEl = null;

  ViewCollection.prototype.onChange = function() {
    return this.$el.toggleClass('empty', _.size(this.views) === 0);
  };

  ViewCollection.prototype.appendView = function(view) {
    return this.$collectionEl.append(view.el);
  };

  ViewCollection.prototype.initialize = function() {
    var collectionEl;
    ViewCollection.__super__.initialize.apply(this, arguments);
    this.views = {};
    this.listenTo(this.collection, "reset", this.onReset);
    this.listenTo(this.collection, "add", this.addItem);
    this.listenTo(this.collection, "remove", this.removeItem);
    if (this.collectionEl == null) {
      return collectionEl = el;
    }
  };

  ViewCollection.prototype.render = function() {
    var id, view, _ref1;
    _ref1 = this.views;
    for (id in _ref1) {
      view = _ref1[id];
      view.$el.detach();
    }
    return ViewCollection.__super__.render.apply(this, arguments);
  };

  ViewCollection.prototype.afterRender = function() {
    var id, view, _ref1;
    this.$collectionEl = $(this.collectionEl);
    _ref1 = this.views;
    for (id in _ref1) {
      view = _ref1[id];
      this.appendView(view.$el);
    }
    this.onReset(this.collection);
    return this.onChange(this.views);
  };

  ViewCollection.prototype.remove = function() {
    this.onReset([]);
    return ViewCollection.__super__.remove.apply(this, arguments);
  };

  ViewCollection.prototype.onReset = function(newcollection) {
    var id, view, _ref1;
    _ref1 = this.views;
    for (id in _ref1) {
      view = _ref1[id];
      view.remove();
    }
    return newcollection.forEach(this.addItem);
  };

  ViewCollection.prototype.addItem = function(model) {
    var options, view;
    options = _.extend({}, {
      model: model
    }, this.itemViewOptions(model));
    view = new this.itemview(options);
    this.views[model.cid] = view.render();
    this.appendView(view);
    return this.onChange(this.views);
  };

  ViewCollection.prototype.removeItem = function(model) {
    this.views[model.cid].remove();
    delete this.views[model.cid];
    return this.onChange(this.views);
  };

  return ViewCollection;

})(BaseView);

});

;require.register("models/bank", function(exports, require, module) {
var Bank, BankAccountsCollection, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BankAccountsCollection = require('../collections/bank_accounts');

module.exports = Bank = (function(_super) {
  __extends(Bank, _super);

  function Bank() {
    _ref = Bank.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Bank.prototype.defaults = {
    amount: 0
  };

  Bank.prototype.checked = true;

  Bank.prototype.initialize = function() {
    this.accounts = new BankAccountsCollection(this);
    this.listenTo(this.accounts, "add", this.updateAmount);
    this.listenTo(this.accounts, "remove", this.updateAmount);
    this.listenTo(this.accounts, "destroy", this.updateAmount);
    return this.listenTo(this.accounts, "change", this.updateAmount);
  };

  Bank.prototype.updateAmount = function() {
    return this.set("amount", this.accounts.getSum());
  };

  return Bank;

})(Backbone.Model);

});

;require.register("models/bank_account", function(exports, require, module) {
var BankAccount, BankOperationsCollection, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BankOperationsCollection = require('../collections/bank_operations');

module.exports = BankAccount = (function(_super) {
  __extends(BankAccount, _super);

  function BankAccount() {
    _ref = BankAccount.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BankAccount.prototype.checked = true;

  return BankAccount;

})(Backbone.Model);

});

;require.register("models/bank_alert", function(exports, require, module) {
var BankAlert, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = BankAlert = (function(_super) {
  __extends(BankAlert, _super);

  function BankAlert() {
    _ref = BankAlert.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BankAlert.prototype.url = "bankalerts";

  return BankAlert;

})(Backbone.Model);

});

;require.register("models/bank_amount", function(exports, require, module) {
var BankAmount, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = BankAmount = (function(_super) {
  __extends(BankAmount, _super);

  function BankAmount() {
    _ref = BankAmount.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  return BankAmount;

})(Backbone.Model);

});

;require.register("models/bank_operation", function(exports, require, module) {
var BankOperation, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = BankOperation = (function(_super) {
  __extends(BankOperation, _super);

  function BankOperation() {
    _ref = BankOperation.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  return BankOperation;

})(Backbone.Model);

});

;require.register("models/receipt--mesconsos", function(exports, require, module) {
var Receipt, Receipts;

Receipt = require('../models/receipt');

module.exports = Receipts = Backbone.Collection.extend({
  model: Receipt,
  url: 'receipts'
});

});

;require.register("models/receipt", function(exports, require, module) {
var Receipt, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Receipt = (function(_super) {
  __extends(Receipt, _super);

  function Receipt() {
    _ref = Receipt.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  return Receipt;

})(Backbone.Model);

});

;require.register("models/regular_operation", function(exports, require, module) {
var RegularOperation, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = RegularOperation = (function(_super) {
  __extends(RegularOperation, _super);

  function RegularOperation() {
    _ref = RegularOperation.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  return RegularOperation;

})(Backbone.Model);

});

;require.register("models/section", function(exports, require, module) {


});

;require.register("models/user_configuration", function(exports, require, module) {
var Config, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = Config = (function(_super) {
  __extends(Config, _super);

  function Config() {
    _ref = Config.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Config.prototype.url = 'rbiconfiguration';

  Config.prototype.isNew = function() {
    return true;
  };

  Config.prototype.defaults = {
    accountNumber: '',
    depositList: [],
    budgetByAcount: {},
    mostRecentOperationDate: ''
  };

  return Config;

})(Backbone.Model);

});

;require.register("router", function(exports, require, module) {
var AppView, Router, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

AppView = require('views/app');

module.exports = Router = (function(_super) {
  __extends(Router, _super);

  function Router() {
    _ref = Router.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  Router.prototype.routes = {
    '': 'monthly_analysis',
    'analyse-mensuelle': 'monthly_analysis',
    'budget-previsionnel': 'forecast_budget',
    'releve-augmente': 'enhanced_report',
    'releve-geolocalise': 'geolocated_report',
    'parametres': 'configuration'
  };

  Router.prototype.monthly_analysis = function() {
    var _ref1;
    return (_ref1 = window.views.monthlyAnalysisView) != null ? _ref1.render() : void 0;
  };

  Router.prototype.forecast_budget = function() {
    var _ref1;
    return (_ref1 = window.views.forecastBudgetView) != null ? _ref1.render() : void 0;
  };

  Router.prototype.enhanced_report = function() {
    var _ref1;
    return (_ref1 = window.views.enhancedReportView) != null ? _ref1.render() : void 0;
  };

  Router.prototype.geolocated_report = function() {
    var _ref1;
    return (_ref1 = window.views.geolocatedReportView) != null ? _ref1.render() : void 0;
  };

  Router.prototype.configuration = function() {
    var _ref1;
    return (_ref1 = window.views.configurationView) != null ? _ref1.render() : void 0;
  };

  return Router;

})(Backbone.Router);

});

;require.register("views/alerts", function(exports, require, module) {
var AlertsView, BaseView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

module.exports = AlertsView = (function(_super) {
  __extends(AlertsView, _super);

  function AlertsView() {
    _ref = AlertsView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  AlertsView.prototype.template = require('./templates/alerts');

  AlertsView.prototype.el = 'div#interface-box';

  AlertsView.prototype.subViews = [];

  AlertsView.prototype.initialize = function() {};

  AlertsView.prototype.render = function() {
    var view;
    AlertsView.__super__.render.call(this);
    view = this;
    return this;
  };

  return AlertsView;

})(BaseView);

});

;require.register("views/app", function(exports, require, module) {
var AppView, BaseView, ConfigurationView, EnhancedReportView, ForecastBudgetView, GeolocatedReportView, MenuView, MonthlyAnalysisView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

MenuView = require('views/menu');

MonthlyAnalysisView = require('views/monthly_analysis');

ForecastBudgetView = require('views/forecast_budget');

EnhancedReportView = require('views/enhanced_report');

GeolocatedReportView = require('views/geolocated_report');

ConfigurationView = require('views/configuration');

module.exports = AppView = (function(_super) {
  __extends(AppView, _super);

  function AppView() {
    _ref = AppView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  AppView.prototype.template = require('./templates/app');

  AppView.prototype.el = 'body.application';

  AppView.prototype.isLoading = true;

  AppView.prototype.afterRender = function() {
    var _this = this;
    return window.collections.banks.fetch({
      data: {
        withAccountOnly: true
      },
      success: function() {
        if (!_this.menuView) {
          _this.menuView = new MenuView();
        }
        if (!window.views.monthlyAnalysisView) {
          window.views.monthlyAnalysisView = new MonthlyAnalysisView();
        }
        if (!window.views.forecastBudgetView) {
          window.views.forecastBudgetView = new ForecastBudgetView();
        }
        if (!window.views.enhancedReportView) {
          window.views.enhancedReportView = new EnhancedReportView();
        }
        if (!window.views.geolocatedReportView) {
          window.views.geolocatedReportView = new GeolocatedReportView();
        }
        if (!window.views.configurationView) {
          window.views.configurationView = new ConfigurationView();
        }
        _this.menuView.render();
        Backbone.history.start();
        _this.displayLoadingView();
        if (document.location.hash !== "#" + "parametres") {
          return window.app.router.navigate('parametres', {
            trigger: true
          });
        }
      },
      error: function() {
        return console.log("Fatal error: could not get the banks list");
      }
    });
  };

  AppView.prototype.displayLoadingView = function() {
    var loaderHtml;
    this.isLoading = true;
    $('#two-cols-box').hide();
    $('#fullsize-box').show();
    loaderHtml = '<div class="config-loader">' + "\t" + 'Chargement de vos paramètres...<br /><br />' + "\t" + '<img src="./loader_big_blue.gif" />' + '</div>';
    return $('#fullsize-box').append(loaderHtml);
  };

  AppView.prototype.displayInterfaceView = function() {
    $('#fullsize-box').empty().hide();
    $('#two-cols-box').show();
    return this.isLoading = false;
  };

  return AppView;

})(BaseView);

});

;require.register("views/bank_statement", function(exports, require, module) {
var BalanceOperationView, BankStatementView, BaseView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

BalanceOperationView = require("./bank_statement_entry");

module.exports = BankStatementView = (function(_super) {
  __extends(BankStatementView, _super);

  BankStatementView.prototype.templateHeader = require('./templates/bank_statement_header');

  BankStatementView.prototype.events = {
    'click a.recheck-button': "checkAccount",
    'keyup input#search-text': "reload",
    'click .special': "reloadMap"
  };

  BankStatementView.prototype.inUse = false;

  BankStatementView.prototype.subViews = [];

  BankStatementView.prototype.subViewLastDate = '';

  BankStatementView.prototype.params = null;

  BankStatementView.prototype.mapLinked = false;

  function BankStatementView(el) {
    this.el = el;
    BankStatementView.__super__.constructor.call(this);
  }

  BankStatementView.prototype.initialize = function() {
    return this.listenTo(window.activeObjects, 'changeActiveAccount', this.reload);
  };

  BankStatementView.prototype.render = function() {
    this.$el.html(require("./templates/bank_statement_empty"));
    return this;
  };

  BankStatementView.prototype.reload = function(params, callback) {
    var displayFixedCosts, displayVariableCosts, view;
    console.log("reload");
    view = this;
    this.model = window.rbiActiveData.bankAccount;
    if ((params != null) && (params.dateFrom != null)) {
      this.params = params;
    }
    if (this.model != null) {
      this.updateFilters();
      if (this.$("#table-operations").length === 0) {
        this.$el.html(this.templateHeader({
          model: this.model
        }));
      }
    }
    displayFixedCosts = this.data != null ? this.data.fixedCosts || false : false;
    displayVariableCosts = this.data != null ? this.data.variableCosts || false : false;
    if (this.send) {
      return $.ajax({
        type: "POST",
        url: "bankoperations/byDate",
        data: this.data,
        success: function(operations) {
          var _this = this;
          if (operations) {
            return $.ajax({
              type: "GET",
              url: "rbifixedcost",
              success: function(fixedCosts) {
                var finalOperations, fixedCost, index, operation, operationRemoved, _i, _j, _len, _len1;
                window.rbiActiveData.currentOperations = {};
                finalOperations = [];
                for (index = _i = 0, _len = operations.length; _i < _len; index = ++_i) {
                  operation = operations[index];
                  operation.isRegularOperation = false;
                  if (operation.amount < 0) {
                    for (_j = 0, _len1 = fixedCosts.length; _j < _len1; _j++) {
                      fixedCost = fixedCosts[_j];
                      if ($.inArray(operation.id, fixedCost.idTable) >= 0) {
                        operation.isRegularOperation = true;
                        operation.fixedCostId = fixedCost.id;
                        break;
                      }
                    }
                  }
                  operationRemoved = false;
                  if (!operationRemoved) {
                    finalOperations.push(operation);
                    window.rbiActiveData.currentOperations[operation.id] = operation;
                  }
                }
                if (callback != null) {
                  callback(window.rbiActiveData.currentOperations);
                }
                window.collections.operations.reset(finalOperations);
                window.collections.operations.setComparator("date");
                window.collections.operations.sort();
                return view.addAll();
              },
              error: function(err) {
                return console.log("getting fixed cost failed.");
              }
            });
          } else {
            return window.collections.operations.reset();
          }
        },
        error: function(err) {
          console.log("there was an error");
          if (callback != null) {
            return callback(null);
          }
        }
      });
    }
  };

  BankStatementView.prototype.updateFilters = function() {
    var accountNumber, dateFrom, dateFromVal, dateTo, dateToVal, searchTextVal;
    if (this.params != null) {
      dateFrom = this.params.dateFrom ? moment(this.params.dateFrom).format('YYYY-MM-DD') : null;
      dateTo = this.params.dateTo ? moment(this.params.dateTo).format('YYYY-MM-DD') : null;
    }
    if (!(dateFrom || dateTo)) {
      this.send = false;
      window.collections.operations.reset();
      return;
    } else {
      this.send = true;
    }
    if (window.rbiActiveData.bankAccount != null) {
      accountNumber = window.rbiActiveData.bankAccount.get('accountNumber');
    } else {
      this.send = false;
    }
    dateFromVal = new Date(dateFrom || null);
    dateToVal = new Date(dateTo || new Date());
    this.data = {
      dateFrom: dateFromVal,
      dateTo: dateToVal,
      accounts: [accountNumber]
    };
    searchTextVal = $("input#search-text").val();
    if ((searchTextVal != null) && (searchTextVal !== "")) {
      if (searchTextVal === "#credits") {
        return this.data.credits = true;
      } else if (searchTextVal === "#debits") {
        return this.data.debits = true;
      } else if (searchTextVal === "#frais-fixes") {
        return this.data.fixedCosts = true;
      } else if (searchTextVal === "#depenses") {
        return this.data.variableCosts = true;
      } else {
        return this.data.searchText = searchTextVal;
      }
    }
  };

  BankStatementView.prototype.addAll = function() {
    var index, operation, subView, subViewDate, view, _i, _j, _len, _len1, _ref, _ref1, _results;
    console.log("addAll");
    this.$("#table-operations").html("");
    this.$(".loading").remove();
    _ref = this.subViews;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      view = _ref[_i];
      view.destroy();
    }
    this.subViews = [];
    if (window.collections.operations.models.length === 0) {
      $("#table-operations").append($('<tr><td>Aucune opération ne correspond à ces critères.</td></tr>'));
      return;
    }
    _ref1 = window.collections.operations.models;
    _results = [];
    for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
      operation = _ref1[index];
      subView = new BalanceOperationView(operation, this.model, false, this.mapLinked);
      subViewDate = subView.render().model.get('date');
      if ((this.subViewLastDate !== subViewDate) || (index === 0)) {
        this.subViewLastDate = subViewDate;
        this.$("#table-operations").append($('<tr class="special"><td colspan="4">' + moment(this.subViewLastDate).format("DD/MM/YYYY" + '</td></tr>')));
      }
      _results.push(this.$("#table-operations").append(subView.render().el));
    }
    return _results;
  };

  BankStatementView.prototype.reloadMap = function(event) {
    var date;
    if (this.mapLinked) {
      date = moment($(event.currentTarget).children("td").text(), "DD/MM/YYYY").format("YYYY-MM-DD");
      console.log(date);
      return window.views.geolocatedReportView.switchDay(null, new Date(date));
    }
  };

  BankStatementView.prototype.destroy = function() {
    var view, _i, _len, _ref, _ref1;
    if ((_ref = this.viewTitle) != null) {
      _ref.destroy();
    }
    _ref1 = this.subViews;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      view = _ref1[_i];
      view.destroy();
    }
    return BankStatementView.__super__.destroy.call(this);
  };

  return BankStatementView;

})(BaseView);

});

;require.register("views/bank_statement_entry", function(exports, require, module) {
var BaseView, EntryView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

module.exports = EntryView = (function(_super) {
  __extends(EntryView, _super);

  EntryView.prototype.template = require('./templates/bank_statement_entry');

  EntryView.prototype.tagName = 'tr';

  EntryView.prototype.events = {
    'click': 'reloadMap',
    'click #cancel-fixed-cost': 'destroyPopupFixedCost',
    'click #save-fixed-cost': 'prepareFixedCost',
    'click #remove-fixed-cost': 'removeFixedCost'
  };

  function EntryView(model, account, showAccountNum, mapLinked) {
    this.model = model;
    this.account = account;
    this.showAccountNum = showAccountNum != null ? showAccountNum : false;
    this.mapLinked = mapLinked;
    EntryView.__super__.constructor.call(this);
  }

  EntryView.prototype.render = function() {
    var hint;
    if (this.model.get("amount") > 0) {
      this.$el.addClass("success");
    }
    this.model.account = this.account;
    this.model.formattedDate = moment(this.model.get('date')).format("DD/MM/YYYY");
    if (this.showAccountNum) {
      hint = ("" + (this.model.account.get('title')) + ", ") + ("n°" + (this.model.account.get('accountNumber')));
      this.model.hint = ("" + (this.model.account.get('title')) + ", ") + ("n°" + (this.model.account.get('accountNumber')));
    } else {
      this.model.hint = "" + (this.model.get('raw'));
    }
    EntryView.__super__.render.call(this);
    if (this.mapLinked) {
      this.$el.find("td").css({
        "cursor": "pointer"
      });
    }
    return this;
  };

  EntryView.prototype.reloadMap = function() {
    if (this.mapLinked) {
      return window.views.geolocatedReportView.switchDay(null, new Date(this.model.get('date')));
    }
  };

  EntryView.prototype.saveFixedCost = function(fixedCost, callback) {
    var _this = this;
    return $.ajax({
      type: "POST",
      url: "rbifixedcost",
      data: fixedCost,
      success: function(objects) {
        var id, _i, _len, _ref;
        _this.model.set("fixedCostId", objects.id);
        _this.model.set("isRegularOperation", true);
        _ref = fixedCost.idTable;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          id = _ref[_i];
          if (window.rbiActiveData.currentOperations[id] != null) {
            window.rbiActiveData.currentOperations[id].isRegularOperation = true;
            window.rbiActiveData.currentOperations[id].fixedCostId = fixedCost.id;
          }
        }
        window.views.monthlyAnalysisView.displayMonthlySums(window.rbiActiveData.currentOperations);
        return callback();
      },
      error: function(err) {
        return console.log("there was an error");
      }
    });
  };

  return EntryView;

})(BaseView);

});

;require.register("views/bank_title", function(exports, require, module) {
var BankTitleView, BaseView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

module.exports = BankTitleView = (function(_super) {
  __extends(BankTitleView, _super);

  BankTitleView.prototype.template = require('./templates/configuration_bank_title');

  BankTitleView.prototype.tagName = 'span';

  function BankTitleView(model) {
    this.model = model;
    BankTitleView.__super__.constructor.call(this);
  }

  BankTitleView.prototype.initialize = function() {
    this.listenTo(this.model, 'change', this.update);
    this.listenTo(this.model.accounts, "add", this.update);
    this.listenTo(this.model.accounts, "destroy", this.update);
    this.listenTo(this.model.accounts, "request", this.displayLoading);
    return this.listenTo(this.model.accounts, "change", this.hideLoading);
  };

  BankTitleView.prototype.displayLoading = function() {
    return this.$(".bank-title-loading").show();
  };

  BankTitleView.prototype.hideLoading = function() {
    return this.$(".bank-title-loading").hide();
  };

  BankTitleView.prototype.update = function() {
    this.model.set("amount", this.model.accounts.getSum());
    this.$(".bank-amount").html(Number(this.model.get('amount')).money());
    if (this.model.accounts.length === 0) {
      this.$(".bank-title").hide();
      this.$(".bank-balance").hide();
    } else {
      this.$(".bank-title").show();
      this.$(".bank-balance").show();
    }
    return this.$(".bank-title-loading").hide();
  };

  BankTitleView.prototype.render = function() {
    BankTitleView.__super__.render.call(this);
    this.update();
    return this;
  };

  return BankTitleView;

})(BaseView);

});

;require.register("views/compared_analysis", function(exports, require, module) {
var BaseView, ComparedAnalysisView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

module.exports = ComparedAnalysisView = (function(_super) {
  __extends(ComparedAnalysisView, _super);

  function ComparedAnalysisView() {
    _ref = ComparedAnalysisView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ComparedAnalysisView.prototype.template = require('./templates/compared_analysis');

  ComparedAnalysisView.prototype.el = 'div#interface-box';

  ComparedAnalysisView.prototype.subViews = [];

  ComparedAnalysisView.prototype.initialize = function() {};

  ComparedAnalysisView.prototype.render = function() {
    var view;
    ComparedAnalysisView.__super__.render.call(this);
    view = this;
    return this;
  };

  return ComparedAnalysisView;

})(BaseView);

});

;require.register("views/configuration", function(exports, require, module) {
var BaseView, ConfigurationBankView, ConfigurationView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

ConfigurationBankView = require('./configuration_bank');

module.exports = ConfigurationView = (function(_super) {
  __extends(ConfigurationView, _super);

  function ConfigurationView() {
    _ref = ConfigurationView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ConfigurationView.prototype.template = require('./templates/configuration');

  ConfigurationView.prototype.el = 'div#interface-box';

  ConfigurationView.prototype.elAccounts = '#account-choice';

  ConfigurationView.prototype.accounts = 0;

  ConfigurationView.prototype.isMonoBox = true;

  ConfigurationView.prototype.subViews = [];

  ConfigurationView.prototype.getLastMonthDebitAmount = function(budgetValue, callback) {
    var criteria, now;
    now = moment(new Date());
    criteria = {
      dateFrom: new Date(moment(now.startOf('month')).format('YYYY-MM-DD')),
      dateTo: new Date(),
      debits: true,
      accounts: [window.rbiActiveData.accountNumber]
    };
    return $.ajax({
      type: "POST",
      url: "bankoperations/byDate",
      data: criteria,
      success: function(operations) {
        var amount, operation, percentage, rest, _i, _len;
        amount = 0;
        for (_i = 0, _len = operations.length; _i < _len; _i++) {
          operation = operations[_i];
          amount += operation.amount;
        }
        if (!isNaN(amount)) {
          amount = Math.abs(amount);
          percentage = parseInt((amount / budgetValue) * 100);
          percentage = percentage <= 100 ? percentage : 100;
          rest = budgetValue - amount;
          $('#current-budget-chart-debit').html(rest.money());
          $('#current-budget-chart').attr('data-percent', percentage);
          return callback(percentage);
        }
      },
      error: function(err) {
        return console.log("getting fixed cost failed.");
      }
    });
  };

  ConfigurationView.prototype.render = function() {
    var _this = this;
    ConfigurationView.__super__.render.call(this);
    window.rbiActiveData.userConfiguration.fetch({
      success: function(currentConfig) {
        var accountNumber, treatment, view;
        accountNumber = currentConfig.get('accountNumber') || "";
        if ((accountNumber != null) && accountNumber !== "") {
          window.rbiActiveData.accountNumber = accountNumber;
        } else {
          if (window.views.appView.isLoading) {
            window.views.appView.displayInterfaceView();
          }
        }
        view = _this;
        treatment = function(bank, callback) {
          var viewBank;
          viewBank = new ConfigurationBankView(bank);
          view.subViews.push(viewBank);
          $(view.elAccounts).append(viewBank.el);
          return bank.accounts.fetch({
            success: function(col) {
              callback(null, col.length);
              if (col.length > 0) {
                return viewBank.render();
              }
            },
            error: function(col, err, opts) {
              callback(null, col.length);
              return viewBank.$el.html("");
            }
          });
        };
        return async.concat(window.collections.banks.models, treatment, function(err, results) {
          if (err) {
            return console.log(err);
          } else {
            this.accounts = results.length;
            if (this.accounts === 0) {
              return $(view.elAccounts).prepend(require("./templates/configuration_bank_empty"));
            }
          }
        });
      },
      error: function() {
        return console.log('error during user configuration fetching process');
      }
    });
    return this;
  };

  return ConfigurationView;

})(BaseView);

});

;require.register("views/configuration_bank", function(exports, require, module) {
var BankSubTitleView, BankTitleView, BaseView, ConfigurationBankView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

BankTitleView = require('./bank_title');

BankSubTitleView = require('./configuration_bank_account');

module.exports = ConfigurationBankView = (function(_super) {
  __extends(ConfigurationBankView, _super);

  ConfigurationBankView.prototype.className = "unclickable-option";

  ConfigurationBankView.prototype.tagName = "tr";

  ConfigurationBankView.prototype.attributes = {
    'disabled': 'true'
  };

  ConfigurationBankView.prototype.sum = 0;

  ConfigurationBankView.prototype.subViews = [];

  function ConfigurationBankView(bank) {
    this.bank = bank;
    ConfigurationBankView.__super__.constructor.call(this);
  }

  ConfigurationBankView.prototype.addOne = function(account) {
    var accountNumber, amount, viewAccount;
    viewAccount = new BankSubTitleView(account);
    this.subViews.push(viewAccount);
    viewAccount.render();
    this.$el.after(viewAccount.el);
    accountNumber = viewAccount.model.get("accountNumber");
    amount = viewAccount.model.get("amount") || 0;
    return $(viewAccount.el).after('<tr class="bottom-margin"><td class="bottom-sep">N° ' + accountNumber + '</td><td class="bottom-sep" colspan="3" style="text-align:right;">' + amount.money() + '</td></tr>');
  };

  ConfigurationBankView.prototype.render = function() {
    var account, _i, _len, _ref;
    this.viewTitle = new BankTitleView(this.bank);
    this.$el.html(this.viewTitle.render().el);
    this.viewTitle = null;
    this.sum = 0;
    _ref = this.bank.accounts.models;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      account = _ref[_i];
      this.addOne(account);
    }
    return this;
  };

  ConfigurationBankView.prototype.destroy = function() {
    var view, _i, _len, _ref, _ref1;
    if ((_ref = this.viewTitle) != null) {
      _ref.destroy();
    }
    _ref1 = this.subViews;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      view = _ref1[_i];
      view.destroy();
    }
    return ConfigurationBankView.__super__.destroy.call(this);
  };

  return ConfigurationBankView;

})(BaseView);

});

;require.register("views/configuration_bank_account", function(exports, require, module) {
var BankSubTitleView, BaseView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

module.exports = BankSubTitleView = (function(_super) {
  __extends(BankSubTitleView, _super);

  BankSubTitleView.prototype.tagName = 'tr';

  BankSubTitleView.prototype.className = 'account-line';

  BankSubTitleView.prototype.template = require('./templates/configuration_bank_account');

  function BankSubTitleView(model) {
    this.model = model;
    BankSubTitleView.__super__.constructor.call(this);
  }

  BankSubTitleView.prototype.events = {
    'click .btn-courant': 'chooseAccount',
    'click .btn-epargne': 'setDepositAccount',
    'click .btn-off': 'setOffAccount'
  };

  BankSubTitleView.prototype.initialize = function() {
    return this.listenTo(window.activeObjects, 'changeActiveAccount', this.checkActive);
  };

  BankSubTitleView.prototype.afterRender = function() {
    var currentAccountNumber, deposit, depositList, jqBtnDeposit, jqBtnOff, thatAccountNumber, _i, _len;
    currentAccountNumber = window.rbiActiveData.accountNumber;
    thatAccountNumber = this.model.get("accountNumber");
    depositList = window.rbiActiveData.userConfiguration.get("depositList") || [];
    for (_i = 0, _len = depositList.length; _i < _len; _i++) {
      deposit = depositList[_i];
      if (deposit === thatAccountNumber) {
        jqBtnDeposit = this.$el.find(".btn-epargne");
        jqBtnOff = this.$el.find(".btn-off");
        jqBtnDeposit.removeClass("btn-default").addClass("btn-warning");
        jqBtnOff.removeClass("btn-danger").addClass("btn-default");
      }
    }
    if ((thatAccountNumber != null) && (thatAccountNumber !== "") && (thatAccountNumber === currentAccountNumber)) {
      return this.chooseAccount();
    }
  };

  BankSubTitleView.prototype.setDepositAccount = function(currentEvent) {
    var jqBtnDeposit, otherButtons;
    if (currentEvent != null) {
      jqBtnDeposit = $(currentEvent.currentTarget);
      if (jqBtnDeposit.hasClass("btn-default")) {
        otherButtons = (jqBtnDeposit.closest("tr")).find(".btn");
        otherButtons.removeClass("btn-info btn-danger").addClass("btn-default");
        jqBtnDeposit.removeClass("btn-default").addClass("btn-warning");
      }
      return this.saveConfiguration(currentEvent);
    }
  };

  BankSubTitleView.prototype.setOffAccount = function(currentEvent) {
    var jqBtnOff, otherButtons;
    if (currentEvent != null) {
      jqBtnOff = $(currentEvent.currentTarget);
      if (jqBtnOff.hasClass("btn-default")) {
        otherButtons = (jqBtnOff.closest("tr")).find(".btn");
        otherButtons.removeClass("btn-info btn-warning").addClass("btn-default");
        jqBtnOff.removeClass("btn-default").addClass("btn-danger");
      }
      return this.saveConfiguration(currentEvent);
    }
  };

  BankSubTitleView.prototype.saveConfiguration = function(currentEvent) {
    var accountChosen, depositAccountList;
    depositAccountList = [];
    accountChosen = "";
    $('.btn-epargne').each(function() {
      if ($(this).hasClass("btn-warning")) {
        return depositAccountList.push($(this).attr("account-number"));
      }
    });
    $('.btn-courant').each(function() {
      if ($(this).hasClass("btn-info")) {
        return accountChosen = $(this).attr("account-number");
      }
    });
    return window.rbiActiveData.userConfiguration.save({
      accountNumber: accountChosen,
      depositList: depositAccountList,
      error: function() {
        return console.log("Error: configuration can't be saved.");
      }
    });
  };

  BankSubTitleView.prototype.chooseAccount = function(currentEvent) {
    var thatBtnCourant, thatOtherButtons, today;
    $(".btn-courant").each(function() {
      var btnOff;
      if ($(this).hasClass("btn-info")) {
        $(this).removeClass("btn-info").addClass("btn-default");
        btnOff = ($(this).closest("tr")).find(".btn-off");
        return btnOff.removeClass("btn-default").addClass("btn-danger");
      }
    });
    thatBtnCourant = this.$el.find(".btn-courant");
    thatBtnCourant.removeClass("btn-default").addClass("btn-info");
    thatOtherButtons = this.$el.find(".btn");
    thatOtherButtons.removeClass("btn-warning btn-danger").addClass("btn-default");
    window.activeObjects.trigger("changeActiveAccount", this.model);
    window.rbiActiveData.accountNumber = this.model.get('accountNumber');
    if (currentEvent != null) {
      this.saveConfiguration();
    }
    $.ajax({
      type: "POST",
      url: "bankoperations/byDate",
      data: {
        accounts: [window.rbiActiveData.accountNumber]
      },
      success: function(operations) {
        var allOperationsById, operation, _i, _len;
        allOperationsById = {};
        for (_i = 0, _len = operations.length; _i < _len; _i++) {
          operation = operations[_i];
          allOperationsById[operation.id] = operation;
        }
        return window.rbiActiveData.allOperationsById = allOperationsById;
      },
      error: function() {
        return window.rbiActiveData.allOperationsById = null;
      }
    });
    window.rbiActiveData.bankAccount = this.model;
    today = moment(new Date()).format('L');
    $("#current-amount-date").text(today);
    if (this.model.get('amount') != null) {
      $("#account-amount-balance").html((this.model.get('amount')).money());
    }
    window.views.forecastBudgetView.displayRegularOperations();
    return this.loadLastYearAmounts(this.model, function() {
      window.views.appView.isLoading;
      if (window.views.appView.isLoading) {
        window.views.appView.displayInterfaceView();
        window.views.monthlyAnalysisView.render();
        return window.app.router.navigate('analyse-mensuelle', {
          trigger: true
        });
      }
    });
  };

  BankSubTitleView.prototype.checkActive = function(account) {
    this.$(".row").removeClass("active");
    if (account === this.model) {
      return this.$(".row").addClass("active");
    }
  };

  BankSubTitleView.prototype.loadLastYearAmounts = function(account, callback) {
    var view;
    view = this;
    window.collections.amounts.reset();
    window.collections.amounts.setAccount(account);
    return window.collections.amounts.fetch({
      success: function(amounts) {
        view.setupLastYearAmountsFlot(amounts);
        $(window).resize(function() {
          return view.setupLastYearAmountsFlot(amounts);
        });
        if (callback != null) {
          return callback();
        }
      },
      error: function() {
        return console.log("error fetching amounts of last year");
      }
    });
  };

  BankSubTitleView.prototype.formatDate = function(date) {
    var day, month, year;
    day = ('0' + date.getDate()).slice(-2);
    month = ('0' + (date.getMonth() + 1)).slice(-2);
    year = date.getFullYear();
    return day + '/' + month + '/' + year;
  };

  BankSubTitleView.prototype.setupLastYearAmountsFlot = function(amounts) {
    var currentDate, dayCounter2, dayRatio, daysPerMonth, flotReadyAmounts, lastAmount, maxAmount, minAmount, numberOfDays, plot, sixMonthAgo, threeMonthAgo, view;
    view = this;
    this.formattedAmounts = [];
    flotReadyAmounts = [];
    daysPerMonth = {
      twelve: 365,
      six: 365 / 2,
      three: 365 / 4
    };
    numberOfDays = daysPerMonth.three;
    threeMonthAgo = new Date();
    threeMonthAgo = threeMonthAgo.setMonth(threeMonthAgo.getMonth() - 3);
    sixMonthAgo = new Date();
    sixMonthAgo = sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
    dayRatio = 4;
    amounts.each(function(amount) {
      var amountDate, currentDate1, dayCounter1;
      if (window.rbiActiveData.olderOperationDate > moment(amount.get('date'))) {
        window.rbiActiveData.olderOperationDate = moment(amount.get('date'));
      }
      currentDate1 = new Date();
      currentDate1.setHours(12, 0, 0, 0);
      amountDate = new Date(amount.get('date'));
      amountDate.setHours(12, 0, 0, 0);
      dayCounter1 = 0;
      while ((amountDate.getTime() !== currentDate1.getTime()) && (dayCounter1 < 365)) {
        currentDate1.setDate(currentDate1.getDate() - 1);
        dayCounter1++;
      }
      if (dayCounter1 < 364) {
        view.formattedAmounts[currentDate1.getTime()] = amount.get('amount');
      }
      if (currentDate1.getTime() < threeMonthAgo) {
        return numberOfDays = daysPerMonth.six;
      } else if (currentDate1.getTime() < sixMonthAgo) {
        return numberOfDays = daysPerMonth.twelve;
      }
    });
    currentDate = new Date();
    currentDate.setHours(12, 0, 0, 0);
    lastAmount = parseFloat(this.model.get('amount'));
    minAmount = parseFloat(this.model.get('amount'));
    maxAmount = parseFloat(this.model.get('amount'));
    dayCounter2 = 0;
    while (dayCounter2 < numberOfDays) {
      if (this.formattedAmounts[currentDate.getTime()]) {
        lastAmount = parseFloat(this.formattedAmounts[currentDate.getTime()]);
      }
      flotReadyAmounts.push([currentDate.getTime(), lastAmount]);
      currentDate.setDate(currentDate.getDate() - 1);
      if (lastAmount < minAmount) {
        minAmount = lastAmount;
      }
      if (lastAmount > maxAmount) {
        maxAmount = lastAmount;
      }
      dayCounter2++;
    }
    $("#max-amount").html(maxAmount.money());
    $("#min-amount").html(minAmount.money());
    minAmount = minAmount - 500;
    maxAmount = maxAmount + 500;
    flotReadyAmounts.reverse();
    $('#amount-stats').empty();
    return plot = $.plot("#amount-stats", [
      {
        data: flotReadyAmounts
      }
    ], {
      series: {
        lines: {
          show: true,
          lineWidth: 2
        },
        points: {
          show: false
        }
      },
      grid: {
        hoverable: true,
        clickable: true,
        borderWidth: 1,
        tickColor: $border_color,
        borderColor: '#eeeeee'
      },
      colors: [window.rbiColors.blue],
      shadowSize: 0,
      yaxis: {
        min: minAmount,
        max: maxAmount
      },
      xaxis: {
        mode: "time",
        minTickSize: [1, "month"],
        monthNames: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
      },
      tooltip: true,
      tooltipOpts: {
        content: '%y.2&euro;<br /> %x',
        xDateFormat: '%d/%m/%y'
      }
    });
  };

  return BankSubTitleView;

})(BaseView);

});

;require.register("views/enhanced_report", function(exports, require, module) {
var BaseView, EnhancedReportView, ReceiptCollection, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

ReceiptCollection = require("../collections/receipts");

module.exports = EnhancedReportView = (function(_super) {
  __extends(EnhancedReportView, _super);

  function EnhancedReportView() {
    _ref = EnhancedReportView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  EnhancedReportView.prototype.template = require('./templates/enhanced_report');

  EnhancedReportView.prototype.el = 'div#interface-box';

  EnhancedReportView.prototype.subViews = [];

  EnhancedReportView.prototype.initialize = function() {
    return this.allReceipts = new ReceiptCollection();
  };

  EnhancedReportView.prototype.render = function() {
    var view,
      _this = this;
    this.allReceipts.fetch({
      success: function(receipts) {
        return _this.displayReceipt();
      }
    });
    EnhancedReportView.__super__.render.call(this);
    view = this;
    return this;
  };

  EnhancedReportView.prototype.displayReceipt = function(receiptId) {
    var attr, foundModel, value, _ref1, _results;
    foundModel = this.allReceipts.where({
      timestamp: "2013-04-11T15:40:31.000Z"
    });
    if (foundModel[0] != null) {
      _ref1 = foundModel[0].attributes;
      _results = [];
      for (attr in _ref1) {
        value = _ref1[attr];
        _results.push(this.$el.find(".interface-box-content").append(attr + " : " + value + '<br />'));
      }
      return _results;
    }
  };

  return EnhancedReportView;

})(BaseView);

});

;require.register("views/forecast_budget", function(exports, require, module) {
var BaseView, ForcastBudgetView, ForecastBudgetEntryView, RegularOpStatementView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

ForecastBudgetEntryView = require("./forecast_budget_entry");

RegularOpStatementView = require("./regular_op_statement");

module.exports = ForcastBudgetView = (function(_super) {
  __extends(ForcastBudgetView, _super);

  function ForcastBudgetView() {
    _ref = ForcastBudgetView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ForcastBudgetView.prototype.template = require('./templates/forecast_budget');

  ForcastBudgetView.prototype.el = 'div#interface-box';

  ForcastBudgetView.prototype.elRegularOperations = '#regular-operations';

  ForcastBudgetView.prototype.subViews = [];

  ForcastBudgetView.prototype.currentChart = null;

  ForcastBudgetView.prototype.monthlyVariableOperations = [];

  ForcastBudgetView.prototype.monthlyRegularOperations = [];

  ForcastBudgetView.prototype.variableOperationsTotal = 0;

  ForcastBudgetView.prototype.newRegularOperationsChecked = false;

  ForcastBudgetView.prototype.initialize = function() {
    return window.views.regularOpStatementView = new RegularOpStatementView($('#context-box'));
  };

  ForcastBudgetView.prototype.render = function() {
    var accountNumber, view;
    ForcastBudgetView.__super__.render.call(this);
    view = this;
    accountNumber = window.rbiActiveData.accountNumber || null;
    if ((accountNumber != null) && (accountNumber !== "")) {
      this.getOperationByRegularType(function() {
        return view.displayRegularOperations(accountNumber);
      });
      window.views.regularOpStatementView.reload();
    }
    return this;
  };

  ForcastBudgetView.prototype.displayRegularOperations = function(accountNumber) {
    var view,
      _this = this;
    view = this;
    if ((accountNumber == null) && (window.rbiActiveData.accountNumber != null)) {
      accountNumber = window.rbiActiveData.accountNumber;
    }
    window.collections.regularOperations.reset();
    window.collections.regularOperations.setAccount(accountNumber);
    return window.collections.regularOperations.fetch({
      success: function(regularOperations, rawData) {
        var operation, subView, _i, _len, _ref1;
        _this.subViews = [];
        $(_this.elRegularOperations).empty();
        _ref1 = regularOperations.models;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          operation = _ref1[_i];
          subView = new ForecastBudgetEntryView(operation);
          $(_this.elRegularOperations).append(subView.render().el);
          _this.subViews.push(subView);
        }
        if (_this.newRegularOperationsChecked) {
          _this.reloadBudget();
        } else {
          _this.getOperationByRegularType(function() {
            return view.reloadBudget();
          });
        }
        return {
          error: function() {
            return console.log("error fetching regular operations");
          }
        };
      }
    });
  };

  ForcastBudgetView.prototype.getOperationByRegularType = function(callback) {
    var accountNumber, currentMonthStart, monthlyOperationsParams, view,
      _this = this;
    view = this;
    accountNumber = window.rbiActiveData.accountNumber;
    this.monthlyRegularOperations = [];
    this.monthlyVariableOperations = [];
    this.variableOperationsTotal = 0;
    currentMonthStart = moment(new Date()).startOf('month');
    monthlyOperationsParams = {
      dateFrom: currentMonthStart.format("YYYY-MM-DD"),
      dateTo: moment(currentMonthStart).endOf('month').format("YYYY-MM-DD"),
      accounts: [accountNumber],
      amountFrom: Number.NEGATIVE_INFINITY,
      amountTo: Number.POSITIVE_INFINITY
    };
    return $.ajax({
      type: "POST",
      url: "bankoperations/byDate",
      data: monthlyOperationsParams,
      success: function(operations) {
        if (operations != null) {
          return $.ajax({
            type: "GET",
            url: "rbifixedcost",
            success: function(fixedCosts) {
              var fixedCost, index, operation, varOperation, _i, _j, _k, _len, _len1, _len2, _ref1;
              for (index = _i = 0, _len = operations.length; _i < _len; index = ++_i) {
                operation = operations[index];
                operation.isRegularOperation = false;
                for (_j = 0, _len1 = fixedCosts.length; _j < _len1; _j++) {
                  fixedCost = fixedCosts[_j];
                  if ($.inArray(operation.id, fixedCost.idTable) >= 0) {
                    operation.isRegularOperation = true;
                    break;
                  }
                }
                if (operation.isRegularOperation) {
                  _this.monthlyRegularOperations.push(operation);
                } else {
                  _this.monthlyVariableOperations.push(operation);
                }
              }
              _ref1 = _this.monthlyVariableOperations;
              for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
                varOperation = _ref1[_k];
                _this.variableOperationsTotal += varOperation.amount;
              }
              view.newRegularOperationsChecked = true;
              if (callback != null) {
                return callback();
              }
            }
          });
        }
      }
    });
  };

  ForcastBudgetView.prototype.reloadBudget = function() {
    var currentBudget, forecastBudget, forecastTitle, percentage, realBudget, realExpenses, realTitle, regularExpenses, regularOperation, roundedForecastBudget, trToInject, _i, _len, _ref1;
    currentBudget = 0;
    realBudget = 0;
    regularExpenses = 0;
    realExpenses = 0;
    _ref1 = this.subViews;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      regularOperation = _ref1[_i];
      if ((regularOperation.rules != null) && (regularOperation.rules.queryMid != null) && regularOperation.model.get("isBudgetPart")) {
        if (regularOperation.rules.queryMid > 0) {
          currentBudget += regularOperation.rules.queryMid;
        } else if (regularOperation.rules.queryMid < 0) {
          regularExpenses += regularOperation.rules.queryMid;
        }
        if ((regularOperation.rules != null) && regularOperation.rules.alreadyPaid) {
          if (regularOperation.rules.alreadyPaidSum > 0) {
            realBudget += regularOperation.rules.alreadyPaidSum;
          } else if (regularOperation.rules.alreadyPaidSum < 0) {
            realExpenses += regularOperation.rules.alreadyPaidSum;
          }
        } else {
          if (regularOperation.rules.queryMid > 0) {
            realBudget += regularOperation.rules.queryMid;
          } else if (regularOperation.rules.queryMid < 0) {
            realExpenses += regularOperation.rules.queryMid;
          }
        }
      }
    }
    regularExpenses = Math.abs(regularExpenses);
    realExpenses = Math.abs(realExpenses);
    percentage = parseInt((regularExpenses / currentBudget) * 100);
    percentage = percentage <= 100 ? percentage : 100;
    forecastBudget = currentBudget - regularExpenses;
    roundedForecastBudget = Math.floor((forecastBudget + 5) / 10) * 10;
    realBudget = realBudget - realExpenses;
    $("#account-budget-amount").html(roundedForecastBudget.money());
    $('#current-budget-chart-debit').html(realBudget.money());
    $('#current-budget-chart').attr('data-percent', percentage);
    if (this.currentChart != null) {
      $('#current-budget-chart').data('easyPieChart').update(percentage);
    } else {
      this.currentChart = $('#current-budget-chart').easyPieChart({
        animate: 1500,
        barColor: window.rbiColors.blue,
        trackColor: window.rbiColors.border_color,
        scaleColor: window.rbiColors.blue,
        lineWidth: 2
      });
    }
    $("#regular-operations-budget").remove();
    forecastTitle = "La somme des mouvements d'argent attendus sur votre compte ce mois-ci.";
    realTitle = "La somme des mouvements d'argent réellement survenus ce mois-ci, et de ceux à venir.";
    trToInject = '<tr id="regular-operations-budget">' + "\t" + "<td><strong title=\"" + forecastTitle + "\">Prévisionnel</strong></td>" + "\t" + "<td>&#8776; " + roundedForecastBudget.money() + "</td>" + "\t" + "<td><strong title=\"" + realTitle + "\">Affiné </strong></td>" + "\t" + "<td>= " + realBudget.money() + "</td>" + '</tr>';
    return $("tbody#regular-operations").append(trToInject);
  };

  return ForcastBudgetView;

})(BaseView);

});

;require.register("views/forecast_budget_entry", function(exports, require, module) {
var BaseView, ForecastBudgetEntryView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

module.exports = ForecastBudgetEntryView = (function(_super) {
  __extends(ForecastBudgetEntryView, _super);

  ForecastBudgetEntryView.prototype.template = require('./templates/forecast_budget_entry');

  ForecastBudgetEntryView.prototype.tagName = 'tr';

  ForecastBudgetEntryView.prototype.events = {
    "click .toogle-monthly-budget": "toogleMonthlyBudget",
    "click .remove-regular-operation": "removeRegularOperation",
    "click td:eq(0),td:eq(1)": "modifyRegularOperation",
    'mouseenter td:eq(0), td:eq(1) ': "showHighlighting",
    'mouseleave td:eq(0), td:eq(1) ': "hideHighlighting"
  };

  ForecastBudgetEntryView.prototype.rules = {};

  function ForecastBudgetEntryView(model) {
    this.model = model;
    ForecastBudgetEntryView.__super__.constructor.call(this);
  }

  ForecastBudgetEntryView.prototype.render = function() {
    if (this.model.get("uniquery") != null) {
      this.rules = this.deserializeUniquery(this.model.get("uniquery"));
      this.addAverageToRules();
      this.addAlreadyPaidToRules();
      this.model.set("rules", this.rules);
    }
    ForecastBudgetEntryView.__super__.render.call(this);
    if (!this.model.get("isBudgetPart")) {
      this.$el.find("em").hide();
    }
    return this;
  };

  ForecastBudgetEntryView.prototype.toogleMonthlyBudget = function(event) {
    var isBudgetPart,
      _this = this;
    isBudgetPart = $(event.currentTarget).is(":checked");
    return $.ajax({
      type: "PUT",
      url: "rbifixedcost/" + this.model.get("id"),
      data: {
        isBudgetPart: isBudgetPart
      },
      success: function(objects) {
        return window.views.forecastBudgetView.displayRegularOperations();
      },
      error: function(err) {
        return console.log("There was an error during saving regular operation process");
      }
    });
  };

  ForecastBudgetEntryView.prototype.showHighlighting = function(event) {
    var jqTr;
    jqTr = $(event.currentTarget).closest("tr");
    return jqTr.addClass("highlighted-rule");
  };

  ForecastBudgetEntryView.prototype.hideHighlighting = function(event) {
    var jqTr;
    jqTr = $(event.currentTarget).closest("tr");
    return jqTr.removeClass("highlighted-rule");
  };

  ForecastBudgetEntryView.prototype.modifyRegularOperation = function(currentEvent) {
    $("#search-regular-operations").val(this.rules.queryPattern);
    $("#search-min-amount").val(this.rules.queryMin);
    $("#search-max-amount").val(this.rules.queryMax);
    return $("#search-regular-operations").keyup();
  };

  ForecastBudgetEntryView.prototype.deserializeUniquery = function(uniquery) {
    var queryParts, rules;
    queryParts = [];
    rules = {};
    if ((uniquery != null) && ((typeof uniquery) === "string")) {
      queryParts = uniquery.split("(#|#)");
    }
    rules.queryAccountNumber = queryParts[0] || "";
    rules.queryPattern = queryParts[1] || "";
    rules.queryMin = (queryParts[2] != null) && (queryParts[2] !== "NEGATIVE_INFINITY") ? Number(queryParts[2]) : null;
    rules.queryMax = (queryParts[3] != null) && (queryParts[3] !== "POSITIVE_INFINITY") ? Number(queryParts[3]) : null;
    return rules;
  };

  ForecastBudgetEntryView.prototype.addAverageToRules = function() {
    var addedAmounts, allOperationsById, count, id, idTable, mid, _i, _len;
    idTable = this.model.get("idTable");
    allOperationsById = window.rbiActiveData.allOperationsById;
    mid = 0;
    count = 0;
    addedAmounts = 0;
    if ((idTable != null) && (allOperationsById != null) && idTable.length > 0) {
      for (_i = 0, _len = idTable.length; _i < _len; _i++) {
        id = idTable[_i];
        if (allOperationsById[id] != null) {
          addedAmounts += allOperationsById[id].amount;
          count++;
        }
      }
    }
    if (addedAmounts !== 0) {
      mid = addedAmounts / count;
    }
    this.rules.queryMid = mid;
    return this.rules.textQueryMid = mid > 0 ? "+" + mid.money() : mid.money();
  };

  ForecastBudgetEntryView.prototype.addAlreadyPaidToRules = function() {
    var allOperationsById, id, idTable, startOfMonth, sum, _i, _len, _results;
    idTable = this.model.get("idTable");
    allOperationsById = window.rbiActiveData.allOperationsById;
    startOfMonth = moment(moment(new Date()).subtract("month", 3)).startOf("month");
    this.rules.alreadyPaid = false;
    this.rules.textAlreadyPaid = "non";
    if ((idTable != null) && (allOperationsById != null) && idTable.length > 0) {
      _results = [];
      for (_i = 0, _len = idTable.length; _i < _len; _i++) {
        id = idTable[_i];
        if ((allOperationsById[id] != null) && moment(allOperationsById[id].date) > moment(startOfMonth)) {
          sum = allOperationsById[id].amount;
          this.rules.alreadyPaid = true;
          this.rules.textAlreadyPaid = sum > 0 ? "+" + sum.money() : sum.money();
          _results.push(this.rules.alreadyPaidSum = sum);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    }
  };

  ForecastBudgetEntryView.prototype.removeRegularOperation = function(event) {
    var regularOperationId,
      _this = this;
    regularOperationId = (this.model.get("id")) || null;
    if (regularOperationId != null) {
      return $.ajax({
        url: '/rbifixedcost/' + regularOperationId,
        type: 'DELETE',
        success: function(result) {
          window.views.forecastBudgetView.newRegularOperationsChecked = false;
          window.views.forecastBudgetView.displayRegularOperations();
          return $('#search-regular-operations').keyup();
        },
        error: function() {
          return console.log("Delete fixed cost failed.");
        }
      });
    }
  };

  return ForecastBudgetEntryView;

})(BaseView);

});

;require.register("views/geolocated_report", function(exports, require, module) {
var BankStatementView, BaseView, GeolocatedReportView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

BankStatementView = require("./bank_statement");

module.exports = GeolocatedReportView = (function(_super) {
  __extends(GeolocatedReportView, _super);

  GeolocatedReportView.prototype.template = require('./templates/geolocated_report');

  GeolocatedReportView.prototype.el = 'div#interface-box';

  GeolocatedReportView.prototype.events = {
    'click .day-switcher': 'switchDay'
  };

  GeolocatedReportView.prototype.bounds = null;

  function GeolocatedReportView(model) {
    this.model = model;
    GeolocatedReportView.__super__.constructor.call(this);
  }

  GeolocatedReportView.prototype.render = function() {
    var bankStatementParams, now;
    this.bankStatementView = new BankStatementView($('#context-box'));
    GeolocatedReportView.__super__.render.call(this);
    this.loadFirstDayMap();
    now = new Date();
    bankStatementParams = {
      accounts: [window.rbiActiveData.accountNumber],
      amountFrom: Number.NEGATIVE_INFINITY,
      amountTo: Number.POSITIVE_INFINITY,
      dateFrom: moment(moment(now).subtract('y', 1)).format('YYYY-MM-DD'),
      dateTo: moment(now).format('YYYY-MM-DD')
    };
    this.bankStatementView.mapLinked = true;
    return this.bankStatementView.reload(bankStatementParams);
  };

  GeolocatedReportView.prototype.loadFirstDayMap = function() {
    var _this = this;
    this.$el.find(".geolocated-report-error").hide();
    this.$el.find(".geolocated-report-loader").show();
    return $.ajax({
      type: "GET",
      url: "geolocationlog/getMostRecent",
      success: function(geolocationLog) {
        if ((geolocationLog != null) && (typeof geolocationLog === "object") && (geolocationLog.timestamp != null)) {
          console.log(geolocationLog);
          return _this.switchDay(null, geolocationLog.timestamp);
        } else {
          _this.$el.find(".geolocated-report-title").html('Relevé Géolocalisé');
          return _this.$el.find(".geolocated-report-error").html("Ce service nécessite les données de l'opérateur Orange.<br /><br /> Aucune donnée de géolocalisation trouvée.").show();
        }
      },
      error: function() {
        _this.$el.find(".geolocated-report-title").html('Relevé Géolocalisé');
        return _this.$el.find(".geolocated-report-error").html('Une erreur est survenue lors du chargement des données.<br /<br />Veuillez réessayer ultérieurement.'.show());
      },
      complete: function() {
        return _this.$el.find(".geolocated-report-loader").hide();
      }
    });
  };

  GeolocatedReportView.prototype.switchDay = function(event, date) {
    var firstDay, jqSwitcher, today,
      _this = this;
    this.$el.find(".geolocated-report-error").hide();
    this.$el.find("#msisdn-geolocation-map").css("visibility", "hidden");
    this.$el.find(".geolocated-report-loader").show();
    if (this.map != null) {
      this.map.closePopup();
    }
    today = moment(new Date()).startOf("day");
    firstDay = moment(window.rbiActiveData.olderOperationDate).startOf('day');
    if ((event != null) && (event.currentTarget != null)) {
      jqSwitcher = $(event.currentTarget);
      if (jqSwitcher.hasClass('previous-day')) {
        this.currentDate.subtract('day', 1).startOf('day');
      } else if (jqSwitcher.hasClass('next-day')) {
        this.currentDate.add('day', 1).startOf('day');
      }
    } else {
      this.currentDate = moment(date || today).startOf("day");
    }
    if (moment(this.currentDate).format("YYYY-MM-DD") === today.format("YYYY-MM-DD")) {
      $('.next-day').hide();
    } else {
      $('.next-day').show();
    }
    if ((firstDay.format("YYYY-MM-DD") !== today.format("YYYY-MM-DD")) && (this.currentDate.format("YYYY-MM-DD") === firstDay.format("YYYY-MM-DD"))) {
      $('.previous-month').hide();
    } else {
      $('.previous-month').show();
    }
    this.$("#current-day").html("Le " + (this.currentDate.format("dddd DD MMMM YYYY")));
    $.ajax({
      type: "POST",
      url: "geolocationlog/allByDate",
      data: {
        dateFrom: this.currentDate.format("YYYY-MM-DD HH:mm"),
        dateTo: moment(this.currentDate.endOf("day")).format("YYYY-MM-DD HH:mm")
      },
      success: function(geolocationLogs) {
        var addTag, alreadyRegistered, lastLocation, log, marker, markerTable, message, newTime, point, polylineTable, _i, _j, _k, _len, _len1, _len2;
        _this.$el.find("#msisdn-geolocation-map").css("visibility", "visible");
        polylineTable = [];
        markerTable = [];
        lastLocation = null;
        for (_i = 0, _len = geolocationLogs.length; _i < _len; _i++) {
          log = geolocationLogs[_i];
          if ((log.longitude != null) && (log.latitude != null)) {
            alreadyRegistered = false;
            lastLocation = [log.latitude, log.longitude];
            polylineTable.push(lastLocation);
            newTime = (moment(log.timestamp).format("HH")) + "h" + (moment(log.timestamp).format("mm"));
            for (_j = 0, _len1 = markerTable.length; _j < _len1; _j++) {
              marker = markerTable[_j];
              if ((marker.location[0] === lastLocation[0]) && (marker.location[1] === lastLocation[1])) {
                alreadyRegistered = true;
                addTag = (marker.time.match(/\h/g).length % 5) === 0 ? ",<br />" : ", ";
                if (marker.time.match(/\.\.\./) == null) {
                  if (marker.time.length < 300) {
                    marker.time += addTag + newTime;
                    marker.plural = true;
                  } else {
                    marker.time += "...";
                  }
                }
                break;
              }
            }
            if (!alreadyRegistered) {
              markerTable.push({
                location: lastLocation,
                time: newTime
              });
            }
          }
        }
        if (markerTable.length === 1) {
          markerTable[0].time = "Toute la journée à cette adresse.";
        }
        if (polylineTable.length > 0) {
          if ((_this.map != null) && (_this.polyline != null)) {
            _this.map.removeLayer(_this.polyline);
          }
          _this.polyline = L.polyline(polylineTable);
          _this.bounds = _this.polyline.getBounds();
        }
        if (lastLocation != null) {
          if ((_this.map == null) || $("#msisdn-geolocation-map").html() === "") {
            if ($("#msisdn-geolocation-map").length === 1) {
              _this.map = L.map('msisdn-geolocation-map').setView(lastLocation, 1);
              _this.layer = L.tileLayer('http://{s}.tile.cloudmade.com/8ee2a50541944fb9bcedded5165f09d9/997/256/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>'
              });
              _this.layer.addTo(_this.map);
            }
          }
        } else {
          if (_this.map != null) {
            _this.map.remove();
            _this.map = null;
          }
          $("#msisdn-geolocation-map").html("");
          $("#msisdn-geolocation-map").attr('class', "");
          _this.$el.find(".geolocated-report-error").html("Aucune donnée de géolocalisation trouvée ce jour.").show();
        }
        if ((_this.polyline != null) && (_this.map != null)) {
          _this.polyline.addTo(_this.map);
          for (_k = 0, _len2 = markerTable.length; _k < _len2; _k++) {
            point = markerTable[_k];
            message = "";
            if (markerTable.length > 1) {
              if (point.plural) {
                message = "&Agrave cette adresse aux heures suivantes : <br /><br /><em>" + point.time + "</em>";
              } else {
                message = "&Agrave cette adresse à <em>" + point.time + "</em>";
              }
            } else {
              message = point.time;
            }
            L.marker(point.location).setIcon(window.rbiIcons.marker).bindPopup(message).addTo(_this.map);
          }
          if (_this.bounds) {
            return _this.map.fitBounds(_this.bounds);
          }
        }
      },
      error: function() {
        _this.$el.find(".geolocated-report-title").html('Relevé Géolocalisé');
        return _this.$el.find(".geolocated-report-error").html('Une erreur est survenue lors du chargement des données.<br /<br />Veuillez réessayer ultérieurement.'.show());
      },
      complete: function() {
        return _this.$el.find(".geolocated-report-loader").hide();
      }
    });
    return this;
  };

  return GeolocatedReportView;

})(BaseView);

});

;require.register("views/intermarche-mesconsos", function(exports, require, module) {
var IntermarcheView, ReceiptCollection, ReceiptTotalView, ReceiptTotalsCollection, ReceiptView;

ReceiptView = require("./receipt");

ReceiptCollection = require("collections/receipts");

ReceiptTotalView = require("./receiptmonth");

ReceiptTotalsCollection = require("collections/receipttotals");

module.exports = IntermarcheView = Backbone.View.extend({
  template: require("../templates/intermarche"),
  initialize: function() {
    this.getDays();
  },
  events: {
    "click #day": "getDays",
    "click #month": "getMonths"
  },
  render: function() {
    this.$el.html(this.template({
      title: "Mes Courses"
    }));
  },
  showLoader: function(show) {
    if (show) {
      this.$el.find("#loader").show();
    } else {
      this.$el.find("#loader").hide();
    }
  },
  toggleList: function(period) {
    var other_map;
    other_map = {
      "#month": "#day",
      "#day": "#month"
    };
    this.$el.find(period).toggleClass("period_button period_button-selected");
    this.$el.find(other_map[period]).toggleClass("period_button-selected period_button");
    this.stopListening(this.collection);
    this.$el.find("#list").empty();
    this.showLoader(true);
  },
  collectionFetch: function() {
    var that;
    that = this;
    that.$el.find(".nodata").hide();
    this.collection.fetch({
      success: function(collection, response, options) {
        that.showLoader(false);
        if (collection.length === 0) {
          that.$el.find(".nodata").show();
        }
      },
      error: function(collection, response, options) {
        that.stopLoader();
      }
    });
  },
  getDays: function() {
    if (this.state === "#day") {
      return;
    }
    this.state = "#day";
    this.toggleList("#day");
    this.collection = new ReceiptCollection();
    this.listenTo(this.collection, "add", this.onReceiptAdded);
    this.collectionFetch();
  },
  onReceiptAdded: function(receipt) {
    var receiptView;
    this.showLoader(false);
    receiptView = new ReceiptView({
      model: receipt
    });
    receiptView.render();
    this.$el.find("#list").append(receiptView.$el);
  },
  getMonths: function() {
    if (this.state === "#month") {
      return;
    }
    this.state = "#month";
    this.toggleList("#month");
    this.collection = new ReceiptTotalsCollection();
    this.listenTo(this.collection, "add", this.onReceiptTotalAdded);
    this.collectionFetch();
  },
  onReceiptAdded: function(receipt) {
    var receiptView;
    receiptView = new ReceiptView({
      model: receipt
    });
    receiptView.render();
    this.$el.find("#list").append(receiptView.$el);
  },
  onReceiptTotalAdded: function(data) {
    var rtView;
    rtView = new ReceiptTotalView({
      model: data
    });
    rtView.render();
    this.$el.find("#list").append(rtView.$el);
  }
});

});

;require.register("views/menu", function(exports, require, module) {
var BaseView, MenuView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

module.exports = MenuView = (function(_super) {
  __extends(MenuView, _super);

  function MenuView() {
    _ref = MenuView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  MenuView.prototype.template = require('./templates/menu');

  MenuView.prototype.el = 'div#mainnav';

  MenuView.prototype.subViews = [];

  MenuView.prototype.initialize = function() {};

  MenuView.prototype.render = function() {
    var view;
    MenuView.__super__.render.call(this);
    view = this;
    return this;
  };

  MenuView.prototype.afterRender = function() {
    var that;
    this.adjustPadding();
    that = this;
    return window.app.router.bind("route", function(method) {
      var currentMethod, currentRoute, route, _ref1;
      route = null;
      if (method != null) {
        _ref1 = window.app.router.routes;
        for (currentRoute in _ref1) {
          currentMethod = _ref1[currentRoute];
          if ((currentRoute !== "") && (currentMethod === method)) {
            route = currentRoute;
            break;
          }
        }
      }
      if (route != null) {
        $('.menu-item').each(function() {
          if ($(this).children('a').attr("href").replace("#", "") === route) {
            that.activateMenuItem($(this));
            return false;
          }
        });
      }
      if ($("#context-box").html() === "") {
        return $("#context-box").hide();
      } else {
        return $("#context-box").show();
      }
    });
  };

  MenuView.prototype.activateMenuItem = function(jqMenuItem) {
    if (!jqMenuItem.hasClass('active')) {
      $('.menu-item').removeClass('active');
      $('.current-arrow').remove();
      jqMenuItem.addClass('active');
      jqMenuItem.prepend($('<span class="current-arrow"></span>'));
    }
    if ($(window).width() < 768) {
      return window.scrollTo(0, 535);
    }
  };

  MenuView.prototype.adjustPadding = function() {
    return $('#mainnav .menu-item > a').each(function() {
      var text;
      text = $(this).text() || null;
      if ((text.length != null) && (text.length > 25)) {
        return $(this).css({
          'padding-top': '10px'
        });
      } else if ((text.length != null) && (text.length < 11)) {
        return $(this).css({
          'padding-top': '20px'
        });
      } else {
        return $(this).css({
          'padding-top': '16px'
        });
      }
    });
  };

  return MenuView;

})(BaseView);

});

;require.register("views/monthly_analysis", function(exports, require, module) {
var BankStatementView, BaseView, MonthlyAnalysisView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

BankStatementView = require("./bank_statement");

module.exports = MonthlyAnalysisView = (function(_super) {
  __extends(MonthlyAnalysisView, _super);

  function MonthlyAnalysisView() {
    _ref = MonthlyAnalysisView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  MonthlyAnalysisView.prototype.template = require('./templates/monthly_analysis');

  MonthlyAnalysisView.prototype.el = 'div#interface-box';

  MonthlyAnalysisView.prototype.subViews = [];

  MonthlyAnalysisView.prototype.currentMonthStart = '';

  MonthlyAnalysisView.prototype.events = {
    'click .month-switcher': 'switchMonth',
    'click #credits-search-btn': 'searchAllCredits',
    'click #debits-search-btn': 'searchAllDebits',
    'click #fixed-cost-search-btn': 'searchAllFixedCost',
    'click #variable-cost-search-btn': 'searchAllVariableCost'
  };

  MonthlyAnalysisView.prototype.render = function() {
    this.bankStatementView = new BankStatementView($('#context-box'));
    MonthlyAnalysisView.__super__.render.call(this);
    this.switchMonth();
    return this;
  };

  MonthlyAnalysisView.prototype.searchAllCredits = function() {
    $('#search-text').val("#credits");
    return $('#search-text').keyup();
  };

  MonthlyAnalysisView.prototype.searchAllDebits = function() {
    $('#search-text').val("#debits");
    return $('#search-text').keyup();
  };

  MonthlyAnalysisView.prototype.searchAllFixedCost = function() {
    $('#search-text').val("#frais-fixes");
    return $('#search-text').keyup();
  };

  MonthlyAnalysisView.prototype.searchAllVariableCost = function() {
    $('#search-text').val("#depenses");
    return $('#search-text').keyup();
  };

  MonthlyAnalysisView.prototype.switchMonth = function(event) {
    var bankStatementParams, currentMonth, firstMonth, jqSwitcher, monthlyAmounts,
      _this = this;
    currentMonth = moment(new Date()).startOf('month').format("YYYY-MM-DD");
    firstMonth = moment(window.rbiActiveData.olderOperationDate).startOf('month').format("YYYY-MM-DD");
    $('#search-text').val("");
    if ((event != null) && (event.currentTarget != null)) {
      jqSwitcher = $(event.currentTarget);
      if (jqSwitcher.hasClass('previous-month')) {
        this.currentMonthStart.subtract('months', 1).startOf('month');
      } else if (jqSwitcher.hasClass('next-month')) {
        this.currentMonthStart.add('months', 1).startOf('month');
      }
    } else {
      this.currentMonthStart = moment(new Date()).startOf('month');
    }
    if ((moment(this.currentMonthStart).format("YYYY-MM-DD")) === currentMonth) {
      $('.next-month').hide();
    } else {
      $('.next-month').show();
    }
    if ((firstMonth !== currentMonth) && (moment(this.currentMonthStart).format("YYYY-MM-DD") === firstMonth)) {
      $('.previous-month').hide();
    } else {
      $('.previous-month').show();
    }
    this.$("#current-month").html(moment(this.currentMonthStart).format("MMMM YYYY"));
    if (window.rbiActiveData.bankAccount != null) {
      monthlyAmounts = this.getAmountsByMonth(this.currentMonthStart);
      this.displayMonthlyAmounts(monthlyAmounts.previous, monthlyAmounts.next);
      bankStatementParams = {
        dateFrom: this.currentMonthStart,
        dateTo: moment(this.currentMonthStart).endOf('month')
      };
      console.log("monthly launch reload");
      return this.bankStatementView.reload(bankStatementParams, function(operations) {
        _this.displayMonthlySums(operations);
        _this.displayPieChart(operations);
        return $(window).resize(function() {
          return _this.displayPieChart(operations);
        });
      });
    }
  };

  MonthlyAnalysisView.prototype.displayMonthlyAmounts = function(previous, next) {
    var differential, iconEvolution, sign;
    differential = next - previous;
    sign = '';
    $("#amount-month-start").html(previous.money());
    $("#amount-month-end").html(next.money());
    $("#amount-month-differential").empty();
    if ((!isNaN(differential)) && differential !== 0) {
      if (differential > 0) {
        sign = '+';
        iconEvolution = $('<span class="fs1 plain-icon-blue" aria-hidden="true" data-icon="&#57641;"></span>');
        if ($("#amount-month-differential").hasClass("red-text")) {
          $("#amount-month-differential").removeClass("red-text").addClass("blue-text");
        }
      } else {
        if ($("#amount-month-differential").hasClass("blue-text")) {
          $("#amount-month-differential").removeClass("blue-text").addClass("red-text");
        }
        iconEvolution = $('<span class="fs1 plain-icon-red" aria-hidden="true" data-icon="&#57643;"></span>');
      }
      $("#amount-month-differential").append(iconEvolution);
      return $("#amount-month-differential").append(sign + differential.money());
    }
  };

  MonthlyAnalysisView.prototype.displayMonthlySums = function(operations) {
    var credits, debits, fixedCost, key, operation, variableCost;
    credits = 0;
    debits = 0;
    fixedCost = 0;
    variableCost = 0;
    if (operations != null) {
      for (key in operations) {
        operation = operations[key];
        if (operation.amount > 0) {
          credits += operation.amount;
        } else {
          debits += operation.amount;
        }
        if (operation.isRegularOperation && operation.amount < 0) {
          fixedCost += operation.amount;
        } else if ((!operation.isRegularOperation) && operation.amount < 0) {
          variableCost += operation.amount;
        }
      }
    }
    $('#credits-sum').html(credits.money());
    $('#debits-sum').html((Math.abs(debits)).money());
    $('#fixed-cost-sum').html((Math.abs(fixedCost)).money());
    return $('#variable-cost-sum').html((Math.abs(variableCost)).money());
  };

  MonthlyAnalysisView.prototype.displayPieChart = function(operations) {
    var amount, chartColors, dataTable, finalObj, finalType, id, isKnownType, obj, operation, operationTypes, others, pattern, raw, type, _i, _len, _ref1;
    $('#pie_chart').empty();
    dataTable = [];
    chartColors = [];
    operationTypes = {
      withdrawals: {
        name: "Retraits",
        amount: 0,
        color: "#8ecf67",
        patterns: [/^CARTE \w+ RETRAIT DAB.* (0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012]).*/g, /^CARTE \w+ (0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012]).* RETRAIT DAB.*/g, /^CARTE RETRAIT .*/g, /RETRAIT DAB (0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012]).*/g]
      },
      payback: {
        name: 'Remboursements',
        amount: 0,
        color: "#fac567",
        patterns: [/^CARTE \w+ REMBT (0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012]).*/g]
      },
      carte: {
        name: "CB",
        amount: 0,
        color: "#F08C56",
        patterns: [/^CARTE \w+ (0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012]) .*/g, /^CARTE (0[1-9]|[12][0-9]|3[01])(0[1-9]|1[012]).* \d+ .*/g]
      },
      orders: {
        name: 'Prélèvements',
        amount: 0,
        color: "#87ceeb",
        patterns: [/^(COTISATION|PRELEVEMENT|TELEREGLEMENT|TIP) .*/g, /^(PRLV|PRELEVEMENT) .*$/g, /^.* QUITTANCE .*/g]
      },
      transfer: {
        name: 'Virements',
        amount: 0,
        color: "#f74e4d",
        patterns: [/^(\d+ )?VIR (PERM )?POUR: (.*?) (REF: \d+ )?MOTIF: (.*)/g, /^(VIR(EMEN)?T?) \w+ (.*)/g, /^VIR COOPA (0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012]) (.*)/g, /^VIR(EMENT|EMT)? (.*?)(- .*)?$/g]
      },
      check: {
        name: "Chèques",
        amount: 0,
        color: "#28D8CA",
        patterns: [/^(CHEQUE) (.*)/g, /^CHEQUE.*/g]
      },
      bank: {
        name: "Frais bancaires",
        amount: 0,
        color: "#8E3CBE",
        patterns: [/^(FRAIS) (.*)/g, /^(AGIOS \/|FRAIS) (.*)/g, /^ABONNEMENT (.*)/g]
      },
      loan_payment: {
        name: "Prêts",
        amount: 0,
        color: '#CF68C1',
        patterns: [/^ECHEANCEPRET(.*)/g]
      },
      deposit: {
        name: 'Remise de chèques',
        amount: 0,
        color: '#4D3CBE',
        patterns: [/^REMISE CHEQUES(.*)/g, /^REMISE (.*)/g]
      }
    };
    others = {
      name: "Autres",
      amount: 0,
      color: "#b0b0b0"
    };
    for (id in operations) {
      operation = operations[id];
      if (operation.amount < 0) {
        isKnownType = false;
        raw = operation.raw.toLocaleUpperCase();
        amount = Math.abs(operation.amount);
        for (type in operationTypes) {
          obj = operationTypes[type];
          if (!isKnownType) {
            _ref1 = obj.patterns;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              pattern = _ref1[_i];
              if (raw.search(pattern) >= 0) {
                obj.amount += amount;
                isKnownType = true;
                break;
              }
            }
          }
        }
        if (!isKnownType) {
          others.amount += amount;
        }
      }
    }
    for (finalType in operationTypes) {
      finalObj = operationTypes[finalType];
      if (finalObj.amount > 0) {
        dataTable.push([finalObj.name, finalObj.amount]);
        chartColors.push(finalObj.color);
      }
    }
    if (others.amount > 0) {
      dataTable.push([others.name, others.amount]);
      chartColors.push(others.color);
    }
    if (dataTable.length > 1) {
      return this.createFlotPieChart(dataTable, chartColors);
    }
  };

  MonthlyAnalysisView.prototype.createFlotPieChart = function(dataTable, chartColors) {
    var data, entry, index, item, labelFormatter, _i, _len;
    data = [];
    for (index = _i = 0, _len = dataTable.length; _i < _len; index = ++_i) {
      item = dataTable[index];
      entry = {
        label: item[0],
        data: item[1],
        color: chartColors[index]
      };
      data.push(entry);
    }
    labelFormatter = function(label, series) {
      return "<div style='font-size:8pt; text-align:center; padding:2px; color:white;'>" + label + "<br/>" + series.data[0][1].money() + "</div>";
    };
    return $.plot('#pie_chart', data, {
      series: {
        pie: {
          show: true,
          radius: 1,
          label: {
            show: true,
            radius: 3 / 5,
            formatter: labelFormatter,
            background: {
              opacity: 0.5
            }
          }
        },
        legend: {
          show: true,
          labelFormatter: null,
          labelBoxBorderColor: null,
          position: "ne"
        }
      }
    });
  };

  MonthlyAnalysisView.prototype.getAmountsByMonth = function(monthStart) {
    var amount, currentAmounts, currentDate, monthEnd, monthlyAmounts, nextAmount, nextDate, previousAmount, previousDate, _i, _len;
    monthlyAmounts = [];
    monthStart = moment(monthStart);
    monthEnd = moment(moment(monthStart).endOf('month'));
    nextAmount = (window.rbiActiveData.bankAccount.get('amount')) || null;
    previousAmount = nextAmount;
    nextDate = null;
    previousDate = null;
    currentAmounts = window.collections.amounts.models;
    if ((currentAmounts != null) && currentAmounts.length > 0) {
      for (_i = 0, _len = currentAmounts.length; _i < _len; _i++) {
        amount = currentAmounts[_i];
        currentDate = moment(amount.get('date'));
        if (currentDate > monthEnd && currentDate <= moment()) {
          if (nextDate == null) {
            nextDate = moment(amount.get('date'));
          }
          if (currentDate < nextDate) {
            nextAmount = amount.get('amount');
            previousAmount = nextAmount;
            nextDate = moment(amount.get('date'));
          }
        } else if (currentDate >= monthStart && currentDate <= monthEnd) {
          if ((previousDate == null) || (currentDate < previousDate)) {
            previousAmount = amount.get('amount');
            previousDate = moment(amount.get('date'));
          }
        }
      }
    }
    return monthlyAmounts = {
      next: parseFloat(nextAmount),
      previous: parseFloat(previousAmount)
    };
  };

  return MonthlyAnalysisView;

})(BaseView);

});

;require.register("views/online_shopping", function(exports, require, module) {
var BaseView, OnlineShoppingView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

module.exports = OnlineShoppingView = (function(_super) {
  __extends(OnlineShoppingView, _super);

  function OnlineShoppingView() {
    _ref = OnlineShoppingView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  OnlineShoppingView.prototype.template = require('./templates/online_shopping');

  OnlineShoppingView.prototype.el = 'div#interface-box';

  OnlineShoppingView.prototype.subViews = [];

  OnlineShoppingView.prototype.initialize = function() {};

  OnlineShoppingView.prototype.render = function() {
    var view;
    OnlineShoppingView.__super__.render.call(this);
    view = this;
    return this;
  };

  return OnlineShoppingView;

})(BaseView);

});

;require.register("views/receipt--mesconsos", function(exports, require, module) {
var Receipt, SectionCollection, SectionView;

SectionView = require("./section");

SectionCollection = require("../collections/sections");

module.exports = Receipt = Backbone.View.extend({
  tagName: "div",
  template: require("../templates/receipt"),
  events: {
    "click .receipt": "toggleSections"
  },
  initialize: function() {
    this.collection = new SectionCollection([], {
      receiptId: this.model.attributes.receiptId
    });
  },
  render: function() {
    this.$el.html(this.template({
      receipt: this.model.toJSON()
    }));
  },
  btnState: function(state) {
    var states;
    states = {
      opened: "img/moins.png",
      closed: "img/plus.png",
      loading: "img/ajax-loader_b.gif"
    };
    this.$el.find(".toggle-btn").attr("src", states[state]);
  },
  toggleSections: function(event) {
    if (!this.open) {
      this.open = true;
      this.btnState("loading");
      this.listenTo(this.collection, "add", this.onSectionAdded);
      this.collection.fetch();
    } else {
      this.stopListening(this.collection);
      this.$el.find(".sections").empty();
      this.btnState("closed");
      this.open = false;
    }
  },
  onSectionAdded: function(section) {
    var sectionView;
    this.btnState("opened");
    sectionView = new SectionView({
      model: section
    });
    sectionView.render();
    this.$el.find(".sections").append(sectionView.$el);
  }
});

});

;require.register("views/regular_op_statement", function(exports, require, module) {
var BaseView, RegularOpStatementEntryView, RegularOpStatementView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

RegularOpStatementEntryView = require("./regular_op_statement_entry");

module.exports = RegularOpStatementView = (function(_super) {
  __extends(RegularOpStatementView, _super);

  RegularOpStatementView.prototype.templateHeader = require('./templates/regular_op_statement_header');

  RegularOpStatementView.prototype.events = {
    'keyup input#search-regular-operations': "reload",
    'keyup input#search-min-amount': "reload",
    'keyup input#search-max-amount': "reload",
    'click .add-regular-operation': "addToRegularOperation",
    'click #empty-search-regular-operations': "emptyAllFields"
  };

  RegularOpStatementView.prototype.inUse = false;

  RegularOpStatementView.prototype.subViews = [];

  RegularOpStatementView.prototype.subViewLastDate = '';

  RegularOpStatementView.prototype.params = null;

  RegularOpStatementView.prototype.alreadyRegular = false;

  function RegularOpStatementView(el) {
    this.el = el;
    RegularOpStatementView.__super__.constructor.call(this);
  }

  RegularOpStatementView.prototype.render = function() {
    this.$el.html(require("./templates/regular_op_statement_empty"));
    return this;
  };

  RegularOpStatementView.prototype.emptyAllFields = function() {
    $("input#search-regular-operations").val("");
    $("#search-min-amount").val("");
    $("#search-max-amount").val("");
    return $("input#search-regular-operations").keyup();
  };

  RegularOpStatementView.prototype.getCurrentRules = function() {
    var rules;
    rules = null;
    if (window.rbiActiveData.bankAccount != null) {
      rules = {
        accountNumber: window.rbiActiveData.bankAccount.get('accountNumber'),
        pattern: $("input#search-regular-operations").val() || null,
        minAmount: $("#search-min-amount").val() || null,
        maxAmount: $("#search-max-amount").val() || null
      };
      if (rules.minAmount != null) {
        rules.minAmount = parseFloat(rules.minAmount).toFixed(2);
      }
      if (rules.maxAmount != null) {
        rules.maxAmount = parseFloat(rules.maxAmount).toFixed(2);
      }
    }
    return rules;
  };

  RegularOpStatementView.prototype.serializeUniquery = function(rules) {
    var maxAmount, minAmount, separator, uniquery;
    uniquery = "";
    separator = "(#|#)";
    if ((rules != null) && (rules.accountNumber != null)) {
      uniquery = rules.accountNumber;
      if (rules.pattern != null) {
        uniquery += separator + rules.pattern;
        minAmount = rules.minAmount || "NEGATIVE_INFINITY";
        maxAmount = rules.maxAmount || "POSITIVE_INFINITY";
        uniquery += separator + minAmount;
        uniquery += separator + maxAmount;
      }
    }
    return uniquery;
  };

  RegularOpStatementView.prototype.addToRegularOperation = function() {
    var data, rules,
      _this = this;
    rules = this.getCurrentRules() || null;
    if (rules != null) {
      data = {
        accounts: [rules.accountNumber],
        searchText: rules.pattern.toString(),
        exactSearchText: "",
        amountFrom: rules.minAmount,
        amountTo: rules.maxAmount
      };
      return $.ajax({
        type: "POST",
        url: "bankoperations/query",
        data: data,
        success: function(objects) {
          var fixedCostToRegister, object, _i, _len;
          if ((objects != null) && objects.length > 0) {
            fixedCostToRegister = {
              type: "standard",
              accountNumber: rules.accountNumber,
              idTable: [],
              uniquery: _this.serializeUniquery(rules),
              isBudgetPart: true
            };
            for (_i = 0, _len = objects.length; _i < _len; _i++) {
              object = objects[_i];
              fixedCostToRegister.idTable.push(object.id);
            }
            return _this.saveFixedCost(fixedCostToRegister, function() {
              $('#search-regular-operations').keyup();
              window.views.forecastBudgetView.newRegularOperationsChecked = false;
              return window.views.forecastBudgetView.displayRegularOperations(rules.accountNumber);
            });
          }
        },
        error: function(err) {
          return console.log("there was an error");
        }
      });
    }
  };

  RegularOpStatementView.prototype.saveFixedCost = function(fixedCost, callback) {
    var _this = this;
    return $.ajax({
      type: "POST",
      url: "rbifixedcost",
      data: fixedCost,
      success: function(objects) {
        var id, _i, _len, _ref;
        _ref = fixedCost.idTable;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          id = _ref[_i];
          if (window.rbiActiveData.currentOperations[id] != null) {
            window.rbiActiveData.currentOperations[id].isRegularOperation = true;
            window.rbiActiveData.currentOperations[id].fixedCostId = fixedCost.id;
          }
        }
        if (callback != null) {
          return callback();
        }
      },
      error: function(err) {
        return console.log("there was an error");
      }
    });
  };

  RegularOpStatementView.prototype.checkButtonAddState = function() {
    var buttonAdd, searchInput;
    searchInput = $("input#search-regular-operations") || null;
    buttonAdd = $(".add-regular-operation") || null;
    if ((buttonAdd != null) && (searchInput != null) && (buttonAdd.length === 1) && (searchInput.length === 1)) {
      if (searchInput.val() !== "") {
        return buttonAdd.attr("disabled", false);
      } else {
        return buttonAdd.attr("disabled", true);
      }
    }
  };

  RegularOpStatementView.prototype.reload = function(params, callback) {
    var displayFixedCosts, displayVariableCosts, view;
    this.checkButtonAddState();
    view = this;
    this.model = window.rbiActiveData.bankAccount;
    if ((params != null) && (params.dateFrom != null)) {
      this.params = params;
    }
    if (this.model != null) {
      this.updateFilters();
      if (this.$("#table-regular-operations").length === 0) {
        this.$el.html(this.templateHeader({
          model: this.model
        }));
      }
    }
    displayFixedCosts = this.data != null ? this.data.fixedCosts || false : false;
    displayVariableCosts = this.data != null ? this.data.variableCosts || false : false;
    if (this.send) {
      return $.ajax({
        type: "POST",
        url: "bankoperations/byDate",
        data: this.data,
        success: function(operations) {
          var _this = this;
          if (operations != null) {
            return $.ajax({
              type: "GET",
              url: "rbifixedcost",
              success: function(fixedCosts) {
                var finalOperations, fixedCost, index, isSearchFieldEmpty, operation, operationRemoved, _i, _j, _len, _len1;
                window.rbiActiveData.currentOperations = {};
                finalOperations = [];
                for (index = _i = 0, _len = operations.length; _i < _len; index = ++_i) {
                  operation = operations[index];
                  operation.isRegularOperation = false;
                  for (_j = 0, _len1 = fixedCosts.length; _j < _len1; _j++) {
                    fixedCost = fixedCosts[_j];
                    if ($.inArray(operation.id, fixedCost.idTable) >= 0) {
                      operation.isRegularOperation = true;
                      operation.fixedCostId = fixedCost.id;
                      break;
                    }
                  }
                  operationRemoved = false;
                  if (!operationRemoved) {
                    finalOperations.push(operation);
                    window.rbiActiveData.currentOperations[operation.id] = operation;
                  }
                }
                if (callback != null) {
                  callback(window.rbiActiveData.currentOperations);
                }
                window.collections.operations.reset(finalOperations);
                window.collections.operations.setComparator("date");
                window.collections.operations.sort();
                view.addAll();
                isSearchFieldEmpty = $("#search-regular-operations").val() === "";
                if (view.alreadyRegular && (!isSearchFieldEmpty)) {
                  $("#regular-op-light-info").hide();
                  return $("#regular-op-exists").show();
                } else {
                  $("#regular-op-exists").hide();
                  return $("#regular-op-light-info").show();
                }
              },
              error: function(err) {
                return console.log("getting fixed cost failed.");
              }
            });
          } else {
            return window.collections.operations.reset();
          }
        },
        error: function(err) {
          console.log("there was an error");
          if (callback != null) {
            return callback(null);
          }
        }
      });
    }
  };

  RegularOpStatementView.prototype.updateFilters = function() {
    var accountNumber, amountFromVal, amountToVal, dateFrom, dateFromVal, dateTo, dateToVal, jqAmountMax, jqAmountMin, now, searchTextVal;
    jqAmountMin = $("#search-min-amount").length === 1 ? ($("#search-min-amount").val()).replace(",", ".") : null;
    jqAmountMax = $("#search-max-amount").length === 1 ? ($("#search-max-amount").val()).replace(",", ".") : null;
    amountFromVal = (parseFloat(jqAmountMin).toFixed(2)) || Number.NEGATIVE_INFINITY;
    amountToVal = (parseFloat(jqAmountMax).toFixed(2)) || Number.POSITIVE_INFINITY;
    now = new Date();
    dateFrom = moment(moment(now).subtract('y', 1)).format('YYYY-MM-DD');
    dateTo = moment(now).format('YYYY-MM-DD');
    if (!(dateFrom || dateTo)) {
      this.send = false;
      window.collections.operations.reset();
      return;
    } else {
      this.send = true;
    }
    if (window.rbiActiveData.bankAccount != null) {
      accountNumber = window.rbiActiveData.bankAccount.get('accountNumber');
    } else {
      this.send = false;
    }
    dateFromVal = new Date(dateFrom || null);
    dateToVal = new Date(dateTo || new Date());
    this.data = {
      dateFrom: dateFromVal,
      dateTo: dateToVal,
      accounts: [accountNumber],
      amountFrom: amountFromVal,
      amountTo: amountToVal
    };
    searchTextVal = $("input#search-regular-operations").val();
    if ((searchTextVal != null) && (searchTextVal !== "")) {
      if (searchTextVal === "#credits") {
        return this.data.credits = true;
      } else if (searchTextVal === "#debits") {
        return this.data.debits = true;
      } else if (searchTextVal === "#frais-fixes") {
        return this.data.fixedCosts = true;
      } else if (searchTextVal === "#depenses") {
        return this.data.variableCosts = true;
      } else {
        return this.data.searchText = searchTextVal;
      }
    }
  };

  RegularOpStatementView.prototype.addAll = function() {
    var index, operation, subView, subViewDate, view, _i, _j, _len, _len1, _ref, _ref1, _results;
    this.alreadyRegular = false;
    this.$("#table-regular-operations").html("");
    this.$(".loading").remove();
    _ref = this.subViews;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      view = _ref[_i];
      view.destroy();
      this.subViews = [];
    }
    if (window.collections.operations.models.length === 0) {
      $("#table-regular-operations").append($('<tr><td>Aucune opération ne correspond à ces critères.</td></tr>'));
      return;
    }
    _ref1 = window.collections.operations.models;
    _results = [];
    for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
      operation = _ref1[index];
      subView = new RegularOpStatementEntryView(operation, this.model);
      subView.render();
      subViewDate = subView.model.get('date');
      if (subView.model.get('isRegularOperation')) {
        this.alreadyRegular = true;
      }
      if ((this.subViewLastDate !== subViewDate) || (index === 0)) {
        this.subViewLastDate = subViewDate;
        this.$("#table-regular-operations").append($('<tr class="special"><td colspan="4">' + moment(this.subViewLastDate).format("DD/MM/YYYY" + '</td></tr>')));
        _results.push(this.$("#table-regular-operations").append(subView.el));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  RegularOpStatementView.prototype.destroy = function() {
    var view, _i, _len, _ref, _ref1, _results;
    if ((_ref = this.viewTitle) != null) {
      _ref.destroy();
    }
    _ref1 = this.subViews;
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      view = _ref1[_i];
      view.destroy();
      _results.push(RegularOpStatementView.__super__.destroy.call(this));
    }
    return _results;
  };

  return RegularOpStatementView;

})(BaseView);

});

;require.register("views/regular_op_statement_entry", function(exports, require, module) {
var BaseView, RegularOpStatementEntryView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

module.exports = RegularOpStatementEntryView = (function(_super) {
  __extends(RegularOpStatementEntryView, _super);

  RegularOpStatementEntryView.prototype.template = require('./templates/regular_op_statement_entry');

  RegularOpStatementEntryView.prototype.tagName = 'tr';

  RegularOpStatementEntryView.prototype.events = {
    'click': 'applySearch'
  };

  function RegularOpStatementEntryView(model, account, showAccountNum) {
    this.model = model;
    this.account = account;
    this.showAccountNum = showAccountNum != null ? showAccountNum : false;
    RegularOpStatementEntryView.__super__.constructor.call(this);
  }

  RegularOpStatementEntryView.prototype.render = function() {
    var hint;
    if (this.model.get("amount") > 0) {
      this.$el.addClass("success");
    }
    this.model.account = this.account;
    this.model.formattedDate = moment(this.model.get('date')).format("DD/MM/YYYY");
    this.model.costClass = "variable-cost";
    this.model.costIcon = "&#57482;";
    if (this.model.get('isRegularOperation')) {
      this.model.costClass = "fixed-cost";
      this.model.costIcon = "&#57481;";
    }
    if (this.showAccountNum) {
      hint = ("" + (this.model.account.get('title')) + ", ") + ("n°" + (this.model.account.get('accountNumber')));
      this.model.hint = ("" + (this.model.account.get('title')) + ", ") + ("n°" + (this.model.account.get('accountNumber')));
    } else {
      this.model.hint = "" + (this.model.get('raw'));
    }
    RegularOpStatementEntryView.__super__.render.call(this);
    return this;
  };

  RegularOpStatementEntryView.prototype.applySearch = function() {
    var currentAmount, maxAmount, minAmount, modifier, title;
    currentAmount = parseFloat(this.model.get("amount") || 0);
    modifier = Math.abs(parseFloat(currentAmount * 0.1));
    title = (this.model.get('title') || "").toString();
    minAmount = (currentAmount - modifier).toFixed(2);
    maxAmount = (currentAmount + modifier).toFixed(2);
    $("input#search-regular-operations").val(title);
    if (minAmount !== 0) {
      $("#search-min-amount").val(minAmount);
    }
    if (maxAmount !== 0) {
      $("#search-max-amount").val(maxAmount);
    }
    return $("input#search-regular-operations").keyup();
  };

  RegularOpStatementEntryView.prototype.destroyPopupFixedCost = function(event) {
    var jqCaller, jqFixedCostIcon, jqParent, jqPopup;
    jqCaller = $(event.currentTarget);
    jqPopup = jqCaller.parent();
    jqParent = jqPopup.parent();
    jqFixedCostIcon = jqPopup.children('.iconCostType');
    jqFixedCostIcon.appendTo(jqParent);
    jqPopup.remove();
    if (jqCaller.attr('id') === 'cancel-fixed-cost') {
      return jqFixedCostIcon.mouseleave();
    } else {
      if (jqFixedCostIcon.hasClass('variable-cost')) {
        return jqFixedCostIcon.removeClass('variable-cost').addClass('fixed-cost');
      } else {
        return jqFixedCostIcon.removeClass('fixed-cost').addClass('variable-cost');
      }
    }
  };

  RegularOpStatementEntryView.prototype.removeFixedCost = function(event) {
    var fixedCostId,
      _this = this;
    fixedCostId = this.model.get("fixedCostId" || null);
    if (fixedCostId != null) {
      return $.ajax({
        url: '/rbifixedcost/' + fixedCostId,
        type: 'DELETE',
        success: function(result) {
          var id, operation, _ref;
          _this.destroyPopupFixedCost(event);
          $('#search-text').keyup();
          if (window.rbiActiveData.currentOperations != null) {
            _ref = window.rbiActiveData.currentOperations;
            for (id in _ref) {
              operation = _ref[id];
              if ((operation.fixedCostId != null) && (operation.fixedCostId = fixedCostId)) {
                operation.isRegularOperation = false;
                operation.fixedCostId = null;
              }
            }
            return window.views.monthlyAnalysisView.displayMonthlySums(window.rbiActiveData.currentOperations);
          }
        },
        error: function() {
          return console.log("Delete fixed cost failed.");
        }
      });
    }
  };

  RegularOpStatementEntryView.prototype.prepareFixedCost = function(event) {
    var accountNumber, currentUniquery, fixedCostToRegister, jqPopup, neededRequest, userChoice,
      _this = this;
    jqPopup = $(event.currentTarget).parent();
    userChoice = jqPopup.children('input[type=radio]:checked').val();
    accountNumber = window.rbiActiveData.bankAccount.get('accountNumber');
    neededRequest = false;
    fixedCostToRegister = {
      type: userChoice,
      accountNumber: accountNumber,
      idTable: []
    };
    switch (userChoice) {
      case 'standard':
        this.data = {
          accounts: [accountNumber],
          searchText: "",
          exactSearchText: this.operationTitle,
          dateFrom: null,
          dateTo: new Date()
        };
        if (this.operationMax < this.operationMin) {
          this.data.amountFrom = this.operationMax;
          this.data.amountTo = this.operationMin;
        } else {
          this.data.amountFrom = this.operationMin;
          this.data.amountTo = this.operationMax;
        }
        currentUniquery = accountNumber + '(#|#)' + this.operationTitle;
        currentUniquery += '(#|#)' + this.data.amountFrom + '(#|#)' + this.data.amountTo;
        fixedCostToRegister.uniquery = currentUniquery;
        neededRequest = true;
        break;
      case 'onetime':
        fixedCostToRegister.uniquery = "";
        fixedCostToRegister.idTable.push(this.model.get('id'));
        break;
      case 'custom':
        console.log('custom not ready ');
    }
    if (neededRequest) {
      return $.ajax({
        type: "POST",
        url: "bankoperations/query",
        data: this.data,
        success: function(objects) {
          var object, _i, _len;
          if ((objects != null) && objects.length > 0) {
            for (_i = 0, _len = objects.length; _i < _len; _i++) {
              object = objects[_i];
              fixedCostToRegister.idTable.push(object.id);
            }
            return _this.saveFixedCost(fixedCostToRegister, function() {
              _this.destroyPopupFixedCost(event);
              return $('#search-text').keyup();
            });
          }
        },
        error: function(err) {
          return console.log("there was an error");
        }
      });
    } else {
      return this.saveFixedCost(fixedCostToRegister, function() {
        _this.destroyPopupFixedCost(event);
        return $('#search-text').keyup();
      });
    }
  };

  RegularOpStatementEntryView.prototype.switchFixedCostIcon = function(event) {
    var jqFixedCostIcon;
    jqFixedCostIcon = $(event.currentTarget);
    if ((jqFixedCostIcon.attr('data-icon')) === '') {
      return jqFixedCostIcon.attr('data-icon', '');
    } else {
      return jqFixedCostIcon.attr('data-icon', '');
    }
  };

  RegularOpStatementEntryView.prototype.popupFixedCost = function(event) {
    var idValidationBtn, jqFixedCostIcon, jqIconParent, jqPopup, newFixedCost, popupTitle;
    jqFixedCostIcon = $(event.currentTarget);
    jqIconParent = jqFixedCostIcon.parent();
    newFixedCost = jqFixedCostIcon.hasClass('variable-cost');
    popupTitle = "Ajouter aux frais fixes";
    idValidationBtn = "save-fixed-cost";
    if (newFixedCost) {
      jqFixedCostIcon.attr('data-icon', '');
    } else {
      jqFixedCostIcon.attr('data-icon', '');
      popupTitle = "Retirer des frais fixes";
      idValidationBtn = "remove-fixed-cost";
    }
    jqPopup = $('<div class="popup-fixed-cost"></div>');
    jqFixedCostIcon.appendTo(jqPopup);
    jqPopup.append('<span class="fixed-cost-title">' + popupTitle + '</span>');
    jqPopup.append('<button type="button" id="' + idValidationBtn + '" class="btn btn-xs btn-primary">Valider</button>');
    jqPopup.append('<button type="button" id="cancel-fixed-cost" class="btn btn-xs btn-danger" >Annuler</button>');
    this.operationTitle = this.model.get('title');
    if (newFixedCost) {
      this.operationMax = parseFloat((this.model.get('amount')) * 1.1);
      this.operationMin = parseFloat((this.model.get('amount')) * 0.9);
      jqPopup.append('<input type="radio" name="fixed-cost-option" value="standard" checked="true" /> <label>Toutes les opérations intitulées "' + this.operationTitle + '" d\'un montant entre  ' + this.operationMin.money() + ' et ' + this.operationMax.money() + '</label><br />');
      jqPopup.append('<input type="radio" name="fixed-cost-option" value="onetime" /> <label>Seulement cette opération</label><br />');
    } else {
      jqPopup.append('<p>Cette action enlevera l\'opération des frais fixes, ainsi que <strong>les autres opérations précédemment associées</strong>.</p>');
    }
    return jqPopup.appendTo(jqIconParent);
  };

  RegularOpStatementEntryView.prototype.saveFixedCost = function(fixedCost, callback) {
    var _this = this;
    return $.ajax({
      type: "POST",
      url: "rbifixedcost",
      data: fixedCost,
      success: function(objects) {
        var id, _i, _len, _ref;
        _this.model.set("fixedCostId", objects.id);
        _this.model.set("isRegularOperation", true);
        _ref = fixedCost.idTable;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          id = _ref[_i];
          if (window.rbiActiveData.currentOperations[id] != null) {
            window.rbiActiveData.currentOperations[id].isRegularOperation = true;
            window.rbiActiveData.currentOperations[id].fixedCostId = fixedCost.id;
          }
        }
        window.views.monthlyAnalysisView.displayMonthlySums(window.rbiActiveData.currentOperations);
        return callback();
      },
      error: function(err) {
        return console.log("there was an error");
      }
    });
  };

  return RegularOpStatementEntryView;

})(BaseView);

});

;require.register("views/section--mesconsos", function(exports, require, module) {
var Section;

module.exports = Section = Backbone.View.extend({
  tagName: "div",
  template: require("../templates/section"),
  render: function() {
    this.$el.html(this.template({
      section: this.model.toJSON()
    }));
  }
});

});

;require.register("views/templates/alerts", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h1>Alertes</h1><div></div>');
}
return buf.join("");
};
});

;require.register("views/templates/app", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
}
return buf.join("");
};
});

;require.register("views/templates/bank_statement_empty", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<br/><br/><p class="loading"></p>');
}
return buf.join("");
};
});

;require.register("views/templates/bank_statement_entry", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<td class="operation-title">' + escape((interp = model.get('title')) == null ? '' : interp) + '</td><td class="operation-amount text-right">' + escape((interp = Number(model.get('amount')).money()) == null ? '' : interp) + '</td><td class="text-right"></td>');
}
return buf.join("");
};
});

;require.register("views/templates/bank_statement_header", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="context-box-header"><h2>Relevé du ' + escape((interp = model.get('title')) == null ? '' : interp) + ' ' + escape((interp = model.get("accountNumber")) == null ? '' : interp) + '</h2><div class="search-field"><span aria-hidden="true" data-icon&#57471;="data-icon&#57471;" class="icon-search fs1"></span><input id="search-text"/></div></div><div class="context-box-content"><div class="text-center loading loader-operations"><img src="./loader_big_blue.gif"/></div><table class="table table-bordered table-condensed table-striped table-hover table-bordered dataTable"><tbody id="table-operations"></tbody></table></div>');
}
return buf.join("");
};
});

;require.register("views/templates/compared_analysis", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h1>Analyse comparée</h1><div></div>');
}
return buf.join("");
};
});

;require.register("views/templates/configuration", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h1>Paramètres</h1><div class="interface-box-content"><div class="configuration-interface"><p>Veuillez sélectionner le compte courant lié à votre relevé malin.</p><table id="account-choice" class="col-md-12"></table><br/><br/><p>Si vos comptes n\'apparaissent pas ici, veuillez les ajouter dans l\'application "MesComptes".</p></div></div>');
}
return buf.join("");
};
});

;require.register("views/templates/configuration_bank_account", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<td>' + escape((interp = model.get('title')) == null ? '' : interp) + '</td><td class="w75px"><button');
buf.push(attrs({ 'type':("button"), 'account-number':("" + (model.get('accountNumber')) + ""), "class": ('btn') + ' ' + ('btn-xs') + ' ' + ('btn-default') + ' ' + ('btn-courant') }, {"type":true,"account-number":true}));
buf.push('>courant</button></td><td class="w50px"><button');
buf.push(attrs({ 'type':("button"), 'account-number':("" + (model.get('accountNumber')) + ""), "class": ('btn') + ' ' + ('btn-xs') + ' ' + ('btn-default') + ' ' + ('btn-epargne') }, {"type":true,"account-number":true}));
buf.push('>épargne</button></td><td class="w25px"><button type="button" class="btn btn-xs btn-danger btn-off">off</button></td>');
}
return buf.join("");
};
});

;require.register("views/templates/configuration_bank_empty", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
}
return buf.join("");
};
});

;require.register("views/templates/configuration_bank_title", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<td colspan="3">' + escape((interp = model.get('name')) == null ? '' : interp) + '</td>');
}
return buf.join("");
};
});

;require.register("views/templates/enhanced_report", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h1>Relevé augmenté</h1><div class="interface-box-content"></div>');
}
return buf.join("");
};
});

;require.register("views/templates/forecast_budget", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h1>Budget prévisionnel</h1><div class="interface-box-content"><div id="forecast-budget-content"><span class="light-info">Définissez votre budget mensuel en désignant vos opérations régulières (salaires, loyers, factures de téléphone, ...).</span><table class="col-md-12"><thead><tr><th title="Le libellé ou le morceau de texte choisi pour retrouver les opérations.">Motif</th><th title="La moyenne des montants de cette opération régulière payés les mois précédents.">Montant moyen</th><th title="Gérer la présence ou non des opérations régulières dans votre budget de ce mois-ci.">Budget</th><th title="Lorsque qu\'une opération régulière est payée ce mois-ci, le budget prévisionnel est affiné.">Déjà payée</th><th>&nbsp;</th></tr></thead><tbody id="regular-operations"></tbody></table><span class="light-info">Survolez quelques instants un label en gras pour en savoir plus.</span></div></div>');
}
return buf.join("");
};
});

;require.register("views/templates/forecast_budget_entry", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<td>' + escape((interp = (model.get("rules")).queryPattern) == null ? '' : interp) + '</td><td>' + escape((interp = (model.get("rules")).textQueryMid) == null ? '' : interp) + '</td><td>');
 if (model.get("isBudgetPart")) {
{
buf.push('<input type="checkbox" checked="true" class="toogle-monthly-budget"/>');
}
 }
 else {
{
buf.push('<input type="checkbox" class="toogle-monthly-budget"/>');
}
 }
buf.push('</td><td><em>' + escape((interp = (model.get("rules")).textAlreadyPaid) == null ? '' : interp) + '</em></td><td><span aria-hidden="true" data-icon="&#57512;" class="fs1 remove-regular-operation red-text"></span></td>');
}
return buf.join("");
};
});

;require.register("views/templates/geolocated_report", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h1 class="geolocated-report-title"><span aria-hidden="true" data-icon="&#57613;" class="day-switcher previous-day pull-left fs1"></span><span id="current-day">Relevé géolocalisé</span><span aria-hidden="true" data-icon="&#57614;" class="day-switcher next-day pull-right fs1"></span></h1><div class="interface-box-content"><div class="geolocated-report-content"><div class="text-center geolocated-report-loader"><img src="./loader_big_blue.gif"/></div><div class="geolocated-report-error"></div><div id="msisdn-geolocation-map"></div></div></div>');
}
return buf.join("");
};
});

;require.register("views/templates/menu", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<ul><li class="menu-item active"><span class="current-arrow"></span><a href="#analyse-mensuelle"><div class="icon"><span aria-hidden="true" data-icon="&#57802;" class="fs1"></span></div>Analyse mensuelle</a></li><li class="menu-item"><a href="#budget-previsionnel"><div class="icon"><span aria-hidden="true" data-icon="&#57802;" class="fs1"></span></div>Budget prévisionnel</a></li><li class="menu-item"><a href="#releve-augmente"><div class="icon"><span aria-hidden="true" data-icon="&#57602;" class="fs1"></span></div>Relevé augmenté</a></li><li class="menu-item"><a href="#releve-geolocalise"><div class="icon"><span aria-hidden="true" data-icon="&#57538;" class="fs1"></span></div>Relevé géolocalisé</a></li><li class="menu-item"><a href="#parametres"><div class="icon"><span aria-hidden="true" data-icon="&#57486;" class="fs1"></span></div>Paramètres</a></li></ul>');
}
return buf.join("");
};
});

;require.register("views/templates/monthly_analysis", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h1><span aria-hidden="true" data-icon="&#57613;" class="month-switcher previous-month pull-left fs1"></span><span id="current-month">Analyse mensuelle</span><span aria-hidden="true" data-icon="&#57614;" class="month-switcher next-month pull-right fs1"></span></h1><div class="interface-box-content"><table id="monthly-report"><tr><td class="amount-month"><div>solde de début de mois<hr/><span id="amount-month-start" class="amount-number"></span></div></td><td class="amount-month"><div>solde de fin de mois<hr/><span id="amount-month-end" class="amount-number"></span><br/><span id="amount-month-differential" class="blue-text amount-number-diff"></span></div></td></tr><tr><td colspan="2" class="search-panel-td1"><div class="col-md-1"></div><div class="search-panel col-md-10"><div class="search-btn-container col-lg-5 col-md-6 col-sm-6"><div id="credits-search-btn" class="search-btn grey1"><span aria-hidden="true" data-icon="&#57602;" class="pull-left fs1 big-size-icon"></span><span id="credits-sum" class="pull-right big-size-text">0 &euro;</span><br/><span class="pull-right little-size-text">Crédits</span></div></div><div class="col-lg-2 search-separator"></div><div class="search-btn-container col-lg-5 col-md-6 col-sm-6"><div id="debits-search-btn" class="search-btn grey2"><span aria-hidden="true" data-icon="&#57601;" class="pull-left fs1 big-size-icon"></span><span id="debits-sum" class="pull-right big-size-text">0 &euro;</span><br/><span class="pull-right little-size-text">Débits</span></div></div></div><div class="col-md-1"></div></td></tr><tr><td colspan="2" class="search-panel-td2"><div class="col-md-1"></div><div class="search-panel col-md-10"><div class="search-btn-container col-lg-5 col-md-6 col-sm-6"><div id="fixed-cost-search-btn" class="search-btn grey3"><span aria-hidden="true" data-icon="&#57481;" class="pull-left fs1 big-size-icon"></span><span id="fixed-cost-sum" class="pull-right big-size-text">0 &euro;</span><br/><span class="pull-right little-size-text">Frais fixes</span></div></div><div class="col-lg-2 search-separator"></div><div class="search-btn-container col-lg-5 col-md-6 col-sm-6"><div id="variable-cost-search-btn" class="search-btn grey4"><span aria-hidden="true" data-icon="&#57393;" class="pull-left fs1 big-size-icon"></span><span id="variable-cost-sum" class="pull-right big-size-text">0 &euro;</span><br/><span class="pull-right little-size-text">Dépenses</span></div></div></div><div class="col-md-1"></div></td></tr><tr><td colspan="2" class="google-pie-chart"><div id="pie_chart" style="min-height:180px;margin:auto;">&nbsp;</div><br/><br/></td></tr></table></div>');
}
return buf.join("");
};
});

;require.register("views/templates/online_shopping", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h1>Achats en ligne</h1><div></div>');
}
return buf.join("");
};
});

;require.register("views/templates/receipt", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="row item_a receipt"><div class="col-md-6"><div class="row"><div title="Détails sur votre magasin." class="col-xs-2 box map"><a');
buf.push(attrs({ 'href':("http://fc1.1bis.com/intermarche/map.asp?id=IMARC" + (receipt.intermarcheShopId) + ""), 'target':("_blank") }, {"href":true,"target":true}));
buf.push('><img src="img/pin.png"/></a></div><div title="Date ou vous avez fait des achats." class="col-xs-5 box">');
 var dt = new Date(receipt.timestamp)
var __val__ = dt.toString('d/MM')
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</div><div title="Heure de votre passage en caisse." class="col-xs-5 box">');
var __val__ = dt.toString('H:mm')
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('</div></div></div><div class="col-md-6"><div class="row"><div title="Nombre d\'articles." class="col-xs-5 box">');
var __val__ = receipt.articlesCount
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('&nbsp; articles</div><div title="Total du ticket de caisse." class="col-xs-5 box price">');
var __val__ = receipt.total.toFixed(2)
buf.push(escape(null == __val__ ? "" : __val__));
buf.push('€</div><div title="Cliquez pour plus de détails" class="col-xs-2 box toggle"><img src="img/plus.png" class="toggle-btn"/></div></div></div></div><div class="sections"></div>');
}
return buf.join("");
};
});

;require.register("views/templates/regular_op_statement_empty", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<br/><br/><p class="loading"></p>');
}
return buf.join("");
};
});

;require.register("views/templates/regular_op_statement_entry", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<td class="operation-title">' + escape((interp = model.get('title')) == null ? '' : interp) + '</td><td class="operation-amount text-right">' + escape((interp = Number(model.get('amount')).money()) == null ? '' : interp) + '</td><td class="text-right"><div class="popup-container"><span');
buf.push(attrs({ 'aria-hidden':("true"), 'data-icon':("" + (model.costIcon) + ""), "class": ('fs1') + ' ' + ('iconCostType') + ' ' + ("" + (model.costClass) + "") }, {"class":true,"aria-hidden":true,"data-icon":true}));
buf.push('></span></div></td>');
}
return buf.join("");
};
});

;require.register("views/templates/regular_op_statement_header", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="context-box-header-bigger"><h2>Relevé du ' + escape((interp = model.get('title')) == null ? '' : interp) + ' ' + escape((interp = model.get("accountNumber")) == null ? '' : interp) + '</h2><div id="search-field-regular-operations"><div class="input-group input-group-sm input-simple pull-left"><span aria-hidden="true" data-icon&#57471;="data-icon&#57471;" class="input-group-addon icon-search fs1"></span><input id="search-regular-operations" type="text" class="form-control"/></div><div class="input-group input-group-sm input-small pull-left"><span class="input-group-addon">Min.</span><input id="search-min-amount" type="text" class="form-control"/></div><div class="input-group input-group-sm input-small pull-left"><span class="input-group-addon">Max.</span><input id="search-max-amount" type="text" class="form-control"/></div><div class="input-group input-group-sm"><div class="input-group-btn"><button id="empty-search-regular-operations" data-original-title="" type="button" class="btn btn-default">Vider</button></div></div></div><div class="add-regular-operation-container"><button type="button" disabled="true" class="btn btn-sm btn-primary add-regular-operation"><span aria-hidden="true" data-icon="" class="fs1 iconCostType fixed-cost"></span>Ajouter aux opérations régulières</button><br/><p id="regular-op-light-info" class="light-info-2">Sélectionnez une opération, puis éditez le filtre (libellé, min., max.) pour retrouver toutes les occurences de cette opération régulière.</p><p id="regular-op-exists" class="text-navy">Attention : certaines opérations qui correspondent à cette règle sont déjà régulières.</p></div></div><div class="context-box-content-smaller"><div id="loader-regular-operations" class="text-center loading"><img src="./loader_big_blue.gif"/></div><table class="table table-bordered table-condensed table-striped table-hover table-bordered dataTable"><tbody id="table-regular-operations"></tbody></table></div>');
}
return buf.join("");
};
});

;require.register("views/templates/section", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
}
return buf.join("");
};
});

;
//# sourceMappingURL=app.js.map