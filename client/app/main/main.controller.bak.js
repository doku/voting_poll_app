"use strict";
angular.module("votingApp", ["ngCookies", "ngResource", "ngSanitize", "ngRoute", "ui.bootstrap"]).config(["$routeProvider", "$locationProvider", "$httpProvider", function(a, b, c) {
    a.otherwise({
        redirectTo: "/"
    }), b.html5Mode(!0), c.interceptors.push("authInterceptor")
}]).factory("authInterceptor", ["$rootScope", "$q", "$cookieStore", "$location", function(a, b, c, d) {
    return {
        request: function(a) {
            return a.headers = a.headers || {}, c.get("token") && (a.headers.Authorization = "Bearer " + c.get("token")), a
        },
        responseError: function(a) {
            return 401 === a.status ? (d.path("/login"), c.remove("token"), b.reject(a)) : b.reject(a)
        }
    }
}]).run(["$rootScope", "$location", "Auth", function(a, b, c) {
    a.$on("$routeChangeStart", function(a, d) {
        c.isLoggedInAsync(function(a) {
            d.authenticate && !a && b.path("/login")
        })
    })
}]), angular.module("votingApp").config(["$routeProvider", function(a) {
    a.when("/login", {
        templateUrl: "app/account/login/login.html",
        controller: "LoginCtrl"
    }).when("/signup", {
        templateUrl: "app/account/signup/signup.html",
        controller: "SignupCtrl"
    }).when("/settings", {
        templateUrl: "app/account/settings/settings.html",
        controller: "SettingsCtrl",
        authenticate: !0
    })
}]), angular.module("votingApp").controller("LoginCtrl", ["$scope", "Auth", "$location", "$window", function(a, b, c, d) {
    a.user = {}, a.errors = {}, a.login = function(d) {
        a.submitted = !0, d.$valid && b.login({
            email: a.user.email,
            password: a.user.password
        }).then(function() {
            c.path("/")
        })["catch"](function(b) {
            a.errors.other = b.message
        })
    }, a.loginOauth = function(a) {
        d.location.href = "/auth/" + a
    }
}]), angular.module("votingApp").controller("SettingsCtrl", ["$scope", "User", "Auth", function(a, b, c) {
    a.errors = {}, a.changePassword = function(b) {
        a.submitted = !0, b.$valid && c.changePassword(a.user.oldPassword, a.user.newPassword).then(function() {
            a.message = "Password successfully changed."
        })["catch"](function() {
            b.password.$setValidity("mongoose", !1), a.errors.other = "Incorrect password", a.message = ""
        })
    }
}]), angular.module("votingApp").controller("SignupCtrl", ["$scope", "Auth", "$location", "$window", function(a, b, c, d) {
    a.user = {}, a.errors = {}, a.register = function(d) {
        a.submitted = !0, d.$valid && b.createUser({
            name: a.user.name,
            email: a.user.email,
            password: a.user.password
        }).then(function() {
            c.path("/")
        })["catch"](function(b) {
            b = b.data, a.errors = {}, angular.forEach(b.errors, function(b, c) {
                d[c].$setValidity("mongoose", !1), a.errors[c] = b.message
            })
        })
    }, a.loginOauth = function(a) {
        d.location.href = "/auth/" + a
    }
}]), angular.module("votingApp").controller("AdminCtrl", ["$scope", "$http", "Auth", "User", function(a, b, c, d) {
    a.users = d.query(), a["delete"] = function(b) {
        d.remove({
            id: b._id
        }), angular.forEach(a.users, function(c, d) {
            c === b && a.users.splice(d, 1)
        })
    }
}]), angular.module("votingApp").config(["$routeProvider", function(a) {
    a.when("/admin", {
        templateUrl: "app/admin/admin.html",
        controller: "AdminCtrl"
    })
}]), angular.module("votingApp").directive("loggedIn", function() {
    return {
        templateUrl: "app/main/loggedIn/loggedIn.html",
        restrict: "EA"
    }
}), angular.module("votingApp").controller("MainCtrl", ["$scope", "$http", "Auth", "$routeParams", function(a, b, c, d) {
    function e() {
        var c = a.getCurrentUser.name;
        b.get("/api/polls/" + c + "/all").success(function(b) {
            var d = [];
            if (a.pollsExist = b.length > 0 ? !0 : !1, a.pollsExist)
                for (var e = 0; e < b.length; e++) {
                    {
                        "" + document.URL + c + "/" + b[e].poll_name
                    }
                    d.push(b[e])
                }
            a.myPolls = d
        })
    }
    a.awesomeThings = [], a.isLoggedIn = c.isLoggedIn, a.isAdmin = c.isAdmin, a.getCurrentUser = c.getCurrentUser(), a.posted = !1, a.pollExists = !1, a.page = "newPoll", a.selectedPoll;
    a.addThing = function() {
        "" !== a.newThing && (b.post("/api/things", {
            name: a.newThing
        }), a.newThing = "")
    }, a["delete"] = function(c) {
        var d = a.getCurrentUser.name;
        b.get("/api/polls/" + d + "/" + c).success(function(a) {
            a.length > 0 && b["delete"]("/api/polls/" + a[0]._id).success(function() {
                e()
            })
        })
    }, a.submit = function(c) {
        var d = a.poll.poll_options.indexOf(a.form.choice);
        a.poll.poll_results[d]++, a.poll.voted_users.push(a.getCurrentUser.name), console.log(a.poll), b.put("/api/polls/" + a.poll._id, a.poll).then(function(b) {
            a.setPage("results", a.poll)
        })
    }, a.setPage = function(c, d) {
        if (a.page = c, "myPolls" === a.page) e();
        else if ("votePoll" === a.page) {
            var f;
            f = void 0 === a.user ? a.getCurrentUser.name : a.user.replace("-", " ");
            var g;
            d = d.replace(/[^\w\s]/gi, ""), b.get("/api/polls/" + f + "/" + d).success(function(b) {
                0 !== b.length ? (g = b[0].comments, a.poll = b[0], a.commentsExist = g.length > 0 ? !0 : !1, a.poll.voted_users.indexOf(f) >= 0 ? a.setPage("results", a.poll) : console.log(a.poll.voted_users + " // " + f)) : a.pollExists = !1
            })
        }
        else if ("results" === a.page) {
            var f;
            f = void 0 === a.user ? a.getCurrentUser.name : a.user.replace("-", " "), b.get("/api/polls/" + f + "/" + a.poll.poll_name).success(function(b) {
                a.results = b[0].poll_results; {
                    var c = document.getElementById("myChart").getContext("2d"),
                        b = {
                            labels: a.poll.poll_options,
                            datasets: [{
                                label: "My First dataset",
                                fillColor: "rgba(220,220,220,0.5)",
                                strokeColor: "rgba(220,220,220,0.8)",
                                highlightFill: "rgba(220,220,220,0.75)",
                                highlightStroke: "rgba(220,220,220,1)",
                                data: a.poll.poll_results
                            }]
                        };
                    new Chart(c).Bar(b, {
                        barShowStroke: !1
                    })
                }
            })
        }
    }, 2 === Object.keys(d).length && d.hasOwnProperty("user") && d.hasOwnProperty("poll") && (a.user = d.user, a.setPage("votePoll", d.poll))
}]), angular.module("votingApp").config(["$routeProvider", function(a) {
    a.when("/", {
        templateUrl: "app/main/main.html",
        controller: "MainCtrl"
    }).when("/:user/:poll", {
        templateUrl: "app/main/main.html",
        controller: "MainCtrl"
    })
}]), angular.module("votingApp").directive("myPolls", function() {
    return {
        templateUrl: "app/main/myPolls/myPolls.html",
        restrict: "EA",
        link: function(a, b, c) {}
    }
}), angular.module("votingApp").directive("myResults", function() {
    return {
        templateUrl: "app/main/myResults/myResults.html",
        restrict: "EA",
        link: function(a, b, c) {}
    }
}), angular.module("votingApp").controller("NewPollCtrl", ["$http", "$scope", "Auth", function(a, b, c) {
    b.message = "Hello";
    var d = c.getCurrentUser();
    b.placeholders = ["Pepsi", "Coca-Cola"], b.pollName, b.pollOptions = [], b.newOption = function() {
        b.placeholders.push("New Option")
    }, b.submit = function() {
        var c = b.pollName.replace(/[^\w\s]/gi, "");
        a.get("/api/polls/" + d.name + "/" + c).success(function(e) {
            for (var f = [], g = 0; g < b.pollOptions.length; g++) f.push(0);
            if (0 === e.length) {
                var h = {
                    user_name: d.name,
                    poll_name: c,
                    poll_options: b.pollOptions,
                    poll_results: f,
                    votes: [],
                    voted_users: [],
                    comments: []
                };
                a.post("/api/polls", h).success(function(a) {
                    var c = d.name.replace(" ", "-"),
                        e = a.poll_name;
                    b.$parent.posted_url = void 0, b.$parent.posted_url = "" + document.URL + c + "/" + e, b.$parent.posted = !0, b.pollName = void 0, b.pollOptions = [], b.$parent.page = "newPollPosted"
                })
            }
            else b.$parent.pollExists = !0
        })
    }
}]), angular.module("votingApp").directive("newPoll", function() {
    return {
        templateUrl: "app/main/newPoll/newPoll.html",
        restrict: "EA",
        link: function(a, b, c) {}
    }
}), angular.module("votingApp").directive("newPollPosted", function() {
    return {
        templateUrl: "app/main/newPollPosted/newPollPosted.html",
        restrict: "EA",
        link: function(a, b, c) {}
    }
}), angular.module("votingApp").directive("signUp", function() {
    return {
        templateUrl: "app/main/signUp/signUp.html",
        restrict: "EA",
        link: function(a, b, c) {}
    }
}), angular.module("votingApp").directive("votePoll", function() {
    return {
        templateUrl: "app/main/votePoll/votePoll.html",
        restrict: "EA",
        link: function(a, b, c) {}
    }
}), angular.module("votingApp").factory("Auth", ["$location", "$rootScope", "$http", "User", "$cookieStore", "$q", function(a, b, c, d, e, f) {
    var g = {};
    return e.get("token") && (g = d.get()), {
        login: function(a, b) {
            var h = b || angular.noop,
                i = f.defer();
            return c.post("/auth/local", {
                email: a.email,
                password: a.password
            }).success(function(a) {
                return e.put("token", a.token), g = d.get(), i.resolve(a), h()
            }).error(function(a) {
                return this.logout(), i.reject(a), h(a)
            }.bind(this)), i.promise
        },
        logout: function() {
            e.remove("token"), g = {}
        },
        createUser: function(a, b) {
            var c = b || angular.noop;
            return d.save(a, function(b) {
                return e.put("token", b.token), g = d.get(), c(a)
            }, function(a) {
                return this.logout(), c(a)
            }.bind(this)).$promise
        },
        changePassword: function(a, b, c) {
            var e = c || angular.noop;
            return d.changePassword({
                id: g._id
            }, {
                oldPassword: a,
                newPassword: b
            }, function(a) {
                return e(a)
            }, function(a) {
                return e(a)
            }).$promise
        },
        getCurrentUser: function() {
            return g
        },
        isLoggedIn: function() {
            return g.hasOwnProperty("role")
        },
        isLoggedInAsync: function(a) {
            g.hasOwnProperty("$promise") ? g.$promise.then(function() {
                a(!0)
            })["catch"](function() {
                a(!1)
            }) : a(g.hasOwnProperty("role") ? !0 : !1)
        },
        isAdmin: function() {
            return "admin" === g.role
        },
        getToken: function() {
            return e.get("token")
        }
    }
}]), angular.module("votingApp").factory("User", ["$resource", function(a) {
    return a("/api/users/:id/:controller", {
        id: "@_id"
    }, {
        changePassword: {
            method: "PUT",
            params: {
                controller: "password"
            }
        },
        get: {
            method: "GET",
            params: {
                id: "me"
            }
        }
    })
}]), angular.module("votingApp").factory("Modal", ["$rootScope", "$modal", function(a, b) {
    function c(c, d) {
        var e = a.$new();
        return c = c || {}, d = d || "modal-default", angular.extend(e, c), b.open({
            templateUrl: "components/modal/modal.html",
            windowClass: d,
            scope: e
        })
    }
    return {
        confirm: {
            "delete": function(a) {
                return a = a || angular.noop,
                    function() {
                        var b, d = Array.prototype.slice.call(arguments),
                            e = d.shift();
                        b = c({
                            modal: {
                                dismissable: !0,
                                title: "Confirm Delete",
                                html: "<p>Are you sure you want to delete <strong>" + e + "</strong> ?</p>",
                                buttons: [{
                                    classes: "btn-danger",
                                    text: "Delete",
                                    click: function(a) {
                                        b.close(a)
                                    }
                                }, {
                                    classes: "btn-default",
                                    text: "Cancel",
                                    click: function(a) {
                                        b.dismiss(a)
                                    }
                                }]
                            }
                        }, "modal-danger"), b.result.then(function(b) {
                            a.apply(b, d)
                        })
                    }
            }
        }
    }
}]), angular.module("votingApp").directive("mongooseError", function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(a, b, c, d) {
            b.on("keydown", function() {
                return d.$setValidity("mongoose", !0)
            })
        }
    }
}), angular.module("votingApp").controller("NavbarCtrl", ["$scope", "$location", "Auth", function(a, b, c) {
    a.menu = [{
        title: "Home",
        link: "/"
    }], a.isCollapsed = !0, a.isLoggedIn = c.isLoggedIn, a.isAdmin = c.isAdmin, a.getCurrentUser = c.getCurrentUser(), a.isTwitter = "twitter" === a.getCurrentUser.provider, a.logout = function() {
        c.logout(), b.path("/login")
    }, a.isActive = function(a) {
        return a === b.path()
    }
}]), angular.module("votingApp").run(["$templateCache", function(a) {
    a.put("app/account/login/login.html", '<div ng-include=&quot;components/navbar/navbar.html&quot;></div><header id=banner class=hero-unit><div class=container><h1>VotePlex</h1><p class=lead>Create custom polls with live results.</p></div></header><div class=container><div class=row><div class=col-sm-12><form name=form ng-submit=login(form) novalidate class=form><div class=form-group><label>Email</label><input name=email ng-model=user.email class="form-control"></div><div class=form-group><label>Password</label><input type=password name=password ng-model=user.password class="form-control"></div><div class="form-group has-error"><p ng-show="form.email.$error.required &amp;&amp; form.password.$error.required &amp;&amp; submitted" class=help-block>Please enter your email and password.</p><p class=help-block>{{ errors.other }}</p></div><button type=submit class="btn btn-success">Login</button><a href="" ng-click=loginOauth(&quot;twitter&quot;) class="btn btn-twitter"><i class="fa fa-twitter">Connect with Twitter</i></a></form></div></div></div>'), a.put("app/account/settings/settings.html", '<div ng-include=&quot;components/navbar/navbar.html&quot;></div><div class=container><div class=row><div class=col-sm-12><h1>Change Password</h1></div><div class=col-sm-12><form name=form ng-submit=changePassword(form) novalidate class=form><div class=form-group><label>Current Password</label><input type=password name=password ng-model=user.oldPassword mongoose-error="" class="form-control"><p ng-show=form.password.$error.mongoose class=help-block>{{ errors.other }}</p></div><div class=form-group><label>New Password</label><input type=password name=newPassword ng-model=user.newPassword ng-minlength=3 required class="form-control"><p ng-show="(form.newPassword.$error.minlength || form.newPassword.$error.required) &amp;&amp; (form.newPassword.$dirty || submitted)" class=help-block>Password must be at least 3 characters.</p></div><p class=help-block>{{ message }}</p><button type=submit class="btn btn-lg btn-primary">Save changes</button></form></div></div></div>'), a.put("app/account/signup/signup.html", '<div ng-include=&quot;components/navbar/navbar.html&quot;></div><header id=banner class=hero-unit><div class=container><h1>VotePlex</h1><p class=lead>Create custom polls with live results.</p></div></header><div class=container><div class=row><div class=col-sm-12><form name=form ng-submit=register(form) novalidate class=form><div ng-class="{ &quot;has-success&quot;: form.name.$valid &amp;&amp; submitted,        &quot;has-error&quot;: form.name.$invalid &amp;&amp; submitted }" class=form-group><label>Name</label><input name=name ng-model=user.name required class="form-control"><p ng-show="form.name.$error.required &amp;&amp; submitted" class=help-block>A name is required</p></div><div ng-class="{ &quot;has-success&quot;: form.email.$valid &amp;&amp; submitted,        &quot;has-error&quot;: form.email.$invalid &amp;&amp; submitted }" class=form-group><label>Email</label><input type=email name=email ng-model=user.email required mongoose-error="" class="form-control"><p ng-show="form.email.$error.email &amp;&amp; submitted" class=help-block>Doesn\'t look like a valid email.</p><p ng-show="form.email.$error.required &amp;&amp; submitted" class=help-block>What\'s your email address?</p><p ng-show=form.email.$error.mongoose class=help-block>{{ errors.email }}</p></div><div ng-class="{ &quot;has-success&quot;: form.password.$valid &amp;&amp; submitted,        &quot;has-error&quot;: form.password.$invalid &amp;&amp; submitted }" class=form-group><label>Password</label><input type=password name=password ng-model=user.password ng-minlength=3 required mongoose-error="" class="form-control"><p ng-show="(form.password.$error.minlength || form.password.$error.required) &amp;&amp; submitted" class=help-block>Password must be at least 3 characters.</p><p ng-show=form.password.$error.mongoose class=help-block>{{ errors.password }}</p><button type=submit class="btn btn-lg btn-success">Sign up</button><a href="" ng-click=loginOauth(&quot;twitter&quot;) class="btn btn-twitter"><i class="fa fa-twitter"></i> Connect with Twitter</a></div></form></div></div></div>'), a.put("app/admin/admin.html", '<div ng-include=&quot;components/navbar/navbar.html&quot;></div><div class=container><p>The delete user and user index api routes are restricted to users with the \'admin\' role.</p><ul class=list-group><li ng-repeat="user in users" class=list-group-item><strong>{{user.name}}</strong><br><span class=text-muted>{{user.email}}</span><a ng-click=delete(user) class=trash><span class="glyphicon glyphicon-trash pull-right"></span></a></li></ul></div>'), a.put("app/main/loggedIn/loggedIn.html", '<header id=banner class=hero-unit><div class=container><h1>Dashboard</h1><p class=lead>What would you like to do today?</p><button ng-click="setPage(\'newPoll\')" class="btn btn-success btn-lg">New Poll</button><button ng-click="setPage(\'myPolls\')" id=currentPolls class="btn btn-primary btn-lg">My Polls</button></div></header>'), a.put("app/main/main.html", '<div ng-include=&quot;components/navbar/navbar.html&quot;></div><div ng-controller=MainCtrl><div ng-hide=isLoggedIn()><sign-up></sign-up><div ng-hide="page === \'votePoll\'"><div class="container marketing"><div class=row><div class="col-lg-4 col-md-4 col-sm-4"><i class="fa fa-bolt"></i><h2>Live Results</h2><p>Live graphs show your poll results immediately in easy to an easy to understand format. One graph will not provide the whole picture, that\'s why we provide multiple graph types to better describe your results.</p></div><div class="col-lg-4 col-md-4 col-sm-4"><i class="fa fa-globe"></i><h2>Works Everywhere</h2><p>Traditional desktop computers now represent only 30% of Internet traffic. Your poll must work on the tablets, smart phones, netbooks and notebooks that your visitors are using. Our responsive designs do just that.</p></div><div class="col-lg-4 col-md-4 col-sm-4"><i class="fa fa-facebook"></i><h2>Social Integration</h2><p>Free integrated facebook or traditional comments allow your poll voters to provide immediate feedback and discuss results. Social share buttons encourage your poll voters to help spread the word.</p></div></div></div><footer class=footer><div class=container><p>FreeCodeCamp Basejump | <a href=https://twitter.com/GeoffStorbeck>@GeoffStorbeck</a></p></div></footer></div></div><div ng-show=isLoggedIn()><logged-in></logged-in><div ng-show="pollExists&amp;&amp; !posted" class="alert alert-danger"><div class=strong>Uh oh!</div><p>You already have a poll with this name!</p></div><new-poll ng-show="page === \'newPoll\'"></new-poll><new-poll-posted ng-show="page===\'newPollPosted\'"></new-poll-posted><my-polls ng-show="page === \'myPolls\'"></my-polls><my-results ng-show="page === \'results\'"></my-results></div><vote-poll ng-show="page === \'votePoll\'"></vote-poll></div>'), a.put("app/main/myPolls/myPolls.html", '<div class=container><div class=col-lg-4></div><div class=col-lg-4><form><ul class=list-group><li ng-repeat="item in myPolls" ng-click="setPage(\'votePoll\', item.poll_name)" class=list-group-item>{{item.poll_name}}<button ng-click="delete(item.poll_name); $event.stopPropagation()" class=btn>Delete</button></li></ul></form></div><div class=col-lg-4></div></div>'), a.put("app/main/myResults/myResults.html", "<div id=resultsView><h1>{{poll.poll_name}}</h1><canvas id=myChart width=400 height=400></canvas></div>"), a.put("app/main/newPoll/newPoll.html", '<div id=newPollForm ng-controller=NewPollCtrl class=container><span><h2>New Poll</h2></span><form name=poll novalidate><div class=form-group><label for=name>Name your poll</label><input id=name ng-model=pollName placeholder="What is your favorite brand?" required class="form-control"></div><div class=form-group><label>Options</label><input ng-model=pollOptions[$index] placeholder={{n}} ng-repeat="n in placeholders track by $index" required class="form-control"></div><div class=form-buttons><button type=button ng-click=newOption() class="btn btn-default">More Options</button><button type=submit ng-click=submit() ng-disabled=poll.$invalid class="btn btn-success">Submit</button></div></form></div>'), a.put("app/main/newPollPosted/newPollPosted.html", "<div id=newPollForm class=container><h1>Congratulations!</h1><p class=lead>Your poll has been posted to <a href={{posted_url}}>{{posted_url}}</a></p></div>"), a.put("app/main/results/results.html", '<p>{{poll}}</p><h1>{{poll.poll_name}}</h1><canvas id=myChart width=400 height=400></canvas><script>var ctx = document.getElementById("myChart").getContext("2d");\nvar data = {\n' + "  labels: ['x','y'],\n  datasets: [{\n    data: [4,7]\n  }]\n}\nvar myBarChart = new Chart(ctx).Bar(data);</script>"), a.put("app/main/signUp/signUp.html", '<header id=banner class=hero-unit><div class=container><h1>VotePlex</h1><p class=lead>Create custom polls with live results.</p><form action=/signup><button type=submit class="btn btn-success btn-lg">Sign Up</button></form></div></header>'), a.put("app/main/votePoll/votePoll.html", '<div class=voting-form><div class=container><div class="col-lg-4 description"><h1>{{poll.poll_name + \'?\'}}</h1><p class=lead>by {{poll.user_name}}</p></div><div class=col-lg-4><form name=form ng-submit=submit()><ul class=list-group><li ng-repeat="item in poll.poll_options" class=list-group-item><input ng-model=form.choice name=choice type=radio value="{{item}}">{{item}}</li></ul><button type=submit ng-disabled=!isLoggedIn() class="btn btn-lg btn-success">Vote!</button></form></div><div class="col-lg-4 comments"><p ng-repeat="comment in poll.comments" ng-show=commentsExist></p><p ng-hide=commentsExist>Sorry, no comments yet.</p></div></div></div>'), a.put("components/modal/modal.html", '<div class=modal-header><button ng-if=modal.dismissable type=button ng-click=$dismiss() class=close>&times;</button><h4 ng-if=modal.title ng-bind=modal.title class=modal-title></h4></div><div class=modal-body><p ng-if=modal.text ng-bind=modal.text></p><div ng-if=modal.html ng-bind-html=modal.html></div></div><div class=modal-footer><button ng-repeat="button in modal.buttons" ng-class=button.classes ng-click=button.click($event) ng-bind=button.text class=btn></button></div>'), a.put("components/navbar/navbar.html", '<div ng-controller=NavbarCtrl class="navbar navbar-default navbar-static-top"><div class=container><div class=navbar-header><button type=button ng-click="isCollapsed = !isCollapsed" class=navbar-toggle><span class=sr-only>Toggle navigation</span><span class=icon-bar></span><span class=icon-bar></span><span class=icon-bar></span></button><a href="/" class=navbar-brand>VotePlex</a></div><div id=navbar-main collapse=isCollapsed class="navbar-collapse collapse"><ul class="nav navbar-nav"><li ng-repeat="item in menu" ng-class="{active: isActive(item.link)}"><a ng-href={{item.link}}>{{item.title}}</a></li><li ng-show=isAdmin() ng-class="{active: isActive(&quot;/admin&quot;)}"><a href=/admin>Admin</a></li></ul><ul class="nav navbar-nav navbar-right"><li ng-hide=isLoggedIn() ng-class="{active: isActive(&quot;/signup&quot;)}"><a href=/signup>Sign up</a></li><li ng-hide=isLoggedIn() ng-class="{active: isActive(&quot;/login&quot;)}"><a href=/login>Login</a></li><li ng-show=isLoggedIn()><p class=navbar-text><img src={{getCurrentUser.twitter.profile_image_url}} alt="Profile Image" ng-show={{isTwitter}} class="profile_image"><a href=/settings ng-hide={{isTwitter}}>{{getCurrentUser.name}}</a><span ng-show={{isTwitter}}>{{getCurrentUser.name}}</span></p></li><li ng-show=isLoggedIn() ng-class="{active: isActive(&quot;/logout&quot;)}"><a href="" ng-click=logout()>Logout</a></li></ul></div></div></div>')
}]);