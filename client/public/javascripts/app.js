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
    return this.step2();
  },
  step2: function() {
    var Router;
    window.collections = {};
    window.views = {};
    window.collections.allBanks = new BanksCollection();
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

;require.register("collections/bank_accesses", function(exports, require, module) {
var BankAccess, BankAccesses, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BankAccess = require('../models/bank_access');

module.exports = BankAccesses = (function(_super) {
  __extends(BankAccesses, _super);

  function BankAccesses() {
    _ref = BankAccesses.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BankAccesses.prototype.model = BankAccess;

  BankAccesses.prototype.url = "bankaccesses";

  return BankAccesses;

})(Backbone.Collection);

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

Number.prototype.formatMoney = function(decPlaces, thouSeparator, decSeparator) {
  var i, j, n, sign;
  n = this;
  decPlaces = (isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces);
  decSeparator = (decSeparator === undefined ? "." : decSeparator);
  thouSeparator = (thouSeparator === undefined ? "," : thouSeparator);
  sign = (n < 0 ? "-" : "");
  i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "";
  j = ((j = i.length) > 3 ? j % 3 : 0);
  return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
};

Number.prototype.money = function() {
  return this.formatMoney(2, " ", ",");
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

;require.register("models/bank_access", function(exports, require, module) {
var BankAccess, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

module.exports = BankAccess = (function(_super) {
  __extends(BankAccess, _super);

  function BankAccess() {
    _ref = BankAccess.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  BankAccess.prototype.url = "bankaccesses";

  return BankAccess;

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
    '': 'parametres'
  };

  Router.prototype.parametres = function() {
    var _ref1;
    return (_ref1 = window.views.configurationView) != null ? _ref1.render() : void 0;
  };

  return Router;

})(Backbone.Router);

});

;require.register("views/app", function(exports, require, module) {
var AppView, BaseView, ConfigurationView, NewBankView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

ConfigurationView = require('views/configuration');

NewBankView = require('views/new_bank');

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
        return window.collections.allBanks.fetch({
          success: function() {
            if (!this.newbankView) {
              this.newbankView = new NewBankView();
            }
            if (!window.views.configurationView) {
              window.views.configurationView = new ConfigurationView();
            }
            this.newbankView.render();
            return Backbone.history.start();
          },
          error: function() {
            return console.log("Fatal error: could not get the banks list");
          }
        });
      }
    });
  };

  return AppView;

})(BaseView);

});

;require.register("views/bank_subtitle", function(exports, require, module) {
var BankSubTitleView, BaseView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

module.exports = BankSubTitleView = (function(_super) {
  __extends(BankSubTitleView, _super);

  BankSubTitleView.prototype.template = require('./templates/configuration_bank_subtitle');

  function BankSubTitleView(model) {
    this.model = model;
    BankSubTitleView.__super__.constructor.call(this);
  }

  BankSubTitleView.prototype.events = {
    "change .accountTitle": 'chooseAccount'
  };

  BankSubTitleView.prototype.initialize = function() {
    this.listenTo(this.model, 'change', this.render);
    return this.listenTo(window.activeObjects, 'changeActiveAccount', this.checkActive);
  };

  BankSubTitleView.prototype.chooseAccount = function(event) {
    window.activeObjects.trigger("changeActiveAccount", this.model);
    $("#account-amount-balance").text($(event.currentTarget).parent().children('input.accountAmount').val());
    return this.loadLastYearAmounts(this.model);
  };

  BankSubTitleView.prototype.checkActive = function(account) {
    this.$(".row").removeClass("active");
    if (account === this.model) {
      return this.$(".row").addClass("active");
    }
  };

  BankSubTitleView.prototype.loadLastYearAmounts = function(account) {
    var _this = this;
    window.collections.amounts.reset();
    window.collections.amounts.setAccount(account);
    window.collections.amounts.fetch({
      success: function(amounts) {
        console.log(amounts);
        return _this.setupLastYearAmountsFlot(amounts);
      },
      error: function() {
        return console.log("error fetching amounts of last year");
      }
    });
    return this;
  };

  BankSubTitleView.prototype.setupLastYearAmountsFlot = function(amounts) {
    var currentDate, flotReadyAmounts, formattedAmounts, i, lastAmount, maxAmount, minAmount, numberOfDays, plot;
    formattedAmounts = [];
    flotReadyAmounts = [];
    amounts.each(function(amount) {
      var amountDate, currentDate, i;
      currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      amountDate = new Date(amount.get('date'));
      i = 0;
      while (amountDate.getTime() !== currentDate.getTime() && i < 365) {
        currentDate.setDate(currentDate.getDate() - 1);
        i++;
      }
      if (i < 364) {
        return formattedAmounts[currentDate.getTime()] = amount.get('amount');
      }
    });
    numberOfDays = 365;
    currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    lastAmount = this.model.get('amount');
    minAmount = 0;
    maxAmount = 0;
    i = 0;
    while (i < numberOfDays) {
      if (formattedAmounts[currentDate.getTime()]) {
        lastAmount = formattedAmounts[currentDate.getTime()];
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
    minAmount = (parseFloat(minAmount)) - 500;
    maxAmount = (parseFloat(maxAmount)) + 500;
    console.log(flotReadyAmounts);
    flotReadyAmounts.reverse();
    return plot = $.plot("#social-stats", [
      {
        data: flotReadyAmounts,
        label: "Solde"
      }
    ], {
      series: {
        lines: {
          show: true,
          lineWidth: 1
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
      colors: ["#f74e4d"],
      shadowSize: 0,
      yaxis: {
        min: minAmount,
        max: maxAmount
      },
      xaxis: {
        mode: "time",
        minTickSize: [1, "month"],
        min: (new Date("2013/02/28")).getTime(),
        max: (new Date("2014/01/28")).getTime()
      }
    });
  };

  return BankSubTitleView;

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

  ConfigurationView.prototype.el = 'div#content';

  ConfigurationView.prototype.elAccounts = 'ul#account-choice';

  ConfigurationView.prototype.accounts = 0;

  ConfigurationView.prototype.subViews = [];

  ConfigurationView.prototype.initialize = function() {
    return this.listenTo(window.activeObjects, "new_access_added_successfully", this.noMoreEmpty);
  };

  ConfigurationView.prototype.noMoreEmpty = function() {
    var _this = this;
    return window.collections.banks.fetch({
      success: function() {
        return _this.render();
      }
    });
  };

  ConfigurationView.prototype.render = function() {
    var treatment, view;
    ConfigurationView.__super__.render.call(this);
    view = this;
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
    async.concat(window.collections.banks.models, treatment, function(err, results) {
      if (err) {
        console.log(err);
        alert(window.i18n("error_loading_accounts"));
      }
      this.accounts = results.length;
      return $(".accountTitle:eq(0)").click();
    });
    return this;
  };

  ConfigurationView.prototype.empty = function() {
    var view, _i, _len, _ref1, _ref2, _results;
    if ((_ref1 = this.operationsView) != null) {
      _ref1.destroy();
    }
    _ref2 = this.subViews;
    _results = [];
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      view = _ref2[_i];
      _results.push(view.destroy());
    }
    return _results;
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

BankSubTitleView = require('./bank_subtitle');

module.exports = ConfigurationBankView = (function(_super) {
  __extends(ConfigurationBankView, _super);

  ConfigurationBankView.prototype.className = 'bank';

  ConfigurationBankView.prototype.sum = 0;

  ConfigurationBankView.prototype.subViews = [];

  function ConfigurationBankView(bank) {
    this.bank = bank;
    ConfigurationBankView.__super__.constructor.call(this);
  }

  ConfigurationBankView.prototype.initialize = function() {
    this.listenTo(this.bank.accounts, "add", this.addOne);
    return this.listenTo(this.bank.accounts, "destroy", this.render);
  };

  ConfigurationBankView.prototype.addOne = function(account) {
    var viewAccount;
    viewAccount = new BankSubTitleView(account);
    this.subViews.push(viewAccount);
    account.view = viewAccount;
    return this.$el.append(viewAccount.render().el);
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

;require.register("views/new_bank", function(exports, require, module) {
var BankAccessModel, BaseView, NewBankView, _ref,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseView = require('../lib/base_view');

BankAccessModel = require('../models/bank_access');

module.exports = NewBankView = (function(_super) {
  __extends(NewBankView, _super);

  function NewBankView() {
    _ref = NewBankView.__super__.constructor.apply(this, arguments);
    return _ref;
  }

  NewBankView.prototype.el = 'div#add-bank-window';

  NewBankView.prototype.initialize = function() {
    return this.render();
  };

  NewBankView.prototype.saveBank = function(event) {
    var bankAccess, button, data, oldText, view;
    event.preventDefault();
    view = this;
    button = $(event.target);
    oldText = button.html();
    button.addClass("disabled");
    button.html(window.i18n("verifying") + "<img src='./loader_green.gif' />");
    button.removeClass('btn-warning');
    button.addClass('btn-success');
    this.$(".message-modal").html("");
    data = {
      login: $("#inputLogin").val(),
      password: $("#inputPass").val(),
      bank: $("#inputBank").val()
    };
    bankAccess = new BankAccessModel(data);
    return bankAccess.save(data, {
      success: function(model, response, options) {
        var bank;
        button.html(window.i18n("sent") + " <img src='./loader_green.gif' />");
        bank = window.collections.allBanks.get(data.bank);
        if (bank != null) {
          console.log("Fetching for new accounts in bank" + bank.get("name"));
          bank.accounts.trigger("loading");
          bank.accounts.fetch();
        }
        $("#add-bank-window").modal("hide");
        button.removeClass("disabled");
        button.html(oldText);
        window.activeObjects.trigger("new_access_added_successfully", model);
        return setTimeout(function() {
          var router;
          $("#add-bank-window").modal("hide");
          router = window.app.router;
          return router.navigate('/', {
            trigger: true,
            replace: true
          });
        }, 500);
      },
      error: function(model, xhr, options) {
        button.removeClass('btn-success');
        button.removeClass('disabled');
        button.addClass('btn-warning');
        if (((xhr != null ? xhr.status : void 0) != null) && xhr.status === 409) {
          this.$(".message-modal").html("<div class='alert alert-danger'>" + window.i18n("access already exists") + "</div>");
          return button.html(window.i18n("access already exists button"));
        } else {
          this.$(".message-modal").html("<div class='alert alert-danger'>" + window.i18n("error_check_credentials") + "</div>");
          return button.html(window.i18n("error_check_credentials_btn"));
        }
      }
    });
  };

  NewBankView.prototype.getRenderData = function() {
    return {
      banks: window.collections.allBanks.models
    };
  };

  return NewBankView;

})(BaseView);

});

;require.register("views/templates/app", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<p>Contenu</p>');
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
buf.push('<div><ul id="account-choice"></ul></div>');
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

;require.register("views/templates/configuration_bank_subtitle", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<input type="radio" name="accountTitle" class="accountTitle"/><label for="accountTitle">' + escape((interp = model.get('title')) == null ? '' : interp) + ' n°' + escape((interp = model.get("accountNumber")) == null ? '' : interp) + '</label><span>Solde :</span><input');
buf.push(attrs({ 'type':("text"), 'value':("" + (Number(model.get('amount')).money()) + ""), 'disabled':("true"), "class": ('accountAmount') }, {"type":true,"value":true,"disabled":true}));
buf.push('/><span>&euro;</span>');
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
buf.push('<li><span class="bank-title-loading"><img src="./loader.gif"/></span><span class="bank-title">' + escape((interp = model.get('name')) == null ? '' : interp) + '</span></li>');
}
return buf.join("");
};
});

;
//# sourceMappingURL=app.js.map