'use strict';




/*
angular.module('workspaceApp')
  .controller('NewPollCtrl', function ($scope){
    
    $scope.option = [];
    $scope.newOption = function(){
      $scope.option.push("test");
    }
  }),
*/
/*

angular.module('workspaceApp')
  .controller('MainCtrl', function ($scope, $http, socket, Auth) {
    $scope.awesomeThings = [];
    
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.page = "default";
    
    $scope.pollExists = false;
    $scope.posted = false;
    
    $scope.setPage = function(pag) {
      $scope.page = pag;
      //console.log(pag);
    
    };

    $http.get('/api/things').success(function(awesomeThings) {
      $scope.awesomeThings = awesomeThings;
      socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $scope.addThing = function() {
      if($scope.newThing === '') {
        return;
      }
      $http.post('/api/things', { name: $scope.newThing });
      $scope.newThing = '';
    };

    $scope.deleteThing = function(thing) {
      $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
      socket.unsyncUpdates('thing');
    });
}),
*/

angular.module("workspaceApp", ["ngCookies", "ngResource", "ngSanitize", "ngRoute", "ui.bootstrap"]).config(["$routeProvider", "$locationProvider", "$httpProvider", function(a, b, c) {
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
}]), 

angular.module("workspaceApp").controller("MainCtrl", ["$scope", "$http", "Auth", "$routeParams", function(a, b, c, d) {
    function e() {
        var c = a.getCurrentUser.name;
        b.get("/api/polls/" + c + "/all").success(function(b) {
          //console.log(b);
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
    a.awesomeThings = [], 
    a.isLoggedIn = c.isLoggedIn, 
    a.isAdmin = c.isAdmin, 
    a.getCurrentUser = c.getCurrentUser(), 
    a.posted = !1, 
    a.pollExists = !1, 
    a.page = "newPoll", 
    a.selectedPoll;
    a.addThing = function() {
        "" !== a.newThing && (b.post("/api/things", {
            name: a.newThing
        }), a.newThing = "")
    }, 
    a["delete"] = function(c) {
        var d = a.getCurrentUser.name;
        b.get("/api/polls/" + d + "/" + c).success(function(a) {
            a.length > 0 && b["delete"]("/api/polls/" + a[0]._id).success(function() {
                e()
            })
        })
    }, 
    a.submit = function(c) {
        var d = a.poll.poll_options.indexOf(a.form.choice);
        //console.log(a.form.choice);
        a.poll.poll_results[d]++, 
        a.poll.voted_users.push(a.getCurrentUser.name), 
        //console.log(a.poll.poll_results), 
        b.put("/api/polls/" + a.poll._id, a.poll).then(function(b) {
            a.setPage("results", a.poll)
        })
    }, a.setPage = function(c, d) {
        if (a.page = c, "myPolls" === a.page) e();
        else if ("votePoll" === a.page) {
            var f;
            f = void 0 === a.user ? a.getCurrentUser.name : a.user.replace("-", " ");
            var g;
            d = d.replace(/[^\w\s]/gi, ""), 
            b.get("/api/polls/" + f + "/" + d).success(function(b) {
                0 !== b.length ? (g = b[0].comments, a.poll = b[0], a.commentsExist = g.length > 0 ? !0 : !1, a.poll.voted_users.indexOf(f) >= 0 ? a.setPage("results", a.poll) : console.log(a.poll.voted_users + " // " + f)) : a.pollExists = !1
            })
        }
        else if ("results" === a.page) {
            var f;
            f = void 0 === a.user ? a.getCurrentUser.name : a.user.replace("-", " "), 
            b.get("/api/polls/" + f + "/" + a.poll.poll_name).success(function(b) {
             
                a.results = b[0].poll_results; 
                //console.log(a.poll.poll_results)
                {
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
                    /*new Chart(c).Bar(b, {
                        barShowStroke: !1
                    })*/
                }
            })
        }
    }, 2 === Object.keys(d).length && d.hasOwnProperty("user") && d.hasOwnProperty("poll") && (a.user = d.user, a.setPage("votePoll", d.poll))
}]), 

angular.module("workspaceApp").controller("NewPollCtrl", ["$http", "$scope", "Auth", function(a, b, c) {
    b.message = "Hello";
    var d = c.getCurrentUser();
    b.placeholders = ["Pepsi", "Coca-Cola"], 
    b.pollName, 
    b.pollOptions = [], 
    b.newOption = function() {
        b.placeholders.push("New Option")
    }, 
    b.submit = function() {
        var c = b.pollName.replace(/[^\w\s]/gi, "");
        //console.log(c);
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
                //console.log(f);
                a.post("/api/polls", h).success(function(a) {
                    var c = d.name.replace(" ", "-"),
                        e = a.poll_name;
                    b.$parent.posted_url = void 0, 
                    b.$parent.posted_url = "" + document.URL + c + "/" + e, 
                    console.log(b.$parent.posted_url);
                    b.$parent.posted = !0, 
                    //b.$parent.posted_url = "setPage('votePoll', '"+ e + "')",
                    //b.$parent.posted_url = e,
                    b.pollName = void 0, 
                    b.pollOptions = [], 
                    b.$parent.page = "newPollPosted"
                })
            }
            else b.$parent.pollExists = !0
        })
    }
}])



