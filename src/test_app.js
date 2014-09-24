/**
 * Created by Artturi Sipilä on 24.9.2014.
 */

var test_app = angular.module('testapp', ["autocomplete"]);

/*
test_app.run(function($templateCache){
    $templateCache.put("autocomplete.html", '<div></div>')
});
*/

test_app.controller('TestController', ['$scope',
        function TestController($scope) {

           $scope.colors = [
                {
                    color: "red",
                    value: "#f00"
                },
                {
                    color: "green",
                    value: "#0f0"
                },
                {
                    color: "blue",
                    value: "#00f"
                },
                {
                    color: "cyan",
                    value: "#0ff"
                },
                {
                    color: "magenta",
                    value: "#f0f"
                },
                {
                    color: "yellow",
                    value: "#ff0"
                },
                {
                    color: "black",
                    value: "#000"
                }
            ];

        }
    ]);
