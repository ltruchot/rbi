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
var AppView, BankAmountsCollection, BankOperationsCollection, BanksCollection;

AppView = require('views/app');

BanksCollection = require('collections/banks');

BankOperationsCollection = require('collections/bank_operations');

BankAmountsCollection = require('collections/bank_amounts');

module.exports = {
  initialize: function() {
    var Router;
    window.app = this;
    window.collections = {};
    window.views = {};
    window.rbiActiveData = {};
    window.rbiActiveData.olderOperationDate = moment(new Date());
    window.rbiActiveData.budgetByAccount = {};
    window.rbiActiveData.accountNumber = null;
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
      }
    };
    window.collections.banks = new BanksCollection();
    window.collections.operations = new BankOperationsCollection();
    window.collections.amounts = new BankAmountsCollection();
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
    this.set("amount", this.accounts.getSum());
    return console.log("updated balance bank " + this.get("name") + " is now " + this.get("amount"));
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
    budgetByAcount: {}
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
    'analyse-mensuelle-comparee': 'compared_analysis',
    'achats-en-ligne': 'online_shopping',
    'alertes': 'alerts'
  };

  Router.prototype.monthly_analysis = function() {
    var _ref1;
    return (_ref1 = window.views.monthlyAnalysisView) != null ? _ref1.render() : void 0;
  };

  Router.prototype.compared_analysis = function() {
    var _ref1;
    return (_ref1 = window.views.comparedAnalysisView) != null ? _ref1.render() : void 0;
  };

  Router.prototype.online_shopping = function() {
    var _ref1;
    return (_ref1 = window.views.onlineShoppingView) != null ? _ref1.render() : void 0;
  };

  Router.prototype.alerts = function() {
    var _ref1;
    return (_ref1 = window.views.alertsView) != null ? _ref1.render() : void 0;
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
var AlertsView, AppView, BaseView, ComparedAnalysisView, ConfigurationView, MenuView, MonthlyAnalysisView, OnlineShoppingView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

ConfigurationView = require('views/configuration');

MonthlyAnalysisView = require('views/monthly_analysis');

ComparedAnalysisView = require('views/compared_analysis');

OnlineShoppingView = require('views/online_shopping');

AlertsView = require('views/alerts');

MenuView = require('views/menu');

module.exports = AppView = (function(_super) {
  __extends(AppView, _super);

  function AppView() {
    _ref = AppView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  AppView.prototype.template = require('./templates/app');

  AppView.prototype.el = 'body.application';

  AppView.prototype.afterRender = function() {
    return window.collections.banks.fetch({
      data: {
        withAccountOnly: true
      },
      success: function() {
        if (!this.menuView) {
          this.menuView = new MenuView();
        }
        if (!window.views.configurationView) {
          window.views.configurationView = new ConfigurationView();
        }
        if (!window.views.monthlyAnalysisView) {
          window.views.monthlyAnalysisView = new MonthlyAnalysisView();
        }
        if (!window.views.comparedAnalysisView) {
          window.views.comparedAnalysisView = new ComparedAnalysisView();
        }
        if (!window.views.onlineShoppingView) {
          window.views.onlineShoppingView = new OnlineShoppingView();
        }
        if (!window.views.alertsView) {
          window.views.alertsView = new AlertsView();
        }
        this.menuView.render();
        window.views.configurationView.render();
        return Backbone.history.start();
      },
      error: function() {
        return console.log("Fatal error: could not get the banks list");
      }
    });
  };

  return AppView;

})(BaseView);

});

;require.register("views/bank_statement", function(exports, require, module) {
var BalanceOperationView, BankOperationsCollection, BankStatementView, BaseView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

BankOperationsCollection = require("../collections/bank_operations");

BalanceOperationView = require("./bank_statement_entry");

module.exports = BankStatementView = (function(_super) {
  var params, subViewLastDate;

  __extends(BankStatementView, _super);

  BankStatementView.prototype.templateHeader = require('./templates/bank_statement_header');

  BankStatementView.prototype.events = {
    'click a.recheck-button': "checkAccount",
    'click th.sort-date': "sortByDate",
    'click th.sort-title': "sortByTitle",
    'click th.sort-amount': "sortByAmount",
    'keyup input#search-text': "reload"
  };

  BankStatementView.prototype.inUse = false;

  BankStatementView.prototype.subViews = [];

  subViewLastDate = '';

  params = null;

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
          console.log("sent successfully!");
          if (operations) {
            return $.ajax({
              type: "GET",
              url: "rbifixedcost",
              success: function(fixedCosts) {
                var finalOperations, fixedCost, index, operation, operationRemoved, _i, _j, _len, _len1;
                console.log("getting fixed cost success.");
                window.rbiCurrentOperations = {};
                finalOperations = [];
                for (index = _i = 0, _len = operations.length; _i < _len; index = ++_i) {
                  operation = operations[index];
                  operation.isFixedCost = false;
                  if (operation.amount < 0) {
                    for (_j = 0, _len1 = fixedCosts.length; _j < _len1; _j++) {
                      fixedCost = fixedCosts[_j];
                      if ($.inArray(operation.id, fixedCost.idTable) >= 0) {
                        operation.isFixedCost = true;
                        operation.fixedCostId = fixedCost.id;
                        break;
                      }
                    }
                  }
                  operationRemoved = false;
                  if (displayFixedCosts && (!operation.isFixedCost)) {
                    operationRemoved = true;
                  } else if (displayVariableCosts && (operation.isFixedCost || (operation.amount > 0))) {
                    operationRemoved = true;
                  }
                  if (!operationRemoved) {
                    finalOperations.push(operation);
                    window.rbiCurrentOperations[operation.id] = operation;
                  }
                }
                if (callback != null) {
                  callback(window.rbiCurrentOperations);
                }
                window.collections.operations.reset(finalOperations);
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
      console.log("Empty query");
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
      subView = new BalanceOperationView(operation, this.model);
      subViewDate = subView.render().model.get('date');
      if ((this.subViewLastDate !== subViewDate) || (index === 0)) {
        this.subViewLastDate = subViewDate;
        this.$("#table-operations").append($('<tr class="special"><td colspan="4">' + moment(this.subViewLastDate).format("DD/MM/YYYY" + '</td></tr>')));
      }
      _results.push(this.$("#table-operations").append(subView.render().el));
    }
    return _results;
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
    'mouseenter .popup-container > .variable-cost': 'switchFixedCostIcon',
    'mouseleave .popup-container > .variable-cost': 'switchFixedCostIcon',
    'mouseenter .popup-container > .fixed-cost': 'switchFixedCostIcon',
    'mouseleave .popup-container > .fixed-cost': 'switchFixedCostIcon',
    'click .popup-container > .variable-cost': 'popupFixedCost',
    'click .popup-container > .fixed-cost': 'popupFixedCost',
    'click #cancel-fixed-cost': 'destroyPopupFixedCost',
    'click #save-fixed-cost': 'prepareFixedCost',
    'click #remove-fixed-cost': 'removeFixedCost'
  };

  function EntryView(model, account, showAccountNum) {
    this.model = model;
    this.account = account;
    this.showAccountNum = showAccountNum != null ? showAccountNum : false;
    EntryView.__super__.constructor.call(this);
  }

  EntryView.prototype.render = function() {
    var hint;
    if (this.model.get("amount") > 0) {
      this.$el.addClass("success");
    }
    this.model.account = this.account;
    this.model.formattedDate = moment(this.model.get('date')).format("DD/MM/YYYY");
    if ((this.model.get('amount')) > 0) {
      this.model.costClass = 'not-displayed-cost';
    } else {
      this.model.costClass = "variable-cost";
      this.model.costIcon = "&#57482;";
      if (this.model.get('isFixedCost')) {
        this.model.costClass = "fixed-cost";
        this.model.costIcon = "&#57481;";
      }
    }
    if (this.showAccountNum) {
      hint = ("" + (this.model.account.get('title')) + ", ") + ("n°" + (this.model.account.get('accountNumber')));
      this.model.hint = ("" + (this.model.account.get('title')) + ", ") + ("n°" + (this.model.account.get('accountNumber')));
    } else {
      this.model.hint = "" + (this.model.get('raw'));
    }
    EntryView.__super__.render.call(this);
    return this;
  };

  EntryView.prototype.destroyPopupFixedCost = function(event) {
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

  EntryView.prototype.removeFixedCost = function(event) {
    var fixedCostId,
      _this = this;
    fixedCostId = this.model.get("fixedCostId" || null);
    if (fixedCostId != null) {
      return $.ajax({
        url: '/rbifixedcost/' + fixedCostId,
        type: 'DELETE',
        success: function(result) {
          console.log("Delete fixed cost success.");
          _this.destroyPopupFixedCost(event);
          return $('#search-text').keyup();
        },
        error: function() {
          return console.log("Delete fixed cost failed.");
        }
      });
    }
  };

  EntryView.prototype.prepareFixedCost = function(event) {
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
          console.log("get operation linked request sent successfully!");
          if ((objects != null) && objects.length > 0) {
            for (_i = 0, _len = objects.length; _i < _len; _i++) {
              object = objects[_i];
              fixedCostToRegister.idTable.push(object.id);
            }
            return _this.saveFixedCost(fixedCostToRegister, function() {
              _this.destroyPopupFixedCost(event);
              return $('#search-text').keyup();
            });
          } else {
            return console.log("Operation(s) not found");
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

  EntryView.prototype.switchFixedCostIcon = function(event) {
    var jqFixedCostIcon;
    jqFixedCostIcon = $(event.currentTarget);
    if ((jqFixedCostIcon.attr('data-icon')) === '') {
      return jqFixedCostIcon.attr('data-icon', '');
    } else {
      return jqFixedCostIcon.attr('data-icon', '');
    }
  };

  EntryView.prototype.popupFixedCost = function(event) {
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
      jqPopup.append('<input type="radio" name="fixed-cost-option" valur="custom" disabled="true" /> <label>Définir une règle</label>');
    } else {
      jqPopup.append('<p>Cette action enlevera l\'opération des frais fixes, ainsi que <strong>les autres opérations précédemment associées</strong>.</p>');
    }
    return jqPopup.appendTo(jqIconParent);
  };

  EntryView.prototype.saveFixedCost = function(fixedCost, callback) {
    var _this = this;
    return $.ajax({
      type: "POST",
      url: "rbifixedcost",
      data: fixedCost,
      success: function(objects) {
        var id, _i, _len, _ref;
        console.log("fixed cost sent successfully!");
        _this.model.set("fixedCostId", objects.id);
        _this.model.set("isFixedCost", true);
        _ref = fixedCost.idTable;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          id = _ref[_i];
          if (window.rbiCurrentOperations[id] != null) {
            window.rbiCurrentOperations[id].isFixedCost = true;
            window.rbiCurrentOperations[id].fixedCostId = fixedCost.id;
          }
        }
        window.views.monthlyAnalysisView.displayMonthlySums(window.rbiCurrentOperations);
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
var BaseView, Config, ConfigurationBankView, ConfigurationView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

Config = require('models/user_configuration');

ConfigurationBankView = require('./configuration_bank');

module.exports = ConfigurationView = (function(_super) {
  __extends(ConfigurationView, _super);

  function ConfigurationView() {
    _ref = ConfigurationView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  ConfigurationView.prototype.template = require('./templates/configuration');

  ConfigurationView.prototype.el = '#configuration';

  ConfigurationView.prototype.elAccounts = 'select#account-choice';

  ConfigurationView.prototype.accounts = 0;

  ConfigurationView.prototype.subViews = [];

  ConfigurationView.prototype.events = {
    'change select#account-choice': 'reloadBudget',
    'keyup #configuration-budget-amount': 'setBudget'
  };

  ConfigurationView.prototype.reloadBudget = function() {
    var accountNumber, budgetByAccount, currentBudget;
    accountNumber = window.rbiActiveData.accountNumber;
    budgetByAccount = window.rbiActiveData.budgetByAccount || [];
    currentBudget = budgetByAccount[accountNumber] || 0;
    if (currentBudget > 0) {
      $('#account-budget-amount').val(budgetByAccount[accountNumber]);
      $('#configuration-budget-amount').val(budgetByAccount[accountNumber]);
    } else {
      $('#account-budget-amount').val(0);
      $('#configuration-budget-amount').val(0);
    }
    return this.getLastMonthDebitAmount(currentBudget, function(percentage) {
      if (this.currentChart != null) {
        return $('#current-budget-chart').data('easyPieChart').update(percentage);
      } else {
        return this.currentChart = $('#current-budget-chart').easyPieChart({
          animate: 1500,
          barColor: window.rbiColors.blue,
          trackColor: window.rbiColors.border_color,
          scaleColor: window.rbiColors.blue,
          lineWidth: 2
        });
      }
    });
  };

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

  ConfigurationView.prototype.setBudget = function(event, view) {
    var accountNumber, budgetValue, jqBudgetInput,
      _this = this;
    budgetValue = 0;
    jqBudgetInput = $(event.currentTarget);
    budgetValue = jqBudgetInput.val();
    if (!/^(\d+(?:[\.\,]\d{2})?)$/.test(budgetValue)) {
      return $('.info-user').css('color', window.rbiColors.red).html('La valeur du budget semble incomplète ou érronée&nbsp;');
    } else {
      $('.info-user').css('color', 'inherit').html('Les modifications sont prises en compte instantanément&nbsp;');
      budgetValue = parseFloat(budgetValue.replace(" ", "").replace(",", "."));
      if (isNaN(budgetValue)) {
        budgetValue = 0;
      }
      if (budgetValue > 0) {
        accountNumber = window.rbiActiveData.accountNumber;
        window.rbiActiveData.budgetByAccount[accountNumber] = budgetValue;
        return window.rbiActiveData.config.save({
          budgetByAccount: window.rbiActiveData.budgetByAccount
        }, {
          success: function() {
            $('#account-budget-amount').val(budgetValue);
            if (view) {
              return view.reloadBudget();
            } else {
              return _this.reloadBudget();
            }
          },
          error: function() {
            return console.log('Error: budget configuration not saved');
          }
        });
      }
    }
  };

  ConfigurationView.prototype.afterRender = function() {
    var view;
    $(this.elAccounts).change(function() {
      return this.options[this.selectedIndex].click();
    });
    view = this;
    return $('#account-budget-amount').keyup(function(event) {
      return view.setBudget(event, view);
    });
  };

  ConfigurationView.prototype.initialize = function() {
    return window.rbiActiveData.config = new Config({});
  };

  ConfigurationView.prototype.render = function() {
    var _this = this;
    ConfigurationView.__super__.render.call(this);
    window.rbiActiveData.config.fetch({
      success: function(currentConfig) {
        var accountNumber, budgetByAccount, treatment, view;
        accountNumber = currentConfig.get('accountNumber') || "";
        if (accountNumber !== "") {
          window.rbiActiveData.accountNumber = accountNumber;
          budgetByAccount = currentConfig.get('budgetByAccount') || {};
          window.rbiActiveData.budgetByAccount = budgetByAccount;
          _this.reloadBudget();
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
            console.log(err);
            alert(window.i18n("error_loading_accounts"));
          }
          this.accounts = results.length;
          if (this.accounts === 0) {
            $(view.elAccounts).prepend(require("./templates/balance_banks_empty"));
          }
          if (accountNumber === "") {
            if ($("#account-choice option").not(':disabled')[0] != null) {
              return $("#account-choice option").not(':disabled')[0].click();
            }
          }
        });
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

  ConfigurationBankView.prototype.tagName = "option";

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
    var viewAccount;
    console.log('add one bank view');
    viewAccount = new BankSubTitleView(account);
    this.subViews.push(viewAccount);
    account.view = viewAccount;
    return this.$el.after(viewAccount.render().el);
  };

  ConfigurationBankView.prototype.render = function() {
    var account, _i, _len, _ref;
    console.log('render bank view');
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

  BankSubTitleView.prototype.tagName = 'option';

  BankSubTitleView.prototype.template = require('./templates/configuration_bank_account');

  function BankSubTitleView(model) {
    this.model = model;
    BankSubTitleView.__super__.constructor.call(this);
  }

  BankSubTitleView.prototype.events = {
    'click': 'chooseAccount'
  };

  BankSubTitleView.prototype.formattedAmounts = [];

  BankSubTitleView.prototype.initialize = function() {
    return this.listenTo(window.activeObjects, 'changeActiveAccount', this.checkActive);
  };

  BankSubTitleView.prototype.afterRender = function() {
    var accountNumber;
    accountNumber = window.rbiActiveData.accountNumber;
    if (accountNumber !== "" && accountNumber === this.model.get('accountNumber')) {
      return this.chooseAccount();
    }
  };

  BankSubTitleView.prototype.chooseAccount = function(event) {
    var today;
    this.$el.attr('selected', 'true');
    window.activeObjects.trigger("changeActiveAccount", this.model);
    window.rbiActiveData.config.save({
      accountNumber: this.model.get('accountNumber', {
        error: function() {
          return console.log('Error: configuration not saved');
        }
      })
    });
    window.rbiActiveData.accountNumber = this.model.get('accountNumber');
    window.rbiActiveData.bankAccount = this.model;
    today = this.formatDate(new Date());
    $("#current-amount-date").text(today);
    $("#account-amount-balance").html((this.model.get('amount')).money());
    console.log('loadLastYearAmounts launched');
    return this.loadLastYearAmounts(this.model, function() {
      return window.views.monthlyAnalysisView.render();
    });
  };

  BankSubTitleView.prototype.checkActive = function(account) {
    this.$(".row").removeClass("active");
    if (account === this.model) {
      return this.$(".row").addClass("active");
    }
  };

  BankSubTitleView.prototype.loadLastYearAmounts = function(account, callback) {
    var _this = this;
    console.log('loadLastYearAmounts running');
    window.collections.amounts.reset();
    window.collections.amounts.setAccount(account);
    return window.collections.amounts.fetch({
      success: function(amounts) {
        console.log('setupLastYearAmountsFlot launched');
        _this.setupLastYearAmountsFlot(amounts);
        if (callback != null) {
          callback();
        }
        return $(window).resize(function() {
          return _this.setupLastYearAmountsFlot(amounts);
        });
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
    var currentDate, dayRatio, daysPerMonth, flotReadyAmounts, i, lastAmount, maxAmount, minAmount, numberOfDays, plot, sixMonthAgo, threeMonthAgo,
      _this = this;
    console.log('setupLastYearAmountsFlot running');
    console.log(amounts);
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
      var amountDate, currentDate, i;
      if (window.rbiActiveData.olderOperationDate > moment(amount.get('date'))) {
        window.rbiActiveData.olderOperationDate = moment(amount.get('date'));
      }
      currentDate = new Date();
      currentDate.setHours(12, 0, 0, 0);
      amountDate = new Date(amount.get('date'));
      i = 0;
      while (amountDate.getTime() !== currentDate.getTime() && i < 365) {
        currentDate.setDate(currentDate.getDate() - 1);
        i++;
      }
      if (i < 364) {
        _this.formattedAmounts[currentDate.getTime()] = amount.get('amount');
      }
      if (currentDate.getTime() < threeMonthAgo) {
        return numberOfDays = daysPerMonth.six;
      } else if (currentDate.getTime() < sixMonthAgo) {
        return numberOfDays = daysPerMonth.twelve;
      }
    });
    currentDate = new Date();
    currentDate.setHours(12, 0, 0, 0);
    lastAmount = parseFloat(this.model.get('amount'));
    minAmount = parseFloat(this.model.get('amount'));
    maxAmount = parseFloat(this.model.get('amount'));
    i = 0;
    while (i < numberOfDays) {
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
      i++;
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

  MenuView.prototype.events = {
    'click .menu-item': 'activateMenuItem'
  };

  MenuView.prototype.subViews = [];

  MenuView.prototype.initialize = function() {};

  MenuView.prototype.render = function() {
    var view;
    MenuView.__super__.render.call(this);
    view = this;
    return this;
  };

  MenuView.prototype.activateMenuItem = function(event) {
    var jqMenuItem;
    jqMenuItem = $(event.currentTarget);
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

  MonthlyAnalysisView.prototype.initialize = function() {
    return this.bankStatementView = new BankStatementView($('#context-box'));
  };

  MonthlyAnalysisView.prototype.render = function() {
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
        if (operation.isFixedCost && operation.amount < 0) {
          fixedCost += operation.amount;
        } else if ((!operation.isFixedCost) && operation.amount < 0) {
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
    var amount, chart, chartColors, data, dataTable, finalObj, finalType, id, isKnownType, numberformatter, obj, operation, operationTypes, options, others, pattern, raw, type, _i, _len, _ref1;
    $('#pie_chart').empty();
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
    dataTable = [['Type', 'Montant']];
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
    if (dataTable.length > 2) {
      data = google.visualization.arrayToDataTable(dataTable);
      numberformatter = new google.visualization.NumberFormat({
        suffix: '€',
        decimalSymbol: ',',
        fractionDigits: ' '
      });
      numberformatter.format(data, 1);
      options = {
        width: 'auto',
        height: '160',
        backgroundColor: 'transparent',
        colors: chartColors,
        tooltip: {
          textStyle: {
            color: '#666666',
            fontSize: 11
          },
          showColorCode: true
        },
        legend: {
          position: 'right',
          textStyle: {
            color: 'black',
            fontSize: 12
          }
        },
        pieSliceText: 'value',
        pieSliceTextStyle: {
          fontSize: '13',
          bold: 'true'
        },
        chartArea: {
          left: 20,
          top: 20,
          height: "180",
          width: "300"
        }
      };
      chart = new google.visualization.PieChart(document.getElementById('pie_chart'));
      return chart.draw(data, options);
    }
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

;require.register("views/templates/balance_banks_empty", function(exports, require, module) {
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
buf.push('<td class="operation-title">' + escape((interp = model.get('title')) == null ? '' : interp) + '</td><td class="operation-amount text-right">' + escape((interp = Number(model.get('amount')).money()) == null ? '' : interp) + '</td><td class="text-right"><div class="popup-container"><span');
buf.push(attrs({ 'aria-hidden':("true"), 'data-icon':("" + (model.costIcon) + ""), "class": ('fs1') + ' ' + ('iconCostType') + ' ' + ("" + (model.costClass) + "") }, {"class":true,"aria-hidden":true,"data-icon":true}));
buf.push('></span></div></td>');
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
buf.push('<h2>Relevé de compte</h2><h3>' + escape((interp = model.get('title')) == null ? '' : interp) + ' n°' + escape((interp = model.get("accountNumber")) == null ? '' : interp) + '</h3><div class="search-field"><span aria-hidden="true" data-icon&#57471;="data-icon&#57471;" class="icon-search fs1"></span><input id="search-text"/></div><div class="text-center loading loader-operations"><img src="./loader_big_blue.gif"/></div><table class="table table-bordered table-condensed table-striped table-hover table-bordered dataTable"><tbody id="table-operations"></tbody></table>');
}
return buf.join("");
};
});

;require.register("views/templates/bank_statement_search", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
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
buf.push('<div id="modalConfiguration" tabindex="-1" role="dialog" aria-labelledby="showModalLabel" aria-hidden="true" style="display: none;" class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" data-dismiss="modal" aria-hidden="true" data-original-title="" class="close">×</button><h4 class="modal-title">Paramètres</h4></div><div class="modal-body"><label class="control-label">Mon choix de compte</label><select id="account-choice" size="1" class="form-control input-lg"></select><br/><label for="monthly-budget" class="control-label">Mon budget du mois</label><div class="input-group input-middle-size"><input id="configuration-budget-amount" type="text" name="monthly-budget" class="form-control"/><span class="input-group-addon">&euro;</span></div></div><div class="modal-footer"><em class="info-user little-text">Les modifications sont prises en compte instantanément&nbsp;</em><button type="button" data-dismiss="modal" data-original-title="" class="btn btn-default">J\'ai terminé</button></div></div></div></div>');
}
return buf.join("");
};
});

;require.register("views/templates/configuration_bank", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
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
buf.push('' + escape((interp = model.get('title')) == null ? '' : interp) + ' n°' + escape((interp = model.get("accountNumber")) == null ? '' : interp) + '');
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
buf.push('' + escape((interp = model.get('name')) == null ? '' : interp) + '');
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
buf.push('<ul><li class="menu-item active"><span class="current-arrow"></span><a href="#analyse-mensuelle"><div class="icon"><span aria-hidden="true" data-icon="&#57802;" class="fs1"></span></div>Analyse mensuelle</a></li><li class="menu-item"><a href="#analyse-mensuelle-comparee"><div class="icon"><span aria-hidden="true" data-icon="&#57802;" class="fs1"></span><span aria-hidden="true" data-icon="&#57802;" class="fs1"></span></div>Analyse mensuelle comparée</a></li><li class="menu-item"><a href="#achats-en-ligne"><div class="icon"><span aria-hidden="true" data-icon="&#57398;" class="fs1"></span></div>Achats en ligne</a></li><li class="menu-item"><a href="#alertes"><div class="icon"><span aria-hidden="true" data-icon="&#57803;" class="fs1"></span></div>Alertes</a></li></ul>');
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
buf.push('<h1><span aria-hidden="true" data-icon="&#57613;" class="month-switcher previous-month pull-left fs1"></span><span id="current-month">Analyse mensuelle</span><span aria-hidden="true" data-icon="&#57614;" class="month-switcher next-month pull-right fs1"></span></h1><table id="monthly-report"><tr><td class="amount-month"><div>solde de début de mois<hr/><span id="amount-month-start" class="amount-number"></span></div></td><td class="amount-month"><div>solde de fin de mois<hr/><span id="amount-month-end" class="amount-number"></span><br/><span id="amount-month-differential" class="blue-text amount-number-diff"></span></div></td></tr><tr><td colspan="2"><div class="col-md-1"></div><div class="search-panel col-md-10"><div class="search-btn-container col-lg-5 col-md-6 col-sm-6"><div id="credits-search-btn" class="search-btn grey1"><span aria-hidden="true" data-icon="&#57602;" class="pull-left fs1 big-size-icon"></span><span id="credits-sum" class="pull-right big-size-text">0 &euro;</span><br/><span class="pull-right little-size-text">Crédits</span></div></div><div class="col-lg-2 search-separator"></div><div class="search-btn-container col-lg-5 col-md-6 col-sm-6"><div id="debits-search-btn" class="search-btn grey2"><span aria-hidden="true" data-icon="&#57601;" class="pull-left fs1 big-size-icon"></span><span id="debits-sum" class="pull-right big-size-text">0 &euro;</span><br/><span class="pull-right little-size-text">Débits</span></div></div></div><div class="col-md-1"></div></td></tr><tr><td colspan="2"><div class="col-md-1"></div><div class="search-panel col-md-10"><div class="search-btn-container col-lg-5 col-md-6 col-sm-6"><div id="fixed-cost-search-btn" class="search-btn grey3"><span aria-hidden="true" data-icon="&#57481;" class="pull-left fs1 big-size-icon"></span><span id="fixed-cost-sum" class="pull-right big-size-text">0 &euro;</span><br/><span class="pull-right little-size-text">Frais fixes</span></div></div><div class="col-lg-2 search-separator"></div><div class="search-btn-container col-lg-5 col-md-6 col-sm-6"><div id="variable-cost-search-btn" class="search-btn grey4"><span aria-hidden="true" data-icon="&#57393;" class="pull-left fs1 big-size-icon"></span><span id="variable-cost-sum" class="pull-right big-size-text">0 &euro;</span><br/><span class="pull-right little-size-text">Dépenses</span></div></div></div><div class="col-md-1"></div></td></tr><tr><td colspan="2" class="google-pie-chart"><div id="pie_chart" style="width:268px;height:180px;margin:auto;">&nbsp;</div><br/><br/></td></tr></table>');
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

;
//# sourceMappingURL=app.js.map